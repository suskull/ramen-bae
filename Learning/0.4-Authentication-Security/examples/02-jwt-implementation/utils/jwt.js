/**
 * JWT Utility Functions
 * 
 * This module provides reusable JWT functions for:
 * - Token generation (access and refresh tokens)
 * - Token verification
 * - Token decoding
 * - Error handling
 */

const jwt = require('jsonwebtoken');
const logger = require('./logger');

class JWTUtils {
  constructor(options = {}) {
    // Get configuration from environment variables
    this.accessSecret = options.accessSecret || process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    this.refreshSecret = options.refreshSecret || process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
    this.accessExpiresIn = options.accessExpiresIn || process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = options.refreshExpiresIn || process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.issuer = options.issuer || 'jwt-auth-app';
    this.audience = options.audience || 'jwt-auth-users';

    // Warn about weak secrets in development
    if (this.accessSecret.includes('fallback') || this.accessSecret.length < 32) {
      logger.warn('JWT secret is weak or using fallback. Set JWT_SECRET environment variable.');
    }
  }

  /**
   * Generate access token with user data
   * @param {Object} user - User object with id, email, role, etc.
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    try {
      const payload = {
        sub: user.id,           // Subject (user ID)
        email: user.email,      // User email
        role: user.role,        // User role for authorization
        name: user.name,        // User name for display
        type: 'access'          // Token type
      };

      const token = jwt.sign(payload, this.accessSecret, {
        expiresIn: this.accessExpiresIn,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      });

      logger.info('Access token generated', { 
        userId: user.id, 
        email: user.email,
        expiresIn: this.accessExpiresIn
      });

      return token;
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token with minimal data
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    try {
      const payload = {
        sub: user.id,
        type: 'refresh'
      };

      const token = jwt.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshExpiresIn,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      });

      logger.info('Refresh token generated', { 
        userId: user.id,
        expiresIn: this.refreshExpiresIn
      });

      return token;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object with accessToken and refreshToken
   */
  generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessExpiresIn
    };
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      });

      // Ensure this is an access token
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.warn('Access token verification failed', { 
        error: error.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      throw this.createTokenError(error);
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      });

      // Ensure this is a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed', { 
        error: error.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      throw this.createTokenError(error);
    }
  }

  /**
   * Decode token without verification (for debugging/analysis)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired without verification
   * @param {string} token - JWT token to check
   * @returns {boolean} True if expired, false otherwise
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get time until token expiration
   * @param {string} token - JWT token
   * @returns {number} Seconds until expiration, or 0 if expired
   */
  getTimeUntilExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;
      return Math.max(0, timeLeft);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Create standardized token error
   * @param {Error} error - Original JWT error
   * @returns {Error} Standardized error
   */
  createTokenError(error) {
    switch (error.name) {
      case 'TokenExpiredError':
        const expiredError = new Error('Token has expired');
        expiredError.name = 'TokenExpiredError';
        expiredError.statusCode = 401;
        return expiredError;

      case 'JsonWebTokenError':
        const invalidError = new Error('Invalid token');
        invalidError.name = 'JsonWebTokenError';
        invalidError.statusCode = 403;
        return invalidError;

      case 'NotBeforeError':
        const notBeforeError = new Error('Token not active yet');
        notBeforeError.name = 'NotBeforeError';
        notBeforeError.statusCode = 401;
        return notBeforeError;

      default:
        const generalError = new Error('Token verification failed');
        generalError.name = 'TokenVerificationError';
        generalError.statusCode = 500;
        return generalError;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Refresh an access token using a refresh token
   * @param {string} refreshToken - Valid refresh token
   * @param {Function} getUserById - Function to get user by ID
   * @returns {Object} New token pair
   */
  async refreshTokens(refreshToken, getUserById) {
    try {
      // Verify the refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Get fresh user data
      const user = await getUserById(decoded.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token pair
      return this.generateTokenPair(user);
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Validate token configuration
   * @returns {Object} Validation result
   */
  validateConfiguration() {
    const issues = [];

    if (this.accessSecret.length < 32) {
      issues.push('Access token secret should be at least 32 characters');
    }

    if (this.refreshSecret.length < 32) {
      issues.push('Refresh token secret should be at least 32 characters');
    }

    if (this.accessSecret === this.refreshSecret) {
      issues.push('Access and refresh token secrets should be different');
    }

    const accessSeconds = this.parseExpirationTime(this.accessExpiresIn);
    const refreshSeconds = this.parseExpirationTime(this.refreshExpiresIn);

    if (accessSeconds >= refreshSeconds) {
      issues.push('Access token should expire before refresh token');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Parse expiration time string to seconds
   * @param {string} timeString - Time string like '15m', '7d', '1h'
   * @returns {number} Time in seconds
   */
  parseExpirationTime(timeString) {
    const units = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24
    };

    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 0;
    }

    const [, value, unit] = match;
    return parseInt(value) * (units[unit] || 0);
  }
}

// Export singleton instance
const jwtUtils = new JWTUtils();

// Validate configuration on startup
const validation = jwtUtils.validateConfiguration();
if (!validation.isValid) {
  logger.warn('JWT configuration issues detected:', validation.issues);
}

module.exports = jwtUtils; 