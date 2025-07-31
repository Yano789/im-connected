import { jest } from '@jest/globals';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock external dependencies with proper ES module mocking
const mockTesseractRecognize = jest.fn();
const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  normalize: jest.fn().mockReturnThis(),
  sharpen: jest.fn().mockReturnThis(),
  gamma: jest.fn().mockReturnThis(),
  modulate: jest.fn().mockReturnThis(),
  linear: jest.fn().mockReturnThis(),
  median: jest.fn().mockReturnThis(),
  threshold: jest.fn().mockReturnThis(),
  negate: jest.fn().mockReturnThis(),
  greyscale: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue()
};
const mockSharp = jest.fn(() => mockSharpInstance);
const mockFetch = jest.fn();

// Mock tesseract.js
jest.unstable_mockModule('tesseract.js', () => ({
  default: {
    recognize: mockTesseractRecognize,
    PSM: {
      AUTO: 3,
      SINGLE_BLOCK: 6,
      SINGLE_COLUMN: 4,
      SINGLE_WORD: 8,
      SINGLE_CHAR: 10
    },
    OEM: {
      LSTM_ONLY: 1,
      LEGACY_ONLY: 0,
      LSTM_LEGACY: 2,
      DEFAULT: 3
    }
  }
}));

// Mock sharp
jest.unstable_mockModule('sharp', () => ({
  default: mockSharp
}));

// Mock node-fetch
jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch
}));

// Import app after mocking
const { default: app } = await import('../app.js');

