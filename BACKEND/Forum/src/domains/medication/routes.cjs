const express = require('express');
const router = express.Router();
const upload = require('../../config/storage.cjs');
const { v2: cloudinary } = require("cloudinary");

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

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Medication service is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
