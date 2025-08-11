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

// Deterministic internals for OTP/hash/token/email
jest.mock("../../../utils/hashData.cjs", () => ({
  hashData: jest.fn(async (str) => `hashed_${str}`),
  verifyHashedData: jest.fn(async (plain, hashed) => hashed === `hashed_${plain}`),
}));
jest.mock("../../../utils/generateOTP.cjs", () => jest.fn(() => "654321"));
jest.mock("../../../utils/sendEmail.cjs", () => jest.fn(async () => ({ accepted: true })));
jest.mock("../../../utils/createToken.cjs", () => jest.fn(async () => "mocked.jwt.token"));

const request = require("supertest");
require("../setUpMongo.cjs");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const OTP = require("../../../domains/otp/model.cjs"); // <-- use OTP (actual model name)

describe("UC1 Account Creation Inner Func Mocked", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await OTP.deleteMany();
  });

  afterEach(async () => {
    await OTP.deleteMany();
    jest.clearAllMocks();
  });

  const payload = () => ({
    name: "Dina",
    username: `dina${Date.now()}`,   // alphanumeric only
    number: `+65${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `dina_${Date.now()}@example.com`,
    password: "Abcd1234!",
  });

  test("Happy path with deterministic OTP & token", async () => {
    const body = payload();

    const resSignup = await request(app).post("/api/v1/user/signup").send(body);
    expect(resSignup.status).toBe(200);
    expect(resSignup.body.verified).toBe(false);

    const otp = await OTP.findOne({ email: body.email });
    expect(otp).toBeTruthy();

    const resVerify = await request(app)
      .post("/api/v1/email_verification/verify")
      .send({ email: body.email, otp: "654321" });

    expect(resVerify.status).toBe(200);
    const setCookie = resVerify.headers["set-cookie"];
    expect(setCookie && setCookie.join(";")).toMatch(/token=mocked\.jwt\.token/);

    const dbUser = await User.findOne({ email: body.email });
    expect(dbUser?.verified).toBe(true);
  });

  test("Invalid verification code → 400 (message matches API)", async () => {
    const body = payload();
    await request(app).post("/api/v1/user/signup").send(body).expect(200);

    const res = await request(app)
      .post("/api/v1/email_verification/verify")
      .send({ email: body.email, otp: "000000" });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/invalid otp/i);
  });
});
