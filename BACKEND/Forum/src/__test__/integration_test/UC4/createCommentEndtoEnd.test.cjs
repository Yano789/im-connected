require("../setUpMongo.cjs"); // Mongo Memory Server setup
const request = require("supertest");
const app = require("../../../app.cjs"); //express app
const User = require("../../../domains/user/model.cjs");
const Comment = require("../../../domains/comment/model.cjs")
const { Post } = require("../../../domains/post/model.cjs")
const jwt = require("jsonwebtoken");

describe("Create a comment to a post", () => {
    let token
    let user
    let post
    beforeAll(async()=>{
        await User.deleteMany()
        await Post.deleteMany()
        await Comment.deleteMany()
    })


      async function createUserAndTokenAndPost() {
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        const username = `testuser4_${uniqueId}`;
        const email = `testuser_${uniqueId}@test.com`;
    
        const user = await User.create({
          name: "JOE",
          username,
          number: uniqueId.toString(),
          email,
          password: "password",
          verified: true,
          threadId: null,
        });

        const post = await Post.create({
            postId: uniqueId.toString(),
            title: `Test Post${uniqueId}`,
            content: "This is a test",
            username: username,
            tags: ["Mental Disability", "Pediatric Care"],
            createdAt: Date.now(),
            edited: false,
            comments: 0,
            likes: 0,
            draft: false,
            media: []
        })
    
        const token = jwt.sign(
          { userId: user._id, username: user.username, email: user.email },
          process.env.TOKEN_KEY,
          { expiresIn: process.env.TOKEN_EXPIRY }
        );
    
        return { user, token , post };
      }


    test("should create a new comment",async()=>{
        const {user,token,post} = await createUserAndTokenAndPost();
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
                const {token} = await createUserAndTokenAndPost();
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
        const {post} = await createUserAndTokenAndPost();

        const res = await request(app)
            .post(`/api/v1/${post.postId}/comment/create`)
            .set("Cookie",["token=fakeToken"])
            .send({
                parentCommentId:null,
                content:"Another comment"
            })
            console.log(res.text)
    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch("Invalid Token provided!");   
    })
})
