import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import MedicationInfoService from './MedicationInfoService.js';

/**
 * Enhanced OCR Service with multiple preprocessing strategies
 */
class OCRService {
  constructor() {
    this.medicationService = new MedicationInfoService();
  }

  async preprocessImage(imagePath) {
    try {
      const pathInfo = path.parse(imagePath);
      const processedPaths = [];

      // Create multiple preprocessed versions optimized for medication boxes
      const variants = [
        { suffix: '-enhanced', ops: this.getEnhancedProcessing() },
        { suffix: '-contrast', ops: this.getContrastProcessing() },
        { suffix: '-denoise', ops: this.getDenoiseProcessing() },
        { suffix: '-sharpen', ops: this.getSharpenProcessing() },
        { suffix: '-box-optimized', ops: this.getBoxOptimizedProcessing() },
        { suffix: '-text-focused', ops: this.getTextFocusedProcessing() }
      ];

      for (const variant of variants) {
        const processedPath = path.join(pathInfo.dir, pathInfo.name + variant.suffix + '.jpg');
        
        let sharpInstance = sharp(imagePath).resize(null, 1200, { withoutEnlargement: true });
        
        // Apply the processing operations directly
        sharpInstance = variant.ops(sharpInstance);
        
        await sharpInstance
          .jpeg({ quality: 95 })
          .toFile(processedPath);
          
        processedPaths.push(processedPath);
      }

      return processedPaths;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  getEnhancedProcessing() {
    return (input) => input
      .normalize()
      .sharpen(2, 1, 2)
      .gamma(1.2)
      .modulate({ brightness: 1.1, saturation: 0.9 });
  }

  getContrastProcessing() {
    return (input) => input
      .normalize()
      .linear(1.2, -(128 * 1.2) + 128)
      .sharpen(1, 1, 1);
  }

  getDenoiseProcessing() {
    return (input) => input
      .median(2)
      .normalize()
      .sharpen(1, 1, 1);
  }

  getSharpenProcessing() {
    return (input) => input
      .normalize()
      .sharpen(3, 1, 3)
      .gamma(1.1);
  }

  // New processing method optimized for medication boxes
  getBoxOptimizedProcessing() {
    return (input) => input
      .normalize()
      .threshold(128) // Convert to black and white for better text extraction
      .negate() // Invert if needed for better contrast
      .negate() // Revert back but with improved contrast
      .sharpen(2, 1, 2)
      .modulate({ brightness: 1.2, saturation: 0.8 });
  }

  // Processing method focused on text extraction
  getTextFocusedProcessing() {
    return (input) => input
      .greyscale() // Convert to grayscale for better text recognition
      .normalize()
      .linear(1.5, -(128 * 1.5) + 128) // Increase contrast
      .sharpen(2, 1, 2)
      .median(1); // Slight noise reduction
  }

  async performOCR(imagePaths) {
    try {
      console.log('Starting enhanced OCR process for medication box detection...');
      
      // Run OCR on all preprocessed versions in parallel with different settings
      const ocrPromises = imagePaths.map(async (imagePath, index) => {
        const { data: { text, confidence } } = await Tesseract.recognize(imagePath, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress (variant ${index + 1}): ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ()-.,/:',
          tessedit_pageseg_mode: index < 3 ? Tesseract.PSM.AUTO : Tesseract.PSM.SINGLE_BLOCK, // Try different page segmentation modes
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
        });
        
        return { text, confidence, variant: index };
      });

      const results = await Promise.all(ocrPromises);
      
      // Combine all text results for better medication detection
      const combinedText = results.map(r => r.text).join('\n\n--- VARIANT SEPARATOR ---\n\n');
      
      // Select the best result based on confidence and text length
      const bestResult = results.reduce((best, current) => {
        const currentScore = current.confidence * Math.log(current.text.length + 1);
        const bestScore = best.confidence * Math.log(best.text.length + 1);
        return currentScore > bestScore ? current : best;
      });

      console.log(`OCR completed. Best result from variant ${bestResult.variant + 1} with confidence: ${bestResult.confidence}%`);
      console.log('Combined text for analysis:', combinedText.substring(0, 500) + '...');
      
      // Clean up processed images
      for (const imagePath of imagePaths) {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Return combined text for better medication detection
      return combinedText;
    } catch (error) {
      // Only log OCR errors in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error('OCR error:', error);
      }
      throw error;
    }
  }

  async extractMedicationInfo(text) {
    const medications = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);

    console.log('Extracted text for analysis:', text);
    
    // Clean and format the extracted text for better processing
    const cleanedText = this.cleanExtractedText(text);
    console.log('Cleaned text for analysis:', cleanedText);
    
    // Try to find medication names using multiple strategies
    const potentialMedications = this.findPotentialMedications(cleanedText);
    console.log('Potential medications found:', potentialMedications);

    for (const medName of potentialMedications) {
      try {
        console.log(`Searching for medication info: ${medName}`);
        const medicationInfo = await this.medicationService.searchMedicationInfo(medName, cleanedText);
        
        if (medicationInfo && medicationInfo.confidence > 0.2) {
          // Extract additional context from the OCR text
          const extractedDosages = this.extractDosages(cleanedText, medName);
          const extractedSchedule = this.extractSchedule(cleanedText);
          
          const medication = {
            name: medicationInfo.name,
            genericName: medicationInfo.genericName,
            brandNames: medicationInfo.brandNames,
            dosage: extractedDosages.length > 0 ? extractedDosages[0] : medicationInfo.strength || 'See prescription label',
            dosages: extractedDosages,
            usedTo: medicationInfo.usedFor,
            sideEffects: medicationInfo.sideEffects,
            warnings: medicationInfo.warnings,
            schedule: extractedSchedule || medicationInfo.schedule || 'Follow prescription instructions',
            confidence: medicationInfo.confidence,
            extractedText: cleanedText,
            sources: medicationInfo.sources || ['OCR + Online'],
            dataSource: medicationInfo.dataSource || 'ocr_with_online_verification'
          };

          medications.push(medication);
          console.log(`Added medication: ${medication.name} (confidence: ${medication.confidence})`);
        } else {
          console.log(`Low confidence or no info found for: ${medName}`);
        }
      } catch (error) {
        console.error(`Error processing medication ${medName}:`, error);
      }
    }

    // If no medications found with high confidence, try fallback methods
    if (medications.length === 0) {
      console.log('No high-confidence medications found, trying fallback detection...');
      const fallbackMedications = await this.fallbackMedicationDetection(cleanedText);
      medications.push(...fallbackMedications);
      
      // If still no medications, try AI-powered text analysis
      if (medications.length === 0) {
        console.log('Standard fallback failed, trying AI-powered medication detection...');
        const aiMedications = await this.aiPoweredMedicationDetection(cleanedText);
        medications.push(...aiMedications);
      }
    }

    return medications;
  }

