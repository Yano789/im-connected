/*
UC7 - Thread path (controller mocked)
Verifies: GET /threadId calls AI chatbot service to create a thread,
writes threadId to user, and returns it.

Test covers:
Express route wiring (/threadId)
Auth cookie is required from .env.test
External HTTP call to AI chatbot is mocked via `nock`
User controller's getUser is temporarily mocked so we don't depend on the database schema

To test, run in terminal '$env:NODE_ENV="test"; npx jest __test__\integration_test\UC7\threadIdControllerMocked.test.cjs --runInBand'
 */

//Load test env
require("../setUpMongo.cjs"); 

const nock = require("nock");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.AI_CHATBOT_URL = process.env.AI_CHATBOT_URL || "http://ai-chatbot:3000";

// Mock the user controller used by domains/user/routes.cjs

jest.mock("../../../domains/user/controller.cjs", () => {
  const saveSpy = jest.fn(async function () { });
  return {
    // other exports can be passed thru or stubbed
    getUser: jest.fn(async (username) => {
      return {
        username,
        threadId: null,
        save: saveSpy,
      };
    }),
    __esModule: true,
  };
});

//require the app after setting env and mocks
const app = require("../../../app.cjs");
const userController = require("../../../domains/user/controller.cjs");

describe("UC7 /threadId (controller mocked)", () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it("creates a new thread via chatbot service and persists on user", async () => {
    // Mock external chatbot service
    const scope = nock(process.env.AI_CHATBOT_URL)
      .post("/api/assistants/threads")
      .reply(200, { threadId: "thread_abc123" });

    // valid auth cookie
    const token = jwt.sign(
      { username: "alice" },
      process.env.TOKEN_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h" }
    );

    const res = await request(app)
      .get("/api/v1/user/threadId")
      .set("Cookie", [`token=${token}`])
      .expect(200);

    expect(res.body).toHaveProperty("threadId", "thread_abc123");
    expect(scope.isDone()).toBe(true); // external call happened

    // Ensure mocked user object updated and saved
    const getUser = userController.getUser;
    expect(getUser).toHaveBeenCalledWith("alice");
    const mockedUser = await getUser.mock.results[0].value;
    expect(mockedUser.threadId).toBe("thread_abc123");
    expect(mockedUser.save).toHaveBeenCalled();
  });
});
