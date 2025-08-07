// Vercel serverless function wrapper for Forum backend
process.env.NODE_ENV = 'production';

// Load environment variables
require('dotenv').config();

// Import the Express app
const app = require('../BACKEND/Forum/src/app.cjs');

// Export the app directly - Vercel will handle the serverless wrapper
module.exports = app;
