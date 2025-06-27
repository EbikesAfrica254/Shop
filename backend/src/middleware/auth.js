// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import User from '../models/User.js';

// Don't instantiate userModel at module level - create it when needed
let userModel = null;

// Function to get or create userModel
const getUserModel = () => {
  if (!userModel && db) {
    try {
      userModel = new User(db);
    } catch (error) {
      console.error('Failed to initialize User model:', error);
      return null;
    }
  }
  return userModel;
};

export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user model instance
    const userModelInstance = getUserModel();
    if (!userModelInstance) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error.' 
      });
    }
    
    // Get user from database
    const user = await userModelInstance.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. User not found.' 
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.is_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Token expired.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticate(req, res, () => {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin role required.' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authorization.' 
    });
  }
};

export const requireVerified = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticate(req, res, () => {
      // Check if user is verified
      if (!req.user.isVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Email verification required.' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('Verification check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during verification check.' 
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user model instance
    const userModelInstance = getUserModel();
    if (!userModelInstance) {
      req.user = null;
      return next();
    }
    
    const user = await userModelInstance.findById(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};