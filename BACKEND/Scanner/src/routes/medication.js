import express from 'express';
import upload from '../config/multer.js';
import MedicationController from '../controllers/medicationController.js';

const router = express.Router();
const medicationController = new MedicationController();

/**
 * Scan medication from uploaded image (no database save)
 */
router.post('/scan-medication', upload.single('medicationImage'), (req, res) => {
  medicationController.scanMedication(req, res);
});

/**
 * Save scanned medication to database
 */
router.post('/save-scanned-medication', upload.single('medicationImage'), (req, res) => {
  medicationController.saveMedication(req, res);
});

/**
 * Get medications for a care recipient
 */
router.get('/medications/:careRecipientId', (req, res) => {
  medicationController.getMedications(req, res);
});

/**
 * Delete a medication
 */
router.delete('/medications/:medicationId', (req, res) => {
  medicationController.deleteMedication(req, res);
});

/**
 * Get all care recipients with their medications
 */
router.get('/care-recipients-with-medications', (req, res) => {
  medicationController.getCareRecipientsWithMedications(req, res);
});

/**
 * Test endpoint for AI chatbot fallback
 */
router.post('/api/test-ai-fallback', (req, res) => {
  medicationController.testAIFallback(req, res);
});

export default router;
