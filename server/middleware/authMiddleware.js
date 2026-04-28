import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

// ============ PROTECT MIDDLEWARE ============
// This middleware checks if user is logged in (has valid token)

export const protect = async (req, res, next) => {
  let token;

  // Step 1: Check if token exists in the Authorization header
  // Token is sent like: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Step 2: Extract token (remove "Bearer " part)
      token = req.headers.authorization.split(' ')[1];
      // "Bearer eyJhbG..." → ["Bearer", "eyJhbG..."] → "eyJhbG..."

      // Step 3: Verify token is valid (not fake, not expired)
      const decoded = jwt.verify(token, config.jwtSecret);
      // decoded = { id: "user_id_here", iat: ..., exp: ... }

      // Step 4: Find user from token and attach to request
      // (exclude password from the result)
      req.user = await User.findById(decoded.id).select('-password');

      // Step 5: User not found in database
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Step 6: All good! Continue to the actual route
      next();
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  // No token provided at all
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// ============ OPTIONAL AUTH MIDDLEWARE ============
// This middleware tries to authenticate but doesn't fail if no token
// Useful for routes that work for both guests and logged-in users

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but that's okay - continue as guest
      req.user = null;
    }
  }

  // Always continue, whether authenticated or not
  next();
};

// ============ ADMIN MIDDLEWARE ============
// This middleware checks if user is an admin
// Must be used AFTER protect middleware

export const admin = (req, res, next) => {
  // req.user is set by protect middleware
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, continue
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};
