require("dotenv").config();
require("../setUpMongo.cjs");
const path = require("path");
const fs = require("fs");
const request = require("supertest");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const { Post } = require("../../../domains/post/model.cjs");

// Mock external dependencies
jest.mock("cloudinary", () => ({
  uploader: { destroy: jest.fn().mockResolvedValue(true) }
}));



describe("Create Post", () => {
  let token;

  beforeEach(async () => {
      jest.clearAllMocks();
    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: "123456",
    });

    const jwt = require("jsonwebtoken");
    token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
  });

  afterEach(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  });

  test("should create a new post successfully with tags as array", async () => {
    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Test Post",
        content: "This is a test post",
        draft: false,
        tags: ["Mental Disability"],  // tags as array here
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("title", "Test Post");
    expect(response.body.tags).toEqual(["Mental Disability"]);
  });

  test("should fail if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        content: "Missing title",
        draft: false,
        tags: ["Incomplete"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/title/i);
  });

  test("should fail when username does not exist", async () => {
    const jwt = require("jsonwebtoken");

    const fakeToken = jwt.sign(
      { userId: "507f1f77bcf86cd799439011", username: "ghostuser", email: "ghost@example.com" },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const res = await request(app)
      .post(`/api/v1/post/create`)
      .set("Cookie", [`token=${fakeToken}`])
      .send({
        title: "Test Post",
        content: "This is a test post",
        draft: false,
        tags: ["Mental Disability"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/username does not exist/i);
  });

  test("should create a post with media files and tags as comma-separated string", async () => {
    const imagePath = path.join(__dirname, "../../dummy_media/dummy.png"); // adjust relative path if needed
    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .field("title", "Post With Media")
      .field("content", "Testing media upload")
      .field("tags", "Mental Disability")
      .field("tags","Pediatric Care")
      .field("draft", "false")           // draft as string for form data
    .attach("media", fs.createReadStream(imagePath), {
      filename: "dummy.png",
      contentType: "image/png",
    })

    console.log(response.text)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("media");
    expect(response.body.media.length).toBe(1);
    expect(response.body.tags).toEqual(["Mental Disability","Pediatric Care"]);

response.body.media.forEach(file => {
  expect(file.url).toMatch(/\?cb=\d+$/);
});
  });

  test("should create post with tags as array (JSON) - normalizeTags test replaced", async () => {
    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Test Tags Array",
        content: "Testing tags array",
        draft: false,
        tags: ["Mental Disability"],  // tags as array here
      })
      .set("Content-Type", "application/json");

    
    expect(response.statusCode).toBe(200);
    expect(response.body.tags).toEqual(["Mental Disability"]);
  });
});
