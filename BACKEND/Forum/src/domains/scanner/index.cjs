const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'IM-CONNECTED Scanner Service',
    version: '1.0.0'
  });
});

// OCR Scan medication endpoint
router.post("/scan-medication", upload.single('medicationImage'), async (req, res) => {
  try {
    console.log("Scanner: Received scan request");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided"
      });
    }

    // Mock OCR response for now - in production you would integrate with actual OCR service
    // This could be Tesseract.js, Google Cloud Vision API, or Azure Computer Vision
    const mockOcrResult = {
      success: true,
      data: {
        medicationName: "Sample Medication",
        dosage: "10mg",
        frequency: "Twice daily",
        instructions: "Take with food",
        confidence: 0.85,
        rawText: "Sample medication text extracted from image"
      },
      message: "Medication successfully scanned and analyzed"
    };

    console.log("Scanner: Returning mock OCR result");
    res.status(200).json(mockOcrResult);

  } catch (error) {
    console.error("Scanner Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process medication scan",
      details: error.message
    });
  }
});

module.exports = router;
