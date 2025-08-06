jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(), // mock only jwt.sign
}));

const jwt = require('jsonwebtoken');
const createToken = require('./../utils/createToken.cjs');

describe("utils.createToken() tests", () => {
  const tokenData = { userId: 123 };
  const tokenKey = 'secretKey';
  const expiresIn = '1h';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return token from jwt.sign", async () => {
    jwt.sign.mockReturnValue('mockedToken');

    const token = await createToken(tokenData, tokenKey, expiresIn);

    expect(jwt.sign).toHaveBeenCalledWith(tokenData, tokenKey, { expiresIn });
    expect(token).toBe('mockedToken');
  });

  test("should throw if jwt.sign throws", async () => {
    const fakeError = new Error("sign error");
    jwt.sign.mockImplementation(() => { throw fakeError; });

    await expect(createToken(tokenData, tokenKey, expiresIn)).rejects.toThrow("sign error");
  });
});