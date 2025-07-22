const express = require("express");
const {createNewUser,authenticateUser} = require("./controller.cjs");
const auth = require("../../middleware/auth.cjs");
const{sendVerificationOTPEmail}=require("../email_verification/controller.cjs");
const {validateBody} = require("../../middleware/validate.cjs")
const {loginSchema,signupSchema} = require("../../utils/validators/userValidator.cjs")
const router  = express.Router();


//Protected Route
//router.get("/private_data",auth,(req,res)=>{
  //  res.status(200).send(`You're in the private territory of ${req.currentUser.email}`);
//});





//login
router.post("/", validateBody(loginSchema), async (req, res) => {
  console.log("Login route hit");
  try {
    const { username, password } = req.body;
    console.log("Received:", username, password);

    const isProduction = process.env.NODE_ENV === "production";
    const { token, authenticatedUser } = await authenticateUser({ username, password });

    console.log("Authenticated user:", authenticatedUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log("Sending response");
    res.status(200).json(authenticatedUser);
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(400).send(error.message);
  }
});




//Signup
//TODO: CHECK IF NEED TO INCLUDE LIKE LANGUAGES AND DISPLAY MODE AS ATTRIBUTES FOR MODEL
router.post("/signup",validateBody(signupSchema),async(req,res)=>{
    try {
        const {firstName,lastName,username,email,password} = req.body;
            
        const newUser = await createNewUser({
                firstName, lastName, username, email, password
            });
            await sendVerificationOTPEmail(email);
            res.status(200).json(newUser);
        
    } catch (error) {
        res.status(400).send(error.message);
    }
});
//logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  });
  return res.status(200).send("Logged out successfully");
});

module.exports = router;