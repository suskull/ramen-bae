/**
 * Validation Middleware
 * 
 * Provides input validation for authentication endpoints
 * Uses express-validator for robust validation
 */

const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors (without sensitive data)
    logger.warn('Validation failed', {
      path: req.path,
      ip: req.ip,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Registration validation middleware
 */
const validateRegistration = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters'),
  
  // Password validation
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  // Handle validation errors
  handleValidationErrors
];

/**
 * Login validation middleware
 */
const validateLogin = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters'),
  
  // Password validation (less strict for login)
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters'),
  
  // Handle validation errors
  handleValidationErrors
];

/**
 * Generic sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Basic sanitization - trim whitespace
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  sanitizeInput,
  handleValidationErrors
}; 