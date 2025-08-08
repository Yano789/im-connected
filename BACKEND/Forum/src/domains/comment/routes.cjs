const express = require("express");
const { createComment, editComment, deleteComment, getAllComments,getComment } = require("./controller.cjs")
const auth = require("./../../middleware/auth.cjs");
const {validateBody,validateParams} = require("./../../middleware/validate.cjs")
const {postParamSchema,createCommentBodySchema,editCommentBodySchema,postAndCommentParamsSchema} = require("./../../utils/validators/commentValidators.cjs")
const router = express.Router({ mergeParams: true });

//create comment for a specific post
router.post("/create", auth ,validateParams(postParamSchema),validateBody(createCommentBodySchema),async (req, res) => {
    try {
        const postId = req.params.post
        const username = req.currentUser.username;
        const { parentCommentId, content } = req.body
        const newComment = await createComment({ postId, parentCommentId, username, content })

        res.status(200).json(newComment)

    } catch (error) {
        res.status(400).send(error.message)
    }
})


//edit comment via commentId
router.put("/:post/:comment/edit",auth,validateParams(postAndCommentParamsSchema),validateBody(editCommentBodySchema),async (req, res) => {
    try {
        const commentId = req.params.comment
        const username = req.currentUser.username;
        const { content } = req.body
        const editedComment = await editComment({ commentId, content,username })
        res.status(200).json(editedComment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete comments via commentId, should be able to retain the nested comments as well
// if top level comment, the next nested comment shld be the next top level comment
// if nested, then its parent command id shld go to the predessesor level comment
router.delete("/:post/:comment/delete", auth ,validateParams(postAndCommentParamsSchema),async (req, res) => {
    try {
        const postId = req.params.post
        const commentId = req.params.comment
        const username = req.currentUser.username;
        const deletedComment = await deleteComment({postId,commentId,username})
        res.status(200).json(deletedComment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get only all the comments in a nested structure
router.get("/",auth,validateParams(postParamSchema),async (req, res) => {
    try {
        const postId = req.params.post
        const username = req.currentUser.username
        const nestedComments = await getAllComments({postId,username})
        res.status(200).json(nestedComments)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get a specific comment
router.get("/:comment",auth,validateParams(postAndCommentParamsSchema),async(req,res)=>{
    try {
        const postId = req.params.post
        const commentId = req.params.comment
        const username = req.currentUser.username
        const comment = await getComment({postId,commentId,username})
        res.status(200).json(comment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router
