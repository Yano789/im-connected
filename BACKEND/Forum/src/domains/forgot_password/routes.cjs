const express = require("express");
const router = express.Router();
const {sendPasswordResetOTPEmail,resetUserPassword} = require("./controller.cjs");
const {resetPasswordSchema,passwordResetRequestSchema} = require("./../../utils/validators/forgot_passwordValidators.cjs")
const {emailVerifySchema} = require("./../../utils/validators/email_verificationValidators.cjs")
const {verifyOTP} = require("./../otp/controller.cjs")
const {validateBody} = require("./../../middleware/validate.cjs")


//changes the password
router.post("/reset",validateBody(resetPasswordSchema),async(req,res)=>{
    try {
        const {email,newPassword} = req.body;
        await resetUserPassword({email,newPassword});
        res.status(200).json({passwordreset:true});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//verify password reset otp, do the same as how you do sign in
router.post("/verify",validateBody(emailVerifySchema),async(req,res)=>{
    try {
        const{email,otp} = req.body
        const validOTP = await verifyOTP({email,otp})
        res.status(200).json(validOTP) //sends out a boolean to check if you successfully verified
    } catch (error) {
        res.status(400).send(error.message)
    }
})


//Password reset request
router.post("/",validateBody(passwordResetRequestSchema),async(req,res)=>{
    try {
        const {email} = req.body;
        const createdPasswordResetOTP = await sendPasswordResetOTPEmail(email);
        res.status(200).json(createdPasswordResetOTP);
    } catch (error) {
        res.status(400).send(error.message);
    }
});


module.exports = router;