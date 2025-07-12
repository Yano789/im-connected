const express = require("express");
const{createComment,editComment,deleteComment,getAllComments} = require("./controller")
const router = express.Router();

//create comment
router.post("/:post/create",async(req,res)=>{
    try {
        const postId = req.params.post
        
        const{parentCommentId,username,content} = req.body

        console.log({ postId, parentCommentId, username, content });


        if(!((postId&&username&&content))){
            throw Error ("Empty Content Given!");
        }

        const newComment = await createComment({postId,parentCommentId,username,content})
        
        res.status(200).json(newComment)

    } catch (error) {
        res.status(400).send(error.message)
    }
})


//edit comment via commentId
router.put("/:comment/edit",async(req,res)=>{
    try {
        const commentId = req.params.comment
        const {newContent} = req.body
        if(!(commentId)){
            throw Error("Invalid comment id!")
        }
        const editedComment = await editComment({commentId,newContent})
        res.status(200).json(editedComment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete comments via commentId, should be able to retain the nested comments as well
// if top level comment, the next nested comment shld be the next top level comment
// if nested, then its parent command id shld go to the predessesor level comment
router.delete("/:comment/delete",async(req,res)=>{
    try {
        const commentId = req.params.comment
        const deletedComment = await deleteComment(commentId)
        res.status(200).json(deletedComment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//gets all the comments and nested comments
router.get("/:post",async(req,res)=>{
    try {
        const postId = req.params.post
        const nestedComments = await getAllComments(postId)
        res.status(200).json(nestedComments)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router
