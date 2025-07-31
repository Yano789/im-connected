const express = require("express");
const translate = require("./controller.cjs")
const router = express.Router();

router.post("/translate", async (req, res) => {
  const { text, target } = req.body;
  if (!text || !target) {
    return res.status(400).json({ error: "Missing text, source or target" });
  }

  try {
    const translated = await translate(text, target);
    res.json({ translated });
  } catch (err) {
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;