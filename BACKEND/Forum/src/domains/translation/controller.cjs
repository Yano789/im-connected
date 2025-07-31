const fetch = require('node-fetch');

async function detectLanguage(text) {
  const res = await fetch('http://localhost:5002/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text }),
  });
  const data = await res.json();
  return data[0]?.language || 'en'; // fallback to English
}

async function translate(text, target) {
  const source = await detectLanguage(text);
  if (source === target) return text; // no translation needed

  const res = await fetch('http://localhost:5002/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: 'text'
    })
  });

  const data = await res.json();
  return data.translatedText;
}

module.exports = translate;


