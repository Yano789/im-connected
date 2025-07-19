const express = require("express");
const router = express.Router();
const {sendPasswordResetOTPEmail,resetUserPassword} = require("./controller.cjs");
const {resetPasswordSchema,passwordResetRequestSchema} = require("./../../utils/validators/forgot_passwordValidators.cjs")
const {validateBody} = require("./../../middleware/validate.cjs")



router.post("/reset",validateBody(resetPasswordSchema),async(req,res)=>{
    try {
        const {email,otp,newPassword} = req.body;
        await resetUserPassword({email,otp,newPassword});
        res.status(200).json({email,passwordreset:true});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

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