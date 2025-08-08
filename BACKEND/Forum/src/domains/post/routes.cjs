const express = require("express");
const {createPost,editDraft,deletePost,getFilteredPosts,getPostWithComment,getAllMyDrafts,getMyDraft,deleteDrafts,getPostByTitle,searchPosts} = require("./controller.cjs");
const auth = require("./../../middleware/auth.cjs");
const {validateBody,validateParams,validateQuery} = require("./../../middleware/validate.cjs")
const {postDraftSchema,querySchema,paramsSchema,postTitleParamSchema,searchBarParamSchema} = require("./../../utils/validators/postValidator.cjs")
const upload = require("../../config/googleStorage.cjs");
const normalizeTagsMiddleware = require("./../../middleware/normalizeTags.cjs");
const { gcsClient } = require('../../config/googleConfig.cjs');
const router = express.Router();

//create post/Draft
router.post("/create", auth, upload.array("media", 5), normalizeTagsMiddleware, validateBody(postDraftSchema), async (req, res) => {
  try {
    const { title, content, tags, draft = false } = req.body;
    const username = req.currentUser.username;

    // Use req.files as returned by multer GCS storage (already encrypted and uploaded)
    const media = (req.files || []).map(file => ({
      url: file.url,
      type: file.resource_type,
      public_id: file.public_id,
      original_filename: file.originalname,
      mimetype: file.mimetype,
      format: file.format,
    }));

    const createdPost = await createPost({ title, content, tags, username, draft, media });

    res.status(200).json(createdPost);
  } catch (error) {
    res.status(400).json({ error: error.message || error.toString() });
  }
});





//delete post via postId
router.delete("/:post/delete",auth,validateParams(paramsSchema),async(req,res)=>{
    try {
        const postId = req.params.post
        const username = req.currentUser.username;
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
router.get("/", auth, validateQuery(querySchema), async (req, res) => {
    try {
        let { filter = "default", mode = "default", sort = "latest", source = "default" } = req.query;
        let tags = []
        if (filter !== "default") {
            tags = filter.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        //TODO accomodate for preferences, when no filter tag is selected
        // Do an else statement where if it is default, check currUser's perferences and 


        const username = req.currentUser?.username



        if (source !== "default" && !username) {
            throw new Error("No Username given for personalized filter");
        }
        const post = await getFilteredPosts({ tags, sort, source, username,mode })
        console.log("Username passed to getFilteredPosts:", username);
        console.log(tags)
        console.log(source)
        /*const limitedPosts = await modeLimit({ post, mode })*/
        res.status(200).json(post)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//TODO GET POST WHEN WE CLICK ON A LINK, VIEW ONE POST WITH COMMENTS!
// comment structure is top level commments are by earliest, nested levels are by earliest
//reason is to show ordering in replies to post
router.get("/getPost/:post", auth ,validateParams(paramsSchema),async (req, res) => {
    try {
        const postId = req.params.post
        const username = req.currentUser.username
        const response = await getPostWithComment({postId,username})
        res.status(200).json(response);
    } catch (error) {
        res.status(400).send(error.message)
    }
})


router.get("/getPost/title/:title",auth,validateParams(postTitleParamSchema),async(req,res)=>{
    try {
        const title = req.params.title
        const username = req.currentUser.username
        const post = await getPostByTitle({title,username})
        res.status(200).json(post)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.get("/getPost/search/:search", auth, validateParams(searchBarParamSchema), async (req, res)=>{
    try {
        const search = req.params.search
        const username = req.currentUser.username
        const postsTitle = await searchPosts({search,username})
        res.status(200).json(postsTitle)
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


router.put(
  "/myDrafts/:post/edit",
  auth,
  validateParams(paramsSchema),
  upload.array("media", 5),
  normalizeTagsMiddleware,
  validateBody(postDraftSchema),
  async (req, res) => {
    try {
      const postId = req.params.post;
      const { title, content, tags, draft = true } = req.body;
      const username = req.currentUser.username;

      let mediaToRemove = [];
      if (req.body.mediaToRemove) {
        const raw = req.body.mediaToRemove;
        mediaToRemove = Array.isArray(raw) ? raw : [raw];
      }

      console.log("Parsed mediaToRemove:", mediaToRemove);

      // 1. Map uploaded files to media objects
      let newMedia = [];
      if (req.files && req.files.length > 0) {
        newMedia = req.files.map(file => ({
          url: file.url,  // from GCS multer engine
          type: file.mimetype.startsWith("video") ? "video" : "image",
          public_id: file.filename, // filename = GCS object name
          original_filename: file.originalname,
          mimetype: file.mimetype,
        }));
      }

      // 2. Remove old media from GCS
      if (mediaToRemove.length > 0) {
        await Promise.all(
          mediaToRemove.map(async (publicId) => {
            try {
              await gcsClient.bucket.file(publicId).delete();
              console.log(`Deleted GCS file: ${publicId}`);
            } catch (err) {
              console.warn(`Failed to delete ${publicId}:`, err.message);
            }
          })
        );
      }

      // 3. Pass everything to service
      const updatedDraft = await editDraft({
        postId,
        content,
        title,
        tags,
        username,
        draft,
        newMedia,
        mediaToRemove
      });

      res.status(200).json(updatedDraft);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || error.toString() });
    }
  }
);


module.exports = router