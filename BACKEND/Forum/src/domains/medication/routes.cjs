const express = require('express');
const router = express.Router();
const upload = require('../../config/storage.cjs');
const { v2: cloudinary } = require("cloudinary");
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

// Upload medication image to Cloudinary
router.post('/upload-image', auth, upload.single('medicationImage'), async (req, res) => {
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
router.delete('/delete-image', auth, async (req, res) => {
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

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Medication service is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
