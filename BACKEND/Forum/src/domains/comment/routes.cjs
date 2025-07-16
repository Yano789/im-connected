const express = require("express");
const { createComment, editComment, deleteComment, getAllComments } = require("./controller.cjs")
const auth = require("./../../middleware/auth.cjs");
const router = express.Router({ mergeParams: true });

//create comment
router.post("/create", auth ,async (req, res) => {
    try {
        const postId = req.params.post
        const username = req.currentUser.username;
        const { parentCommentId, content } = req.body


        if(!postId){
            throw Error("No PostId detected")
        }

        if(!username){
            throw Error("No Username detected")
        }

        if(!content){
            throw Error("No Content detected")
        }

        const newComment = await createComment({ postId, parentCommentId, username, content })

        res.status(200).json(newComment)

    } catch (error) {
        res.status(400).send(error.message)
    }
})


//edit comment via commentId
router.put("/:comment/edit",auth,async (req, res) => {
    try {
        const commentId = req.params.comment
        const username = req.currentUser.username;
        const { newContent } = req.body
        if (!(commentId)) {
            throw Error("Invalid comment id!")
        }
        if(!(newContent)){
            throw Error("Invalid content!")
        }
        const editedComment = await editComment({ commentId, newContent,username })
        res.status(200).json(editedComment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete comments via commentId, should be able to retain the nested comments as well
// if top level comment, the next nested comment shld be the next top level comment
// if nested, then its parent command id shld go to the predessesor level comment
router.delete("/:comment/delete", auth ,async (req, res) => {
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

//get all comments in a nested structure
router.get("/",async (req, res) => {
    try {
        const postId = req.params.post
        const nestedComments = await getAllComments(postId)
        res.status(200).json(nestedComments)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router
