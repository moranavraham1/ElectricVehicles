const User = require('../../User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// First mock the other dependencies
jest.mock('../../User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../models/Booking');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify: jest.fn().mockImplementation(callback => callback(null, true))
  })
}));

// Mock sendEmailAsync by directly mocking authController before requiring it
jest.mock('../../authController', () => {
  const sendEmailAsyncMock = jest.fn().mockResolvedValue(true);
  const originalModule = jest.requireActual('../../authController');
  
  return {
    ...originalModule,
    sendEmailAsync: sendEmailAsyncMock
  };
});

// Import authController after mocking it
const authController = require('../../authController');

describe('Auth Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      body: {},
      header: jest.fn(),
      user: { id: 'mock-user-id' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.EMAIL = 'test@example.com';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  describe('register', () => {
    beforeEach(() => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'Password123'
      };

      // Mock User.findOne to simulate no existing user
      User.findOne.mockResolvedValue(null);
      
      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed-password');
      
      // Mock User constructor and save method
      const mockUser = {
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => mockUser);
    });

    it('should register a new user successfully', async () => {
      await authController.register(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
      expect(User).toHaveBeenCalledWith(expect.objectContaining({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: 'hashed-password',
        verified: false
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('User registered successfully'),
        email: req.body.email
      }));
    });

    it('should return 400 if user already exists', async () => {
      // Mock User.findOne to simulate existing user
      User.findOne.mockResolvedValueOnce({ email: req.body.email });
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Email already in use')
      }));
    });

    it('should return 400 if phone number format is invalid', async () => {
      req.body.phone = '123'; // Invalid phone format
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid phone number format')
      }));
    });

    it('should return 400 if password format is invalid', async () => {
      req.body.password = 'weak'; // Invalid password format
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Password must be at least 8 characters')
      }));
    });
  });

  describe('login', () => {
    beforeEach(() => {
      req.body = {
        email: 'john.doe@example.com',
        password: 'Password123'
      };

      // Mock found user
      const mockUser = {
        _id: 'mock-user-id',
        email: req.body.email,
        password: 'hashed-password',
        verified: true
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');
    });

    it('should login successfully with valid credentials', async () => {
      await authController.login(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-user-id' }),
        process.env.JWT_SECRET,
        expect.objectContaining({ expiresIn: '1h' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful',
        token: 'mock-token'
      }));
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValueOnce(null);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });

    it('should return 400 if password is incorrect', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid password.'
      }));
    });

    it('should return 403 if user is not verified', async () => {
      const unverifiedUser = {
        _id: 'mock-user-id',
        email: req.body.email,
        password: 'hashed-password',
        verified: false
      };
      
      User.findOne.mockResolvedValueOnce(unverifiedUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not verified')
      }));
    });
  });

}); 