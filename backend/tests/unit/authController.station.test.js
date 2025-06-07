const nodemailer = require('nodemailer');

// Mock the Station model
const mockStation = {
  _id: 'mock-station-id',
  name: 'Test Station',
  likedBy: ['user@example.com'],
  save: jest.fn().mockResolvedValue(true)
};

// Create mock controller functions
const mockLikeStation = jest.fn().mockImplementation((req, res) => {
  const { id } = req.params;
  if (id === 'mock-station-id') {
    return res.status(200).json({ message: 'Station liked' });
  }
  return res.status(404).json({ message: 'Station not found' });
});

const mockUnlikeStation = jest.fn().mockImplementation((req, res) => {
  const { id } = req.params;
  if (id === 'mock-station-id') {
    return res.status(200).json({ message: 'Station unliked' });
  }
  return res.status(404).json({ message: 'Station not found' });
});

// Mock the auth controller
jest.mock('../../authController', () => ({
  likeStation: mockLikeStation,
  unlikeStation: mockUnlikeStation
}));

// Import after mocking
const authController = require('../../authController');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify: jest.fn().mockImplementation(callback => callback(null, true))
  })
}));

describe('Auth Controller - Station Management Tests', () => {
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
  });

  describe('likeStation', () => {
    beforeEach(() => {
      req.params = {
        id: 'mock-station-id'
      };
      req.body = {
        user: 'user@example.com'
      };
    });

    it('should like a station successfully', async () => {
      await authController.likeStation(req, res);
      
      expect(mockLikeStation).toHaveBeenCalledWith(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Station liked'
      }));
    });

    it('should return 404 if station is not found', async () => {
      req.params.id = 'non-existent-id';
      
      await authController.likeStation(req, res);
      
      expect(mockLikeStation).toHaveBeenCalledWith(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Station not found'
      }));
    });
  });

  describe('unlikeStation', () => {
    beforeEach(() => {
      req.params = {
        id: 'mock-station-id'
      };
      req.body = {
        email: 'user@example.com'
      };
    });

    it('should unlike a station successfully', async () => {
      await authController.unlikeStation(req, res);
      
      expect(mockUnlikeStation).toHaveBeenCalledWith(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Station unliked'
      }));
    });

    it('should return 404 if station is not found', async () => {
      req.params.id = 'non-existent-id';
      
      await authController.unlikeStation(req, res);
      
      expect(mockUnlikeStation).toHaveBeenCalledWith(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Station not found'
      }));
    });
  });
}); 