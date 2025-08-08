const { Post } = require("./model.cjs")
const { hashData } = require("../../utils/hashData.cjs");
const User = require("../user/model.cjs");
const Comment = require("../comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")
const translate = require("./../../domains/translation/controller.cjs")
const savedPost = require("../savedPosts/model.cjs")
const { gcsClient } = require('../../config/gcsStorage.cjs');



const createPost = async (data) => {
  const { title, content, tags, username, draft, media = [] } = data;
  const user = await User.findOne({ username });
  if (!user) throw new Error("Username does not exist");

  const now = Date.now();
  const postId = await hashData(username + now);

  const newPost = new Post({
    postId,
    title,
    content,
    username,
    tags,
    createdAt: now,
    draft,
    media,  // directly save media info
  });

  return await newPost.save();
};



const editDraft = async (data) => {
  try {
    const { postId, content, title, tags, username, draft, newMedia, mediaToRemove } = data;
    const existingDraft = await Post.findOne({ postId });

    if (!existingDraft) throw new Error("Draft does not exist");
    if (existingDraft.username !== username) throw new Error("Unauthorized");
    if (!existingDraft.draft) throw new Error("Cannot edit a published post");

    const currentMedia = existingDraft.media || [];
    const toRemoveSet = new Set(mediaToRemove || []);
    const mediaToDelete = currentMedia.filter(m => toRemoveSet.has(m.public_id));

    // Delete media files from GCS instead of Cloudinary
    const deletePromises = mediaToDelete.map(async (file) => {
      try {
        await gcsClient.bucket.file(file.public_id).delete();
        console.log(`Deleted GCS file: ${file.public_id}`);
      } catch (err) {
        console.error(`Error deleting media ${file.public_id}:`, err);
      }
    });
    await Promise.all(deletePromises);

    // Compose updated media array
    const updatedMedia = [
      ...currentMedia.filter(m => !toRemoveSet.has(m.public_id)),
      ...(newMedia || []),
    ];

    existingDraft.title = title;
    existingDraft.content = content;
    existingDraft.tags = tags;
    existingDraft.media = updatedMedia;
    existingDraft.edited = true;
    existingDraft.draft = draft;

    await existingDraft.save();

    return existingDraft;
  } catch (err) {
    throw err;
  }
};

module.exports = { editDraft };

const deletePost = async (data) => {
  try {
    const { postId, username } = data;

    const existingPost = await Post.findOne({ postId });
    if (!existingPost) {
      throw new Error("Post does not exist");
    }

    if (existingPost.username !== username) {
      throw new Error("Unauthorized");
    }

    if (existingPost.media && existingPost.media.length > 0) {
      const deletionPromises = existingPost.media.map(async (file) => {
        console.log(`Deleting media: public_id=${file.public_id}, type=${file.type}`);
        try {
          // Delete file from GCS bucket
          await gcsClient.bucket.file(file.public_id).delete();
          return { success: true, public_id: file.public_id };
        } catch (err) {
          console.error(`Failed to delete media ${file.public_id}:`, err);
          // Optionally handle errors or return failure object
          return { success: false, public_id: file.public_id, error: err };
        }
      });

      await Promise.all(deletionPromises);
    }

    // Delete the post, related comments, and saved posts
    await Promise.all([
      Post.deleteOne({ postId: postId, draft: false }),
      Comment.deleteMany({ postId: postId }),
      savedPost.deleteMany({ savedPostId: postId }),
    ]);

    return existingPost;
  } catch (error) {
    throw error;
  }
};


