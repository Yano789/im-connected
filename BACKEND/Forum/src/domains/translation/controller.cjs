const fetch = require('node-fetch');
async function translate(text, target) {
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      target: target,
      format: "text",
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Translation failed: ${data.error.message}`);
  }

  return data.data.translations[0].translatedText
}

module.exports = translate;


