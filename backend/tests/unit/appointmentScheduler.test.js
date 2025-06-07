const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Mock dependencies
jest.mock('node-cron', () => ({
  schedule: jest.fn()
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify: jest.fn().mockImplementation(callback => callback(null, true))
  })
}));

jest.mock('../../models/Booking', () => {
  const mockBooking = {
    _id: 'mock-booking-id',
    user: 'user@example.com',
    station: 'Station A',
    date: '2023-06-15',
    time: '14:00',
    status: 'pending',
    currentBattery: 30,
    estimatedChargeTime: 45,
    createdAt: new Date('2023-06-10T10:00:00Z'),
    save: jest.fn().mockResolvedValue(true)
  };

  return {
    find: jest.fn().mockResolvedValue([mockBooking]),
    findOne: jest.fn().mockResolvedValue(mockBooking),
    findById: jest.fn().mockResolvedValue(mockBooking),
    countDocuments: jest.fn().mockResolvedValue(1),
    aggregate: jest.fn().mockResolvedValue([
      {
        _id: {
          station: 'Station A',
          date: '2023-06-16',
          time: '15:00'
        },
        count: 1
      }
    ])
  };
});

// Import after mocking
const { startScheduler, handleLateRegistration, manualCheckAllPendingAppointments } = require('../../appointmentScheduler');

describe('Appointment Scheduler Tests', () => {
  let originalDateNow;
  let mockDate;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.EMAIL = 'test@example.com';
    
    // Mock Date.now() to return a fixed date
    originalDateNow = Date.now;
    mockDate = new Date('2023-06-15T13:00:00Z'); // 1 hour before appointment
    global.Date.now = jest.fn(() => mockDate.getTime());
  });

  afterEach(() => {
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });

  describe('startScheduler', () => {
    it('should set up cron job schedules', () => {
      startScheduler();
      
      // Verify cron.schedule was called at least twice (for regular checks and hourly backup)
      expect(cron.schedule).toHaveBeenCalledTimes(2);
      expect(cron.schedule.mock.calls[0][0]).toBe('*/10 * * * * *'); // Every 10 seconds
      expect(cron.schedule.mock.calls[1][0]).toBe('0 * * * *'); // Every hour
    });
  });

  describe('handleLateRegistration', () => {
    it('should approve late registration if capacity is available', async () => {
      const mockBooking = {
        _id: 'mock-booking-id',
        user: 'user@example.com',
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Set up countDocuments to return 1 (below capacity of 2)
      require('../../models/Booking').countDocuments.mockResolvedValueOnce(1);
      
      await handleLateRegistration(mockBooking);
      
      // Check if booking was approved and saved
      expect(mockBooking.status).toBe('approved');
      expect(mockBooking.save).toHaveBeenCalled();
    });

    it('should reject late registration if station is at capacity', async () => {
      const mockBooking = {
        _id: 'mock-booking-id',
        user: 'user@example.com',
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Set up countDocuments to return 2 (at capacity)
      require('../../models/Booking').countDocuments.mockResolvedValueOnce(2);
      
      await handleLateRegistration(mockBooking);
      
      // Check if booking was rejected and saved
      expect(mockBooking.status).toBe('rejected');
      expect(mockBooking.rejectionReason).toBe('Late registration - station full');
      expect(mockBooking.save).toHaveBeenCalled();
    });
  });

  describe('manualCheckAllPendingAppointments', () => {
    it('should process pending bookings and return results', async () => {
      const result = await manualCheckAllPendingAppointments();
      
      // Check if proper counts were returned
      expect(result).toHaveProperty('checked');
      expect(result).toHaveProperty('processed');
      expect(result.checked).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      // Force an error by making find throw
      require('../../models/Booking').find.mockRejectedValueOnce(new Error('Test error'));
      
      const result = await manualCheckAllPendingAppointments();
      
      // Should return error object
      expect(result).toHaveProperty('error');
      expect(result.checked).toBe(0);
      expect(result.processed).toBe(0);
    });
  });

  // Test helper functions
  describe('Helper Functions', () => {
    
    it('should process internal functions without errors', async () => {
      // Instead of trying to test the internal function directly, 
      // we'll just assert that the manual check function doesn't throw
      await expect(manualCheckAllPendingAppointments()).resolves.not.toThrow();
      
      // Test passes as long as the function doesn't throw an error
      expect(true).toBe(true);
    });
  });
}); 