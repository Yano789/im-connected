jest.mock("@google-cloud/storage", () => {
  const { PassThrough } = require("stream");
  const FakeFile = () => ({
    createWriteStream: () => new PassThrough(),
    delete: jest.fn(async () => {}),
    exists: jest.fn(async () => [false]),
  });
  const FakeBucket = () => ({
    file: jest.fn(() => FakeFile()),
    upload: jest.fn(async () => [{}]),
    deleteFiles: jest.fn(async () => {}),
  });
  return {
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn(() => FakeBucket()),
      getBuckets: jest.fn(async () => [[]]),
    })),
  };
});
jest.mock("../../../config/googleConfig.cjs", () => ({
  storage: { bucket: () => ({ file: () => ({}) }) },
  bucketName: "dummy-bucket",
}));
jest.mock("../../../config/gcsStorage.cjs", () => ({
  storage: { bucket: () => ({ file: () => ({}) }) },
  bucketName: "dummy-bucket",
}));
jest.mock("../../../config/googleStorage.cjs", () => ({
  array:  (..._a) => (req, _res, next) => next(),
  single: (..._a) => (req, _res, next) => next(),
  fields: (..._a) => (req, _res, next) => next(),
  any:    (..._a) => (req, _res, next) => next(),
  deleteFromBucket: jest.fn(async () => {}),
}));

// Also mock OTP/email so signup path doesn't try to send real email
jest.mock("../../../utils/generateOTP.cjs", () => jest.fn(() => "111222"));
jest.mock("../../../domains/user/controller.cjs", () => ({
  createNewUser: jest.fn(async (data) => {
    const user = await User.create({
      ...data,
      _id: new mongoose.Types.ObjectId(),
      verified: false,
      threadId: null,
      preferences: {
        preferredLanguage: "en",
        textSize: "Medium",
        contentMode: "Default",
        topics: [],
      },
    });
    return user.toObject();
  }),
}));
jest.mock('../../../domains/email_verification/controller', () => ({
  sendVerificationOTPEmail: jest.fn().mockResolvedValue(),
}));



const request = require("supertest");
const mongoose = require("mongoose");
require("../setUpMongo.cjs");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const OTP = require("../../../domains/otp/model.cjs");
const { createNewUser } = require("../../../domains/user/controller.cjs");

describe("UC1 Account Creation Controller Mocked", () => {

    const validPayload = () => ({
    name: "Alice",
    username: `alice${Date.now()}`,   // alphanumeric only
    number: `+65${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `alice_${Date.now()}@example.com`,
    password: "Abcd1234!",
  });

  beforeAll(async () => {
      await User.deleteMany();
      await OTP.deleteMany();
    });
    afterEach(async () => {
      await OTP.deleteMany();
    });
  beforeEach(() => jest.clearAllMocks());

  const good = validPayload()

  test("Happy path: valid payload passes Joi; route returns created user", async () => {
    
    const res = await request(app).post("/api/v1/user/signup").send(good);
    console.log(res.text)
    expect(res.status).toBe(200);
    expect(createNewUser).toHaveBeenCalled();
    expect(res.body).toMatchObject({ username: good.username, verified: false });
  });

  test("Validation: missing required fields → 400 (first error only)", async () => {
    const res = await request(app).post("/api/v1/user/signup").send({});
    expect(res.status).toBe(400);
    const msg = JSON.stringify(res.body);
    expect(msg).toMatch(/(Name|Username|Phone number|Email|Password) is required/i);
  });

  test("Validation: bad formats → 400 (first failing only)", async () => {
    const bad = {
      name: "Cara123",     // typically fails first on name-only-letters
      username: "caracare",
      number: "98765432",
      email: "bad",
      password: "weak",
    };
    const res = await request(app).post("/api/v1/user/signup").send(bad);
    expect(res.status).toBe(400);
    const msg = JSON.stringify(res.body);
    expect(msg).toMatch(/(Name.*only letters|Phone number.*valid|valid email|Password)/i);
  });

  test("Controller error: duplicates bubble up → 400", async () => {
    createNewUser.mockRejectedValueOnce(new Error("User with provided email already exists"));
    const res = await request(app).post("/api/v1/user/signup").send(good);
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/(exists|taken)/i);
  });
});
