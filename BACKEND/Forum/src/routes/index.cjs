const express = require("express");
const router = express.Router();
const userRoutes = require("../domains/user/index.cjs"); //domains/user/index.js
const OTPRoutes = require("../domains/otp/index.cjs");
const EmailVerificationRoutes = require("../domains/email_verification/index.cjs");
const ForgotPasswordRoutes = require("../domains/forgot_password/index.cjs");
const postRoutes = require("../domains/post/index.cjs");
const commentRoutes = require("../domains/comment/index.cjs");
const savedPostRoutes = require("../domains/savedPosts/index.cjs");

router.use("/user",userRoutes);
router.use("/otp",OTPRoutes);
router.use("/email_verification",EmailVerificationRoutes);
router.use("/forgot_password",ForgotPasswordRoutes);
router.use("/post",postRoutes);
router.use("/:post/comment",commentRoutes);
router.use("/:username/saved",savedPostRoutes);
module.exports = router;