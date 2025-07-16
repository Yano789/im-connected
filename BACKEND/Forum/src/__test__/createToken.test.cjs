
const jwt = require('jsonwebtoken');
const createToken = require("./../utils/createToken.cjs")


describe("utils.createToken() tests", () => {
    const tokenData = { userId: 123 }
    const tokenKey = 'secretKey'
    const expiresIn = '1h'
    test("testing createToken()", async () => {

        const token = await createToken(tokenData, tokenKey, expiresIn)
        expect(typeof token).toBe('string');

        const decoded = jwt.verify(token, tokenKey);
        expect(decoded.userId).toBe(tokenData.userId);
    })

  test('should throw error if key is invalid', async () => {
    const invalidKey = null;
    await expect(createToken(tokenData, invalidKey, expiresIn)).rejects.toThrow();
  })

})