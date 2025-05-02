const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No authentication token provided');
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found for token:', decoded.userId);
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if token is in user's tokens list (if implementing token blacklisting)
      if (user.tokens && !user.tokens.includes(token)) {
        console.log('Token not found in user tokens');
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      // Add user and token to request
      req.user = user;
      req.token = token;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('Token expired');
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        console.log('Invalid token format');
        return res.status(401).json({ 
          message: 'Invalid token format',
          code: 'INVALID_TOKEN_FORMAT'
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: error.message,
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = authMiddleware; 