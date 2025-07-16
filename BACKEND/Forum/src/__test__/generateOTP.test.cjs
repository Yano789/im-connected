

const generateOTP = require("./../utils/generateOTP.cjs")


describe("utils.generateOTP() tests", () => {

    test("testing generateOTP()", async () => {

        const otp = await generateOTP()
        expect(typeof otp).toBe('string');
        expect(otp.length).toBe(6);

        const otpValue = parseInt(otp)
        expect(otpValue).toBeGreaterThanOrEqual(0);
        expect(otpValue).toBeLessThanOrEqual(999999);
    })


})