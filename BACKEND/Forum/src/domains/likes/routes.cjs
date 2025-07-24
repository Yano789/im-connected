const express = require("express")
const {createLikedPost,unlikePost,getAlllikedPosts} = require("./controller.cjs")
const auth = require("../../middleware/auth.cjs");
const {validateParams} = require("../../middleware/validate.cjs")
const paramsSchema = require("./../../utils/validators/likePostValidators.cjs")
const router = express.Router()

//like post
router.post("/:post/like",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const username = req.currentUser.username
        const postId = req.params.post   
        const {liked,post} = await createLikedPost({ postId, username })
        res.status(200).json({document:liked,likes:post.likes})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//unlike a post
router.delete("/:post/unlike",auth,validateParams(paramsSchema),async (req, res) => {
    try {
        const username = req.currentUser.username
        const postId = req.params.post
        const {unlikedPost,post} = await unlikePost({ postId, username })
        res.status(200).json({document:unlikedPost,likes:post.likes})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get all liked posts

router.get("/", auth ,async (req, res) => {
    try {
        const username = req.currentUser.username
        if (!username) {
            throw Error("Empty Content Given!");
        }
        const allLikedPosts = await getAlllikedPosts(username)
        res.status(200).json(allLikedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router

