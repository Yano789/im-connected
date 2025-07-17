jest.mock("./../../domains/user/model.cjs")
jest.mock("./../../domains/otp/controller.cjs")
jest.mock("../../utils/hashData.cjs")


const User = require("./../../domains/user/model.cjs");
const { sendOTP, verifyOTP, deleteOTP } = require("./../../domains/otp/controller.cjs");
const { hashData } = require("../../utils/hashData.cjs");

const { sendPasswordResetOTPEmail, resetUserPassword } = require("./../../domains/forgot_password/controller.cjs")


describe("sendPasswordRestOTPEmail", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("sending password reset email", async () => {
        const mockEmail = "john@example.com"
        const mockOTPResult = {
            email: mockEmail,
            otp: "hashed_otp",
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000
        }
        const mockUser = { email: mockEmail, verified: true }
        User.findOne.mockResolvedValueOnce(mockUser)
        sendOTP.mockResolvedValueOnce(mockOTPResult)
        const result = await sendPasswordResetOTPEmail(mockEmail)
        expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail })
        expect(sendOTP).toHaveBeenCalledWith({
            email: mockEmail,
            subject: "Password Reset",
            message: "Enter the code below to reset your password.",
            duration: 1,
        })
        expect(result).toEqual(mockOTPResult)

    })

    test("should throw Error if user not found", async () => {
        const wrongEmail = "null@example.com"
        User.findOne.mockResolvedValueOnce(null)
        await expect(sendPasswordResetOTPEmail(wrongEmail)).rejects.toThrow("There's no account for the provided email.");
    })

    test("should throw Error if user's email is not verified", async () => {
        const mockEmail = "john@example.com"
        const mockUnverifiedUser = { email: mockEmail, verified: false }
        User.findOne.mockResolvedValueOnce(mockUnverifiedUser)
        await expect(sendPasswordResetOTPEmail(mockEmail)).rejects.toThrow("Email hasn't been verified yet. Check your inbox.");
    })
})

describe("resetUserPassword", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("reseting password", async () => {
        const mockEmail = "john@example.com"
        const mockOtp = "123456"
        const newPassword = "Password!"
        const hashedPassword = "hashed_password"
        verifyOTP.mockResolvedValueOnce(true)
        hashData.mockResolvedValueOnce(hashedPassword)
        User.updateOne = jest.fn().mockResolvedValueOnce()
        deleteOTP.mockResolvedValueOnce()

        const result = await resetUserPassword({ email: mockEmail, otp: mockOtp, newPassword });
        expect(verifyOTP).toHaveBeenCalledWith({ email: mockEmail, otp: mockOtp });
        expect(hashData).toHaveBeenCalledWith(newPassword);
        expect(User.updateOne).toHaveBeenCalledWith(
            { email: mockEmail },
            { password: hashedPassword }
        );
        expect(deleteOTP).toHaveBeenCalledWith(mockEmail);
        expect(result).toBeUndefined();
    });

    test("throws if OTP is invalid", async () => {
        expect.assertions(3);

        const mockEmail = "john@example.com";
        const mockOtp = "wrong_otp";
        const newPassword = "Secure!Pass1";

        verifyOTP.mockResolvedValueOnce(false);

        await expect(
            resetUserPassword({ email: mockEmail, otp: mockOtp, newPassword })
        ).rejects.toThrow("invalid code passed. Check your inbox.");

        expect(User.updateOne).not.toHaveBeenCalled();
        expect(deleteOTP).not.toHaveBeenCalled();
    });

    test("throws if password does not meet criteria", async () => {
        expect.assertions(3);

        const mockEmail = "john@example.com";
        const mockOtp = "123456";
        const badPassword = "weakpass";

        verifyOTP.mockResolvedValueOnce(true);

        await expect(
            resetUserPassword({ email: mockEmail, otp: mockOtp, newPassword: badPassword })
        ).rejects.toThrow(
            "Password needs to have at least one Uppercase Letter, one special character and is more than 8 characters long."
        );

        expect(User.updateOne).not.toHaveBeenCalled();
        expect(deleteOTP).not.toHaveBeenCalled();
    });


})

