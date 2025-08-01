require("dotenv").config();
const request = require("supertest");
const app = require("../../app.cjs"); //express app
const User = require("../../domains/user/model.cjs");
const { Post } = require("../../domains/post/model.cjs")
const savedPost = require("../../domains/savedPosts/model.cjs")
const jwt = require("jsonwebtoken");
require("./setUpMongo.cjs");

describe("Saving a post",()=>{
    let token;
    let user;
    let post;

    beforeEach(async()=>{
        user = await User.create({
            name: "sean",
            username: "Bearson",
            number: "+6512421535",
            email: "test@example.com",
            password: "hashed-password",
            verified: true,
            preferences: {
                preferredLanguage: "en",
                textSize: "Medium",
                contentMode: "Default",
                topics: ["Pediatric Care"]
            }
        })
        post = await Post.create({
            postId: "testpostId123",
            title: "Test Post",
            content: "This is a test",
            username: "jane",
            tags: ["Mental Disability", "Pediatric Care"],
            createdAt: Date.now(),
            edited: false,
            comments: 0,
            likes: 0,
            draft: false,
            media: []
        })        

        token = jwt.sign(
            { userId: user._id, username: user.username, email: user.email },
            process.env.TOKEN_KEY,
            { expiresIn: process.env.TOKEN_EXPIRY }
        );
    })

    afterEach(async()=>{
        await User.deleteMany();
        await Post.deleteMany();
    })

    test("Should save a post successfully",async()=>{
        const res = await request(app)
                    .post(`/api/v1/saved/${post.postId}/save`)
                    .set("Cookie",[`token=${token}`])

        console.log(res.body)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("savedPostId")
        expect(res.body.savedPostId).toBe(post.postId)
        expect(res.body.username).toBe(user.username)
    })

    test("should fail with invalid postId",async()=>{
        const res = await request(app)
                    .post("/api/v1/saved/invalidPostId/save")
                    .set("Cookie",[`token=${token}`])
        expect(res.statusCode).toBe(400)
        expect(res.text).toMatch("Post does not exist")

    })

    test("should fail without right auth token",async()=>{
        const res = await request(app)
                    .post(`/api/v1/saved/${post.postId}/save`)
                    .set("Cookie",["token=fakeToken"])
    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch("Invalid Token provided!");          
    })



})