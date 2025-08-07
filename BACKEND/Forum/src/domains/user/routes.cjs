const express = require("express");
const { createNewUser, authenticateUser, updateUserPreferences, getUser,updateUserDetails } = require("./controller.cjs");
const auth = require("../../middleware/auth.cjs");
const { sendVerificationOTPEmail } = require("../email_verification/controller.cjs");
const { validateBody } = require("../../middleware/validate.cjs")
const { loginSchema, signupSchema, preferencesSchema,userDetailsSchema} = require("../../utils/validators/userValidator.cjs")
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
      sameSite: isProduction ? "None" : "Strict", // Use "None" in production for cross-origin
      maxAge: 24 * 60 * 60 * 1000
    };

    if (rememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // persist for 7 days
    }

    res.cookie("token", token, cookieOptions);

    res.status(200).json(authenticatedUser);
  } catch (error) {

    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
});

router.post("/preferences", validateBody(preferencesSchema), async (req, res) => {
  try {
    const { username, language, textSize, contentMode, topics } = req.body;

    const preferences = {
      preferredLanguage:language,
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
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Strict"
  });
  return res.status(200).send("Logged out successfully");
});

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
    console.log(`This is the current user ${username}`);
    const user = await getUser(username);
    let threadId = user.threadId;
    console.log(`This is the retrieved current user's threadId ${threadId}`);
    if (!threadId) {
      //Create a new thread via the Quick‑start POST /api/assistants/threads

      const AI_BASE = process.env.AI_CHATBOT_URL || 'http://ai-chatbot:3000';
      console.log('[threadId] no threadId in user, calling Quick-start API…');
      /*const createRes = await fetch(
        "http://localhost:3000/api/assistants/threads",
        { method: "POST" }
      );*/
      const createRes = await fetch(
        `${AI_BASE}/api/assistants/threads`,
        { method: "POST" }
      );

      console.log('[threadId] Quick-start status:', createRes.status, createRes.statusText);

      if (!createRes.ok) {
        throw new Error(`Quickstart failed: ${createRes.status} ${createRes.statusText}`);
      }
      const { threadId: newId } = await createRes.json();
      console.log('[threadId] got new threadId:', newId);

      threadId = newId;
      user.threadId = threadId;
      console.log('[threadId] saving user…');
      await user.save();
    }
    return res.status(200).json({ threadId });
  } catch (err) {
    console.error('[threadId] could not read or create thread:', err.stack || err);
    return res.status(500).send('Could not read/create threadId');
  }
});

router.get('/language', auth, async (req, res) => {
  try {
    const username = req.currentUser.username;
    const user = await getUser(username);
    let language = user.preferences.preferredLanguage;
    return res.status.json({ language });
  } catch (err) {
    console.error('Could not retrieve language settings', err);
    return res.status(500).send('Could not retrieve language settings');
  }
});

router.get("/getUser",auth,async(req,res)=>{
  try {
    const username = req.currentUser.username;
    const user = await getUser(username);
    return res.status(200).json(user)
  } catch (error) {
    return res.status(400).send(error.message)
  }
})

router.post("/userDetails",auth,validateBody(userDetailsSchema),async(req,res)=>{
  try {
    const username = req.currentUser.username
    const{name,newUsername,number,email} = req.body
    const {token,newUser} = await updateUserDetails({name,username,newUsername,number,email})
    res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  });
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000
    };
res.cookie("token", token, cookieOptions);
    return res.status(200).json(newUser)
  } catch (error) {
    return res.status(400).send(error.message)
  }
})
module.exports = router;