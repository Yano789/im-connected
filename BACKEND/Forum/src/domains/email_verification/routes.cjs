const express = require("express");
const router = express.Router();
const{sendVerificationOTPEmail,verifyUserEmail} = require("./controller.cjs");
const{validateBody} = require("./../../middleware/validate.cjs")
const {emailVerifySchema,emailOTPRequestSchema} = require("./../../utils/validators/email_verificationValidators.cjs")

//verifies email otp
router.post("/verify",validateBody(emailVerifySchema),async(req,res)=>{
    try {
        const {email,otp} = req.body;
        await verifyUserEmail({email,otp});
        res.status(200).json({email,verified:true});

    } catch (error) {
        res.status(400).send(error.message);
    }
});



//request new verification otp
router.post("/",validateBody(emailOTPRequestSchema),async(req,res)=>{
    try {
        const {email} = req.body;
        const createdEmailVerificationOTP = await sendVerificationOTPEmail(email);
        res.status(200).json(createdEmailVerificationOTP);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;