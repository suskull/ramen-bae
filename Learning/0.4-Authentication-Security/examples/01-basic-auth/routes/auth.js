/**
 * Authentication Routes
 * 
 * Demonstrates secure authentication endpoints:
 * - User registration with validation
 * - User login with secure error handling
 * - Input sanitization and validation
 * - Proper HTTP status codes
 */

const express = require('express');
const { User, UserStore } = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Additional password validation
    const passwordValidation = User.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Create user
    const user = await User.create(email, password);

    // Log successful registration (without sensitive data)
    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    // Return success response (without password hash)
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toSafeObject()
    });

  } catch (error) {
    // Log error (without sensitive data)
    logger.error('Registration error:', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    // Generic error response to prevent information leakage
    if (error.message === 'User already exists') {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    res.status(500).json({
      error: 'Registration failed'
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user login
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const user = await User.authenticate(email, password);

    if (!user) {
      // Log failed login attempt
      logger.warn('Failed login attempt', {
        email: email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Generic error message to prevent user enumeration
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Log successful login
    logger.info('Successful login', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    // Return success response
    res.json({
      message: 'Login successful',
      user: user.toSafeObject()
    });

  } catch (error) {
    // Log error
    logger.error('Login error:', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Login failed'
    });
  }
});

/**
 * GET /auth/users
 * Get all users (for testing - remove in production)
 */
router.get('/users', (req, res) => {
  try {
    const users = UserStore.getAll();
    res.json({
      message: 'All users retrieved',
      count: users.length,
      users: users
    });
  } catch (error) {
    logger.error('Error retrieving users:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve users'
    });
  }
});

/**
 * DELETE /auth/users
 * Clear all users (for testing - remove in production)
 */
router.delete('/users', (req, res) => {
  try {
    UserStore.clear();
    logger.info('All users cleared');
    res.json({
      message: 'All users cleared'
    });
  } catch (error) {
    logger.error('Error clearing users:', error.message);
    res.status(500).json({
      error: 'Failed to clear users'
    });
  }
});

/**
 * GET /auth/test
 * Test endpoint to verify API is working
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'Authentication API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      users: 'GET /auth/users (testing only)',
      clear: 'DELETE /auth/users (testing only)'
    }
  });
});

module.exports = router; 