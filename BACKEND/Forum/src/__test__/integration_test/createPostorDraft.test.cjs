require("dotenv").config();
const request = require("supertest");
const app = require("../../app.cjs"); //express app
const User = require("../../domains/user/model.cjs");
const { Post } = require("./../../domains/post/model.cjs")

require("./setUpMongo.cjs"); // Mongo Memory Server setup

describe("Create Post", () => {
  let token;

  beforeAll(async () => {

    const user = await User.create({ username: "testuser", email: "test@test.com", password: "123456" });


    const jwt = require("jsonwebtoken");


    token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

  });

  afterAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  })

  test("should create a new post successfully", async () => {
    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Test Post",
        content: "This is a test post",
        draft: false,
        tags: ["Mental Disability"]
      })
      .set("Content-Type", "application/json");



    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("title", "Test Post");
  });

  test("should fail if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        content: "Missing title",
        draft: false,
        tags: ["Incomplete"]
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
        tags: ["Mental Disability"]
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/username does not exist/i);
  });
});
