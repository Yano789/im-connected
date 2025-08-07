const fetch = require("node-fetch");

const SUPPORTED_LANGUAGES = ["en", "ms", "zh", "ta"]; // English, Malay, Chinese, Tamil

// Fallback mapping for related/variant languages
const LANGUAGE_FALLBACK_MAP = {
  // English-like
  en: "en",
  "en-GB": "en",
  "en-US": "en",
  "en-IN": "en",

  // Malay-like
  id: "ms",   // Indonesian
  jv: "ms",   // Javanese
  su: "ms",   // Sundanese

  // Chinese-like
  zh: "zh",
  "zh-TW": "zh-CN",
  "zh-HK": "zh-CN",
  "zh-SG": "zh-CN",

  // Tamil-like
  ta: "ta",
  te: "ta",  // Telugu (fallback to Tamil)
  kn: "ta",  // Kannada
  ml: "ta",  // Malayalam
};

async function translate(text, targetLang) {
  const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

  // Step 1: Detect source language
  const detectRes = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: text }),
    }
  );

  const detectData = await detectRes.json();

  if (detectData.error) {
    throw new Error(`Language detection failed: ${detectData.error.message}`);
  }

  let detectedLang = detectData.data.detections[0][0].language;

  // Step 2: Map to fallback if not directly supported
  const mappedLang = LANGUAGE_FALLBACK_MAP[detectedLang] || "en";

  if (!SUPPORTED_LANGUAGES.includes(mappedLang)) {
    console.warn(`⚠️ Detected unsupported language (${detectedLang}). Falling back to 'en'.`);
  }

  // Step 3: Validate target
  if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
    throw new Error(`Target language '${targetLang}' is not supported.`);
  }

  // No translation needed
  if (mappedLang === targetLang) {
    return text;
  }

  // Step 4: Translate
  const translateRes = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: mappedLang,
        target: targetLang,
        format: "text",
      }),
    }
  );

  const translateData = await translateRes.json();

  if (translateData.error) {
    throw new Error(`Translation failed: ${translateData.error.message}`);
  }

  return translateData.data.translations[0].translatedText;
}

module.exports = translate;
