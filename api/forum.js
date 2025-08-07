// Vercel serverless function wrapper for Forum backend
require('dotenv').config();
const app = require('../BACKEND/Forum/src/app.cjs');

module.exports = app;
