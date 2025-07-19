const express = require("express");
const {createPost,editDraft,deletePost,modeLimit,getFilteredPosts,getPostWithComment,likePosts,getAllMyPosts,getAllMyDrafts,getMyDraft,deleteDrafts} = require("./controller.cjs");
const auth = require("./../../middleware/auth.cjs");
const {validateBody,validateParams,validateQuery} = require("./../../middleware/validate.cjs")
const {postDraftSchema,querySchema,paramsSchema} = require("./../../utils/validators/postValidator.cjs")
const router = express.Router();

//create post/Draft
router.post("/create",auth,validateBody(postDraftSchema),async (req,res)=>{
    try {
        const { title, content, tags ,draft = false} = req.body;
        const username = req.currentUser.username;
        const createdPost = await createPost({ title, content, tags, username ,draft})
        res.status(200).json(createdPost);

    } catch (error) {
        res.status(400).send(error.message)
    }
})


//delete post via postId
router.delete("/:post/delete",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const postId = req.params.post
        const username = req.currentUser.username;
        if(!postId){
            throw Error("No PostId given")
        }
        if(!username){
            throw Error("No Username given")
        }
        const deletedPost = await deletePost({postId,username})
        res.status(200).json(deletedPost)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//gets post based on the filter, display mode and sorting 
router.get("/",validateQuery(querySchema),async(req,res)=>{
    try {
        let { filter = "default", mode = "default", sort = "latest" } = req.query;
        let tags = []
        if (filter !== "default") {
            tags = filter.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        const post = await getFilteredPosts({tags,sort})
        const limitedPosts = await modeLimit({post,mode})
        res.status(200).json(limitedPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//TODO GET POST WHEN WE CLICK ON A LINK, VIEW ONE POST WITH COMMENTS!
// comment structure is top level commments are by earliest, nested levels are by earliest
//reason is to show ordering in replies to post
router.get("/getPost/:post", validateParams(paramsSchema),async (req, res) => {
    try {
        const postId = req.params.post
        if (!postId) {
            throw Error("No PostId given")
        }

        const response = await getPostWithComment(postId)
        res.status(200).json(response);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
router.get("/myPosts/", auth, async (req, res) => {
    try {
        const username = req.currentUser.username
        if (!username) {
            throw Error("No Username given")
        }
        const allMyPosts = await getAllMyPosts(username)
        res.status(200).json(allMyPosts)
    } catch (error) {
        res.status(400).send(error.message)
    }
});

//TODO, do a like counter
router.put("/:post/like",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const postId = req.params.post
                if(!postId){
            throw Error("No PostId given")
        }
        const {like = "like"} = req.query 
        const updatedLikes = await likePosts({like,postId})
        res.status(200).json({ 
            likes: updatedLikes.likes,
            message: "Like added successfully"
        });
    } catch (error) {
        res.status(400).send(error.message)
    }
})



//displays all current draft by username
router.get("/myDrafts",auth,async(req,res)=>{
    try {
        const username = req.currentUser.username
        const myDrafts = await getAllMyDrafts(username)
        res.status(200).json(myDrafts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//displays the draft
router.get("/myDrafts/:post",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const username = req.currentUser.username
        const postId = req.params.post
        const myDrafts = await getMyDraft({username,postId})
        res.status(200).json(myDrafts)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.delete("/myDrafts/:post/delete",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const username = req.currentUser.username
        const postId = req.params.post
        const deletedDraft = await deleteDrafts({username,postId})
        res.status(200).json(deletedDraft)
    } catch (error) {
        res.status(400).send(error.message)
    }   
})


//edit draft via postId
router.put("/myDrafts/:post/edit", auth ,validateParams(paramsSchema),validateBody(postDraftSchema),async (req, res) => {
    try {
        const postId = req.params.post
        const {title,content,tags,draft = true} = req.body
        const username = req.currentUser.username;
        
        if (!postId) {
            throw Error("No PostId given")
        }
        if (!username) {
            throw Error("No Username given")
        }
        const existingEditedDraft = await editDraft({ postId, content,title,tags,username,draft})
        res.status(200).json(existingEditedDraft)
    } catch (error) {
        res.status(400).send(error.message)
    }
})





module.exports = router