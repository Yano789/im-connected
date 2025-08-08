import fs from 'fs';
import mongoose from 'mongoose';
import { CareRecipient, Medication } from '../models/index.js';
import { OCRService, GoogleCloudStorageService, MedicationInfoService } from '../services/index.js';
import constants from '../utils/constants.js';

class MedicationController {
  constructor() {
    this.ocrService = new OCRService();
    this.googleCloudStorageService = new GoogleCloudStorageService();
    this.medicationInfoService = new MedicationInfoService();
  }

  /**
   * Scan medication from uploaded image (without saving to database)
   */
  async scanMedication(req, res) {
    const startTime = Date.now();
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      console.log(`=== SCAN MEDICATION REQUEST ===`);
      console.log('File:', req.file.filename);

      // Process the image with enhanced OCR
      const processedImages = await this.ocrService.preprocessImage(req.file.path);
      const extractedText = await this.ocrService.performOCR(processedImages);
      const medications = await this.ocrService.extractMedicationInfo(extractedText);

      console.log(`OCR extraction completed. Found ${medications.length} medications.`);

      const processingTime = Date.now() - startTime;
      const scanConfidence = this.ocrService.calculateScanConfidence(medications, extractedText);

      // Clean up local file after processing
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Local file cleaned up after processing');
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up local file:', cleanupError.message);
      }

      const response = {
        success: true,
        processingTime,
        confidence: scanConfidence > 0.7 ? 'high' : scanConfidence > 0.4 ? 'medium' : 'low',
        extractedText,
        medications: medications.map(med => ({
          name: med.name,
          genericName: med.genericName,
          brandNames: med.brandNames,
          dosage: med.dosage,
          usedFor: med.usedTo,
          sideEffects: med.sideEffects,
          warnings: med.warnings,
          schedule: med.schedule,
          confidence: med.confidence,
          dosages: med.dosages || [],
          sources: med.sources || ['OCR + Online'],
          dataSource: med.dataSource || 'ocr_with_online_verification'
        })),
        metadata: {
          filename: req.file.filename,
          fileSize: req.file.size,
          uploadTime: new Date().toISOString(),
          ocrMethod: 'enhanced_multi_variant',
          ocrVariantsUsed: processedImages?.length || 3,
          textFormatting: 'enhanced_readability'
        }
      };

