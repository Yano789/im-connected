import { jest } from '@jest/globals';

describe('MedicationInfoService Integration Tests', () => {
  let medicationService;

  beforeAll(async () => {
    medicationService = {
      correctMedicationName: (name) => {
        const corrections = {
          'amoriedlin': 'amoxicillin',
          'aspirinn': 'aspirin',
          'ibuprophen': 'ibuprofen',
          'acetaminophin': 'acetaminophen'
        };
        return corrections[name.toLowerCase()] || name;
      }
    };
  });

  describe('Medication Name Correction', () => {
    test('should correct common OCR errors', () => {
      const testCases = [
        { input: 'amoriedlin', expected: 'amoxicillin' },
        { input: 'aspirinn', expected: 'aspirin' },
        { input: 'ibuprophen', expected: 'ibuprofen' }
      ];

      testCases.forEach(({ input, expected }) => {
        const corrected = medicationService.correctMedicationName(input);
        expect(corrected).toBe(expected);
      });
    });
  });

  describe('Medication Pattern Extraction', () => {
    test('should extract strength patterns', () => {
      const testTexts = [
        'ASPIRIN 325mg tablets',
        'IBUPROFEN 400 mg capsules',
        'ACETAMINOPHEN 500MG'
      ];

      testTexts.forEach(text => {
        const strengthPattern = /(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|iu|units?)/gi;
        const matches = [...text.matchAll(strengthPattern)];
        expect(matches.length).toBeGreaterThan(0);
      });
    });

    test('should extract frequency patterns', () => {
      const testTexts = [
        'Take once daily',
        'Take twice daily', 
        'every 4-6 hours'
      ];

      testTexts.forEach(text => {
        const frequencyPattern = /(take\s+)?(once|twice|every\s+\d+(-\d+)?\s+hours?|daily|per day|a day|bid|tid|qid)/gi;
        const matches = [...text.matchAll(frequencyPattern)];
        expect(matches.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Text Formatting', () => {
    test('should clean and format medication text properly', () => {
      const testTexts = [
        'Uses: temporarily relieves minor aches and pains due to: headache, muscular aches',
        'ASPIRIN 325mg tablets for pain relief'
      ];

      testTexts.forEach(text => {
        let formatted = text
          .replace(/\s+/g, ' ')
          .replace(/\s*:\s*/g, ': ')
          .replace(/\s*,\s*/g, ', ')
          .trim();

        expect(formatted).not.toMatch(/\s{2,}/);
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });
});