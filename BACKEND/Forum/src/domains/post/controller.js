const Post = require("./model")
const {hashData} = require("../../utils/hashData");
const User = require("../user/model");

const createPost = async(data)=>{
    try {
        const {title,content,tag,username} = data;
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
                tag,
                createdAt:Date.now()
            })
            const createdPost = await newPost.save()
            return createdPost
        }
    } catch (error) {
        throw error;
    }
}

const editPost = async(data)=>{
    try {
        const {postId,newContent,newTitle,newTag} = data;
        const existingPost = await Post.findOne({postId})
        if(!existingPost){
            throw Error("Post does not exist!")
        }else{
            const editedTag = newTag == null ? existingPost.tag: newTag
            const editedTitle = newTitle==null ? existingPost.title:newTitle
            const editedContent = newContent == null ? existingPost.content:newContent
            await Post.updateOne({postId},{title:editedTitle,content:editedContent,tag:editedTag,createdAt:Date.now(),edited:true})
            const existingEditedPost = await Post.findOne({postId})
            return existingEditedPost
        }
    } catch (error) {
        throw error
    }
}

const deletePost = async(data)=>{
    try {
        const postId = data;
        const existingPost = await Post.findOne({postId})
        if(!existingPost){
            throw Error("Post does not exist")
        }else{
            await Post.deleteOne({postId});
            return existingPost
        }

    } catch (error) {
        throw error
    }
}


const getFilteredPosts = async ({ filter, sort }) => {
    try {
        // Determine sort order for MongoDB
        const sortOption = (sort === "earliest") ? 1 : -1; // 1 = ascending, -1 = descending

        // Build query
        const query = (filter && filter !== "default")
            ? { tag: filter }
            : {};

        // Fetch posts with filter and sort directly in DB
        const posts = await Post.find(query).sort({ createdAt: sortOption });
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
        if(mode == "Big"){
            limit = 5
        }
        
        const posts = post.slice(0,limit)
        return posts
    } catch (error) {
        throw error
    }
}

module.exports = {createPost,editPost,deletePost,modeLimit,getFilteredPosts}