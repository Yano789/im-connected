const express = require("express");
const {createPost,editPost,deletePost,modeLimit,getFilteredPosts} = require("./controller");
const router = express.Router();

//create post
router.post("/create",async(req,res)=>{
    try {
       const {title,content,tag,username} = req.body;
        if(!(content&&title&&tag)){
            throw Error ("Empty Content Given!");
        }

        const newPost = await createPost({title,content,tag,username})
        res.status(200).json(newPost);

    } catch (error) {
        res.status(400).send(error.message)
    }
})

//edit post via postId
router.put("/:post/edit", async (req, res) => {
    try {
        const postId = req.params.post
        const {newTitle,newContent,newTag} = req.body
        
        if (!postId) {
            throw Error("Invalid post id!")
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

//gets post based on the filter, display mode and sorting 
//TODO: UPDATE THE GET POST FILTERS THAT USES THE DISPLAY MODE AND PREFERRED TAGS
// CHECK IF WE CAN USE MULTIPLE QUERY OPTIONS PER PARAMETER
router.get("/",async(req,res)=>{
    try {
        const filter = req.query.filter || "default";
        const mode = req.query.mode || "default"
        const sort = req.query.sort || "latest"
        const post = await getFilteredPosts({filter,sort})
        const limitedPosts = await modeLimit({post,mode})
        res.status(200).json(limitedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//TODO GET POST WHEN WE CLICK ON A LINK, VIEW ONE POST WITH COMMENTS!


//TODO do a filter by username -> relevant for my posts under profile


module.exports = router