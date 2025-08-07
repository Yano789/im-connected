jest.mock("./../../domains/user/model.cjs")
jest.mock("./../../domains/otp/controller.cjs")


const User = require("./../../domains/user/model.cjs");
const {sendOTP,verifyOTP,deleteOTP} = require("./../../domains/otp/controller.cjs");
const {sendVerificationOTPEmail,verifyUserEmail} = require("./../../domains/email_verification/controller.cjs");


describe("sendVerifiactionOTPEmail",()=>{
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test("sending verification email",async()=>{
        const mockEmail ="john@example.com"
        const mockUser = {email: mockEmail}
        const mockOTPResult = {
            email:mockEmail,
            otp:"hashed_otp",
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000
        }
        User.findOne.mockResolvedValueOnce(mockUser)
        sendOTP.mockResolvedValueOnce(mockOTPResult)
        const result = await sendVerificationOTPEmail(mockEmail)
        
        expect(User.findOne).toHaveBeenCalledWith({email:mockEmail})
    expect(sendOTP).toHaveBeenCalledWith({
      email: mockEmail,
      subject: "Email Verification",
      message: "Verify your email with the code below.",
      duration: 1,
    });
    expect(result).toEqual(mockOTPResult)
        
    })

    test("throw Error if user is not found",async()=>{
        const mockEmail = "null@example.com"
        User.findOne.mockResolvedValueOnce(null)
        await expect(sendVerificationOTPEmail(mockEmail)).rejects.toThrow("There's no account for the provided email.")

        expect(User.findOne).toHaveBeenCalledWith({email:mockEmail})
        expect(sendOTP).not.toHaveBeenCalled();
    })
})



describe("verifyUserEmail", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("verifying user email", async () => {
        const mockEmail = "john@example.com"
        const mockOtp = "123456"
        verifyOTP.mockResolvedValueOnce(true)
        User.updateOne = jest.fn().mockResolvedValueOnce()
        deleteOTP.mockResolvedValueOnce()
        const result = await verifyUserEmail({ email: mockEmail, otp: mockOtp })
        expect(User.updateOne).toHaveBeenCalledWith({email:mockEmail }, { verified: true })
        expect(deleteOTP).toHaveBeenCalledWith(mockEmail)
        expect(verifyOTP).toHaveBeenCalledWith({ email: mockEmail, otp: mockOtp })
        expect(result).toBeUndefined();
    })

    test("should throw Error if invalid otp passed", async () => {
        const mockEmail = "john@example.com"
        const invalidOtp = "invalid_123456"
        verifyOTP.mockResolvedValueOnce(false);
        User.updateOne = jest.fn();
        deleteOTP.mockResolvedValueOnce();
        await expect(verifyUserEmail({ email: mockEmail, otp: invalidOtp })).rejects.toThrow("Invalid code passed. Check your inbox.")
        expect(deleteOTP).not.toHaveBeenCalled();
        expect(User.updateOne).not.toHaveBeenCalled();

    })


})
