const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Mock the sendEmailAsync function
// We need to mock it outside of the module to override it before it's used
jest.mock('../../authController', () => {
  // Save the original module
  const originalModule = jest.requireActual('../../authController');
  
  // Override the sendEmailAsync function
  return {
    ...originalModule,
    sendEmailAsync: jest.fn().mockResolvedValue(true)
  };
});

// Import authController after mocking
const authController = require('../../authController');
const User = require('../../User');

// Mocking modules before they're used
jest.mock('../../User');
jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('jsonwebtoken');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify: jest.fn().mockImplementation(callback => callback(null, true))
  })
}));

// Mock nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-id' });
nodemailer.createTransport.mockReturnValue({
  sendMail: mockSendMail
});

describe('Auth Controller - Password Management Tests', () => {
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

  describe('forgotPassword', () => {
    beforeEach(() => {
      req.body = {
        email: 'user@example.com'
      };

      // Mock User.findOne
      const mockUser = {
        email: req.body.email,
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock crypto
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('mock-reset-token')
      });
    });

    it('should send password reset email', async () => {
      await authController.forgotPassword(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Password reset link sent')
      }));
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValueOnce(null);
      
      await authController.forgotPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found.'
      }));
    });
  });

  describe('verifyResetToken', () => {
    beforeEach(() => {
      req.body = {
        token: 'valid-reset-token'
      };

      const mockUser = {
        resetPasswordToken: 'valid-reset-token',
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour in the future
      };
      
      User.findOne.mockResolvedValue(mockUser);
    });

    it('should validate a valid reset token', async () => {
      await authController.verifyResetToken(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: expect.any(Number) }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Token is valid.'
      }));
    });

    it('should return 400 if token is invalid or expired', async () => {
      User.findOne.mockResolvedValueOnce(null);
      
      await authController.verifyResetToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or expired token.'
      }));
    });

    it('should return 400 if token is missing', async () => {
      req.body = {}; // No token
      
      await authController.verifyResetToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Token is required.'
      }));
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      req.body = {
        token: 'valid-reset-token',
        newPassword: 'NewPassword123'
      };

      const mockUser = {
        email: 'user@example.com',
        resetPasswordToken: 'valid-reset-token',
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour in the future
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('hashed-new-password');
    });

    it('should reset password with valid token and password', async () => {
      await authController.resetPassword(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: expect.any(Number) }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.newPassword, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Password has been reset successfully.'
      }));
    });

    it('should return 400 if token is invalid or expired', async () => {
      User.findOne.mockResolvedValueOnce(null);
      
      await authController.resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or expired token.'
      }));
    });

    it('should return 400 if password format is invalid', async () => {
      req.body.newPassword = 'weak';
      
      await authController.resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Password must be at least 8 characters')
      }));
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      req.body = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123'
      };
      
      req.header = jest.fn().mockReturnValue('Bearer mock-token');
      
      const mockUser = {
        _id: 'mock-user-id',
        email: 'user@example.com',
        password: 'hashed-current-password',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed-new-password');
      jwt.verify = jest.fn().mockReturnValue({ id: 'mock-user-id' });
    });

    it('should change password with valid credentials', async () => {
      await authController.changePassword(req, res);
      
      expect(jwt.verify).toHaveBeenCalledWith('mock-token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('mock-user-id');
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.currentPassword, 'hashed-current-password');
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.newPassword, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Password has been successfully changed.'
      }));
    });

    it('should return 401 if no token is provided', async () => {
      req.header.mockReturnValueOnce(null);
      
      await authController.changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Access denied. No token provided.'
      }));
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValueOnce(null);
      
      await authController.changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found.'
      }));
    });

    it('should return 400 if current password is incorrect', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      
      await authController.changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Current password is incorrect.'
      }));
    });

    it('should return 400 if new password format is invalid', async () => {
      req.body.newPassword = 'weak';
      
      await authController.changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Password must be at least 8 characters')
      }));
    });
  });
}); 