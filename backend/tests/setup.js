// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.EMAIL = 'test@example.com';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock sendEmailAsync function globally
jest.mock('../authController', () => {
  const originalModule = jest.requireActual('../authController');
  return {
    ...originalModule,
    sendEmailAsync: jest.fn().mockResolvedValue(true)
  };
});

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

if (process.env.SUPPRESS_LOGS) {
  console.log = jest.fn();
  console.error = jest.fn();
}

// Restore console after tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 