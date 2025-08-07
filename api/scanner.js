// Vercel serverless function wrapper for Scanner backend
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';

// Import configurations  
import { connectDatabase } from '../BACKEND/Scanner/src/config/database.js';
import corsConfig from '../BACKEND/Scanner/src/config/cors.js';

// Import routes and middleware
import routes from '../BACKEND/Scanner/src/routes/index.js';
import errorHandler from '../BACKEND/Scanner/src/middleware/errorHandler.js';

// Initialize Express app
const app = express();

// Connect to database (but don't start server)
connectDatabase();

// Middleware
app.use(corsConfig);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
