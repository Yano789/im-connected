require("dotenv").config();
const request = require("supertest");
const app = require("../../app.cjs"); // Your express app
const User = require("../../domains/user/model.cjs");

require("./setUpMongo.cjs"); // Mongo Memory Server setup

describe("Create Post", () => {
  let token;

  beforeAll(async () => {
    // Register or insert test user manually
    const user = await User.create({ username: "testuser", email: "test@test.com", password: "123456" });

    // Create a JWT manually (skip login route)
    const jwt = require("jsonwebtoken");


   token = jwt.sign(
  { userId: user._id, username: user.username }, 
  process.env.TOKEN_KEY, 
  { expiresIn: process.env.TOKEN_EXPIRY }
);

  });

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
    
      

    expect(response.statusCode).toBe(200); // or 201
    expect(response.body).toHaveProperty("title", "Test Post");
  });
});
