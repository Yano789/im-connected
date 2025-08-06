// Step 1: Mock the entire controller BEFORE any imports
jest.mock("../../../domains/post/controller.cjs", () => ({
  createPost: jest.fn(async (data) => {
    // simulate cacheBuster effect on media urls if media exists
    const media = (data.media || []).map((file) => ({
      ...file,
      url: file.url + "?cb=1234567890",
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

// Optional: mock internal utils
let postIdCounter = 0;
jest.mock("../../../utils/hashData.cjs", () => ({
  hashData: jest.fn(() => {
    postIdCounter++;
    return Promise.resolve(`mockedPostId_${postIdCounter}`);
  }),
  verifyHashedData: jest.fn(),
}));

jest.mock("../../../utils/cacheBuster.cjs", () =>
  jest.fn((url) => `${url}?cb=1234567890`)
);

// Step 2: Import AFTER mocks
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
    expect(res.statusCode).toBe(200);
    expect(res.body.tags).toEqual(["Mental Disability", "Pediatric Care"]);
    expect(res.body.media).toBeDefined();
  });
});
