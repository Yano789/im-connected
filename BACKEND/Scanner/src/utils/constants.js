/**
 * Application constants
 */
const constants = {
  // Server configuration
  PORT: process.env.SCANNER_PORT || process.env.PORT || 3001,
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Cache settings
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  
  // API endpoints
  FORUM_BACKEND_URL: process.env.FORUM_BACKEND_URL || 'http://localhost:5001',
  
  // Application info
  APP_NAME: 'Medication Scanner API', // Used for health checks
  APP_FULL_NAME: 'Enhanced Medication Scanner API - Online Sources Only', // Used for API documentation
  APP_VERSION: '2.0.0',
  APP_DOC_VERSION: '2.1.0', // Version for API documentation
  APP_DESCRIPTION: 'Advanced OCR-based medication scanner with authoritative online medical database integration',
  
  // Features
  FEATURES: [
    'Multi-variant image preprocessing optimized for medication boxes',
    'Enhanced OCR with confidence scoring',
    'Authoritative online medical database integration only',
    'FDA, NIH, and RxNav API integration',
    'Multi-source cross-referencing for reliability',
    'Intelligent caching with source verification',
    'No local medication database - ensures up-to-date information'
  ],
  
  // Data sources
  DATA_SOURCES: [
    'FDA Drug Label Database',
    'NIH MedlinePlus',
    'RxNav (National Library of Medicine)',
    'OpenFDA',
    'Online Medical Databases'
  ],
  
  // Default user ID for Scanner-created care recipients
  DEFAULT_USER_ID: '507f1f77bcf86cd799439011'
};

export default constants;
