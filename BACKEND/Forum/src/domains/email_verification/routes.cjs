const express = require("express");
const router = express.Router();
const{sendVerificationOTPEmail,verifyUserEmail} = require("./controller.cjs");
const{validateBody} = require("./../../middleware/validate.cjs")
const {emailVerifySchema,emailOTPRequestSchema} = require("./../../utils/validators/email_verificationValidators.cjs")

//verifies email otp
router.post("/verify",validateBody(emailVerifySchema),async(req,res)=>{
    try {
        const {email,otp} = req.body;
        const verifiedUser = await verifyUserEmail({email,otp});
        
        //create login token for verified user
        const createToken = require("../../utils/createToken.cjs");
        const tokenData = { 
            userId: verifiedUser._id, 
            email: verifiedUser.email, 
            username: verifiedUser.username 
        };
        const token = await createToken(tokenData);
        
        //set auth cookie
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        res.cookie("token", token, cookieOptions);
        res.status(200).json({email, verified: true, user: verifiedUser});

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



//request new verification otp
router.post("/",validateBody(emailOTPRequestSchema),async(req,res)=>{
    try {
        const {email} = req.body;
        const createdEmailVerificationOTP = await sendVerificationOTPEmail(email);
        res.status(200).json(createdEmailVerificationOTP);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;