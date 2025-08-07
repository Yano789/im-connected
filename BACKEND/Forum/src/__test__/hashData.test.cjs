jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const { hashData, verifyHashedData } = require('./../utils/hashData.cjs');

describe("utils.hashData tests", () => {
  const input = 'password123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("hashData() should return hashed string", async () => {
    bcrypt.hash.mockResolvedValue('mockedHashedValue');

    const hashed = await hashData(input);

    expect(bcrypt.hash).toHaveBeenCalledWith(input, 10); // default saltRounds
    expect(hashed).toBe('mockedHashedValue');
  });

  test("verifyHashedData() should return true for matching input", async () => {
    bcrypt.compare.mockResolvedValue(true);

    const result = await verifyHashedData(input, 'mockedHashedValue');

    expect(bcrypt.compare).toHaveBeenCalledWith(input, 'mockedHashedValue');
    expect(result).toBe(true);
  });

  test("verifyHashedData() should return false for non-matching input", async () => {
    bcrypt.compare.mockResolvedValue(false);

    const result = await verifyHashedData('wrongPassword', 'mockedHashedValue');

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'mockedHashedValue');
    expect(result).toBe(false);
  });

  test("hashData() should throw if bcrypt.hash throws", async () => {
    bcrypt.hash.mockRejectedValue(new Error("Hash error"));

    await expect(hashData(input)).rejects.toThrow("Hash error");
  });

  test("verifyHashedData() should throw if bcrypt.compare throws", async () => {
    bcrypt.compare.mockRejectedValue(new Error("Compare error"));

    await expect(verifyHashedData(input, 'mockedHashedValue')).rejects.toThrow("Compare error");
  });
});