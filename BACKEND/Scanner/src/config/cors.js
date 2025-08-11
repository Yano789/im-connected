import cors from 'cors';

/**
 * CORS configuration - Very permissive for production debugging
 */
const corsConfig = cors({
  origin: true, // Allow all origins in production for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
});

export default corsConfig;
