export default {
  testEnvironment: 'node',
  globals: {
    'NODE_OPTIONS': '--experimental-vm-modules'
  },
  transform: {},
  testMatch: [
    '**/__test__/**/*.test.js'
  ],
  collectCoverageFrom: [
    'app.js',
    '!node_modules/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/__test__/setup.js'
  ]
};
