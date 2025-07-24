const express = require("express");
const { createNewUser, authenticateUser, updateUserPreferences } = require("./controller.cjs");
const auth = require("../../middleware/auth.cjs");
const { sendVerificationOTPEmail } = require("../email_verification/controller.cjs");
const { validateBody } = require("../../middleware/validate.cjs")
const { loginSchema, signupSchema } = require("../../utils/validators/userValidator.cjs");
const router = express.Router();


//Protected Route
router.get("/private_data", auth, (req, res) => {
    res.status(200).send(`You're in the private territory of ${req.currentUser.email}`);
});

router.get("/check-auth", auth, (req, res) => {
  res.status(200).json({ user: req.currentUser });
});

//login
router.post("/", validateBody(loginSchema), async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        const isProduction = process.env.NODE_ENV === "production"

        const { token, authenticatedUser } = await authenticateUser({ username, password });

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: "Strict",
        };

        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // persist for 7 days
        }

        res.cookie("token", token, cookieOptions);
        res.status(200).json(authenticatedUser);

    } catch (error) {
        res.status(400).send(error.message);
    }
});

//Signup
//TODO: CHECK IF NEED TO INCLUDE LIKE LANGUAGES AND DISPLAY MODE AS ATTRIBUTES FOR MODEL
router.post("/signup", validateBody(signupSchema), async (req, res) => {
    try {
        const { name, username, email, number, password } = req.body;

        const newUser = await createNewUser({
            name, username, email, number, password
        });
        await sendVerificationOTPEmail(email);
        res.status(200).json(newUser);

    } catch (error) {
        res.status(400).send(error.message);
    }
});

// preferences
router.post("/preferences", async (req, res) => {
    try {
        const { username, language, textSize, contentMode, topics } = req.body;

        const preferences = {
            language,
            textSize,
            contentMode,
            topics,
        };

        const updatedUser = await updateUserPreferences({ username, preferences });

        res.status(200).json({ success: true, preferences: updatedUser.preferences });
    } catch (error) {
        res.status(500).json({ error: "Failed to update preferences" });
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