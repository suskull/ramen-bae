/**
 * Database Implementation Examples
 * 
 * This shows how your current UserStore methods would be implemented
 * using parameterized queries with real databases.
 */

// ========================================
// 🔄 CONVERTING YOUR CURRENT CODE TO USE DATABASES
// ========================================

// Your current in-memory method (SAFE from SQL injection)
class CurrentUserStore {
  static findByEmail(email) {
    return this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase().trim()
    );
  }
}

// ========================================
// ✅ MYSQL WITH PARAMETERIZED QUERIES
// ========================================

const mysql = require('mysql2/promise');

class MySQLUserStore {
  static async findByEmail(email) {
    // ✅ SECURE: Using parameterized query with ?
    const query = 'SELECT id, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER(?)';
    const params = [email.trim()];
    
    console.log('MySQL Query:', query);
    console.log('Parameters:', params);
    
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
  }
  
  static async create(email, hashedPassword) {
    // ✅ SECURE: Parameterized INSERT
    const query = 'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())';
    const params = [email.toLowerCase().trim(), hashedPassword];
    
    const [result] = await db.execute(query, params);
    return result.insertId;
  }
  
  static async updatePassword(userId, hashedPassword) {
    // ✅ SECURE: Parameterized UPDATE
    const query = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    const params = [hashedPassword, userId];
    
    await db.execute(query, params);
  }
}

// ========================================
// ✅ POSTGRESQL WITH PARAMETERIZED QUERIES
// ========================================

const { Pool } = require('pg');

class PostgreSQLUserStore {
  static async findByEmail(email) {
    // ✅ SECURE: Using numbered placeholders $1, $2
    const query = 'SELECT id, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER($1)';
    const params = [email.trim()];
    
    console.log('PostgreSQL Query:', query);
    console.log('Parameters:', params);
    
    const result = await db.query(query, params);
    return result.rows[0] || null;
  }
  
  static async create(email, hashedPassword) {
    // ✅ SECURE: Parameterized INSERT with RETURNING
    const query = 'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id';
    const params = [email.toLowerCase().trim(), hashedPassword];
    
    const result = await db.query(query, params);
    return result.rows[0].id;
  }
}

// ========================================
// ✅ SQLITE WITH PARAMETERIZED QUERIES
// ========================================

const Database = require('better-sqlite3');

class SQLiteUserStore {
  static findByEmail(email) {
    // ✅ SECURE: Using named parameters
    const query = 'SELECT id, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER(@email)';
    const params = { email: email.trim() };
    
    console.log('SQLite Query:', query);
    console.log('Parameters:', params);
    
    return db.prepare(query).get(params);
  }
  
  static create(email, hashedPassword) {
    // ✅ SECURE: Parameterized INSERT
    const query = 'INSERT INTO users (email, password_hash, created_at) VALUES (@email, @password, datetime("now"))';
    const params = { 
      email: email.toLowerCase().trim(), 
      password: hashedPassword 
    };
    
    const result = db.prepare(query).run(params);
    return result.lastInsertRowid;
  }
}

// ========================================
// ✅ MONGOOSE (MONGODB) - OBJECT-BASED QUERIES
// ========================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

class MongoUserStore {
  static async findByEmail(email) {
    // ✅ SECURE: Mongoose automatically prevents injection
    const query = { email: email.toLowerCase().trim() };
    
    console.log('MongoDB Query:', JSON.stringify(query));
    
    return await User.findOne(query);
  }
  
  static async create(email, hashedPassword) {
    // ✅ SECURE: Object-based creation
    const userData = {
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword
    };
    
    const user = new User(userData);
    await user.save();
    return user._id;
  }
}

// ========================================
// ✅ PRISMA ORM - TYPE-SAFE QUERIES
// ========================================

// Prisma automatically generates parameterized queries
class PrismaUserStore {
  static async findByEmail(email) {
    // ✅ SECURE: Prisma automatically parameterizes
    return await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      }
    });
  }
  
  static async create(email, hashedPassword) {
    // ✅ SECURE: Type-safe, automatically parameterized
    return await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password_hash: hashedPassword
      }
    });
  }
}

// ========================================
// 🚫 WHAT YOUR CODE WOULD LOOK LIKE IF VULNERABLE
// ========================================

class VulnerableUserStore {
  static async findByEmail(email) {
    // ❌ DANGEROUS: String concatenation - DON'T DO THIS!
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    
    console.log('VULNERABLE Query:', query);
    
    // An attacker could send: email = "'; DROP TABLE users; --"
    // Resulting query: SELECT * FROM users WHERE email = ''; DROP TABLE users; --'
    
    return await db.query(query);
  }
}

// ========================================
// 🔧 COMPLETE AUTHENTICATION EXAMPLE WITH MYSQL2
// ========================================

class SecureAuthSystem {
  static async authenticate(email, password) {
    try {
      // 1. Find user with parameterized query
      const query = 'SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER(?)';
      const [rows] = await db.execute(query, [email.trim()]);
      
      if (rows.length === 0) {
        // Prevent timing attacks
        await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing.attacks');
        return null;
      }
      
      const user = rows[0];
      
      // 2. Verify password with bcrypt (same as your current code)
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return null;
      }
      
      // 3. Log successful login with parameterized query
      const logQuery = 'INSERT INTO login_logs (user_id, ip_address, user_agent, login_time) VALUES (?, ?, ?, NOW())';
      await db.execute(logQuery, [user.id, req.ip, req.get('User-Agent')]);
      
      return user;
      
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  static async register(email, password) {
    try {
      // 1. Check if user exists with parameterized query
      const checkQuery = 'SELECT id FROM users WHERE LOWER(email) = LOWER(?)';
      const [existing] = await db.execute(checkQuery, [email.trim()]);
      
      if (existing.length > 0) {
        throw new Error('User already exists');
      }
      
      // 2. Hash password (same as your current code)
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // 3. Create user with parameterized query
      const insertQuery = 'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())';
      const [result] = await db.execute(insertQuery, [email.toLowerCase().trim(), hashedPassword]);
      
      return result.insertId;
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}

// ========================================
// 📋 MIGRATION PLAN: FROM USERSTORE TO DATABASE
// ========================================

console.log(`
🔄 HOW TO MIGRATE YOUR CURRENT SYSTEM TO USE A DATABASE:

1. CHOOSE A DATABASE:
   - MySQL/PostgreSQL: For relational data
   - MongoDB: For document-based data
   - SQLite: For simple/local applications

2. REPLACE UserStore METHODS:
   - UserStore.findByEmail() → SELECT query with parameterized WHERE clause
   - UserStore.save() → INSERT query with parameterized VALUES
   - UserStore.update() → UPDATE query with parameterized SET clause

3. KEEP YOUR SECURITY FEATURES:
   ✅ Password hashing with bcrypt (no changes needed)
   ✅ Input validation with express-validator (no changes needed)
   ✅ Error handling (no changes needed)
   ✅ Add parameterized queries for database operations

4. EXAMPLE CONVERSION:
   
   // OLD (in-memory)
   const user = UserStore.findByEmail(email);
   
   // NEW (with MySQL)
   const [rows] = await db.execute(
     'SELECT * FROM users WHERE email = ?', 
     [email]
   );
   const user = rows[0];

Your current system is already very secure! When you add a database,
just remember: ALWAYS use parameterized queries, NEVER string concatenation.
`);

module.exports = {
  MySQLUserStore,
  PostgreSQLUserStore,
  SQLiteUserStore,
  MongoUserStore,
  PrismaUserStore,
  SecureAuthSystem
}; 