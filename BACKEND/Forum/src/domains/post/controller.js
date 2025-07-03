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
            await Post.updateOne({postId},{title:newTitle,content:newContent,tag:newTag,createdAt:Date.now(),edited:true})
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

const getTenPosts = async(data)=>{
    try {
        let limit = 10;
        if(data == "Big"){
            limit = 5
        }
        
        const posts = await Post.find().sort({createdAt:-1}).limit(limit);
        return posts
    } catch (error) {
        throw error
    }
}

module.exports = {createPost,editPost,deletePost,getTenPosts}