      console.log(`Medication scan completed in ${processingTime}ms. Found ${medications.length} medications.`);
      res.json(response);

    } catch (error) {
      console.error('Medication scanning error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process medication image',
        details: error.message
      });
    }
  }

  /**
   * Save scanned medication to database
   */
  async saveMedication(req, res) {
    const startTime = Date.now();
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file uploaded'
        });
      }

      const { careRecipientId } = req.body;
      
      if (!careRecipientId) {
        return res.status(400).json({
          success: false,
          error: 'Care recipient ID is required'
        });
      }

      console.log(`=== SAVE MEDICATION REQUEST ===`);
      console.log('File:', req.file.filename);
      console.log('Care Recipient ID:', careRecipientId);

      // Verify care recipient exists
      const careRecipient = await CareRecipient.findById(careRecipientId);
      if (!careRecipient) {
        return res.status(404).json({
          success: false,
          error: 'Care recipient not found'
        });
      }

      console.log(`Processing medication scan for: ${careRecipient.name}`);

      // Process the image with enhanced OCR
      const processedImages = await this.ocrService.preprocessImage(req.file.path);
      const extractedText = await this.ocrService.performOCR(processedImages);
      const medications = await this.ocrService.extractMedicationInfo(extractedText);

      console.log(`OCR extraction completed. Found ${medications.length} medications.`);

      // Upload original image to Google Cloud Storage
      let imageData = null;
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      try {
        imageData = await this.googleCloudStorageService.uploadImage(req.file.path, authToken);
        console.log('Image uploaded to Google Cloud Storage successfully');
      } catch (uploadError) {
        console.warn('Google Cloud Storage upload failed, proceeding without cloud storage:', uploadError.message);
      }

      // Save medications to database
      const savedMedications = [];
      
      for (const medicationData of medications) {
        try {
          const medication = new Medication({
            name: medicationData.name,
            careRecipientId,
            dosage: medicationData.dosage,
            usedTo: medicationData.usedTo,
            sideEffects: medicationData.sideEffects,
            warnings: medicationData.warnings,
            schedule: medicationData.schedule,
            image: imageData ? {
              url: imageData.url,
              publicId: imageData.publicId
            } : undefined,
            dosages: medicationData.dosages || [],
            scanData: {
              confidence: medicationData.confidence,
              extractedText: medicationData.extractedText,
              processingTime: Date.now() - startTime,
              ocrMethod: 'enhanced_multi_variant'
            },
            isActive: true
          });

          await medication.save();
          savedMedications.push(medication);
          
          console.log(`Saved medication: ${medication.name} (ID: ${medication._id})`);
        } catch (saveError) {
          console.error(`Error saving medication ${medicationData.name}:`, saveError);
        }
      }

      const processingTime = Date.now() - startTime;
      const scanConfidence = this.ocrService.calculateScanConfidence(medications, extractedText);

      // Clean up local file
      if (imageData?.url && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Local file cleaned up after Google Cloud Storage upload');
        } catch (cleanupError) {
          console.warn('Failed to clean up local file:', cleanupError.message);
        }
      }

      const response = {
        success: true,
        processingTime,
        confidence: scanConfidence,
        extractedText,
        savedMedications: savedMedications.length,
        medications: savedMedications.map(med => ({
          id: med._id,
          name: med.name,
          dosage: med.dosage,
          usedFor: med.usedTo,
          sideEffects: med.sideEffects,
          schedule: med.schedule,
          image: med.image?.url,
          confidence: med.scanData.confidence,
          warnings: med.warnings,
          careRecipientId: med.careRecipientId,
          createdAt: med.createdAt
        })),
        careRecipient: {
          id: careRecipient._id,
          name: careRecipient.name
        },
        metadata: {
          filename: req.file.filename,
          fileSize: req.file.size,
          uploadTime: new Date().toISOString(),
          savedToDatabase: true
        }
      };

      console.log(`Medication scan and save completed in ${processingTime}ms. Saved ${savedMedications.length} medications for ${careRecipient.name}.`);
      res.json(response);

    } catch (error) {
      console.error('Medication saving error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save scanned medication',
        details: error.message
      });
    }
  }

  /**
   * Get medications for a care recipient
   */
  async getMedications(req, res) {
    try {
      const { careRecipientId } = req.params;
      
      console.log(`Getting medications for care recipient: ${careRecipientId}`);
      
      const medications = await Medication.find({ 
        careRecipientId: careRecipientId,
        isActive: true 
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${medications.length} medications for care recipient ${careRecipientId}`);
      
      // Format medications for frontend
      const formattedMedications = medications.map(med => {
        console.log(`Formatting medication: ${med.name}, Image URL: ${med.image?.url || 'No image'}`);
        return {
          _id: med._id,
          name: med.name,
          dosage: med.dosage,
          usedTo: med.usedTo,
          sideEffects: med.sideEffects,
          warnings: med.warnings,
          schedule: med.schedule,
          image: med.image?.url || '',
          dosages: med.dosages || [],
          createdAt: med.createdAt,
          confidence: med.scanData?.confidence || 0
        };
      });
      
      res.json(formattedMedications);
    } catch (error) {
      console.error('Error getting medications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get medications',
        details: error.message
      });
    }
  }

  /**
   * Delete a medication
   */
  async deleteMedication(req, res) {
    try {
      const { medicationId } = req.params;
      
      console.log(`=== DELETE MEDICATION REQUEST ===`);
      console.log('Medication ID:', medicationId);
      
      // Find and delete the medication
      const deletedMedication = await Medication.findByIdAndDelete(medicationId);
      
      if (!deletedMedication) {
        return res.status(404).json({
          success: false,
          error: 'Medication not found'
        });
      }
      
      console.log(`Medication deleted: ${deletedMedication.name}`);
      
      res.json({
        success: true,
        message: 'Medication deleted successfully',
        deletedMedication: {
          id: deletedMedication._id,
          name: deletedMedication.name,
          careRecipientId: deletedMedication.careRecipientId
        }
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete medication',
        details: error.message
      });
    }
  }

  /**
   * Test AI fallback functionality
   */
  async testAIFallback(req, res) {
    try {
      const { medicationName, testType = 'standard' } = req.body;
      
      if (!medicationName) {
        return res.status(400).json({ error: 'Medication name is required' });
      }

      console.log(`Testing AI fallback for medication: ${medicationName} (type: ${testType})`);
      
      let result;
      
      if (testType === 'text_analysis') {
        // Test the OCR text analysis functionality
        result = await this.medicationInfoService.analyzeTextForMedications(medicationName);
      } else {
        // Test standard AI medication info lookup
        result = await this.medicationInfoService.getAIChatbotMedicationInfo(medicationName);
      }
      
      if (result) {
        res.json({
          success: true,
          testType,
          medication: result,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          testType,
          error: `AI could not generate information for this medication (${testType})`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error testing AI fallback:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get all care recipients with their medications
   */
  async getCareRecipientsWithMedications(req, res) {
    try {
      console.log('Getting all care recipients with medications...');
      
      const careRecipients = await CareRecipient.find({ isActive: true }).sort({ createdAt: -1 });
      
      const recipientsWithMedications = await Promise.all(
        careRecipients.map(async (recipient) => {
          const medications = await Medication.find({ 
            careRecipientId: recipient._id,
            isActive: true 
          }).sort({ createdAt: -1 });
          
          const formattedMedications = medications.map(med => ({
            _id: med._id,
            name: med.name,
            dosage: med.dosage,
            usedTo: med.usedTo,
            sideEffects: med.sideEffects,
            warnings: med.warnings,
            schedule: med.schedule,
            image: med.image?.url || '',
            dosages: med.dosages || [],
            createdAt: med.createdAt,
            confidence: med.scanData?.confidence || 0
          }));
          
          return {
            _id: recipient._id,
            name: recipient.name,
            medications: formattedMedications,
            createdAt: recipient.createdAt
          };
        })
      );
      
      console.log(`Returning ${recipientsWithMedications.length} care recipients with medications`);
      res.json(recipientsWithMedications);
    } catch (error) {
      console.error('Error getting care recipients with medications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get care recipients with medications',
        details: error.message
      });
    }
  }
}

export default MedicationController;
