const express = require('express');
const router = express.Router();
const upload = require('../../config/googleStorage.cjs');
const { gcsClient } = require("../../config/gcsStorage.cjs");
const auth = require("../../middleware/auth.cjs");
const {
    createCareRecipient,
    getCareRecipients,
    updateCareRecipient,
    deleteCareRecipient,
    createMedication,
    getMedications,
    updateMedication,
    deleteMedication,
    getUserMedicationData
} = require('./controller.cjs');

// ==================== CARE RECIPIENTS ====================

// Get all care recipients for the current user
router.get('/care-recipients', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const recipients = await getCareRecipients(username);
        res.status(200).json(recipients);
    } catch (error) {
        console.error('Error fetching care recipients:', error);
        res.status(400).json({ error: error.message });
    }
});

// Create a new care recipient
router.post('/care-recipients', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Care recipient name is required' });
        }
        
        const recipient = await createCareRecipient({ name: name.trim(), username });
        res.status(201).json(recipient);
    } catch (error) {
        console.error('Error creating care recipient:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update a care recipient
router.put('/care-recipients/:id', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Care recipient name is required' });
        }
        
        const recipient = await updateCareRecipient({ id, name: name.trim(), username });
        res.status(200).json(recipient);
    } catch (error) {
        console.error('Error updating care recipient:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete a care recipient
router.delete('/care-recipients/:id', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { id } = req.params;
        
        const result = await deleteCareRecipient({ id, username });
        res.status(200).json({
            message: 'Care recipient and associated medications deleted successfully',
            deletedRecipient: result.deletedRecipient,
            deletedMedicationsCount: result.deletedMedicationsCount
        });
    } catch (error) {
        console.error('Error deleting care recipient:', error);
        res.status(400).json({ error: error.message });
    }
});

// ==================== MEDICATIONS ====================

// Get all medications for the current user (optionally filtered by care recipient)
router.get('/medications', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { careRecipientId } = req.query;
        
        const medications = await getMedications(username, careRecipientId);
        res.status(200).json(medications);
    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(400).json({ error: error.message });
    }
});

// Create a new medication
router.post('/medications', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const medicationData = { ...req.body, username };
        
        if (!medicationData.name || medicationData.name.trim() === '') {
            return res.status(400).json({ error: 'Medication name is required' });
        }
        
        if (!medicationData.careRecipientId) {
            return res.status(400).json({ error: 'Care recipient ID is required' });
        }
        
        const medication = await createMedication(medicationData);
        res.status(201).json(medication);
    } catch (error) {
        console.error('Error creating medication:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update a medication
router.put('/medications/:id', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { id } = req.params;
        const updateData = { ...req.body, id, username };
        
        const medication = await updateMedication(updateData);
        res.status(200).json(medication);
    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete a medication
router.delete('/medications/:id', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const { id } = req.params;
        
        const medication = await deleteMedication({ id, username });
        res.status(200).json({
            message: 'Medication deleted successfully',
            deletedMedication: medication
        });
    } catch (error) {
        console.error('Error deleting medication:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get complete medication data for the current user (care recipients with their medications)
router.get('/user-data', auth, async (req, res) => {
    try {
        const username = req.currentUser.username;
        const userData = await getUserMedicationData(username);
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user medication data:', error);
        res.status(400).json({ error: error.message });
    }
});

// ==================== IMAGE UPLOAD ====================

// ==================== IMAGE UPLOAD ====================

// Upload medication image to Google Cloud Storage
router.post('/upload-image', auth, upload.single('medicationImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No image file provided',
                message: 'Please provide a medication image to upload'
            });
        }

        // The file is already uploaded to Google Cloud Storage by the custom storage engine
        const uploadResult = {
            url: req.file.secure_url || req.file.url,
            public_id: req.file.public_id || req.file.filename,
            type: 'image',
            format: req.file.format,
            bytes: req.file.bytes || req.file.size,
            resource_type: req.file.resource_type || 'image'
        };

        console.log('Medication image uploaded to Google Cloud Storage:', uploadResult);

        res.status(200).json({
            success: true,
            message: 'Medication image uploaded successfully',
            data: uploadResult
        });

    } catch (error) {
        console.error('Error uploading medication image:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && req.file.public_id) {
            try {
                await gcsClient.destroy(req.file.public_id);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded file:', cleanupError);
            }
        }
        
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to upload medication image'
        });
    }
});// Delete medication image from Google Cloud Storage
router.delete('/delete-image', auth, async (req, res) => {
    try {
        const { public_id, publicId } = req.body;
        const imageId = public_id || publicId;

        if (!imageId) {
            return res.status(400).json({
                error: 'Missing public_id or publicId',
                message: 'Please provide the public_id of the image to delete'
            });
        }

        // Delete from Google Cloud Storage
        const deleteResult = await gcsClient.destroy(imageId);

        console.log('Medication image deleted from Google Cloud Storage:', deleteResult);

        if (deleteResult.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Medication image deleted successfully',
                data: deleteResult
            });
        } else {
            res.status(404).json({
                error: 'Image not found',
                message: 'The specified image could not be found or was already deleted',
                data: deleteResult
            });
        }

    } catch (error) {
        console.error('Error deleting medication image:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete medication image'
        });
    }
});

