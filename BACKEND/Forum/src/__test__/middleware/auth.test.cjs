jest.mock("jsonwebtoken",()=>({
    verify: jest.fn()
}))
require("dotenv").config();
const jwt = require("jsonwebtoken")
const verifyToken = require("./../../middleware/auth.cjs")

describe("verifyToken middleware test",()=>{
    const TOKEN_KEY = "mockSecret"
    process.env.TOKEN_KEY = TOKEN_KEY

    let req,res,next

    beforeEach(()=>{
        req={
            cookies:{},
            originalUrl: "/api/protected"
        }

        res = {
            status: jest.fn().mockReturnThis(),
            send:jest.fn()
        }

        next = jest.fn();
        jest.clearAllMocks()
    })

    test("should return 403 if no token is present", async () => {
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("An authentication token is required!");
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() if token is valid", async () => {
    const mockToken = "validToken";
    const decodedUser = { id: 1, username: "john" };

    req.cookies.token = mockToken;
    jwt.verify.mockReturnValue(decodedUser);

    await verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, TOKEN_KEY);
    expect(req.currentUser).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid", async () => {
    const mockToken = "badToken";
    req.cookies.token = mockToken;

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, TOKEN_KEY);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid Token provided!");
    expect(next).not.toHaveBeenCalled();
  });
})