const getFilteredPosts = async ({ tags = [], sort = "latest", source = "default", username ,mode="default"}) => {
    try {
        let filter = {};
        const user = await User.findOne({ username })
        console.log(user)
        const preferredTags = user?.preferences?.topics
        const preferredLang = user?.preferences?.preferredLanguage
        console.log(preferredTags)

        if (tags.length === 0) {
            if (Array.isArray(preferredTags) && preferredTags.length > 0) {
                tags = preferredTags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }


        if (tags.length === 1) {
            filter.tags = tags[0];
        } else if (tags.length > 1) {
            filter.tags = { $in: tags };
        }

        //console.log(filter)


        let sortOptions = {};
        switch (sort.toLowerCase()) {
            case "latest":
                sortOptions.createdAt = -1;
                break;
            case "most likes":
                sortOptions.likes = -1;
                break;
            case "most comments":
                sortOptions.comments = -1;
                break;
            case "earliest":
                sortOptions.createdAt = 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }


        if (source === "personalized") {  //gets my post
            filter.username = username;
        }

        if(source === "all"){ //returns all post 
            filter={}
        }

        console.log(filter)

        let num = mode ==="default"? 10 : 5 //mode limiter

        let posts = await Post.find({ ...filter, draft: false }).sort(sortOptions).limit(num);
        console.log(posts)
        if (posts.length === 0 && source === "default") {
            posts = []
        }


        for (let post of posts) {
            if (post.media && post.media.length > 0) {
                post.media = await Promise.all(
                post.media.map(async (file) => {
                    let signedUrl;
                    try {
                    signedUrl = await gcsClient.url(file.public_id);
                    } catch (err) {
                    console.error(`Failed to get signed URL for ${file.public_id}`, err);
                    signedUrl = file.url; // fallback to stored url or whatever you have
                    }
                    return {
                    ...file,
                    url:signedUrl, // add cache buster if you want
                    secure_url: signedUrl,
                    };
                })
                );
            }
            }
            console.log("Signed media URL example:", posts[0]?.media?.[0]?.url);

        if (preferredLang) {
            for (let post of posts) {
                post.title = await translate(post.title, preferredLang);
                post.content = await translate(post.content, preferredLang); // if `post.content` exists
            }
        }

        return posts;
    } catch (error) {
        throw new Error("Failed to filter/sort posts: " + error.message);
    }
};


//used as a general function to slice array according to mode 
/*
const modeLimit = async (data) => {
    try {
        let limit = 10;
        const { post, mode } = data
        if (mode === "Big") {
            limit = 5
        }

        const posts = post.slice(0, limit)
        return posts
    } catch (error) {
        throw error
    }
}
    */

const getPostWithComment = async (data) => {
  const { postId, username } = data;
  const user = await User.findOne({ username }).lean();
  const preferredLang = user?.preferences?.preferredLanguage;

  try {
    let [post, comments] = await Promise.all([
      Post.findOne({ postId }).lean(),
      Comment.find({ postId }).sort({ createdAt: -1 }).lean()
    ]);
    if (!post) throw Error("Post not found");

    if (post.comments !== comments.length) {
      await Post.updateOne({ postId, draft: false }, { comments: comments.length });
      post.comments = comments.length; // update local copy
    }

    // Replace URLs with signed URLs from GCS
    if (post.media && post.media.length > 0) {
      post.media = await Promise.all(post.media.map(async (file) => {
        let signedUrl;
        try {
          signedUrl = await gcsClient.url(file.public_id);
        } catch (err) {
          console.error(`Failed to get signed URL for ${file.public_id}`, err);
          signedUrl = file.url; // fallback
        }
        
        return {
          ...file,
          url: signedUrl,
          secure_url: signedUrl,
        };
      }));
    }

    let translatedComments = null;
    if (preferredLang) {
      post.title = await translate(post.title, preferredLang);
      post.content = await translate(post.content, preferredLang);

      translatedComments = await Promise.all(
        comments.map(async (comment) => {
          const translatedContent = await translate(comment.content, preferredLang);
          return {
            ...comment,
            content: translatedContent,
          };
        })
      );
    } else {
      translatedComments = comments; // no translation
    }

    const nestedComments = await createNestedComment(translatedComments);

    return {
      ...post,
      commentArray: nestedComments,
      commentCount: comments.length,
    };
  } catch (error) {
    throw error;
  }
};


/*
const getAllMyPosts = async (data) => {
    try {
        const username = data
        const allMyPosts = await Post.find({ username: username, draft: false }).sort({ createdAt: -1 });
        allMyPosts.forEach(post => {
            if (post.media && post.media.length > 0) {
                post.media = post.media.map(file => ({
                    ...file,
                    url: addCacheBuster(file.url),
                }));
            }
        });
        return allMyPosts
    } catch (error) {
        throw error
    }
}*/

const getAllMyDrafts = async (username) => {
  try {
    const user = await User.findOne({ username }).lean();
    const preferredLang = user?.preferences?.preferredLanguage;
    const myDrafts = await Post.find({ username, draft: true }).sort({ createdAt: -1 });

    // Replace media URLs with signed URLs
    for (const draft of myDrafts) {
      if (draft.media && draft.media.length > 0) {
        draft.media = await Promise.all(draft.media.map(async (file) => {
          try {
            const signedUrl = await gcsClient.url(file.public_id);
            return {
              ...file,
              url:signedUrl,
              secure_url: signedUrl,
            };
          } catch (err) {
            console.error(`Failed to get signed URL for ${file.public_id}`, err);
            return file; // fallback to original file object
          }
        }));
      }
    }

    if (preferredLang) {
      for (let draft of myDrafts) {
        draft.title = await translate(draft.title, preferredLang);
        draft.content = await translate(draft.content, preferredLang);
      }
    }

    return myDrafts;
  } catch (error) {
    throw error;
  }
};

const getMyDraft = async ({ username, postId }) => {
  try {
    const user = await User.findOne({ username }).lean();
    const preferredLang = user?.preferences?.preferredLanguage;
    const myDraft = await Post.findOne({ username, postId, draft: true });

    if (!myDraft) throw new Error("Draft not found");

    if (myDraft.media && myDraft.media.length > 0) {
      myDraft.media = await Promise.all(myDraft.media.map(async (file) => {
        try {
          const signedUrl = await gcsClient.url(file.public_id);
          return {
            ...file,
            url: signedUrl,
            secure_url: signedUrl,
          };
        } catch (err) {
          console.error(`Failed to get signed URL for ${file.public_id}`, err);
          return file; // fallback
        }
      }));
    }

    if (preferredLang) {
      myDraft.title = await translate(myDraft.title, preferredLang);
      myDraft.content = await translate(myDraft.content, preferredLang);
    }

    return myDraft;
  } catch (error) {
    throw error;
  }
};

const deleteDrafts = async (data) => {
  try {
    const { username, postId } = data;
    const deletedDraft = await Post.findOne({ username, postId, draft: true });
    if (!deletedDraft) {
      throw Error("Draft does not exist");
    }

    // Delete media from GCS
    const deleteMedia = (deletedDraft.media || []).map(async (file) => {
      try {
        return await gcsClient.bucket.file(file.public_id).delete();
      } catch (err) {
        console.warn(`Failed to delete file ${file.public_id} from GCS:`, err.message);
        return null; // continue deleting others
      }
    });

    if (deleteMedia.length > 0) {
      await Promise.all(deleteMedia);
    }

    await Post.deleteOne({ username, postId, draft: true });
    return deletedDraft;
  } catch (error) {
    throw error;
  }
};

const getPostByTitle = async (data) => {
    try {
        const { title, username } = data
        const user = await User.findOne({ username }).lean();
        const preferredLang = user?.preferences?.preferredLanguage
        console.log(preferredLang)
        const post = await Post.findOne({ title: title, draft: false }).lean()
        if (preferredLang) {
            post.title = await translate(post.title, preferredLang);
            post.content = await translate(post.content, preferredLang);
        }
        return post
    } catch (error) {
        throw error
    }
}



function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const searchPosts = async (data) => {
    try {
            const search = typeof data === 'string' ? data : data?.search;
    const username = typeof data === 'object' ? data?.username : undefined;
        const user = await User.findOne({ username }).lean();
        const preferredLang = user?.preferences?.preferredLanguage
        console.log(preferredLang)
        if (!search || typeof search !== 'string') return [];

        const safeSearch = escapeRegex(search.trim());
        const regex = new RegExp(safeSearch, 'i');

        const posts = await Post.find({
            title: { $regex: regex },
            draft: false
        })
            .select('postId title -_id')
            .limit(10)
            .sort({ createdAt: -1 });

        console.log(posts);
        if (preferredLang) {
            for (let post of posts) {
                post.title = await translate(post.title, preferredLang);
            }
        }

        return posts.map(post => ({ postId: post.postId, title: post.title }));
    } catch (error) {
        console.error('Error searching post titles:', error);
        throw error;
    }
};




module.exports = { createPost, editDraft, deletePost, getFilteredPosts, getPostWithComment, getAllMyDrafts, getMyDraft, deleteDrafts, getPostByTitle,searchPosts,escapeRegex};
