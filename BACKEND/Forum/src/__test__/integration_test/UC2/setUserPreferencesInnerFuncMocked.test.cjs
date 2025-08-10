// Mock any utility functions that might be used in the controller
jest.mock("../../../utils/hashData.cjs", () => ({
  hashData: jest.fn(() => Promise.resolve("mockedHash")),
  verifyHashedData: jest.fn(() => Promise.resolve(true)),
}));

const path = require("path");
require("../setUpMongo.cjs");
const request = require("supertest");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");

// testing the controller function with inner function mocked
describe("Set User Preferences", () => {
  async function createUserAndToken() {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const username = `testuseruc2_${uniqueId}`;
    const email = `testuseruc2_${uniqueId}@test.com`;

    const user = await User.create({
      name: "JOE",
      username,
      number: uniqueId.toString(),
      email,
      password: "password",
      verified: true,
      threadId: null,
      preferences: {
        preferredLanguage: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      },
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
  });



  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should set all user preferences successfully with mocked utilities", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "zh",
        textSize: "Large",
        contentMode: "Easy Read",
        topics: ["Personal Mental Health", "Pediatric Care"],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.preferences).toMatchObject({
      preferredLanguage: "zh",
      textSize: "Large",
      contentMode: "Easy Read",
      topics: ["Personal Mental Health", "Pediatric Care"],
    });

    // Check that mocked utilities were called if they're used
    const { hashData } = require("../../../utils/hashData.cjs");
    // Note: hashData might not be called in preferences update, but we're testing the pattern
  });

  test("should set preferred language successfully", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "ta",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences.preferredLanguage).toBe("ta");
  });

  test("should set text size preference successfully", async () => {
    const { user } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .send({
        username: user.username,
        language: "en",
        textSize: "Large",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences.textSize).toBe("Large");
  });

  test("should set content mode preference successfully", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Easy Read",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences.contentMode).toBe("Easy Read");
  });

  test("should set topic preferences successfully", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: ["Personal Mental Health", "Pediatric Care", "End of Life Care"],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences.topics).toEqual(["Personal Mental Health", "Pediatric Care", "End of Life Care"]);
  });

  test("should fail if required fields are missing", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        language: "zh",
        textSize: "Large",
        contentMode: "Easy Read",
        topics: ["Mental Health"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/username/i);
  });

  test("should fail when username does not exist", async () => {
    const jwt = require("jsonwebtoken");

    const fakeToken = jwt.sign(
      { userId: "507f1f77bcf86cd799439011", username: "ghostuser", email: "ghost@example.com" },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const res = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${fakeToken}`])
      .send({
        username: "nonexistentuser",
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      });

    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Failed to update preferences/i);
  });

  test("should work without auth token since route doesn't require auth", async () => {
    const { user } = await createUserAndToken();
    
    const res = await request(app)
      .post("/api/v1/user/preferences")
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    console.log("Response without token:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("should validate language preference values", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "invalid_language",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch(/language/i);
  });

  test("should validate text size values", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Extra Large",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch(/textSize/i);
  });

  test("should validate content mode values", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Invalid Mode",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch(/contentMode/i);
  });

  test("should validate topic values", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: ["Invalid Topic"],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(400);
    expect(response.text).toMatch(/topics/i);
  });

  test("should apply default settings when no preferences are selected", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences).toMatchObject({
      preferredLanguage: "en",
      textSize: "Medium",
      contentMode: "Default",
      topics: [],
    });
  });

  test("should handle empty topics array", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.preferences.topics).toEqual([]);
  });
}); 