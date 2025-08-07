// Vercel serverless function wrapper for Forum backend
process.env.NODE_ENV = 'production';

// Load environment variables - try both .env files
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '../.env.local' });

// Import the Express app
const app = require('../BACKEND/Forum/src/app.cjs');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  // Ensure we have required environment variables
  if (!process.env.MONGODB_URI || !process.env.TOKEN_KEY) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Call the Express app
  return app(req, res);
};
