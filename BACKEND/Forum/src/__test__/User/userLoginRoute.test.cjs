jest.mock("../../domains/user/controller.cjs", () => ({
  authenticateUser: jest.fn(),
  createNewUser: jest.fn(),
}));

jest.mock("../../domains/email_verification/controller.cjs", () => ({
  sendVerificationOTPEmail: jest.fn(),
}));

jest.mock("../../middleware/validate.cjs", () => ({
  validateBody: () => (req, res, next) => next(),
}));

const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const { authenticateUser } = require("../../domains/user/controller.cjs");
const { createNewUser } = require("../../domains/user/controller.cjs");
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

  test("Should log in user and set token cookie", async () => {
    authenticateUser.mockResolvedValueOnce({
      token: "mockToken",
      authenticatedUser: {
        firstName: "John",
        lastName: "Doe",
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
  }, 10000);
});



describe("Signup and logout",()=>{
    let app;
    beforeAll(()=>{
        app = express()
        app.use(express.json())
        app.use(cookieParser())
        app.use("/api/user",userRoutes)
    })

    test("Should signup user and send verification email",async()=>{
        const mockUser = {
            firstName:"Jane",
            lastName:"Doe",
            username:"janedoe",
            email:"janedoe@gmail.com",
            password:"hashedPassword",
            verified: false
        }

        createNewUser.mockResolvedValueOnce(mockUser)
        sendVerificationOTPEmail.mockResolvedValueOnce()

        const res = await request(app).post("/api/user/signup").send({
            firstName:"Jane",
            lastName:"Doe",
            username:"janedoe",
            email:"janedoe@gmail.com",
            password:"Password!"
        })

        expect(res.statusCode).toBe(200)
        expect(res.body).toMatchObject(mockUser)
        expect(createNewUser).toHaveBeenCalledWith({
            firstName:"Jane",
            lastName:"Doe",
            username:"janedoe",
            email:"janedoe@gmail.com",
            password:"Password!"            
        })


    expect(sendVerificationOTPEmail).toHaveBeenCalledWith("janedoe@gmail.com");
  });

  test("Should clear token cookie and logout user", async () => {
    const res = await request(app)
      .post("/api/user/logout")
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Logged out successfully");

    // Check cookie cleared (set-cookie header with expired token)
    const clearCookieHeader = res.headers["set-cookie"].find(cookie => cookie.startsWith("token="));
    expect(clearCookieHeader).toBeDefined();
    expect(clearCookieHeader).toMatch(/token=;/); // token cleared
  });
})

