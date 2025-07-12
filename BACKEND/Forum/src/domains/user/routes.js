const express = require("express");
const router  = express.Router();
const {createNewUser,authenticateUser} = require("./controller");
const auth = require("./../../middleware/auth");
const{sendVerificationOTPEmail}=require("./../email_verification/controller");


//Protected Route
router.get("/private_data",auth,(req,res)=>{
    res.status(200).send(`You're in the private territory of ${req.currentUser.email}`);
});






//Login
router.post("/",async(req,res)=>{
    try {
        let{username,password} = req.body;
        username = username.trim();
        password = password.trim();

        if(!(username&&password)){
            throw Error ("Empty Credentials Given!");
        }
        const authenticatedUser = await authenticateUser({username,password});
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
        firstName = firstName.trim();
        lastName = lastName.trim();
        username = username.trim();
        email = email.trim();
        password = password.trim();
        confirmPassword = confirmPassword.trim();

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
        else if (!(confirmPassword === password)){
            throw Error("Different Password!");
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

module.exports = router;