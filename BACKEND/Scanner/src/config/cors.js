import cors from 'cors';

/**
 * CORS configuration
 */
const corsConfig = cors({
  origin: function (origin, callback) {
    console.log('CORS: NODE_ENV =', process.env.NODE_ENV);
    console.log('CORS: Request from origin:', origin);
    
    // In production or Railway environment, be more permissive
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
      console.log('CORS: Production/Railway mode - allowing all origins');
      callback(null, true);
      return;
    }

    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // AI chatbot
      'http://localhost:5001', // Forum backend
      'http://localhost:80',   // Docker frontend
      'http://localhost',      // Docker frontend (without port)
      'http://localhost:8080', // Nginx proxy
      // Production Railway URLs
      'https://im-connected-production.up.railway.app', // Production frontend
      'https://ai-chatbot-production-c94d.up.railway.app', // Production AI chatbot
      'https://scanner-service.up.railway.app', // Production scanner service
      // Docker network internal communication
      'http://frontend',
      'http://im-connected-frontend',
      'http://frontend:80',
      'http://im-connected-frontend:80',
      // Common Docker bridge network IPs
      'http://172.17.0.1',
      'http://172.18.0.1',
      'http://172.19.0.1',
      'http://172.20.0.1'
    ];
    
    // Allow requests with no origin (mobile apps, curl, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('CORS allowed for origin:', origin || 'no-origin');
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
});

export default corsConfig;