  cleanExtractedText(text) {
    return text
      // Remove common OCR artifacts
      .replace(/[|\\\/\[\]{}()<>]/g, ' ')
      // Clean up spacing
      .replace(/\s+/g, ' ')
      // Remove very short lines that are likely artifacts
      .split('\n')
      .filter(line => line.trim().length > 2)
      .join('\n')
      .trim();
  }

  findPotentialMedications(text) {
    const medications = new Set();
    
    // Look for medication patterns
    const patterns = [
      // Standard medication name pattern (capitalize first letter)
      /\b([A-Z][a-z]{2,}(?:ol|in|ine|ate|ide|ium|ase|pam|zole|mycin|cillin|xacin|mine|done|tide|pine|cept|pril|sartan))\b/g,
      // Brand name patterns (often all caps or title case)
      /\b([A-Z]{2,}[a-z]*|[A-Z][a-z]+[A-Z][a-z]*)\b/g,
      // Generic name patterns
      /\b([a-z]+(?:ol|in|ine|ate|ide|ium|ase|pam|zole|mycin|cillin|xacin|mine|done|tide|pine|cept|pril|sartan))\b/gi
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned.length >= 4 && cleaned.length <= 30) {
          medications.add(cleaned);
        }
      });
    }

    // Filter out common false positives
    const filtered = Array.from(medications).filter(med => 
      !this.isCommonFalsePositive(med)
    );

    return filtered.slice(0, 5); // Limit to first 5 potential matches
  }

  isCommonFalsePositive(word) {
    const falsePositives = [
      'take', 'tablet', 'capsule', 'pills', 'dose', 'times', 'daily', 'twice',
      'morning', 'evening', 'night', 'food', 'water', 'doctor', 'prescription',
      'medication', 'medicine', 'drug', 'treatment', 'therapy', 'patient',
      'contains', 'ingredients', 'directions', 'warnings', 'storage',
      'keep', 'store', 'room', 'temperature', 'children', 'adults',
      'variant', 'separator' // OCR processing artifacts
    ];
    
    return falsePositives.includes(word.toLowerCase());
  }

  extractDosages(text, medicationName) {
    const dosagePatterns = [
      /(\d+(?:\.\d+)?)\s*(mg|g|ml|units?|mcg|µg|IU)/gi,
      /(\d+(?:\.\d+)?)\s*milligrams?/gi,
      /(\d+(?:\.\d+)?)\s*grams?/gi
    ];

    const dosages = new Set();
    
    for (const pattern of dosagePatterns) {
      const matches = text.match(pattern) || [];
      matches.forEach(match => dosages.add(match.trim()));
    }

    return Array.from(dosages);
  }

  extractSchedule(text) {
    const schedulePatterns = [
      /(?:take|every|once|twice|three times?|(\d+)\s*times?)\s*(?:daily|per day|a day|bid|tid|qid)/gi,
      /(?:morning|evening|night|bedtime|with meals?|before meals?|after meals?)/gi,
      /\d{1,2}:\d{2}(?:\s*(?:am|pm))?/gi
    ];

    const schedules = new Set();
    
    for (const pattern of schedulePatterns) {
      const matches = text.match(pattern) || [];
      matches.forEach(match => schedules.add(match.trim()));
    }

    return schedules.size > 0 ? Array.from(schedules).join(', ') : null;
  }

  async fallbackMedicationDetection(text) {
    const medications = [];
    
    // Try to find any text that might be a medication using broader patterns
    const words = text.split(/\s+/).filter(word => 
      word.length >= 4 && 
      word.length <= 25 && 
      /^[a-zA-Z]+$/.test(word) &&
      !this.isCommonFalsePositive(word)
    );

    for (const word of words.slice(0, 3)) { // Try first 3 potential words
      try {
        const medicationInfo = await this.medicationService.searchMedicationInfo(word, text);
        
        if (medicationInfo && medicationInfo.confidence > 0.1) {
          const medication = {
            name: medicationInfo.name,
            genericName: medicationInfo.genericName,
            brandNames: medicationInfo.brandNames,
            dosage: 'See prescription label',
            dosages: [],
            usedTo: medicationInfo.usedFor,
            sideEffects: medicationInfo.sideEffects,
            warnings: medicationInfo.warnings,
            schedule: 'Follow prescription instructions',
            confidence: medicationInfo.confidence * 0.8, // Lower confidence for fallback
            extractedText: text,
            sources: medicationInfo.sources || ['Fallback OCR'],
            dataSource: 'fallback_detection'
          };

          medications.push(medication);
          console.log(`Fallback detected medication: ${medication.name} (confidence: ${medication.confidence})`);
          break; // Only add one fallback medication
        }
      } catch (error) {
        console.error(`Error in fallback detection for ${word}:`, error);
      }
    }

    return medications;
  }

  /**
   * AI-powered medication detection when standard methods fail
   */
  async aiPoweredMedicationDetection(text) {
    const medications = [];
    
    try {
      console.log('Attempting AI-powered medication detection from OCR text...');
      
      // Use the medication info service's AI capability to analyze the entire text
      const aiResult = await this.medicationService.analyzeTextForMedications(text);
      
      if (aiResult && aiResult.medications && Array.isArray(aiResult.medications)) {
        for (const aiMed of aiResult.medications.slice(0, 2)) { // Limit to 2 AI suggestions
          const medication = {
            name: aiMed.name || 'Unknown medication',
            genericName: aiMed.genericName || aiMed.name || 'Unknown',
            brandNames: aiMed.brandNames || [],
            dosage: aiMed.dosage || 'See prescription label',
            dosages: [],
            usedTo: aiMed.usedFor || 'Consult healthcare provider',
            sideEffects: aiMed.sideEffects || 'Consult healthcare provider',
            warnings: aiMed.warnings || 'Follow healthcare provider instructions',
            schedule: 'Follow prescription instructions',
            confidence: (aiMed.confidence || 0.5) * 0.7, // Lower confidence for AI-only detection
            extractedText: text,
            sources: ['AI_OCR_Analysis'],
            dataSource: 'ai_ocr_detection'
          };

          medications.push(medication);
          console.log(`AI detected medication from OCR: ${medication.name} (confidence: ${medication.confidence})`);
        }
      }
    } catch (error) {
      console.error('Error in AI-powered medication detection:', error);
    }

    return medications;
  }

  // Calculate overall confidence based on OCR quality and medication detection
  calculateScanConfidence(medications, ocrText) {
    if (medications.length === 0) return 0.1;

    // Base confidence from medication detection
    const avgMedicationConfidence = medications.reduce((sum, med) => sum + med.confidence, 0) / medications.length;
    
    // OCR quality factors
    const textLength = ocrText.length;
    const hasStructuredData = /\d+\s*(mg|ml|g)/.test(ocrText);
    const hasScheduleInfo = /(daily|twice|morning|evening)/.test(ocrText.toLowerCase());
    
    let ocrQualityBonus = 0;
    if (textLength > 50) ocrQualityBonus += 0.1;
    if (hasStructuredData) ocrQualityBonus += 0.1;
    if (hasScheduleInfo) ocrQualityBonus += 0.05;
    
    return Math.min(avgMedicationConfidence + ocrQualityBonus, 0.95);
  }
}

export default OCRService;
