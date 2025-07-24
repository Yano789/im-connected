const express = require('express');
const router = express.Router();
const upload = require('../../config/storage.cjs');
const { v2: cloudinary } = require("cloudinary");
const { CareRecipient, Medication, MedicationLog } = require('./models.cjs');

// =============================================================================
// CARE RECIPIENTS ROUTES
// =============================================================================

// Get all care recipients for a user
router.get('/care-recipients', async (req, res) => {
    try {
        // For now, we'll use a default user ID. In production, get from authentication
        const userId = req.user?.id || 'default_user_id';
        
        const careRecipients = await CareRecipient.find({ 
            userId: userId, 
            isActive: true 
        }).populate({
            path: 'userId',
            select: 'username email'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: careRecipients,
            count: careRecipients.length
        });
    } catch (error) {
        console.error('Error fetching care recipients:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch care recipients',
            message: error.message
        });
    }
});

// Create a new care recipient
router.post('/care-recipients', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { name, dateOfBirth, medicalConditions, emergencyContact, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Care recipient name is required'
            });
        }

        const careRecipient = new CareRecipient({
            userId,
            name: name.trim(),
            dateOfBirth,
            medicalConditions,
            emergencyContact,
            notes
        });

        await careRecipient.save();

        res.status(201).json({
            success: true,
            data: careRecipient,
            message: 'Care recipient created successfully'
        });
    } catch (error) {
        console.error('Error creating care recipient:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create care recipient',
            message: error.message
        });
    }
});

// Update care recipient
router.put('/care-recipients/:id', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;
        const updateData = req.body;

        const careRecipient = await CareRecipient.findOneAndUpdate(
            { _id: id, userId: userId, isActive: true },
            updateData,
            { new: true, runValidators: true }
        );

        if (!careRecipient) {
            return res.status(404).json({
                success: false,
                error: 'Care recipient not found'
            });
        }

        res.status(200).json({
            success: true,
            data: careRecipient,
            message: 'Care recipient updated successfully'
        });
    } catch (error) {
        console.error('Error updating care recipient:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update care recipient',
            message: error.message
        });
    }
});

// Delete care recipient (soft delete)
router.delete('/care-recipients/:id', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;

        const careRecipient = await CareRecipient.findOneAndUpdate(
            { _id: id, userId: userId },
            { isActive: false },
            { new: true }
        );

        if (!careRecipient) {
            return res.status(404).json({
                success: false,
                error: 'Care recipient not found'
            });
        }

        // Also soft delete associated medications
        await Medication.updateMany(
            { careRecipientId: id, userId: userId },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: 'Care recipient deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting care recipient:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete care recipient',
            message: error.message
        });
    }
});

// =============================================================================
// MEDICATIONS ROUTES
// =============================================================================

// Get all medications for a care recipient
router.get('/care-recipients/:recipientId/medications', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { recipientId } = req.params;

        const medications = await Medication.find({
            careRecipientId: recipientId,
            userId: userId,
            isActive: true
        }).populate('careRecipientId', 'name').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: medications,
            count: medications.length
        });
    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medications',
            message: error.message
        });
    }
});

// Create a new medication
router.post('/care-recipients/:recipientId/medications', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { recipientId } = req.params;
        const medicationData = req.body;

        // Verify care recipient exists and belongs to user
        const careRecipient = await CareRecipient.findOne({
            _id: recipientId,
            userId: userId,
            isActive: true
        });

        if (!careRecipient) {
            return res.status(404).json({
                success: false,
                error: 'Care recipient not found'
            });
        }

        if (!medicationData.name || !medicationData.name.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Medication name is required'
            });
        }

        const medication = new Medication({
            careRecipientId: recipientId,
            userId: userId,
            ...medicationData,
            name: medicationData.name.trim()
        });

        await medication.save();

        // Populate the care recipient data
        await medication.populate('careRecipientId', 'name');

        res.status(201).json({
            success: true,
            data: medication,
            message: 'Medication created successfully'
        });
    } catch (error) {
        console.error('Error creating medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create medication',
            message: error.message
        });
    }
});

