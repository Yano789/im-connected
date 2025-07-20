const { Post } = require("./model.cjs")
const { hashData } = require("../../utils/hashData.cjs");
const User = require("../user/model.cjs");
const Comment = require("../comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")
const { v2: cloudinary } = require("cloudinary");
const savedPost = require("../savedPosts/model.cjs")

const addCacheBuster = (url) => {
    if (!url) return url;
    const cb = Date.now();
    return url.includes('?') ? `${url}&cb=${cb}` : `${url}?cb=${cb}`;
};




const createPost = async (data) => {
    try {
        const { title, content, tags, username, draft, media } = data;
        const existingUsername = await User.findOne({ username });

        if (!existingUsername) {
            throw new Error("Username does not exist");
        }

        const now = Date.now();
        const createdPostId = await hashData(username + now);

        const newPost = new Post({
            postId: createdPostId,
            title,
            content,
            username,
            tags,
            createdAt: now,
            draft: draft,
            media: media
        });

        const createdPost = await newPost.save();
        if (createdPost.media && createdPost.media.length > 0) {
            createdPost.media = createdPost.media.map(file => ({
                ...file,
                url: addCacheBuster(file.url),
            }));
        }
        return createdPost;
    } catch (error) {
        throw error;
    }
};

const editDraft = async (data) => {
    try {
        const { postId, content, title, tags, username, draft, newMedia } = data;
        const existingDraft = await Post.findOne({ postId })

        if (!existingDraft) throw Error("Draft does not exist");
        if (existingDraft.username !== username) throw new Error("unauthorized");
        if (!existingDraft.draft) throw Error("Cannot edit a published post");

        if (newMedia && newMedia.length > 0) {
            const deleteOldMediaPromises = (existingDraft.media || []).map(async (file) => {
                try {
                    console.log(`Deleting media: ${file.public_id}, type: ${file.type}`);
                    const result = await cloudinary.uploader.destroy(file.public_id, {
                        resource_type: file.type === "video" ? "video" : "image",
                    });
                    console.log(`Deletion result for ${file.public_id}:`, result);
                    return result;
                } catch (err) {
                    console.error(`Error deleting media ${file.public_id}:`, err);
                    // Continue with other deletions without throwing:
                    return null;
                }
            });
            await Promise.all(deleteOldMediaPromises);
        }

        const mediaToSave = newMedia && newMedia.length > 0 ? newMedia : existingDraft.media
        const existingEditedDraft = await Post.findOneAndUpdate({ postId }, { title: title, content: content, tags: Array.isArray(tags) ? tags : [], createdAt: Date.now(), edited: true, draft: draft, media: mediaToSave }, { new: true })
        if (!existingEditedDraft) {
            throw Error("Post does not exist!")
        }

        if (existingEditedDraft.media && existingEditedDraft.media.length > 0) {
            existingEditedDraft.media = existingEditedDraft.media.map(file => ({
                ...file,
                url: addCacheBuster(file.url),
            }));
        }
        return existingEditedDraft

    } catch (error) {
        throw error
    }
}

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
                    const result = await cloudinary.uploader.destroy(file.public_id, {
                        resource_type: file.type === "video" ? "video" : "image",
                    });
                    console.log(`Deleted media result for ${file.public_id}:`, result);
                    return result;
                } catch (err) {
                    console.error(`Error deleting media ${file.public_id}:`, err);
                    throw err; // optionally handle without throwing if you want to continue deleting others
                }
            });

            await Promise.all(deletionPromises);
        }

        // Make sure savedPost model is correctly named (capitalize if needed)
        await Promise.all([
            Post.deleteOne({ postId: postId, draft: false }),
            Comment.deleteMany({ postId: postId }),
            savedPost.deleteMany({ savedPostId: postId })
        ]);

        return existingPost;
    } catch (error) {
        console.error("deletePost error:", error);
        throw error;
    }
};


