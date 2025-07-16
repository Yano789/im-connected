const express = require("express");
const {createSavedPost,deleteSavedPost,getAllSavedPosts} = require("./controller.cjs")
const auth = require("../../middleware/auth.cjs");
const router = express.Router({ mergeParams: true });

//save a post
router.post("/:post/save",auth,async(req,res)=>{
    try {
        const username = req.currentUser.username
        const postId = req.params.post
        if (!postId) {
            throw Error("No PostId Given!");
        }
        if (!username) {
            throw Error("No username Given!");
        }        
        const savedPosts = await createSavedPost({ postId, username })
        res.status(200).json(savedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//unsave a post
router.delete("/:post/delete",auth ,async (req, res) => {
    try {
        const username = req.currentUser.username
        const postId = req.params.post
        if (!((postId && username))) {
            throw Error("Empty Content Given!");
        }
        const deletedSavedPosts = await deleteSavedPost({ postId, username })
        res.status(200).json(deletedSavedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get all saved posts, by clicking my saved posts

router.get("/", auth ,async (req, res) => {
    try {
        const username = req.currentUser.username
        if (!username) {
            throw Error("Empty Content Given!");
        }
        const allSavedPosts = await getAllSavedPosts(username)
        res.status(200).json(allSavedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router
