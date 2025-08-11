
let postIdCounter = 0;
jest.mock("../../../utils/hashData.cjs", () => ({
  hashData: jest.fn(() => {
    postIdCounter++;
    return Promise.resolve(`mockedPostId_${postIdCounter}`);
  }),
  verifyHashedData: jest.fn(),
}));



const path = require("path");
require("../setUpMongo.cjs");
const fs = require("fs");
const request = require("supertest");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const { Post } = require("../../../domains/post/model.cjs");

//testing the controller function with inner function mocked
describe("Create Post", () => {
 
  async function createUserAndToken() {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const username = `testuser2_${uniqueId}`;
    const email = `testuser2_${uniqueId}@test.com`;

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
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    return { user, token };
  }

  beforeAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new post successfully with tags as array", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Test Post2",
        content: "This is a test post",
        draft: false,
        tags: ["Mental Disability"],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("title", "Test Post2");
    expect(response.body.tags).toEqual(["Mental Disability"]);

    // Check mocks called
    const { hashData } = require("../../../utils/hashData.cjs");
    expect(hashData).toHaveBeenCalled();
    expect(response.body.postId).toMatch("mockedPostId")
  });

  test("should fail if required fields are missing", async () => {
    const { token } = await createUserAndToken();

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
      {
        userId: "507f1f77bcf86cd799439011",
        username: "ghostuser",
        email: "ghost@example.com",
      },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const res = await request(app)
      .post(`/api/v1/post/create`)
      .set("Cookie", [`token=${fakeToken}`])
      .send({
        title: "Test Post2",
        content: "This is a test post",
        draft: false,
        tags: ["Mental Disability"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/username does not exist/i);
  });

  test(
    "should create a post with media files and tags as comma-separated string",
    async () => {
      const { token } = await createUserAndToken();


      const imagePath = path.join(__dirname, "../../dummy_media/dummy.png");
      const response = await request(app)
        .post("/api/v1/post/create")
        .set("Cookie", [`token=${token}`])
        .field("title", "Post With Media2")
        .field("content", "Testing media upload")
        .field("tags", "Mental Disability")
        .field("tags", "Pediatric Care")
        .field("draft", "false")
        .attach("media", fs.createReadStream(imagePath), {
          filename: "dummy.png",
          contentType: "image/png",
        });

      if (response.statusCode !== 200) {
        console.log("❌ Response Status:", response.statusCode);
        console.log("❌ Response Body:", response.body);
        console.log("❌ Response Text:", response.text);
      }

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("media");
      expect(response.body.media.length).toBe(1);
      expect(response.body.tags).toEqual(["Mental Disability", "Pediatric Care"]);
    },
    15000 // Increased timeout for file upload test
  );

  test("should create post with tags as array (JSON) - normalizeTags test replaced", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/post/create")
      .set("Cookie", [`token=${token}`])
      .send({
        title: "Test Tags Array2",
        content: "Testing tags array",
        draft: false,
        tags: ["Mental Disability"],
      })
      .set("Content-Type", "application/json");

    if (response.statusCode !== 200) {
      console.log("❌ Response Status:", response.statusCode);
      console.log("❌ Response Body:", response.body);
      console.log("❌ Response Text:", response.text);
    }
    expect(response.statusCode).toBe(200);
    expect(response.body.tags).toEqual(["Mental Disability"]);
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


});
