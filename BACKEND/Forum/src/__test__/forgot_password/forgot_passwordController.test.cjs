jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../domains/otp/controller.cjs");
jest.mock("../../utils/hashData.cjs");

const User = require("./../../domains/user/model.cjs");
const { sendOTP, deleteOTP } = require("./../../domains/otp/controller.cjs");
const { hashData } = require("../../utils/hashData.cjs");

const { sendPasswordResetOTPEmail, resetUserPassword } = require("./../../domains/forgot_password/controller.cjs");

describe("sendPasswordRestOTPEmail", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("sending password reset email", async () => {
        const mockEmail = "john@example.com";
        const mockOTPResult = {
            email: mockEmail,
            otp: "hashed_otp",
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        };
        const mockUser = { email: mockEmail, verified: true };
        User.findOne.mockResolvedValueOnce(mockUser);
        sendOTP.mockResolvedValueOnce(mockOTPResult);

        const result = await sendPasswordResetOTPEmail(mockEmail);

        expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
        expect(sendOTP).toHaveBeenCalledWith({
            email: mockEmail,
            subject: "Password Reset",
            message: "Enter the code below to reset your password.",
            duration: 1,
        });
        expect(result).toEqual(mockOTPResult);
    });

    test("should throw Error if user not found", async () => {
        const wrongEmail = "null@example.com";
        User.findOne.mockResolvedValueOnce(null);

        await expect(sendPasswordResetOTPEmail(wrongEmail)).rejects.toThrow("There's no account for the provided email.");
    });

    test("should throw Error if user's email is not verified", async () => {
        const mockEmail = "john@example.com";
        const mockUnverifiedUser = { email: mockEmail, verified: false };
        User.findOne.mockResolvedValueOnce(mockUnverifiedUser);

        await expect(sendPasswordResetOTPEmail(mockEmail)).rejects.toThrow("Email hasn't been verified yet. Check your inbox.");
    });
});

describe("resetUserPassword", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("successfully resets password", async () => {
        const mockEmail = "john@example.com";
        const newPassword = "SecurePass!1";
        const hashedPassword = "hashed_password";

        hashData.mockResolvedValueOnce(hashedPassword);
        User.updateOne = jest.fn().mockResolvedValueOnce();
        deleteOTP.mockResolvedValueOnce();

        const result = await resetUserPassword({ email: mockEmail, newPassword });

        expect(hashData).toHaveBeenCalledWith(newPassword);
        expect(User.updateOne).toHaveBeenCalledWith({ email: mockEmail }, { password: hashedPassword });
        expect(deleteOTP).toHaveBeenCalledWith(mockEmail);
        expect(result).toBeUndefined();
    });

    test("throws if password does not meet criteria", async () => {
        const mockEmail = "john@example.com";
        const badPassword = "weakpass";

        await expect(
            resetUserPassword({ email: mockEmail, newPassword: badPassword })
        ).rejects.toThrow(
            "Password needs to have at least one Uppercase Letter, one special character and is more than 8 characters long."
        );

        expect(hashData).not.toHaveBeenCalled();
        expect(User.updateOne).not.toHaveBeenCalled();
        expect(deleteOTP).not.toHaveBeenCalled();
    });
});

