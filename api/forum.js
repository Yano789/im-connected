// Vercel serverless function wrapper for Forum backend

// Initialize environment variables before importing app
process.env.NODE_ENV = 'production';

let app;

// Export as Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Lazy load the app to avoid initialization issues
    if (!app) {
      app = require('../BACKEND/Forum/src/app.cjs');
    }

    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      console.error('Missing MONGODB_URI environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        message: 'Database connection not configured' 
      });
    }

    if (!process.env.TOKEN_KEY) {
      console.error('Missing TOKEN_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        message: 'Authentication not configured' 
      });
    }

    // Call the Express app
    return app(req, res);
    
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};
