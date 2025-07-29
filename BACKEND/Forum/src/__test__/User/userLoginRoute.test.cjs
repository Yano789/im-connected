jest.mock("../../domains/user/controller.cjs", () => ({
  authenticateUser: jest.fn(),
  createNewUser: jest.fn(),
  updateUserPreferences: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock("../../domains/email_verification/controller.cjs", () => ({
  sendVerificationOTPEmail: jest.fn(),
}));

jest.mock("../../middleware/validate.cjs", () => ({
  validateBody: () => (req, res, next) => next(),
}));

jest.mock("../../middleware/auth.cjs", () =>
  jest.fn((req, res, next) => {
    req.currentUser = "janedoe";
    next();
  })
);

const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const {
  authenticateUser,
  createNewUser,
  updateUserPreferences,
  getUser,
} = require("../../domains/user/controller.cjs");
const { sendVerificationOTPEmail } = require("../../domains/email_verification/controller.cjs");
const userRoutes = require("../../domains/user/routes.cjs");

describe("User Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/user", userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/user (login)", () => {
    test("logs in user and sets token cookie", async () => {
      authenticateUser.mockResolvedValueOnce({
        token: "mockToken",
        authenticatedUser: {
          name: "John",
          username: "johndoe",
          email: "johndoe@gmail.com",
          password: "hashedPassword",
          verified: true,
        },
      });

      const res = await request(app)
        .post("/api/user")
        .send({ username: "johndoe", password: "Password!" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("username", "johndoe");

      expect(res.headers["set-cookie"]).toBeDefined();
      const tokenCookie = res.headers["set-cookie"].find((c) => c.startsWith("token="));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/token=mockToken/);
    });
  });

  describe("POST /api/user/signup", () => {
    test("signs up user and sends verification email", async () => {
      const mockUser = {
        name: "Jane",
        username: "janedoe",
        email: "janedoe@gmail.com",
        number: "+6512345678",
        password: "hashedPassword",
        verified: false,
      };

      createNewUser.mockResolvedValueOnce(mockUser);
      sendVerificationOTPEmail.mockResolvedValueOnce();

      const res = await request(app).post("/api/user/signup").send({
        name: "Jane",
        username: "janedoe",
        email: "janedoe@gmail.com",
        number: "+6512345678",
        password: "Password!",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(mockUser);
      expect(createNewUser).toHaveBeenCalledWith({
        name: "Jane",
        username: "janedoe",
        email: "janedoe@gmail.com",
        number: "+6512345678",
        password: "Password!",
      });

      expect(sendVerificationOTPEmail).toHaveBeenCalledWith("janedoe@gmail.com");
    });
  });

  describe("POST /api/user/preferences", () => {
    test("updates user preferences", async () => {
      const mockPreferences = {
        language: "English",
        textSize: "Medium",
        contentMode: "Default",
        topics: ["Pediatric Care", "Mental Health"],
      };

      updateUserPreferences.mockResolvedValueOnce({
        preferences: mockPreferences,
      });

      const res = await request(app).post("/api/user/preferences").send({
        username: "janedoe",
        language: "English",
        textSize: "Medium",
        contentMode: "Default",
        topics: ["Pediatric Care", "Mental Health"],
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ success: true, preferences: mockPreferences });
      expect(updateUserPreferences).toHaveBeenCalledWith({
        username: "janedoe",
        preferences: mockPreferences,
      });
    });
  });

  describe("POST /api/user/logout", () => {
    test("clears token cookie and logs out user", async () => {
      const res = await request(app).post("/api/user/logout").send();

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Logged out successfully");

      const clearCookieHeader = res.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("token=")
      );
      expect(clearCookieHeader).toBeDefined();
      expect(clearCookieHeader).toMatch(/token=;/); // token cleared
    });
  });

  describe("GET /api/user/check-auth", () => {
    test("returns current user info", async () => {


      getUser.mockResolvedValueOnce({
        name: "Jane",
        username: "janedoe",
        email: "janedoe@gmail.com",
      });

      const res = await request(app).get("/api/user/check-auth");

      expect(res.statusCode).toBe(200);
      expect(getUser).toHaveBeenCalledWith("janedoe");
      expect(res.body.user).toMatchObject({
        name: "Jane",
        username: "janedoe",
        email: "janedoe@gmail.com",
      });
    });
  });
});
