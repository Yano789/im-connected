const express = require("express");
const router  = express.Router();
const {createNewUser,authenticateUser} = require("./controller.cjs");
const auth = require("../../middleware/auth.cjs");
const{sendVerificationOTPEmail}=require("../email_verification/controller.cjs");


//Protected Route
router.get("/private_data",auth,(req,res)=>{
    res.status(200).send(`You're in the private territory of ${req.currentUser.email}`);
});





//login
router.post("/", async (req, res) => {
    try {
        let { username, password } = req.body;
        const isProduction = process.env.NODE_ENV === "production"

        if (!(username && password)) {
            throw Error("Empty Credentials Given!");
        }
        const {token,authenticatedUser} = await authenticateUser({ username, password });
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json(authenticatedUser);

    } catch (error) {
        res.status(400).send(error.message);
    }
});



//Signup
//TODO: CHECK IF NEED TO INCLUDE LIKE LANGUAGES AND DISPLAY MODE AS ATTRIBUTES FOR MODEL
router.post("/signup",async(req,res)=>{
    try {
        let{firstName,lastName,username,email,password,confirmPassword} = req.body;

        //simple checking of inputs
        if(!(firstName&&lastName&&username&&email&&password&&confirmPassword)){
            throw Error("Empty Input Fields!");
        }else if((!/^[a-zA-Z]*$/.test(firstName))||(!/^[a-zA-Z]*$/.test(lastName))){
            throw Error("Invalid name entered");
        }
        else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
            throw Error("Invalid email entered");
        }
        else if(!/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password)){
            throw Error("Invalid Password!");
        }
        else{
            //good credentials, create new user
            const newUser = await createNewUser({
                firstName, lastName, username, email, password
            });
            await sendVerificationOTPEmail(email);
            res.status(200).json(newUser);
        }
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