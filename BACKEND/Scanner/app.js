import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
const envPath = path.join(__dirname, '../../.env');
console.log('Scanner: Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Scanner: Error loading .env file:', result.error);
} else {
  console.log('Scanner: Successfully loaded .env file');
  console.log('Scanner: GOOGLE_CLOUD_PROJECT_ID =', process.env.GOOGLE_CLOUD_PROJECT_ID ? 'SET' : 'NOT SET');
  console.log('Scanner: GCS_BUCKET_NAME =', process.env.GCS_BUCKET_NAME ? 'SET' : 'NOT SET');
}

import express from 'express';
import mongoose from 'mongoose';

// Import configurations
import { connectDatabase } from './src/config/database.js';
import corsConfig from './src/config/cors.js';

// Import routes and middleware
import routes from './src/routes/index.js';
import errorHandler from './src/middleware/errorHandler.js';

// Import constants
import constants from './src/utils/constants.js';

// Initialize Express app
const app = express();

// Connect to database
connectDatabase();

// Middleware
app.use(corsConfig);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(constants.PORT, '0.0.0.0', () => {
  console.log(`🏥 ${constants.APP_NAME} v${constants.APP_VERSION} running on http://0.0.0.0:${constants.PORT}`);
  console.log(`📱 Ready to scan medication images with authoritative online database integration`);
  console.log(`🔍 Features: Online-only data sources, FDA/NIH integration, enhanced preprocessing`);
  console.log(`✅ Data Policy: All medication information sourced from authoritative online medical databases`);
  console.log(`🚫 No local medication database - ensures maximum reliability and up-to-date information`);
});

// Graceful shutdown function for tests
export const closeServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(async () => {
        // Close database connection if it exists
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Handle process termination gracefully
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await closeServer();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await closeServer();
    process.exit(0);
  });
}

export default app;
