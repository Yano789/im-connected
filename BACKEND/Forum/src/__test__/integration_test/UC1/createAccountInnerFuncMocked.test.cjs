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
  array:  (..._a) => (req, _res, next) => next(),  // multer-like no-ops
  single: (..._a) => (req, _res, next) => next(),
  fields: (..._a) => (req, _res, next) => next(),
  any:    (..._a) => (req, _res, next) => next(),
  deleteFromBucket: jest.fn(async () => {}),
}));

// Email/OTP deterministic for this suite
jest.mock("../../../utils/sendEmail.cjs", () => jest.fn(async () => ({ accepted: true })));
jest.mock("../../../utils/generateOTP.cjs", () => jest.fn(() => "123456"));

const request = require("supertest");
require("../setUpMongo.cjs");
const app = require("../../../app.cjs");
const User = require("../../../domains/user/model.cjs");
const OTP = require("../../../domains/otp/model.cjs"); // <-- use OTP (actual model name)

describe("UC1 • Account Creation • Final Stage (route + controller + DB)", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await OTP.deleteMany();
  });

  afterEach(async () => {
    await OTP.deleteMany();
  });

  const validPayload = () => ({
    name: "Alice",
    username: `alice${Date.now()}`,   // alphanumeric only
    number: `+65${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `alice_${Date.now()}@example.com`,
    password: "Abcd1234!",
  });

  test("Main flow: signup → OTP generated → verify → user verified & cookie set", async () => {
    const body = validPayload();

    const resSignup = await request(app).post("/api/v1/user/signup").send(body);
    expect(resSignup.status).toBe(200);
    expect(resSignup.body).toMatchObject({
      name: body.name,
      username: body.username,
      email: body.email,
      number: body.number,
      verified: false,
    });

    const otpDoc = await OTP.findOne({ email: body.email });
    expect(otpDoc).toBeTruthy();

    const resVerify = await request(app)
      .post("/api/v1/email_verification/verify")
      .send({ email: body.email, otp: "123456" });

    expect(resVerify.status).toBe(200);
    expect(resVerify.body).toMatchObject({ email: body.email, verified: true });

    const setCookie = resVerify.headers["set-cookie"];
    expect(setCookie && setCookie.join(";")).toMatch(/token=/);

    const dbUser = await User.findOne({ email: body.email });
    expect(dbUser?.verified).toBe(true);
  });

  test("Alt flow: invalid account details → 400 (first failing message only)", async () => {
    const bad = {
      name: "Bob123",
      username: "bobby",
      number: "91234567",
      email: "not-an-email",
      password: "weakpass",
    };
    const res = await request(app).post("/api/v1/user/signup").send(bad);
    expect(res.status).toBe(400);
    const msg = JSON.stringify(res.body);
    expect(msg).toMatch(/(Name.*only letters|valid email|Phone number|Password)/i);
  });

  test("Alt flow: duplicate email/username/phone → 400", async () => {
    const base = validPayload();
    await request(app).post("/api/v1/user/signup").send(base).expect(200)


    // duplicate email
    let res = await request(app).post("/api/v1/user/signup").send({
      ...validPayload(),
      email: base.email,
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/email.*(exists|taken)/i);

    // duplicate username
    res = await request(app).post("/api/v1/user/signup").send({
      ...validPayload(),
      username: base.username,
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/username.*(exists|taken)/i);

    // duplicate phone
    res = await request(app).post("/api/v1/user/signup").send({
      ...validPayload(),
      number: base.number,
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/(mobile|phone).*(exists|taken)/i);
  });

  test("Alt flow: invalid verification code → 400, request new OTP, then verify", async () => {
    const body = validPayload();
    await request(app).post("/api/v1/user/signup").send(body).expect(200)

    const bad = await request(app)
      .post("/api/v1/email_verification/verify")
      .send({ email: body.email, otp: "000000" });
    expect(bad.status).toBe(400);
    expect(JSON.stringify(bad.body)).toMatch(/invalid otp/i);

    // request another OTP
    const otpReq = await request(app)
      .post("/api/v1/email_verification/")
      .send({ email: body.email });
    expect(otpReq.status).toBe(200);

    // verify with mocked code
    const good = await request(app)
      .post("/api/v1/email_verification/verify")
      .send({ email: body.email, otp: "123456" });
    expect(good.status).toBe(200);
    expect(good.body.verified).toBe(true);
  });
});
