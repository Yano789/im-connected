const {Post} = require("./model.cjs")
const {hashData} = require("../../utils/hashData.cjs");
const User = require("../user/model.cjs");
const Comment = require("../comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")
const savedPost = require("../savedPosts/model.cjs")


const createPost = async (data) => {
    try {
        const { title, content, tags, username, draft } = data;
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
            draft: draft
        });

        const createdPost = await newPost.save();
        return createdPost;
    } catch (error) {
        throw error;
    }
};

const editDraft = async (data) => {
    try {
        const { postId, content, title, tags ,username,draft} = data;
        const existingDraft = await Post.findOne({postId})

        if (!existingDraft) throw Error("Draft does not exist");
        if(existingDraft.username !== username) throw new Error("unauthorized");
        if (!existingDraft.draft) throw Error("Cannot edit a published post");
        const existingEditedDraft = await Post.findOneAndUpdate({ postId }, { title: title, content: content, tags: Array.isArray(tags) ? tags : [], createdAt: Date.now(), edited: true ,draft:draft},{ new: true })
        if (!existingEditedDraft) {
            throw Error("Post does not exist!")
        }
        return existingEditedDraft
        
    } catch (error) {
        throw error
    }
}

const deletePost = async(data)=>{
    try {
        const {postId,username} = data;
        const existingPost = await Post.findOne({postId})
                if(!existingPost){
            throw Error("Post does not exist")
        }
        if(existingPost.username !== username){
            throw Error("unauthorized");
        }else{
            await Promise.all([ Post.deleteOne({postId:postId,draft:false}),Comment.deleteMany({postId:postId}),savedPost.deleteMany({savedPostId:postId})])
            return existingPost
        }

    } catch (error) {
        throw error
    }
}


const getFilteredPosts = async ({ tags = [], sort = "latest" }) => {
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

        // Fetch posts with filter and sort directly in DB
        const posts = await Post.find({...filter,draft:false}).sort(sortOptions);
        return posts;
    } catch (error) {
        throw new Error("Failed to filter/sort posts: " + error.message);
    }
};


//used as a general function to slice array according to mode 
const modeLimit = async(data)=>{
 try {
        let limit = 10;
        const{post,mode} = data
        if(mode === "Big"){
            limit = 5
        }
        
        const posts = post.slice(0,limit)
        return posts
    } catch (error) {
        throw error
    }
}

const getPostWithComment = async(data)=>{
    const postId = data
    try {
         let [post, comments] = await Promise.all([
            Post.findOne({ postId }).lean(),
            Comment.find({ postId }).sort({ createdAt: -1 }).lean()
        ]);
        if (!post) {
            throw Error ("Post not found");
        }
        if(post.comments != comments.length){
            post = await Post.findOneAndUpdate({postId:postId,draft:false},{comments:comments.length},{new:true})
        }
        const nestedComments = await createNestedComment(comments)
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


const likePosts = async(data)=>{
    const {like,postId} = data
    try {
        const query = (like && like === "like")
            ? { likes: 1 }
            : {likes:-1};
        await Post.updateOne({postId:postId,draft:false},{$inc:query})
        const updatedLikes = await Post.findOne({ postId })
        return updatedLikes
    } catch (error) {
        throw error
    }
}

const getAllMyPosts = async(data)=>{
    try {
        const username = data
        const allMyPosts = await Post.find({username:username,draft:false}).sort({ createdAt: -1 });
        return allMyPosts
    } catch (error) {
        throw error
    }
}

const getAllMyDrafts = async(data)=>{
    try {
        const username = data
        const myDrafts = await Post.find({username,draft:true}).sort({createdAt: -1});
        return myDrafts
    } catch (error) {
        throw error
    }
}

const getMyDraft = async(data)=>{
    try {
        const {username,postId} = data
        const myDraft = await Post.findOne({username:username,postId:postId,draft:true})
        return myDraft
    } catch (error) {
        throw error
    }
}

const deleteDrafts = async(data)=>{
    try {
        const {username,postId} = data
        const deletedDraft = await Post.findOneAndDelete({username:username,postId:postId,draft:true})
        return deletedDraft
    } catch (error) {
        throw error
    }
}

module.exports = {createPost,editDraft,deletePost,modeLimit,getFilteredPosts,getPostWithComment,likePosts,getAllMyPosts,getAllMyDrafts,getMyDraft,deleteDrafts}