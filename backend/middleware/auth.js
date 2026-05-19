const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      // Log detailed error information for debugging
      console.error('Token verification error:', {
        name: error.name,
        message: error.message,
        tokenProvided: !!token,
        secretLength: process.env.JWT_SECRET?.length || 0
      });
      
      // Return specific error messages based on error type
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token signature. Please log in again.',
          code: 'INVALID_TOKEN'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      } else {
        return res.status(401).json({ 
          message: 'Authentication failed. Please log in again.',
          code: 'AUTH_FAILED'
        });
      }
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const sellerProtect = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Seller access required.' });
  }
};

const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin access required.' });
  }
};

module.exports = { protect, sellerProtect, adminProtect };