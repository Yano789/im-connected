import { jest } from '@jest/globals';

// Set test timeout to 30 seconds for OCR operations
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  process.env.SCANNER_PORT = '3002'; // Use different port for tests
  
  // Suppress console logs during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  }
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock external dependencies by default
const mockRecognize = jest.fn();

jest.mock('tesseract.js', () => ({
  default: {
    recognize: mockRecognize
  },
  recognize: mockRecognize,
  PSM: {
    AUTO: 3,
    SINGLE_BLOCK: 6
  },
  OEM: {
    LSTM_ONLY: 1
  }
}));

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

jest.mock('sharp', () => ({
  default: mockSharp,
  __esModule: true
}));

jest.mock('node-fetch', () => ({
  default: jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({})
  })
}));

// Make mocks available globally for tests
global.mockRecognize = mockRecognize;
global.mockSharp = mockSharp;
global.mockSharpInstance = mockSharpInstance;
