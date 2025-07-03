const express = require("express");
const {createPost,editPost,deletePost,getTenPosts} = require("./controller");
const router = express.Router();

//create post
router.post("/create",async(req,res)=>{
    try {
        let{title,content,tag,username} = req.body;
        username = username.trim()
        content = content.trim()
        title = title.trim()
        if(!(username&&content&&title&&tag)){
            throw Error ("Empty Content Given!");
        }

        const newPost = await createPost({title,content,tag,username})
        res.status(200).json(newPost);

    } catch (error) {
        res.status(400).send(error.message)
    }
})

//edit post via postId
router.put("/edit", async (req, res) => {
    try {
        let {postId,newTitle,newContent,newTag} = req.body
        newContent = newContent.trim()
        if (!(newContent&&postId&&newTitle&&newTag)) {
            throw Error("Empty Content Given!")
        }
        const editedPost = await editPost({ postId, newContent,newTitle,newTag})
        res.status(200).json(editedPost)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete post via postId
router.delete("/delete",async(req,res)=>{
    try {
        const {postId} = req.body
        const deletedPost = await deletePost(postId)
        res.status(200).json(deletedPost)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//gets the ten most recent posts
router.get("/",async(req,res)=>{
    try {
        const mode = req.query.mode || "default";
        const posts = await getTenPosts(mode)
        res.status(200).json(posts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//TODO do a filter by oldest

//TODO do a filter by tag

//TODO do a filter by username -> relevant for my posts under profile


module.exports = router