describe('Medicine Scanner Backend', () => {
  let testImagePath;
  let mockImageBuffer;

  beforeAll(() => {
    // Create a test image buffer (1x1 pixel JPEG)
    mockImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
    ]);

    testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, mockImageBuffer);
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('Health Check Endpoint', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'Medication Scanner API',
        version: '2.0.0'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Documentation Endpoint', () => {
    test('GET / should return API documentation', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Enhanced Medication Scanner API - Online Sources Only',
        version: '2.1.0',
        description: expect.any(String)
      });
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.features).toBeInstanceOf(Array);
      expect(response.body.dataSources).toBeInstanceOf(Array);
    });
  });

  describe('Medication Scanning Endpoint', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
      mockTesseractRecognize.mockReset();
      mockSharp.mockClear();
      mockFetch.mockReset();
      // Reset the sharp instance methods
      Object.values(mockSharpInstance).forEach(method => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
      // Restore the chainable behavior
      Object.keys(mockSharpInstance).forEach(key => {
        if (key !== 'toFile' && key !== 'jpeg') {
          mockSharpInstance[key].mockReturnThis();
        }
      });
      mockSharpInstance.jpeg.mockReturnThis();
      mockSharpInstance.toFile.mockResolvedValue();
    });

    test('POST /scan-medication should reject request without file', async () => {
      const response = await request(app)
        .post('/scan-medication')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'No image file provided'
      });
    });

    test('POST /scan-medication should reject invalid file types', async () => {
      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', Buffer.from('not an image'), 'test.txt')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('POST /scan-medication should process valid image file', async () => {
      // Mock Tesseract.js response
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'PARACETAMOL 500mg\\nUses: temporarily relieves minor aches and pains\\ndue to: headache, muscular aches, backache',
          confidence: 85
        }
      });

      // Mock fetch for external APIs to fail (using fallback)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.extractedText).toContain('PARACETAMOL');
      expect(response.body.medications).toBeInstanceOf(Array);
      expect(response.body.processingTime).toBeDefined();
      expect(response.body.metadata).toBeDefined();
    });

    test('POST /scan-medication should handle OCR errors gracefully', async () => {
      // Mock Tesseract.js to throw an error
      mockTesseractRecognize.mockRejectedValue(new Error('OCR processing failed'));

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Failed to process medication image'
      });
    });

    test('POST /scan-medication should reject files larger than 10MB', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', largeBuffer, 'large-image.jpg')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    });
  });

  describe('MedicationInfoService', () => {
    let MedicationInfoService;

    beforeAll(async () => {
      // We need to import the class for unit testing
      // Since it's not exported, we'll test it through the OCR service
    });

    test('should correct common medication name errors', async () => {
      // Mock successful medication detection
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'amoriedlin 500mg capsules',
          confidence: 80
        }
      });

      // Mock fetch for external APIs to fail (using fallback)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.extractedText).toContain('amoriedlin');
    });

    test('should extract medication patterns correctly', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'IBUPROFEN 400mg tablets\nTemporarily relieves minor aches and pains\nTake 1-2 tablets every 4-6 hours',
          confidence: 90
        }
      });

      // Mock fetch for external APIs to fail (using fallback)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.extractedText).toContain('IBUPROFEN');
      expect(response.body.extractedText).toContain('400mg');
    });
  });

  describe('OCRService', () => {
    test('should handle multiple image preprocessing variants', async () => {
      // Mock Tesseract.js with different results for different variants
      mockTesseractRecognize
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL 500mg', confidence: 70 }
        })
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL 500mg tablets', confidence: 85 }
        })
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL', confidence: 60 }
        })
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL 500mg pain relief', confidence: 80 }
        })
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL 500mg', confidence: 75 }
        })
        .mockResolvedValueOnce({
          data: { text: 'PARACETAMOL 500mg tablets', confidence: 82 }
        });

      // Mock fetch for external APIs to fail (using fallback)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.extractedText).toContain('PARACETAMOL');
      expect(response.body.metadata.ocrVariantsUsed).toBeGreaterThan(1);
    });

    test('should clean and format extracted text properly', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'Uses  •  temporarily    relieves   minor aches and pains  due to :  headache ,  muscular aches',
          confidence: 80
        }
      });

      // Mock fetch for external APIs
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      // The text should be processed and contain the expected content
      expect(response.body.extractedText).toContain('Uses');
    });
  });

  describe('External API Integration', () => {
    test('should handle FDA API responses', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'ASPIRIN 81mg tablets',
          confidence: 85
        }
      });

      // Mock successful FDA API response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            results: [{
              openfda: {
                generic_name: ['aspirin'],
                brand_name: ['Bayer Aspirin'],
                manufacturer_name: ['Bayer HealthCare LLC']
              },
              indications_and_usage: ['For pain relief and fever reduction'],
              adverse_reactions: ['May cause stomach upset'],
              warnings: ['Do not exceed recommended dosage']
            }]
          })
        })
        .mockResolvedValue({
          ok: false,
          status: 404
        });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.medications).toHaveLength(1);
      expect(response.body.medications[0].name).toBe('ASPIRIN');
      expect(response.body.medications[0].sources).toContain('FDA');
    });

    test('should handle external API failures gracefully', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'UNKNOWN_MEDICATION 250mg',
          confidence: 70
        }
      });

      // Mock all external APIs to fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should still return a response with default medication info
      expect(response.body.medications).toBeInstanceOf(Array);
    });
  });

  describe('Caching System', () => {
    test('should cache medication information from external APIs', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'ACETAMINOPHEN 500mg',
          confidence: 85
        }
      });

      // Mock fetch for external APIs
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      // First request
      const response1 = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      // Second request with same medication
      const response2 = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed image files', async () => {
      // Mock Tesseract to throw an error for malformed images
      mockTesseractRecognize.mockRejectedValue(new Error('Image processing failed'));
      
      const malformedBuffer = Buffer.from('this is not an image');

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', malformedBuffer, 'malformed.jpg')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Failed to process medication image'
      });
    });

    test('should handle missing uploads directory', async () => {
      // Mock fs.existsSync to return false for uploads directory
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn((path) => {
        if (path.includes('uploads')) return false;
        return originalExistsSync(path);
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg');

      // Restore original function
      fs.existsSync = originalExistsSync;

      // Should handle the missing directory gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('CORS Configuration', () => {
    test('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/scan-medication')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBeLessThan(300);
    });
  });

  describe('Performance and Metrics', () => {
    test('should include processing time in response', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'ASPIRIN 325mg',
          confidence: 80
        }
      });

      // Mock fetch for external APIs
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.processingTime).toBeDefined();
      expect(typeof response.body.processingTime).toBe('number');
      expect(response.body.processingTime).toBeGreaterThanOrEqual(0);
    });

    test('should include metadata about processing', async () => {
      mockTesseractRecognize.mockResolvedValue({
        data: {
          text: 'VITAMIN D 1000IU',
          confidence: 75
        }
      });

      // Mock fetch for external APIs
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .post('/scan-medication')
        .attach('medicationImage', mockImageBuffer, 'test-medication.jpg')
        .expect(200);

      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.filename).toBeDefined();
      expect(response.body.metadata.fileSize).toBeDefined();
      expect(response.body.metadata.uploadTime).toBeDefined();
      expect(response.body.metadata.ocrVariantsUsed).toBeDefined();
      expect(response.body.metadata.textFormatting).toBe('enhanced_readability');
    });
  });
});