// =============================================================================
// ANALYTICS AND REPORTING ROUTES
// =============================================================================

// Get medication adherence analytics for a care recipient
router.get('/care-recipients/:recipientId/analytics', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { recipientId } = req.params;
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get medication logs for analytics
        const logs = await MedicationLog.find({
            careRecipientId: recipientId,
            userId: userId,
            ...dateFilter
        }).populate('medicationId', 'name');

        // Calculate adherence statistics
        const totalLogs = logs.length;
        const takenLogs = logs.filter(log => log.taken).length;
        const adherenceRate = totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 0;

        // Group by medication
        const medicationStats = {};
        logs.forEach(log => {
            const medName = log.medicationId?.name || 'Unknown';
            if (!medicationStats[medName]) {
                medicationStats[medName] = { total: 0, taken: 0 };
            }
            medicationStats[medName].total++;
            if (log.taken) medicationStats[medName].taken++;
        });

        // Calculate adherence rate per medication
        Object.keys(medicationStats).forEach(medName => {
            const stats = medicationStats[medName];
            stats.adherenceRate = stats.total > 0 ? (stats.taken / stats.total) * 100 : 0;
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalLogs,
                    takenLogs,
                    missedLogs: totalLogs - takenLogs,
                    adherenceRate: Math.round(adherenceRate * 100) / 100
                },
                medicationBreakdown: medicationStats,
                period: {
                    startDate: startDate || 'All time',
                    endDate: endDate || 'Present'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics',
            message: error.message
        });
    }
});

// =============================================================================
// SCANNER INTEGRATION ROUTES
// =============================================================================

// Process scanned medication data (for future integration with Scanner service)
router.post('/scan-medication', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No image file provided for scanning' 
            });
        }

        const userId = req.user?.id || 'default_user_id';
        const { careRecipientId } = req.body;

        // Upload image to Google Cloud Storage first
        const result = await gcsClient.uploadBuffer(
            req.file.buffer, 
            `scanned_medications/${Date.now()}-${req.file.originalname}`,
            req.file.mimetype
        );

        // TODO: Integrate with Scanner service for OCR processing
        // For now, return the uploaded image data
        const scanData = {
            imageUrl: result.url,
            publicId: result.public_id,
            scanResults: {
                text: "OCR processing not yet implemented",
                medications: [],
                confidence: 0
            },
            timestamp: new Date()
        };

        res.status(200).json({
            success: true,
            data: scanData,
            message: 'Image uploaded successfully. OCR processing will be implemented in future updates.'
        });
    } catch (error) {
        console.error('Error processing scanned medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process scanned medication',
            message: error.message
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Medication service is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
