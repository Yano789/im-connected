import express from 'express';
import medicationRoutes from './medication.js';
import careRecipientRoutes from './careRecipient.js';
import healthRoutes from './health.js';

const router = express.Router();

// Mount all routes
router.use('/', medicationRoutes);
router.use('/', careRecipientRoutes);
router.use('/', healthRoutes);

export default router;
