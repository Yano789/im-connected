const { hashData, verifyHashedData } = require("./../utils/hashData.cjs")

describe("utils.hashData tests", () => {

    test("testing hashData()", async () => {

        const input = 'mySecretPassword';
        const hashed = await hashData(input);

        expect(typeof hashed).toBe('string');
        expect(hashed).not.toBe(input);
        expect(hashed.length).toBeGreaterThan(0);
    })

    test("testing verifyHashedData() for correct password", async () => {
        const input = 'password123';
        const hashed = await hashData(input);
        const isMatch = await verifyHashedData(input, hashed);

        expect(isMatch).toBe(true);
    })

    test("testing verifyHashedData() for correct password", async () => {
        const input = 'password123';
        const wrongInput = 'wrongPassword';
        const hashed = await hashData(input);
        const isMatch = await verifyHashedData(wrongInput, hashed);

        expect(isMatch).toBe(false);
    });
})