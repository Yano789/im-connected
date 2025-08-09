// Mock the controller before importing the app
jest.mock("../../../domains/user/controller.cjs", () => ({
  updateUserPreferences: jest.fn(async ({ username, preferences }) => {
    console.log("🔧 Mocked updateUserPreferences called with:", { username, preferences });
    return {
      username,
      preferences: {
        preferredLanguage: preferences.preferredLanguage || "en",
        textSize: preferences.textSize || "Medium",
        contentMode: preferences.contentMode || "Default",
        topics: preferences.topics || [],
      },
      _id: "mockedUserId",
      __v: 0,
    };
  }),
}));

// testing route functionality and its middleware
const path = require("path");
require("../setUpMongo.cjs");
const request = require("supertest");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");

describe("Set User Preferences (Mocked Controller)", () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create fresh user + token for every test
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
    token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
  });

  test("should call mocked updateUserPreferences with expected data", async () => {
    // Get the user that was created in beforeEach
    const user = await User.findOne({});
    
    console.log("🧪 Testing with user:", user.username);
    console.log("🧪 Token:", token);
    
    const res = await request(app)
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

    if (res.statusCode !== 200) {
      console.log("❌ Response Status:", res.statusCode);
      console.log("❌ Response Body:", res.body);
      console.log("❌ Response Text:", res.text);
    }
    console.log("✅ Response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.preferences).toMatchObject({
      preferredLanguage: "zh",
      textSize: "Large",
      contentMode: "Easy Read",
      topics: ["Personal Mental Health", "Pediatric Care"],
    });

    const { updateUserPreferences } = require("../../../domains/user/controller.cjs");
    expect(updateUserPreferences).toHaveBeenCalled();
  });

  test("should handle language preference update", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(200);
    expect(res.body.preferences.preferredLanguage).toBe("ta");

    const { updateUserPreferences } = require("../../../domains/user/controller.cjs");
    expect(updateUserPreferences).toHaveBeenCalledWith({
      username: user.username,
      preferences: expect.objectContaining({
        preferredLanguage: "ta",
      }),
    });
  });

  test("should handle text size preference update", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
      .post("/api/v1/user/preferences")
      .set("Cookie", [`token=${token}`])
      .send({
        username: user.username,
        language: "en",
        textSize: "Large",
        contentMode: "Default",
        topics: [],
      })
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.preferences.textSize).toBe("Large");

    const { updateUserPreferences } = require("../../../domains/user/controller.cjs");
    expect(updateUserPreferences).toHaveBeenCalledWith({
      username: user.username,
      preferences: expect.objectContaining({
        textSize: "Large",
      }),
    });
  });

  test("should handle content mode preference update", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(200);
    expect(res.body.preferences.contentMode).toBe("Easy Read");

    const { updateUserPreferences } = require("../../../domains/user/controller.cjs");
    expect(updateUserPreferences).toHaveBeenCalledWith({
      username: user.username,
      preferences: expect.objectContaining({
        contentMode: "Easy Read",
      }),
    });
  });

  test("should handle topic preferences update", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(200);
    expect(res.body.preferences.topics).toEqual(["Personal Mental Health", "Pediatric Care", "End of Life Care"]);

    const { updateUserPreferences } = require("../../../domains/user/controller.cjs");
    expect(updateUserPreferences).toHaveBeenCalledWith({
      username: user.username,
      preferences: expect.objectContaining({
        topics: ["Personal Mental Health", "Pediatric Care", "End of Life Care"],
      }),
    });
  });

  test("should fail if required fields are missing", async () => {
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

  test("should work without auth token since route doesn't require auth", async () => {
    const user = await User.findOne({});
    
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
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/language/i);
  });

  test("should validate text size values", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/textSize/i);
  });

  test("should validate content mode values", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/contentMode/i);
  });

  test("should validate topic values", async () => {
    const user = await User.findOne({});
    
    const res = await request(app)
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

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/topics/i);
  });
}); 