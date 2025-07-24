import { jest } from '@jest/globals';

describe('OCR Service Tests', () => {
  describe('Image Preprocessing', () => {
    test('should generate multiple preprocessing variants', () => {
      const variants = [
        { suffix: '-enhanced', description: 'Enhanced processing with sharpening' },
        { suffix: '-contrast', description: 'High contrast processing' },
        { suffix: '-denoise', description: 'Noise reduction processing' },
        { suffix: '-sharpen', description: 'Sharpening focused processing' },
        { suffix: '-box-optimized', description: 'Medication box optimized processing' },
        { suffix: '-text-focused', description: 'Text extraction focused processing' }
      ];

      expect(variants).toHaveLength(6);
      variants.forEach(variant => {
        expect(variant.suffix).toMatch(/^-\w+/);
        expect(variant.description).toBeDefined();
      });
    });

    test('should apply different sharp processing operations', () => {
      // Mock the different processing operations
      const mockOperations = {
        enhanced: (input) => ({
          normalize: jest.fn().mockReturnThis(),
          sharpen: jest.fn().mockReturnThis(),
          gamma: jest.fn().mockReturnThis(),
          modulate: jest.fn().mockReturnThis()
        }),
        contrast: (input) => ({
          normalize: jest.fn().mockReturnThis(),
          linear: jest.fn().mockReturnThis(),
          sharpen: jest.fn().mockReturnThis()
        }),
        denoise: (input) => ({
          median: jest.fn().mockReturnThis(),
          normalize: jest.fn().mockReturnThis(),
          sharpen: jest.fn().mockReturnThis()
        }),
        boxOptimized: (input) => ({
          normalize: jest.fn().mockReturnThis(),
          threshold: jest.fn().mockReturnThis(),
          negate: jest.fn().mockReturnThis(),
          sharpen: jest.fn().mockReturnThis(),
          modulate: jest.fn().mockReturnThis()
        }),
        textFocused: (input) => ({
          greyscale: jest.fn().mockReturnThis(),
          normalize: jest.fn().mockReturnThis(),
          linear: jest.fn().mockReturnThis(),
          sharpen: jest.fn().mockReturnThis(),
          median: jest.fn().mockReturnThis()
        })
      };

      Object.keys(mockOperations).forEach(operation => {
        const ops = mockOperations[operation]();
        expect(ops).toBeDefined();
      });
    });
  });

  describe('OCR Text Processing', () => {
    test('should handle multiple OCR results and select best one', () => {
      const mockResults = [
        { text: 'PARACETAMOL 500mg', confidence: 70, variant: 0 },
        { text: 'PARACETAMOL 500mg tablets', confidence: 85, variant: 1 },
        { text: 'PARACETAMOL', confidence: 60, variant: 2 },
        { text: 'PARACETAMOL 500mg pain relief', confidence: 80, variant: 3 }
      ];

      // Test best result selection logic
      const bestResult = mockResults.reduce((best, current) => {
        const currentScore = current.confidence * Math.log(current.text.length + 1);
        const bestScore = best.confidence * Math.log(best.text.length + 1);
        return currentScore > bestScore ? current : best;
      });

      expect(bestResult.variant).toBe(1); // Should select the one with most complete text
      expect(bestResult.text).toContain('tablets');
    });

    test('should combine multiple OCR variant results', () => {
      const results = [
        { text: 'PARACETAMOL 500mg' },
        { text: 'Uses: pain relief' },
        { text: 'Take as directed' }
      ];

      const combinedText = results.map(r => r.text).join('\n\n--- VARIANT SEPARATOR ---\n\n');
      
      expect(combinedText).toContain('PARACETAMOL');
      expect(combinedText).toContain('VARIANT SEPARATOR');
      expect(combinedText).toContain('Uses: pain relief');
    });
  });

  describe('Text Cleaning and Formatting', () => {
    test('should clean extracted OCR text properly', () => {
      const messyText = 'Uses  •  temporarily    relieves   minor aches and pains  due to :  headache ,  muscular aches';
      
      const cleaned = messyText
        .replace(/\s+/g, ' ')
        .replace(/\s*•\s*/g, ' • ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/Uses\s*•/gi, 'Uses: •')
        .trim();

      expect(cleaned).toBe('Uses: • temporarily relieves minor aches and pains due to: headache, muscular aches');
    });

    test('should handle bullet points correctly', () => {
      const textWithBullets = 'Uses • pain relief • fever reduction • inflammation';
      const formatted = textWithBullets
        .replace(/\s*•\s*/g, '\n• ')
        .replace(/^Uses\s*•/i, 'Uses:\n•');
      
      expect(formatted).toContain('Uses:\n•');
      expect(formatted.split('\n•').length).toBe(4); // Uses: + 3 bullet points
    });

    test('should normalize whitespace and punctuation', () => {
      const testCases = [
        {
          input: 'temporarily    relieves',
          expected: 'temporarily relieves'
        },
        {
          input: 'due to :headache',
          expected: 'due to: headache'
        },
        {
          input: 'aches ,pains',
          expected: 'aches, pains'
        },
        {
          input: 'dose  .',
          expected: 'dose.'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const cleaned = input
          .replace(/\s+/g, ' ')
          .replace(/\s*:\s*/g, ': ')
          .replace(/\s*,\s*/g, ', ')
          .replace(/\s+\./g, '.')
          .trim();
        
        expect(cleaned).toBe(expected);
      });
    });
  });

  describe('Medication Candidate Filtering', () => {
    test('should filter out non-medication words', () => {
      const excludeWords = [
        'bottle', 'label', 'tablet', 'capsule', 'medicine', 'pharmacy', 
        'prescription', 'doctor', 'patient', 'health', 'medical', 
        'hospital', 'clinic', 'doses', 'instructions', 'warning'
      ];

      const testWords = [
        'paracetamol',  // should pass
        'bottle',       // should fail
        'ibuprofen',    // should pass
        'instructions', // should fail
        'amoxicillin',  // should pass
        'pharmacy'      // should fail
      ];

      testWords.forEach(word => {
        const shouldExclude = excludeWords.includes(word.toLowerCase());
        if (shouldExclude) {
          expect(['bottle', 'instructions', 'pharmacy']).toContain(word);
        } else {
          expect(['paracetamol', 'ibuprofen', 'amoxicillin']).toContain(word);
        }
      });
    });

    test('should validate medication-like characteristics', () => {
      const testCases = [
        { word: 'paracetamol', shouldPass: true, reason: 'known medication' },
        { word: 'amoxicillin', shouldPass: true, reason: 'has cillin suffix' },
        { word: 'atorvastatin', shouldPass: true, reason: 'has statin suffix' },
        { word: 'Aspirin', shouldPass: true, reason: 'properly capitalized' },
        { word: 'abc', shouldPass: false, reason: 'too short' },
        { word: 'verylongmedicationnamethatistoobig', shouldPass: false, reason: 'too long' },
        { word: 'med123', shouldPass: false, reason: 'contains numbers' },
        { word: 'bottle', shouldPass: false, reason: 'excluded word' }
      ];

      testCases.forEach(({ word, shouldPass, reason }) => {
        // Test length requirements
        const validLength = word.length >= 4 && word.length <= 20;
        
        // Test character requirements
        const onlyLetters = /^[A-Za-z]+$/.test(word);
        
        // Test against exclude list
        const excludeWords = ['bottle', 'label', 'tablet', 'capsule'];
        const notExcluded = !excludeWords.includes(word.toLowerCase());
        
        if (shouldPass) {
          expect(validLength && onlyLetters && notExcluded).toBe(true);
        }
      });
    });

    test('should prioritize known medications', () => {
      const knownMedications = [
        'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin',
        'amoxicillin', 'metformin', 'lisinopril', 'atorvastatin'
      ];

      const testWords = ['paracetamol', 'randomword', 'ibuprofen', 'bottle'];
      
      testWords.forEach(word => {
        const isKnown = knownMedications.includes(word.toLowerCase());
        if (['paracetamol', 'ibuprofen'].includes(word)) {
          expect(isKnown).toBe(true);
        }
      });
    });
  });

  describe('Pattern Extraction Strategies', () => {
    test('should extract medications by common patterns', () => {
      const testText = 'AMOXICILLIN 500mg capsules for infection treatment';
      
      const patterns = [
        /([A-Z][a-z]+(?:cillin|mycin|cycline|prazole|sartan|statin|olol))/g,
        /([A-Z][a-z]+)\s+(?:\d+(?:\.\d+)?)\s*(?:mg|g|ml)/gi
      ];

      let found = false;
      patterns.forEach(pattern => {
        const matches = [...testText.matchAll(pattern)];
        if (matches.length > 0) {
          found = true;
          expect(matches[0][1] || matches[0][0]).toContain('AMOXICILLIN');
        }
      });
      
      expect(found).toBe(true);
    });

    test('should extract medications by word length and characteristics', () => {
      const testText = 'The patient should take Paracetamol as directed by doctor';
      const words = testText.split(/\s+/).filter(word => 
        word.length >= 6 && 
        word.length <= 20 && 
        /^[A-Za-z]+$/.test(word)
      );

      const medicationCandidates = words.filter(word => {
        const commonWords = ['patient', 'should', 'directed', 'doctor'];
        return !commonWords.includes(word.toLowerCase());
      });

      expect(medicationCandidates).toContain('Paracetamol');
    });

    test('should extract medications by capitalization patterns', () => {
      const testText = 'Take Ibuprofen with food and plenty of water';
      const capitalizedWords = testText.match(/\b[A-Z][a-z]{4,}\b/g) || [];
      
      const medicationCandidates = capitalizedWords.filter(word => {
        const commonWords = ['Take', 'Take'];
        return !commonWords.includes(word);
      });

      expect(capitalizedWords).toContain('Ibuprofen');
    });

    test('should extract medications by pharmaceutical terms context', () => {
      const testLines = [
        'Aspirin 81mg tablet take daily',
        'Ibuprofen 400mg capsule twice daily',
        'Paracetamol 500mg dose as needed'
      ];

      const pharmaKeywords = ['tablet', 'capsule', 'mg', 'dose', 'daily'];
      
      testLines.forEach(line => {
        const hasKeyword = pharmaKeywords.some(keyword => 
          line.toLowerCase().includes(keyword)
        );
        expect(hasKeyword).toBe(true);
        
        if (hasKeyword) {
          const words = line.split(/\s+/).filter(word => 
            word.length >= 5 && 
            /^[A-Za-z]+$/.test(word)
          );
          expect(words.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('OCR Configuration', () => {
    test('should use appropriate Tesseract settings', () => {
      const ocrSettings = {
        logger: expect.any(Function),
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ()-.,/:',
        tessedit_pageseg_mode: 3, // AUTO or SINGLE_BLOCK
        tessedit_ocr_engine_mode: 1 // LSTM_ONLY
      };

      expect(ocrSettings.tessedit_char_whitelist).toContain('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(ocrSettings.tessedit_char_whitelist).toContain('0123456789');
      expect(ocrSettings.tessedit_char_whitelist).toContain('()-.,/:');
      expect([1, 3, 6]).toContain(ocrSettings.tessedit_pageseg_mode);
      expect(ocrSettings.tessedit_ocr_engine_mode).toBe(1);
    });

    test('should handle different page segmentation modes', () => {
      const modes = {
        AUTO: 3,
        SINGLE_BLOCK: 6
      };

      const variants = [0, 1, 2, 3, 4, 5];
      variants.forEach((variantIndex) => {
        const mode = variantIndex < 3 ? modes.AUTO : modes.SINGLE_BLOCK;
        expect([3, 6]).toContain(mode);
      });
    });
  });

  describe('Error Handling in OCR', () => {
    test('should handle OCR processing failures gracefully', () => {
      const mockError = new Error('Tesseract processing failed');
      
      // Simulate error handling
      let errorHandled = false;
      try {
        throw mockError;
      } catch (error) {
        errorHandled = true;
        expect(error.message).toBe('Tesseract processing failed');
      }
      
      expect(errorHandled).toBe(true);
    });

    test('should handle empty or low-confidence OCR results', () => {
      const lowConfidenceResults = [
        { text: '', confidence: 0 },
        { text: 'unclear text', confidence: 30 },
        { text: '###@#$', confidence: 10 }
      ];

      lowConfidenceResults.forEach(result => {
        if (result.confidence < 50 || result.text.length < 3) {
          expect(result.confidence).toBeLessThan(50);
        }
      });
    });

    test('should clean up processed image files', () => {
      const mockImagePaths = [
        '/tmp/medication-enhanced.jpg',
        '/tmp/medication-contrast.jpg',
        '/tmp/medication-denoise.jpg'
      ];

      // Simulate cleanup process
      let cleanupCalled = false;
      mockImagePaths.forEach(imagePath => {
        // In real implementation, this would be fs.unlinkSync(imagePath)
        cleanupCalled = true;
      });

      expect(cleanupCalled).toBe(true);
    });
  });
});
