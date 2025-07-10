/**
 * User Model
 * 
 * Demonstrates secure password handling:
 * - bcrypt hashing with salt
 * - Password validation
 * - Secure password comparison
 * - User data sanitization
 */

const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

class User {
  constructor(id, email, hashedPassword, createdAt = new Date()) {
    this.id = id;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.createdAt = createdAt;
  }

  /**
   * Create a new user with hashed password
   * @param {string} email - User's email
   * @param {string} password - Plain text password
   * @returns {Promise<User>} New user instance
   */
  static async create(email, password) {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if user already exists
      const existingUser = UserStore.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash the password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const id = UserStore.generateId();
      const user = new User(id, email.toLowerCase().trim(), hashedPassword);
      
      // Store user
      UserStore.save(user);

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error creating user:', error.message);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User's email
   * @param {string} password - Plain text password
   * @returns {Promise<User|null>} User if authenticated, null otherwise
   */
  static async authenticate(email, password) {
    try {
      // Find user by email
      const user = UserStore.findByEmail(email);
      if (!user) {
        // Use same timing as bcrypt.compare to prevent timing attacks
        await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing.attacks');
        return null;
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        logger.warn('Invalid password attempt', { email: user.email });
        return null;
      }

      logger.info('User authenticated successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error authenticating user:', error.message);
      return null;
    }
  }

  /**
   * Update user's password
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} Success status
   */
  async updatePassword(newPassword) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      this.hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update in store
      UserStore.update(this);
      
      logger.info('Password updated successfully', { userId: this.id });
      return true;
    } catch (error) {
      logger.error('Error updating password:', error.message);
      return false;
    }
  }

  /**
   * Get safe user data (without password hash)
   * @returns {Object} Safe user data
   */
  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt
    };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePassword(password) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!password) {
      result.isValid = false;
      result.errors.push('Password is required');
      return result;
    }

    if (password.length < 8) {
      result.isValid = false;
      result.errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      result.isValid = false;
      result.errors.push('Password must be less than 128 characters');
    }

    // Check for at least one lowercase, uppercase, number, and special character
    if (!/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      result.isValid = false;
      result.errors.push('Password is too common');
    }

    return result;
  }
}

/**
 * Simple in-memory user store
 * In a real application, this would be a database
 */
class UserStore {
  static users = [];
  static nextId = 1;

  static generateId() {
    return this.nextId++;
  }

  static save(user) {
    this.users.push(user);
    return user;
  }

  static findByEmail(email) {
    return this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  static findById(id) {
    return this.users.find(user => user.id === id);
  }

  static update(user) {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
    return user;
  }

  static getAll() {
    return this.users.map(user => user.toSafeObject());
  }

  static clear() {
    this.users = [];
    this.nextId = 1;
  }
}

module.exports = { User, UserStore }; 