const nodemailer = require('nodemailer');

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

// Import after mocking
const authController = require('../../authController');
const User = require('../../User');
const Booking = require('../../models/Booking');

// Mocking modules before they're used
jest.mock('../../User');
jest.mock('../../models/Booking');
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

describe('Auth Controller - Booking Management Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      body: {},
      params: {},
      user: { id: 'mock-user-id' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock environment variables
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.EMAIL = 'test@example.com';
  });

  describe('createBooking', () => {
    beforeEach(() => {
      req.body = {
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00'
      };
      
      const mockUser = {
        _id: 'mock-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };
      
      User.findById.mockResolvedValue(mockUser);
      Booking.findOne.mockResolvedValue(null); // No existing booking
      
      const mockBooking = {
        _id: 'mock-booking-id',
        user: 'mock-user-id',
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Booking.mockImplementation(() => mockBooking);
    });

    it('should create a new booking successfully', async () => {
      await authController.createBooking(req, res);
      
      expect(Booking.findOne).toHaveBeenCalledWith({
        station: req.body.station,
        date: req.body.date,
        time: req.body.time
      });
      
      expect(Booking).toHaveBeenCalledWith(expect.objectContaining({
        user: req.user.id,
        station: req.body.station,
        date: req.body.date,
        time: req.body.time
      }));
      
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Booking confirmed and email sent.'
      }));
    });

    it('should return 400 if time slot is already booked', async () => {
      // Mock an existing booking
      Booking.findOne.mockResolvedValueOnce({
        _id: 'existing-booking-id',
        user: 'another-user-id',
        station: req.body.station,
        date: req.body.date,
        time: req.body.time
      });
      
      await authController.createBooking(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'This time slot is already booked.'
      }));
    });
  });

  describe('cancelBooking', () => {
    beforeEach(() => {
      req.params = {
        bookingId: 'mock-booking-id'
      };
      
      const mockBooking = {
        _id: 'mock-booking-id',
        user: 'mock-user-id',
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00'
      };
      
      Booking.findOne.mockResolvedValue(mockBooking);
      Booking.deleteOne.mockResolvedValue({ deletedCount: 1 });
      
      const mockUser = {
        _id: 'mock-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };
      
      User.findById.mockResolvedValue(mockUser);
    });

    it('should cancel a booking successfully', async () => {
      await authController.cancelBooking(req, res);
      
      expect(Booking.findOne).toHaveBeenCalledWith({
        _id: req.params.bookingId,
        user: req.user.id
      });
      
      expect(Booking.deleteOne).toHaveBeenCalledWith({
        _id: req.params.bookingId
      });
      
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Booking cancelled and email sent.'
      }));
    });

    it('should return 404 if booking is not found', async () => {
      Booking.findOne.mockResolvedValueOnce(null);
      
      await authController.cancelBooking(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Booking not found.'
      }));
    });
  });
}); 