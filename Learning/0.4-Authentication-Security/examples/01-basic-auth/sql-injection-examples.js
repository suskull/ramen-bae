/**
 * SQL Injection Examples
 * 
 * This file demonstrates the difference between vulnerable SQL queries
 * and secure parameterized queries. This is for educational purposes only!
 */

// ========================================
// 🚫 VULNERABLE CODE (NEVER USE THIS!)
// ========================================

// Example 1: Vulnerable Login Function
function vulnerableLogin(email, password) {
  // ❌ DANGEROUS: Direct string concatenation
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  
  console.log("Generated SQL Query:", query);
  
  // This would execute the query:
  // return db.query(query);
}

// Example 2: Vulnerable Registration
function vulnerableRegister(email, password, name) {
  // ❌ DANGEROUS: Template literals with user input
  const query = `INSERT INTO users (email, password, name) VALUES ('${email}', '${password}', '${name}')`;
  
  console.log("Generated SQL Query:", query);
}

// ========================================
// 🎯 HOW THE ATTACK WORKS
// ========================================

console.log("=== DEMONSTRATING SQL INJECTION ATTACK ===\n");

// Normal use case
console.log("1. NORMAL LOGIN ATTEMPT:");
vulnerableLogin("john@example.com", "mypassword123");
console.log("Result: Normal query executed\n");

// Attack scenario
console.log("2. SQL INJECTION ATTACK:");
const maliciousEmail = "admin@example.com' OR '1'='1' --";
const maliciousPassword = "anything";

vulnerableLogin(maliciousEmail, maliciousPassword);
console.log("Result: Authentication bypassed! The attacker is logged in as admin!\n");

// Even worse attack
console.log("3. DESTRUCTIVE SQL INJECTION:");
const destructiveEmail = "test@example.com'; DROP TABLE users; --";
vulnerableRegister(destructiveEmail, "password123", "Hacker");
console.log("Result: The entire users table would be deleted!\n");

// ========================================
// ✅ SECURE CODE WITH PARAMETERIZED QUERIES
// ========================================

// Example using different database libraries
const secureExamples = {
  
  // MySQL with mysql2
  mysql2: {
    login: function(email, password) {
      // ✅ SECURE: Using placeholders (?)
      const query = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
      const params = [email, password]; // Values are separate from SQL
      
      console.log("Secure SQL:", query);
      console.log("Parameters:", params);
      
      // return db.execute(query, params);
    },
    
    register: function(email, hashedPassword, name) {
      // ✅ SECURE: Named placeholders
      const query = 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)';
      const params = [email, hashedPassword, name];
      
      console.log("Secure SQL:", query);
      console.log("Parameters:", params);
    }
  },

  // PostgreSQL with pg
  postgresql: {
    login: function(email, password) {
      // ✅ SECURE: Using numbered placeholders ($1, $2)
      const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
      const params = [email, password];
      
      console.log("Secure PostgreSQL:", query);
      console.log("Parameters:", params);
      
      // return db.query(query, params);
    }
  },

  // SQLite with better-sqlite3
  sqlite: {
    login: function(email, password) {
      // ✅ SECURE: Using named parameters
      const query = 'SELECT * FROM users WHERE email = @email AND password_hash = @password';
      const params = { email, password };
      
      console.log("Secure SQLite:", query);
      console.log("Parameters:", params);
      
      // return db.prepare(query).get(params);
    }
  },

  // MongoDB with mongoose (NoSQL but similar concept)
  mongodb: {
    login: function(email, password) {
      // ✅ SECURE: Object-based queries prevent injection
      const query = { email: email }; // MongoDB automatically escapes
      
      console.log("Secure MongoDB query:", JSON.stringify(query));
      
      // return User.findOne(query);
    }
  }
};

console.log("=== SECURE PARAMETERIZED QUERY EXAMPLES ===\n");

console.log("4. SECURE MYSQL LOGIN:");
secureExamples.mysql2.login("john@example.com", "hashedPassword123");
console.log("Result: Safe - user input cannot modify SQL structure\n");

console.log("5. SECURE LOGIN WITH MALICIOUS INPUT:");
secureExamples.mysql2.login("admin@example.com' OR '1'='1' --", "anything");
console.log("Result: Safe - malicious input is treated as literal string data\n");

// ========================================
// 🛡️ WHY PARAMETERIZED QUERIES WORK
// ========================================

console.log("=== WHY PARAMETERIZED QUERIES ARE SECURE ===\n");

console.log(`
🔍 How SQL Injection Works:
1. Attacker sends: email = "admin' OR '1'='1' --"
2. Vulnerable code creates: SELECT * FROM users WHERE email = 'admin' OR '1'='1' --' AND password = 'x'
3. Database interprets this as:
   - Find user with email 'admin' 
   - OR where '1'='1' (always true!)
   - Comment out the rest with --
4. Result: Query returns all users, authentication bypassed!

🛡️ How Parameterized Queries Prevent This:
1. SQL structure is defined first: SELECT * FROM users WHERE email = ? AND password = ?
2. Database prepares this structure and creates execution plan
3. User input is passed separately as parameters: ['admin\\' OR \\'1\\'=\\'1\\' --', 'password']
4. Database treats parameters as DATA only, not as SQL commands
5. Result: The malicious input is searched for literally - no SQL injection possible!

🎯 Key Benefits:
- SQL structure and data are completely separate
- User input cannot change the SQL command structure
- Database driver automatically escapes special characters
- Better performance (query plans can be cached)
- Works with any type of user input
`);

// ========================================
// 🔧 REAL-WORLD IMPLEMENTATION EXAMPLES
// ========================================

console.log("=== REAL-WORLD SECURE IMPLEMENTATIONS ===\n");

// Express.js with MySQL2
const expressMySQL = `
// ✅ Secure Express.js + MySQL2 Authentication
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Find user with parameterized query
    const [rows] = await db.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // 2. Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 3. Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
`;

console.log("Express.js + MySQL2 Example:");
console.log(expressMySQL);

// ========================================
// 🎓 YOUR CURRENT SYSTEM
// ========================================

console.log("=== YOUR CURRENT AUTHENTICATION SYSTEM ===\n");

console.log(`
🎯 Current Protection Level: EXCELLENT!

Your current system doesn't use SQL at all - it uses an in-memory UserStore.
This means you're 100% protected from SQL injection because there's no SQL!

Current Protection Mechanisms:
✅ No SQL queries (uses UserStore.findByEmail())
✅ Input validation with express-validator
✅ Password hashing with bcrypt
✅ Secure error handling
✅ Request sanitization

Example from your code:
// This is NOT vulnerable to SQL injection because it's not SQL!
const user = UserStore.findByEmail(email);
const isValid = await bcrypt.compare(password, user.hashedPassword);

When you DO use a database later, remember to:
1. Use parameterized queries
2. Validate all input
3. Use an ORM/query builder that automatically parameterizes
4. Never concatenate user input into SQL strings
`);

module.exports = {
  vulnerableLogin,
  secureExamples
}; 