require("dotenv").config();
const request = require("supertest");
const app = require("../../app.cjs"); //express app
const User = require("../../domains/user/model.cjs");
const Comment = require("../../domains/comment/model.cjs")
const { Post } = require("../../domains/post/model.cjs")
const jwt = require("jsonwebtoken");
require("./setUpMongo.cjs"); // Mongo Memory Server setup

describe("Create a comment to a post", () => {
    let token
    let user
    let post
    beforeEach(async () => {
        //create the mock data user and post , to make comments to
        user = await User.create({
            name: "sean",
            username: "Bearson",
            number: "+6512421535",
            email: "test@example.com",
            password: "hashed-password",
            verified: true,
            preferences: {
                preferredLanguage: "English",
                textSize: "Medium",
                contentMode: "Default",
                topics: ["Pediatric Care"]
            }
        });

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
        await User.deleteMany()
        await Post.deleteMany()
        await Comment.deleteMany()
    })

    test("should create a new comment",async()=>{
        const res = await request(app)
            .post(`/api/v1/${post.postId}/comment/create`)
            .set("Cookie",[`token=${token}`])
            .send({
                parentCommentId:null,
                content: "This is a test comment"
            })
        console.log(res.body)
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("commentId");
        expect(res.body.content).toBe("This is a test comment");
        expect(res.body.username).toBe(user.username);
    })

    test("should fail with invalid postId",async()=>{
        const res = await request(app)
            .post("/api/v1/invalidPostId/comment/create")
            .set("Cookie",[`token=${token}`])
            .send({
                parentCommentId:null,
                content:"Another comment"
            })

            expect(res.statusCode).toBe(400)
            expect(res.text).toMatch("Post not found")
    })

    test("should fail without right auth token",async()=>{
        const res = await request(app)
            .post(`/api/v1/${post.postId}/comment/create`)
            .set("Cookie",["token=fakeToken"])
            .send({
                parentCommentId:null,
                content:"Another comment"
            })
    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch("Invalid Token provided!");   
    })
})