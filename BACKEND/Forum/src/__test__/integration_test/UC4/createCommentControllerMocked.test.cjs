jest.mock("../../../domains/comment/controller.cjs",()=>({
    createComment:jest.fn(async(data)=>{
        return {
            ...data,
            commentId:"MockCommentIdFromController",
            createdAt:Date.now(),
            _id:"MockedId",
            __v:0

        }
    })
}))


//we will test the route function itself and the middlewares
require("../setUpMongo.cjs"); // Mongo Memory Server setup
const request = require("supertest");
const app = require("../../../app.cjs"); //express app
const User = require("../../../domains/user/model.cjs");
const Comment = require("../../../domains/comment/model.cjs")
const { Post } = require("../../../domains/post/model.cjs")
const jwt = require("jsonwebtoken");

describe("Create a comment to a post", () => {
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

      beforeEach(() => {
  jest.clearAllMocks();
});


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
    const { createComment } = require("../../../domains/comment/controller.cjs");
    expect(createComment).toHaveBeenCalled();
    expect(res.body.commentId).toMatch("MockCommentIdFromController")
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

    test("should fail with missing content", async () => {
            const { user, token, post } = await createUserAndTokenAndPost();

            const res = await request(app)
                .post(`/api/v1/${post.postId}/comment/create`)
                .set("Cookie", [`token=${token}`])
                .send({
                    parentCommentId: null
                    // Missing content
                })

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch("Content is required")
        })
    test("should fail with empty content", async () => {
            const { user, token, post } = await createUserAndTokenAndPost();

            const res = await request(app)
                .post(`/api/v1/${post.postId}/comment/create`)
                .set("Cookie", [`token=${token}`])
                .send({
                    parentCommentId: null,
                    content: ""
                })

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch("Content cannot be empty")
        })

    test("shouldnt handle numeric parentCommentId", async () => {
            const { user, token, post } = await createUserAndTokenAndPost();

            const res = await request(app)
                .post(`/api/v1/${post.postId}/comment/create`)
                .set("Cookie", [`token=${token}`])
                .send({
                    parentCommentId: 12345,
                    content: "Reply to numeric parent ID"
                })

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch("Parent comment ID must be a string")
        })

        test("should handle concurrent requests", async () => {
            const { user, token, post } = await createUserAndTokenAndPost();

            const promises = Array.from({ length: 5 }, (_, i) =>
                request(app)
                    .post(`/api/v1/${post.postId}/comment/create`)
                    .set("Cookie", [`token=${token}`])
                    .send({
                        parentCommentId: null,
                        content: `Concurrent comment ${i}`
                    })
            );

            const responses = await Promise.all(promises);
            
            responses.forEach((res, i) => {
                expect(res.statusCode).toBe(200);
                expect(res.body.content).toBe(`Concurrent comment ${i}`);
            });

            const { createComment } = require("../../../domains/comment/controller.cjs");
            expect(createComment).toHaveBeenCalledTimes(5); 
        })
})
