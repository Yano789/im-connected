import cors from 'cors';

/**
 * CORS configuration
 */
const corsConfig = cors({
  origin: function (origin, callback) {
    // In Docker/production, be more permissive for internal network communication
    if (process.env.NODE_ENV === 'production') {
      console.log('CORS: Production mode - allowing all origins for Docker networking');
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
    
    console.log('CORS: Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, curl, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('CORS allowed for origin:', origin || 'no-origin');
      // Pass the specific origin back, or '*' for no-origin requests
      callback(null, origin || '*');
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
