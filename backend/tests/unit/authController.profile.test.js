const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authController = require('../../authController');
const User = require('../../User');

// Mocking modules before they're used
jest.mock('../../User');
jest.mock('jsonwebtoken');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify: jest.fn().mockImplementation(callback => callback(null, true))
  })
}));

describe('Auth Controller - User Profile Management Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      body: {},
      header: jest.fn().mockReturnValue('Bearer mock-token'),
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
  });

  describe('fetchDetails', () => {
    beforeEach(() => {
      const mockUser = {
        _id: 'mock-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        verified: true
      };
      
      User.findById.mockResolvedValue(mockUser);
      jwt.verify.mockReturnValue({ id: 'mock-user-id' });
    });

    it('should fetch user details successfully', async () => {
      await authController.fetchDetails(req, res);
      
      expect(jwt.verify).toHaveBeenCalledWith('mock-token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('mock-user-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        verified: true
      }));
    });

    it('should return 401 if no token is provided', async () => {
      req.header.mockReturnValueOnce(null);
      
      await authController.fetchDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Access denied. No token provided.'
      }));
    });

    it('should return 401 if token is invalid', async () => {
      jwt.verify.mockReturnValueOnce(null);
      
      await authController.fetchDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid token.'
      }));
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValueOnce(null);
      
      await authController.fetchDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found.'
      }));
    });
  });

  describe('updateDetails', () => {
    beforeEach(() => {
      req.body = {
        firstName: 'Updated',
        lastName: 'User',
        phone: '9876543210'
      };
      
      const mockUser = {
        _id: 'mock-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        verified: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findById.mockResolvedValue(mockUser);
      jwt.verify.mockReturnValue({ id: 'mock-user-id' });
    });

    it('should update user details successfully', async () => {
      await authController.updateDetails(req, res);
      
      expect(jwt.verify).toHaveBeenCalledWith('mock-token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('mock-user-id');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValueOnce(null);
      
      await authController.updateDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
  });

  describe('checkEmail', () => {
    beforeEach(() => {
      req.body = {
        email: 'test@example.com'
      };
    });

    it('should return true if email exists', async () => {
      User.findOne.mockResolvedValueOnce({ email: req.body.email });
      
      await authController.checkEmail(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: true });
    });

    it('should return false if email does not exist', async () => {
      User.findOne.mockResolvedValueOnce(null);
      
      await authController.checkEmail(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: false });
    });
  });
}); 