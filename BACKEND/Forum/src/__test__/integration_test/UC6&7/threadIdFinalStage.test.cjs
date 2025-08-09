/**
 * UC7 - Thread bootstrap path (final stage, real test DB)
Verifies: GET /threadId stores a new threadId for the logged-in user and returns it.
Only the external AI chatbot HTTP call is mocked.
To test, run in terminal "$env:NODE_ENV="test"; npx jest __test__\integration_test\UC7\threadIdFinalStage.test.cjs --runInBand
"
 */

require("../setUpMongo.cjs");

const nock = require("nock");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.AI_CHATBOT_URL = process.env.AI_CHATBOT_URL || "http://ai-chatbot:3000";

const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");

describe("UC7 /threadId (final stage real test DB)", () => {
  beforeAll(async () => {
    await User.deleteMany({ username: { $in: ["Alice"] } });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  it("creates, saves, and returns a threadId for a user with none", async () => {
    //  Arrange: ensure a user exists with no threadId
    const username = "Alice";
    const user = await User.create({
      name: "Alice",
      username: username,
      number: "12345678",
      email: "alice_uc7@example.com",
      password: "Password!",
      verified: true,
      threadId: null,
    });

    // Mock external chatbot server
    const scope = nock(process.env.AI_CHATBOT_URL)
      .post("/api/assistants/threads")
      .reply(200, { threadId: "thread_db_123" });

    // valid auth cookie
    const token = jwt.sign(
      { username },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h" }
    );

    // call the API
    const res = await request(app)
      .get("/api/v1/user/threadId")
      .set("Cookie", [`token=${token}`])
      .expect(200);

    // Assert
    expect(res.body).toHaveProperty("threadId", "thread_db_123");
    expect(scope.isDone()).toBe(true);

    const saved = await User.findOne({ username });
    expect(saved).toBeTruthy();
    expect(saved.threadId).toBe("thread_db_123");
  });
});
