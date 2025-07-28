const express = require("express");
const { createNewUser, authenticateUser, updateUserPreferences, getUser } = require("./controller.cjs");
const auth = require("../../middleware/auth.cjs");
const { sendVerificationOTPEmail } = require("../email_verification/controller.cjs");
const { validateBody } = require("../../middleware/validate.cjs")
const { loginSchema, signupSchema, preferencesSchema } = require("../../utils/validators/userValidator.cjs")
const router = express.Router();


//login
router.post("/", validateBody(loginSchema), async (req, res) => {

  try {
    const { username, password, rememberMe } = req.body;

    const isProduction = process.env.NODE_ENV === "production";
    const { token, authenticatedUser } = await authenticateUser({ username, password });

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000
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

router.post("/preferences", validateBody(preferencesSchema), async (req, res) => {
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


// router.get("/check-auth", auth, async (req, res) => {
//   const username = req.currentUser
//   const user = await getUser(username)
//   res.status(200).json(user);
// });

// /check-auth route with improved error handling and debug logging
router.get("/check-auth", auth, async (req, res) => {
  try {
    console.log("[check-auth] req.currentUser:", req.currentUser);
    const username = req.currentUser?.username || req.currentUser;
    if (!username) {
      return res.status(401).json({ error: "No user found in token" });
    }
    const user = await getUser(username);
    res.status(200).json({ user });
  } catch (err) {
    console.error("[check-auth] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/threadId', auth, async (req, res) => {
  try {
    // re‑fetch user record so we include the latest threadId
    const username = req.currentUser.username;
    const user = await getUser(username);
    let threadId = user.threadId;
    if (!threadId) {
      //Create a new thread via the Quick‑start POST /api/assistants/threads
      const createRes = await fetch(
        "http://localhost:3000/api/assistants/threads",
        { method: "POST" }
      );
      if (!createRes.ok) {
        throw new Error(`Quickstart failed: ${createRes.status} ${createRes.statusText}`);
      }
      const { threadId: newId } = await createRes.json();

      threadId = newId;
      user.threadId = threadId;
      await user.save();
    }
    return res.json({ threadId });
  } catch (err) {
    console.error('[threadId] could not read or create thread:', err);
    return res.status(500).send('Could not read/create threadId');
  }
});

module.exports = router;