// Get a specific medication
router.get('/medications/:id', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;

        const medication = await Medication.findOne({
            _id: id,
            userId: userId,
            isActive: true
        }).populate('careRecipientId', 'name');

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found'
            });
        }

        res.status(200).json({
            success: true,
            data: medication
        });
    } catch (error) {
        console.error('Error fetching medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medication',
            message: error.message
        });
    }
});

// Update medication
router.put('/medications/:id', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;
        const updateData = req.body;

        const medication = await Medication.findOneAndUpdate(
            { _id: id, userId: userId, isActive: true },
            updateData,
            { new: true, runValidators: true }
        ).populate('careRecipientId', 'name');

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found'
            });
        }

        res.status(200).json({
            success: true,
            data: medication,
            message: 'Medication updated successfully'
        });
    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update medication',
            message: error.message
        });
    }
});

// Delete medication (soft delete)
router.delete('/medications/:id', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;

        const medication = await Medication.findOneAndUpdate(
            { _id: id, userId: userId },
            { isActive: false },
            { new: true }
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medication deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete medication',
            message: error.message
        });
    }
});

// =============================================================================
// MEDICATION LOGGING ROUTES
// =============================================================================

// Log medication dosage (taken/not taken)
router.post('/medications/:id/log', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;
        const { dosageIndex, taken, notes, location } = req.body;

        // Find the medication
        const medication = await Medication.findOne({
            _id: id,
            userId: userId,
            isActive: true
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found'
            });
        }

        if (dosageIndex < 0 || dosageIndex >= medication.dosages.length) {
            return res.status(400).json({
                success: false,
                error: 'Invalid dosage index'
            });
        }

        // Create medication log entry
        const log = new MedicationLog({
            medicationId: id,
            careRecipientId: medication.careRecipientId,
            userId: userId,
            dosageIndex,
            taken: taken || false,
            notes,
            location
        });

        await log.save();

        // Update the medication dosage status
        medication.dosages[dosageIndex].taken = taken || false;
        medication.dosages[dosageIndex].takenAt = new Date();
        await medication.save();

        res.status(201).json({
            success: true,
            data: log,
            message: 'Medication log created successfully'
        });
    } catch (error) {
        console.error('Error logging medication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log medication',
            message: error.message
        });
    }
});

// Get medication logs for a specific medication
router.get('/medications/:id/logs', async (req, res) => {
    try {
        const userId = req.user?.id || 'default_user_id';
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const logs = await MedicationLog.find({
            medicationId: id,
            userId: userId
        })
        .populate('medicationId', 'name dosage')
        .populate('careRecipientId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

        res.status(200).json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching medication logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medication logs',
            message: error.message
        });
    }
});

// =============================================================================
// IMAGE UPLOAD ROUTES (Enhanced)
// =============================================================================

// Upload medication image to Cloudinary
router.post('/upload-image', upload.single('medicationImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No image file provided',
                message: 'Please provide a medication image to upload'
            });
        }

        // The file is already uploaded to Cloudinary by multer-storage-cloudinary
        const uploadResult = {
            url: req.file.path,
            public_id: req.file.filename,
            type: 'image',
            width: req.file.width,
            height: req.file.height,
            format: req.file.format,
            bytes: req.file.bytes
        };

        console.log('Medication image uploaded to Cloudinary:', uploadResult);

        res.status(200).json({
            success: true,
            message: 'Medication image uploaded successfully',
            data: uploadResult
        });

    } catch (error) {
        console.error('Error uploading medication image:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" });
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded file:', cleanupError);
            }
        }
        
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to upload medication image'
        });
    }
});

// Delete medication image from Cloudinary
router.delete('/delete-image', async (req, res) => {
    try {
        const { public_id } = req.body;

        if (!public_id) {
            return res.status(400).json({
                error: 'Missing public_id',
                message: 'Please provide the public_id of the image to delete'
            });
        }

        // Delete from Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(public_id, { 
            resource_type: "image" 
        });

        console.log('Medication image deleted from Cloudinary:', deleteResult);

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

        // Upload image to Cloudinary first
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'scanned_medications',
            resource_type: 'image'
        });

        // TODO: Integrate with Scanner service for OCR processing
        // For now, return the uploaded image data
        const scanData = {
            imageUrl: result.secure_url,
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
