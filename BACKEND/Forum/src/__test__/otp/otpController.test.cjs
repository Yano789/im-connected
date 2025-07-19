jest.mock("../../utils/generateOTP.cjs")
jest.mock('../../utils/sendEmail.cjs', () => jest.fn(() => Promise.resolve()));
jest.mock("../../utils/hashData.cjs")
jest.mock("./../../domains/otp/model.cjs")



const generateOTP = require("../../utils/generateOTP.cjs");
const sendEmail = require("../../utils/sendEmail.cjs");
const { hashData, verifyHashedData } = require("../../utils/hashData.cjs");
const OTP = require("./../../domains/otp/model.cjs");

const { sendOTP, verifyOTP, deleteOTP } = require("./../../domains/otp/controller.cjs");


describe("sendOTP", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test("sending otp", async () => {
    const mockEmail = "john@example.com";
    const mockOTP = "123456";
    const mockHashedOTP = "hashed_123456";
    const mockData = {
      email: mockEmail,
      subject: "subject",
      message: "message",
    };

    generateOTP.mockResolvedValueOnce(mockOTP);
    sendEmail.mockResolvedValueOnce();
    hashData.mockResolvedValueOnce(mockHashedOTP);
    OTP.deleteOne.mockResolvedValueOnce();

    const saveMock = jest.fn().mockResolvedValue({
      email: mockEmail,
      otp: mockHashedOTP,
      createdAt: expect.any(Number),
      expiresAt: expect.any(Number),
    });

    OTP.mockImplementation(() => ({
      save: saveMock,
    }));

    const result = await sendOTP(mockData);

    expect(OTP.deleteOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(generateOTP).toHaveBeenCalled();
    expect(hashData).toHaveBeenCalledWith(mockOTP);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockEmail,
        subject: mockData.subject,
        html: expect.stringContaining(mockOTP),
      })
    );

    expect(saveMock).toHaveBeenCalled();

    expect(result).toMatchObject({
      email: mockEmail,
      otp: mockHashedOTP,
    });
  });

  test("should throw error when required fields are missing", async () => {
    await expect(sendOTP({})).rejects.toThrow("Provide values for email,subject,message");
  });

})



describe("verifyOTP", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test("verifyOTP", async () => {
    OTP.findOne.mockResolvedValueOnce({
      email: "john@example.com",
      otp: "hashed_otp",
      expiresAt: Date.now() + 10000,
    });

    verifyHashedData.mockResolvedValueOnce(true);

    const result = await verifyOTP({ email: "john@example.com", otp: "123456" });

    expect(result).toBe(true);
    expect(verifyHashedData).toHaveBeenCalledWith("123456", "hashed_otp");
  });

  test("should throw error if email or otp is missing", async () => {
    await expect(verifyOTP({})).rejects.toThrow("Provide values for email,otp");
  });
  test("should throw error if no OTP record is found", async () => {
    OTP.findOne.mockResolvedValueOnce(null)
    await expect(
      verifyOTP({ email: "john@example.com", otp: "123456" })
    ).rejects.toThrow("No otp records found.");

  })

  test("should throw error if OTP is expired and delete record", async () => {
    const pastTime = Date.now() - 1000;

    OTP.findOne.mockResolvedValueOnce({
      email: "john@example.com",
      otp: "hashed_otp",
      expiresAt: pastTime,
    });

    OTP.deleteOne.mockResolvedValueOnce();

    await expect(
      verifyOTP({ email: "john@example.com", otp: "123456" })
    ).rejects.toThrow("Code has expired. REquest for a new one.");

    expect(OTP.deleteOne).toHaveBeenCalledWith({ email: "john@example.com" });
  });

  test("should throw error if hashed OTP does not match", async () => {
    OTP.findOne.mockResolvedValueOnce({
      email: "john@example.com",
      otp: "hashed_otp",
      expiresAt: Date.now() + 10000,
    });

    verifyHashedData.mockResolvedValueOnce(false);

    await expect(
      verifyOTP({ email: "john@example.com", otp: "123456" })
    ).rejects.toThrow("Invalid OTP!");
  });

})



describe("deleteOTP", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("deleteOTP", async () => {
    const mockEmail = "john@example.com";
    OTP.deleteOne.mockResolvedValueOnce("mocked delete result");
    const result = await deleteOTP(mockEmail);
    expect(OTP.deleteOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(result).toBeUndefined();
  })
})

