const {Post} = require("./model.cjs")
const {hashData} = require("../../utils/hashData.cjs");
const User = require("../user/model.cjs");
const Comment = require("../comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")
const savedPost = require("../savedPosts/model.cjs")

const createPost = async(data)=>{
    try {
        const {title,content,tags,username} = data;
        const existingUsername = await User.findOne({username})
        if(!existingUsername){
            throw Error("Username does not exist")
        }
        else{
            const createdPostId = await hashData(username+Date.now().toLocaleString())
            const newPost = new Post({
                postId:createdPostId,
                title,
                content,
                username,
                tags,
                createdAt:Date.now()
            })
            const createdPost = await newPost.save()
            return createdPost
        }
    } catch (error) {
        throw error;
    }
}

const editPost = async (data) => {
    try {
        const { postId, newContent, newTitle, newTags ,username} = data;
        const existingPost = await Post.findOne({postId})
        if(existingPost.username !== username) throw new Error("unauthorized");
        const existingEditedPost = await Post.findOneAndUpdate({ postId }, { title: newTitle, content: newContent, tags: newTags, createdAt: Date.now(), edited: true },{ new: true })
        if (!existingEditedPost) {
            throw Error("Post does not exist!")
        }
        return existingEditedPost
        
    } catch (error) {
        throw error
    }
}

const deletePost = async(data)=>{
    try {
        const {postId,username} = data;
        const existingPost = await Post.findOne({postId})
        if(existingPost.username !== username) throw new Error("unauthorized");
        if(!existingPost){
            throw Error("Post does not exist")
        }else{
            await Promise.all([ Post.deleteOne({postId}),Comment.deleteMany({postId:postId}),savedPost.deleteMany({savedPostId:postId})])
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
        if (sort === "latest") sortOptions.createdAt = -1;
        else if (sort === "most likes") sortOptions.likes = -1;
        else if (sort === "most comments") sortOptions.comments = -1;
        else if (sort === "earliest") sortOptions.createdAt = 1;

        // Fetch posts with filter and sort directly in DB
        const posts = await Post.find(filter).sort(sortOptions);
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
            return res.status(404).send("Post not found");
        }
        if(post.comments != comments.length){
            post = await Post.findOneAndUpdate({postId},{comments:comments.length},{new:true})
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
        await Post.updateOne({postId},{$inc:query})
        const updatedLikes = await Post.findOne({ postId })
        return updatedLikes
    } catch (error) {
        throw error
    }
}

const getAllMyPosts = async(data)=>{
    try {
        const username = data
        const allMyPosts = await Post.find({username:username}).sort({ createdAt: -1 });
        return allMyPosts
    } catch (error) {
        throw error
    }
}

module.exports = {createPost,editPost,deletePost,modeLimit,getFilteredPosts,getPostWithComment,likePosts,getAllMyPosts}