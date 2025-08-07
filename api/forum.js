// Vercel serverless function wrapper for Forum backend
const app = require('../BACKEND/Forum/src/app.cjs');

// Export the Express app directly for Vercel
module.exports = app;
