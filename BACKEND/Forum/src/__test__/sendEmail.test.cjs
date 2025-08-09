jest.mock("nodemailer"); 

const nodemailer = require("nodemailer");

// Mock sendMail and verify BEFORE importing emailService
const mockSendMail = jest.fn();
const mockVerify = jest.fn((cb) => cb(null, true));

nodemailer.createTransport.mockReturnValue({
  sendMail: mockSendMail,
  verify: mockVerify,
});

const sendEmail = require("./../utils/sendEmail.cjs"); 

describe("sendEmail", () => {
  beforeEach(() => {
    mockSendMail.mockClear();
    mockVerify.mockClear();
  });

  test("should send email successfully", async () => {
    const mailOptions = {
      from: "test@example.com",
      to: "user@example.com",
      subject: "Test Email",
      text: "Hello!"
    };

    const result = await sendEmail(mailOptions);
    console.log(result)
    expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
    expect(result).toEqual({ success: true });
  });

  test("should throw error on failure", async () => {
    const error = new Error("Send failed");
    mockSendMail.mockRejectedValue(error);

    const mailOptions = {
      from: "test@example.com",
      to: "user@example.com",
      subject: "Fail Test",
      text: "This should fail"
    };

    await expect(sendEmail(mailOptions)).rejects.toThrow("Send failed");
  });
});