const getFilteredPosts = async ({ tags = [], sort = "latest",source= "default",username }) => {
    try {
        // Determine sort order for MongoDB
        let filter = {};

        if (tags.length === 1) {
            // Match posts that contain the single tag, even with other tags
            filter.tags = tags[0];
        } else if (tags.length === 2) {
            // Match posts with *exactly* those two tags (no more, no less)
            filter.tags = { $all: tags, $size: 2 };
        }

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
        if (source !== "default" && username) {
            filter.username = username
        }

        // Fetch posts with filter and sort directly in DB
        const posts = await Post.find({ ...filter, draft: false }).sort(sortOptions);
        posts.forEach(post => {
            if (post.media && post.media.length > 0) {
                post.media = post.media.map(file => ({
                    ...file,
                    url: addCacheBuster(file.url),
                }));
            }
        });
        return posts;
    } catch (error) {
        throw new Error("Failed to filter/sort posts: " + error.message);
    }
};


//used as a general function to slice array according to mode 
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

const getPostWithComment = async (data) => {
    const postId = data
    try {
        let [post, comments] = await Promise.all([
            Post.findOne({ postId }).lean(),
            Comment.find({ postId }).sort({ createdAt: -1 }).lean()
        ]);
        if (!post) {
            throw Error("Post not found");
        }
        if (post.comments != comments.length) {
            post = await Post.findOneAndUpdate({ postId: postId, draft: false }, { comments: comments.length }, { new: true })
        }
        const nestedComments = await createNestedComment(comments)

        if (post.media && post.media.length > 0) {
            post.media = post.media.map(file => ({
                ...file,
                url: addCacheBuster(file.url),
            }));
        }
        const response = {
            ...post,
            commentArray: nestedComments,
            commentCount: comments.length
        }
        return response
    } catch (error) {
        throw error
    }
}


const likePosts = async (data) => {
    const { like, postId } = data
    try {
        const query = (like && like === "like")
            ? { likes: 1 }
            : { likes: -1 };
        await Post.updateOne({ postId: postId, draft: false }, { $inc: query })
        const updatedLikes = await Post.findOne({ postId })
        return updatedLikes
    } catch (error) {
        throw error
    }
}

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
}

const getAllMyDrafts = async (data) => {
    try {
        const username = data
        const myDrafts = await Post.find({ username, draft: true }).sort({ createdAt: -1 });
        myDrafts.forEach(draft => {
            if (draft.media && draft.media.length > 0) {
                draft.media = draft.media.map(file => ({
                    ...file,
                    url: addCacheBuster(file.url),
                }));
            }
        });
        return myDrafts
    } catch (error) {
        throw error
    }
}

const getMyDraft = async (data) => {
    try {
        const { username, postId } = data
        const myDraft = await Post.findOne({ username: username, postId: postId, draft: true })
        if (myDraft?.media && myDraft.media.length > 0) {
            myDraft.media = myDraft.media.map(file => ({
                ...file,
                url: addCacheBuster(file.url),
            }));
        }
        return myDraft
    } catch (error) {
        throw error
    }
}

const deleteDrafts = async (data) => {
    try {
        const { username, postId } = data
        const deletedDraft = await Post.findOne({ username: username, postId: postId, draft: true })
        if (!deletedDraft) {
            throw Error("Draft does not exist")
        }
        const deleteMedia = deletedDraft.media?.map((file) =>
            cloudinary.uploader.destroy(file.public_id, {
                resource_type: file.type === "video" ? "video" : "image",
            })
        );

        if (deleteMedia && deleteMedia.length > 0) {
            await Promise.all(deleteMedia);
        }
        await Post.deleteOne({ username, postId, draft: true });
        return deletedDraft
    } catch (error) {
        throw error
    }
}

module.exports = { createPost, editDraft, deletePost, modeLimit, getFilteredPosts, getPostWithComment, likePosts, getAllMyPosts, getAllMyDrafts, getMyDraft, deleteDrafts }