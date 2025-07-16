const express = require("express");
const {createPost,editPost,deletePost,modeLimit,getFilteredPosts,getPostWithComment,likePosts,getAllMyPosts} = require("./controller.cjs");
const auth = require("./../../middleware/auth.cjs");
const {allowedTags} = require("./model.cjs");
const router = express.Router();

//create post
router.post("/create",auth,async (req,res)=>{
    try {
        const { title, content, tags } = req.body;
        if (!content) {
            throw Error("Empty Content Given!");
        }
        if (!title) {
            throw Error("Empty Title Given!");
        }
        if (!Array.isArray(tags) || tags.some(tag => !allowedTags.includes(tag))) {
            throw Error('Invalid tag(s) provided');
        }
        const username = req.currentUser.username;
        const createdPost = await createPost({ title, content, tags, username })
        res.status(200).json(createdPost);

    } catch (error) {
        res.status(400).send(error.message)
    }
})

//edit post via postId
router.put("/:post/edit", auth ,async (req, res) => {
    try {
        const postId = req.params.post
        const {newTitle,newContent,newTags} = req.body
        const username = req.currentUser.username;
        
        if (!newContent) {
            throw Error("Empty Content Given!");
        }
        if (!newTitle) {
            throw Error("Empty Title Given!");
        }
        if (!Array.isArray(newTags) || newTags.some(tag => !allowedTags.includes(tag))) {
            throw Error('Invalid tag(s) provided');
        }
        if (!postId) {
            throw Error("No PostId given")
        }
        if (!username) {
            throw Error("No Username given")
        }
        const editedPost = await editPost({ postId, newContent,newTitle,newTags,username})
        res.status(200).json(editedPost)
    } catch (error) {
        res.status(400).send(error.message)
    }
})


//delete post via postId
router.delete("/:post/delete",auth,async(req,res)=>{
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
router.get("/",async(req,res)=>{
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
router.get("/getPost/:post", async (req, res) => {
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
router.put("/:post/like",auth,async(req,res)=>{
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





module.exports = router