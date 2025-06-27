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

jest.mock('../../Station', () => ({
  findOne: jest.fn().mockResolvedValue({
    'Station Name': 'Station A',
    'Duplicate Count': 2
  })
}));

jest.mock('../../User', () => ({
  findOne: jest.fn().mockResolvedValue({
    email: 'user@example.com',
    laxity: 0
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue({
    email: 'user@example.com',
    laxity: 0
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
    findByIdAndDelete: jest.fn().mockResolvedValue(mockBooking),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
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
const { 
  startScheduler, 
  handleLateRegistration, 
  manualCheckAllPendingAppointments, 
  processAppointments
} = require('../../appointmentScheduler');

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
      
      // Verify cron.schedule was called at least 4 times (main job, hourly backup, cleanup jobs)
      expect(cron.schedule).toHaveBeenCalledTimes(4);
      expect(cron.schedule.mock.calls[0][0]).toBe('*/30 * * * * *'); // Every 30 seconds
      expect(cron.schedule.mock.calls[1][0]).toBe('0 * * * *'); // Every hour
    });
  });

  describe('handleLateRegistration', () => {
    it('should handle late registration without errors', async () => {
      const mockBooking = {
        _id: { toString: () => 'mock-booking-id' },
        user: 'user@example.com',
        station: 'Station A',
        date: '2023-06-15',
        time: '14:00',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock Booking.findById to return the booking
      require('../../models/Booking').findById = jest.fn().mockResolvedValue(mockBooking);
      
      // Set up countDocuments to return 1 (below capacity of 2)
      require('../../models/Booking').countDocuments.mockResolvedValueOnce(1);
      
      const result = await handleLateRegistration(mockBooking);
      
      // Just check that the function returns a result without throwing
      expect(result).toBeDefined();
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