jest.mock("../../../domains/post/controller.cjs", () => ({
  createPost: jest.fn(async (data) => {
    // simulate media upload without appending cache buster to the signed URL
    const media = (data.media || []).map((file) => ({
      ...file,
      url: file.url, 
      secure_url: file.secure_url || file.url,
    }));

    return {
      ...data,
      postId: "mockedPostIdFromController",
      createdAt: Date.now(),
      edited: false,
      comments: 0,
      likes: 0,
      _id: "mockedObjectId",
      __v: 0,
      media,
    };
  }),
}));



// testing route functionality and its middleware
const path = require("path");
require("../setUpMongo.cjs");
const fs = require("fs");
const request = require("supertest");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const { Post } = require("../../../domains/post/model.cjs");

describe("Create Post (Mocked Controller)", () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create fresh user + token for every test
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const username = `testuser1_${uniqueId}`;
    const email = `testuser1_${uniqueId}@test.com`;

    const user = await User.create({
      name: "JOE",
      username,
      number: uniqueId.toString(),
      email,
      password: "password",
      verified: true,
      threadId: null,
    });

    const jwt = require("jsonwebtoken");
    token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
  });

  test("should call mocked createPostController with expected data", async () => {
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Mocked Post1",
        content: "Content of the mocked post",
        draft: false,
        tags: ["Mental Disability"],
      })
      .set("Content-Type", "application/json");

    if (res.statusCode !== 200) {
      console.log("❌ Response Status:", res.statusCode);
      console.log("❌ Response Body:", res.body);
      console.log("❌ Response Text:", res.text);
    }
    console.log(res.body)
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Mocked Post1");
    expect(res.body.tags).toEqual(["Mental Disability"]);

    const { createPost } = require("../../../domains/post/controller.cjs");
    expect(createPost).toHaveBeenCalled();
  });

  test("should handle media and multiple tags", async () => {
    const imagePath = path.join(__dirname, "../../dummy_media/dummy.png");
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .field("title", "Media Post1")
      .field("content", "Post with media")
      .field("tags", "Mental Disability")
      .field("tags", "Pediatric Care")
      .field("draft", "false")
      .attach("media", fs.createReadStream(imagePath), {
        filename: "dummy.png",
        contentType: "image/png",
      });

    if (res.statusCode !== 200) {
      console.log("❌ Response Status:", res.statusCode);
      console.log("❌ Response Body:", res.body);
      console.log("❌ Response Text:", res.text);
    }
    console.log(res.body)
    expect(res.statusCode).toBe(200);
    expect(res.body.tags).toEqual(["Mental Disability", "Pediatric Care"]);
    expect(res.body.media).toBeDefined();
  });

    test("should fail without right auth token",async()=>{
        const res = await request(app)
            .post(`/api/v1/post/create`)
            .set("Cookie",["token=fakeToken"])
            .send({
                    title: "Test Tags Array1",
                    content: "Testing tags array",
                    draft: false,
                    tags: ["Mental Disability"],
                  })
            console.log(res.text)
    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch("Invalid Token provided!");   
    })


test("should handle multiple media files", async () => {
    const imagePath1 = path.join(__dirname, "../../dummy_media/dummy.png");
    const imagePath2 = path.join(__dirname, "../../dummy_media/dummy.png"); 
    
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .field("title", "Multiple Media Post")
      .field("content", "Post with multiple media files")
      .field("tags", "Mental Disability")
      .attach("media", fs.createReadStream(imagePath1))
      .attach("media", fs.createReadStream(imagePath2));

    expect(res.statusCode).toBe(200);
    const {createPost} = require("../../../domains/post/controller.cjs")
    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        media: expect.arrayContaining([
          expect.objectContaining({
            url: expect.any(String),
            type: expect.any(String),
            public_id: expect.any(String),
            original_filename: expect.any(String),
            mimetype: expect.any(String),
            format: expect.any(String)
          })
        ])
      })
    );
});
 test("should fail validation with empty title", async () => {
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "", // Empty title
        content: "Valid content",
        tags: ["Mental Disability"],
      });

    expect(res.statusCode).toBe(400);
    const {createPost} = require("../../../domains/post/controller.cjs")
    expect(createPost).not.toHaveBeenCalled();
    expect(res.text).toMatch( "{\"error\":\"\\\"title\\\" cannot be empty\"}")
  });

  test("should fail validation with empty content", async () => {
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Valid title",
        content: "", // Empty content
        tags: ["Mental Disability"],
      });

    expect(res.statusCode).toBe(400);
    const {createPost} = require("../../../domains/post/controller.cjs")
    expect(createPost).not.toHaveBeenCalled();
    expect(res.text).toMatch("{\"error\":\"\\\"content\\\" cannot be empty\"}")
  });

test("should handle concurrent requests", async () => {
    const promises = Array.from({ length: 3 }, (_, i) =>
      request(app)
        .post("/api/v1/post/create")
        .set("Cookie", [`token=${token}`])
        .send({
          title: `Concurrent Post ${i}`,
          content: `Concurrent content ${i}`,
          tags: ["Mental Disability"],
        })
    );

    const responses = await Promise.all(promises);
    
    responses.forEach((res, i) => {
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(`Concurrent Post ${i}`);
    });
    const {createPost} = require("../../../domains/post/controller.cjs")
    expect(createPost).toHaveBeenCalledTimes(3);
  });


});
