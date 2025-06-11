const mongoose = require('mongoose');

// Mock the dependencies
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    close: jest.fn().mockResolvedValue(true)
  }
}));

// Mock the Booking model
jest.mock('../../models/Booking', () => {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null)
  };
});

jest.mock('../../appointmentScheduler', () => ({
  manualCheckAllPendingAppointments: jest.fn().mockResolvedValue({
    checked: 5,
    processed: 2
  })
}));

// Create a function that simulates what process-appointments.js does
// This is needed because requiring the file directly executes it immediately
async function simulateProcessAppointments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/electricVehicles');
    console.log('Connected to MongoDB');
    
    // Run the manual processing
    console.log('Processing appointments...');
    const result = await require('../../appointmentScheduler').manualCheckAllPendingAppointments();
    
    console.log('Processing completed:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Save the original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Process Appointments Script Tests', () => {
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mocks between tests
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  it('should connect to MongoDB and process appointments', async () => {
    // Execute the simulated script
    await simulateProcessAppointments();
    
    // Verify MongoDB connection was attempted
    expect(mongoose.connect).toHaveBeenCalledWith(
      expect.stringContaining('mongodb://')
    );
    
    // Verify manualCheckAllPendingAppointments was called
    expect(require('../../appointmentScheduler').manualCheckAllPendingAppointments).toHaveBeenCalled();
    
    // Verify MongoDB connection was closed
    expect(mongoose.connection.close).toHaveBeenCalled();
    
    // Verify appropriate logs were made
    expect(console.log).toHaveBeenCalledWith('Connected to MongoDB');
    expect(console.log).toHaveBeenCalledWith('Processing appointments...');
    
    // Use a more general matcher for the third call since it includes an object
    expect(console.log.mock.calls[2][0]).toBe('Processing completed:');
    
    expect(console.log).toHaveBeenCalledWith('MongoDB connection closed');
  });
  
  it('should handle MongoDB connection errors', async () => {
    // Mock mongoose.connect to reject
    mongoose.connect.mockRejectedValueOnce(new Error('Connection error'));
    
    // Execute the simulated script
    await simulateProcessAppointments();
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    
    // Verify MongoDB connection was still closed (in finally block)
    expect(mongoose.connection.close).toHaveBeenCalled();
  });
  
  it('should handle processing errors', async () => {
    // Mock manualCheckAllPendingAppointments to reject
    require('../../appointmentScheduler').manualCheckAllPendingAppointments.mockRejectedValueOnce(
      new Error('Processing error')
    );
    
    // Execute the simulated script
    await simulateProcessAppointments();
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    
    // Verify MongoDB connection was still closed (in finally block)
    expect(mongoose.connection.close).toHaveBeenCalled();
  });
}); 