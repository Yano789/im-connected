const savedPost = require("./model.cjs")
const {Post} = require("../post/model.cjs")
const User = require("../user/model.cjs")
const createSavedPost = async (data) => {

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
        let saved = await savedPost.findOne({ savedPostId: postId, username });
        if (saved) return saved;
        const createdSavedPost = new savedPost({
            savedPostId: postId,
            username: username,
            createdAt: Date.now()
        })

        const savedPosts = await createdSavedPost.save()
        return savedPosts
    } catch (error) {
        throw error
    }
}


const deleteSavedPost = async (data) => {

    try {
        const { postId, username } = data
        const deletedSavedPosts = await savedPost.findOneAndDelete({ username: username, savedPostId: postId })
        return deletedSavedPosts
    } catch (error) {
        throw error
    }
}

const getAllSavedPosts = async (data) => {
    try {
        const username = data
        const savedPosts = await savedPost.find({ username: username }).sort({ createdAt: -1 }).select("savedPostId -_id")
        const savedPostIds = savedPosts.map(sp => sp.savedPostId);
        if (savedPostIds.length === 0) {
            return []; // early return, no posts saved
        }
        const posts = await Post.find({ postId: { $in: savedPostIds } });
        const postMap = new Map(posts.map(post => [post.postId, post]));
        const allSavedPosts = savedPostIds.map(id => postMap.get(id)).filter(Boolean);
        return allSavedPosts
    } catch (error) {
        throw error
    }
}
module.exports = {createSavedPost,deleteSavedPost,getAllSavedPosts}