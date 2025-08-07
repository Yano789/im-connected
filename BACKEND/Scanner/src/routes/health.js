import express from 'express';
import constants from '../utils/constants.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: constants.APP_NAME,
    version: constants.APP_VERSION
  });
});

/**
 * API documentation endpoint
 */
router.get('/', (req, res) => {
  res.json({
    name: constants.APP_FULL_NAME,
    version: constants.APP_DOC_VERSION,
    description: constants.APP_DESCRIPTION,
    dataPolicy: 'All medication information sourced from authoritative online medical databases for consistency and reliability',
    endpoints: {
      'POST /scan-medication': 'Upload and scan medication images',
      'GET /health': 'Health check',
      'GET /uploads/:filename': 'Access uploaded images'
    },
    features: constants.FEATURES,
    dataSources: constants.DATA_SOURCES,
    reliability: {
      'approach': 'Online-only for maximum accuracy and consistency',
      'benefits': [
        'Always up-to-date information',
        'Authoritative medical sources',
        'Cross-verified data from multiple sources',
        'No outdated local information'
      ]
    }
  });
});

export default router;
