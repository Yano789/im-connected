const likedPost = require("./model.cjs")
const {Post} = require("../post/model.cjs")
const User = require("../user/model.cjs")

const createLikedPost = async (data) => {

    try {
        const { postId, username } = data
        const [existingUsername, existingPost] = await Promise.all([
            User.findOne({ username }),
            Post.findOne({ postId })
        ]);

        if (!(existingUsername)) {
            throw Error("Username does not exist")
        }

        if (!(existingPost)) {
            throw Error("Post does not exist")
        }
        let liked;
        liked = await likedPost.findOne({  likedPostId: postId, username });
        if (liked){
            const post = await Post.findOne({ postId: postId, draft: false })
            return {liked,post};
        } 
        const post = await Post.findOneAndUpdate({ postId: postId, draft: false }, { $inc: {likes:1} },{new:true})
        const createdLikedPost = new likedPost({
            likedPostId: postId,
            username: username,
            createdAt: Date.now()
        })

        liked = await createdLikedPost.save()
        return {liked,post}
    } catch (error) {
        throw error
    }
}

const unlikePost = async (data) => {

    try {
        const { postId, username } = data
        const unlikedPost = await likedPost.findOneAndDelete({ username: username, likedPostId: postId })
        if(!unlikedPost){
            throw Error ("Cannot unlike a post that you didn't like")
        }
        const post = await Post.findOneAndUpdate({ postId: postId, draft: false }, { $inc: {likes: -1} },{new:true})
        return {unlikedPost,post}
    } catch (error) {
        throw error
    }
}

const getAlllikedPosts = async (data) => {
    try {
        const username = data
        const likePosts = await likedPost.find({ username: username }).sort({ createdAt: -1 }).select("likedPostId -_id")
        const likedPostIds = likePosts.map(lp => lp.likedPostId);
        if (likedPostIds.length === 0) {
            return []; // early return, no posts saved
        }
        const posts = await Post.find({ postId: { $in: likedPostIds } });
        const postMap = new Map(posts.map(post => [post.postId, post]));
        const allLikedPosts = likedPostIds.map(id => postMap.get(id)).filter(Boolean);
        return allLikedPosts
    } catch (error) {
        throw error
    }
}

module.exports = {createLikedPost,unlikePost,getAlllikedPosts}

