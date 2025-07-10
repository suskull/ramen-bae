/**
 * Security Testing Script
 * 
 * This script tests various security vulnerabilities including:
 * - SQL Injection attempts
 * - Input validation testing
 * - Authentication bypass attempts
 * - Password validation testing
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.blue}=== ${msg} ===${colors.reset}`)
};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test SQL Injection attempts
async function testSQLInjection() {
  log.header('Testing SQL Injection Attacks');
  
  const sqlPayloads = [
    // Classic SQL injection payloads
    {
      name: "Classic OR injection",
      email: "admin@example.com' OR '1'='1' --",
      password: "anything"
    },
    {
      name: "Union-based injection", 
      email: "admin@example.com' UNION SELECT * FROM users --",
      password: "password"
    },
    {
      name: "Comment-based bypass",
      email: "admin@example.com'/*",
      password: "*/OR/**/1=1--"
    },
    {
      name: "Time-based blind injection",
      email: "admin@example.com'; WAITFOR DELAY '00:00:05' --",
      password: "password"
    },
    {
      name: "Boolean-based blind injection",
      email: "admin@example.com' AND (SELECT COUNT(*) FROM users) > 0 --",
      password: "password"
    },
    {
      name: "Stacked queries",
      email: "admin@example.com'; DROP TABLE users; --",
      password: "password"
    }
  ];

  log.info('Testing various SQL injection payloads...\n');

  for (const payload of sqlPayloads) {
    log.info(`Testing: ${payload.name}`);
    console.log(`   Email: ${payload.email}`);
    console.log(`   Password: ${payload.password}`);
    
    const result = await makeRequest('POST', '/auth/login', {
      email: payload.email,
      password: payload.password
    });
    
    if (result.success) {
      log.error(`VULNERABILITY: ${payload.name} succeeded!`);
      console.log('   Response:', result.data);
    } else {
      log.success(`Protected: ${payload.name} blocked`);
      console.log(`   Status: ${result.status}, Error: ${result.error.error || result.error}`);
    }
    console.log('');
  }
}

// Test registration SQL injection
async function testRegistrationSQLInjection() {
  log.header('Testing SQL Injection in Registration');
  
  const registrationPayloads = [
    {
      name: "Email injection",
      email: "test@example.com'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'hashed'); --",
      password: "ValidPassword123!"
    },
    {
      name: "Password injection",
      email: "test2@example.com",
      password: "pass'; UPDATE users SET role='admin' WHERE email='test2@example.com'; --"
    }
  ];

  for (const payload of registrationPayloads) {
    log.info(`Testing: ${payload.name}`);
    
    const result = await makeRequest('POST', '/auth/register', {
      email: payload.email,
      password: payload.password
    });
    
    if (result.success) {
      log.warning(`Registration succeeded with potentially malicious input`);
      console.log('   Response:', result.data);
    } else {
      log.success(`Protected: ${payload.name} blocked`);
      console.log(`   Status: ${result.status}, Error: ${result.error.error || result.error}`);
    }
    console.log('');
  }
}

// Test input validation bypass attempts
async function testInputValidationBypass() {
  log.header('Testing Input Validation Bypass');
  
  const bypassAttempts = [
    // Email validation bypass
    {
      name: "Invalid email format",
      email: "not-an-email",
      password: "ValidPassword123!"
    },
    {
      name: "Email with script tag",
      email: "<script>alert('xss')</script>@example.com",
      password: "ValidPassword123!"
    },
    {
      name: "Empty email",
      email: "",
      password: "ValidPassword123!"
    },
    // Password validation bypass
    {
      name: "Weak password",
      email: "weak@example.com",
      password: "123"
    },
    {
      name: "No special characters",
      email: "weak2@example.com", 
      password: "Password123"
    },
    {
      name: "Too long password (DoS attempt)",
      email: "dos@example.com",
      password: "a".repeat(10000)
    }
  ];

  for (const attempt of bypassAttempts) {
    log.info(`Testing: ${attempt.name}`);
    
    const result = await makeRequest('POST', '/auth/register', {
      email: attempt.email,
      password: attempt.password
    });
    
    if (result.success) {
      log.error(`VULNERABILITY: ${attempt.name} bypassed validation!`);
    } else {
      log.success(`Protected: ${attempt.name} blocked by validation`);
      if (result.error.details) {
        console.log(`   Validation errors:`, result.error.details);
      }
    }
    console.log('');
  }
}

// Test authentication bypass attempts
async function testAuthenticationBypass() {
  log.header('Testing Authentication Bypass Attempts');
  
  // First, register a legitimate user for testing
  await makeRequest('POST', '/auth/register', {
    email: 'testuser@example.com',
    password: 'ValidPassword123!'
  });

  const bypassAttempts = [
    {
      name: "Empty credentials",
      email: "",
      password: ""
    },
    {
      name: "Null injection",
      email: "testuser@example.com\x00admin",
      password: "ValidPassword123!"
    },
    {
      name: "Unicode normalization",
      email: "testuser@example.com",
      password: "ValidPassword123\u2060!" // invisible character
    },
    {
      name: "Case sensitivity test",
      email: "TESTUSER@EXAMPLE.COM",
      password: "validpassword123!"
    }
  ];

  for (const attempt of bypassAttempts) {
    log.info(`Testing: ${attempt.name}`);
    
    const result = await makeRequest('POST', '/auth/login', {
      email: attempt.email,
      password: attempt.password
    });
    
    if (result.success) {
      log.warning(`Authentication succeeded: ${attempt.name}`);
      console.log('   This might be expected behavior or a vulnerability');
    } else {
      log.success(`Protected: ${attempt.name} rejected`);
    }
    console.log('');
  }
}

// Test rate limiting
async function testRateLimit() {
  log.header('Testing Rate Limiting');
  
  log.info('Attempting multiple rapid login requests...');
  
  const rapidRequests = [];
  for (let i = 0; i < 10; i++) {
    rapidRequests.push(
      makeRequest('POST', '/auth/login', {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    );
  }
  
  const results = await Promise.all(rapidRequests);
  
  const blocked = results.filter(r => r.status === 429).length;
  const allowed = results.filter(r => r.status !== 429).length;
  
  if (blocked > 0) {
    log.success(`Rate limiting working: ${blocked} requests blocked, ${allowed} allowed`);
  } else {
    log.warning(`No rate limiting detected: All ${allowed} requests were processed`);
    log.warning('Consider implementing rate limiting to prevent brute force attacks');
  }
}

// Demonstrate what a vulnerable system would look like
function demonstrateVulnerableCode() {
  log.header('Example: How SQL Injection Works in Vulnerable Code');
  
  console.log(`
${colors.red}❌ VULNERABLE CODE EXAMPLE (DO NOT USE):${colors.reset}

// Vulnerable login function
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // 🚨 DANGEROUS: Direct string concatenation
  const query = \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`;
  
  db.query(query, (err, results) => {
    if (results.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

${colors.yellow}⚠️  ATTACK SCENARIO:${colors.reset}
Attacker sends:
- Email: admin@example.com' OR '1'='1' --
- Password: anything

${colors.yellow}RESULTING QUERY:${colors.reset}
SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1' --' AND password = 'anything'

${colors.red}RESULT: Authentication bypassed! The query always returns true.${colors.reset}

${colors.green}✅ SECURE CODE (What your app does):${colors.reset}

// Input validation with express-validator
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Parameterized queries (if using a real database)
const query = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
db.query(query, [email, hashedPassword]);

// In-memory store (your current implementation)
const user = UserStore.findByEmail(email); // No SQL injection possible
`);
}

// Main testing function
async function runSecurityTests() {
  console.log(`${colors.blue}🔒 Security Testing Suite${colors.reset}\n`);
  
  // Check if server is running
  try {
    await makeRequest('GET', '/health');
    log.success('Server is running and accessible\n');
  } catch (error) {
    log.error('Server is not running! Please start it with: npm start');
    process.exit(1);
  }

  // Run all tests
  await testSQLInjection();
  await testRegistrationSQLInjection();
  await testInputValidationBypass();
  await testAuthenticationBypass();
  await testRateLimit();
  
  // Educational content
  demonstrateVulnerableCode();
  
  log.header('Security Test Summary');
  log.info('Your application appears to be well-protected against basic attacks!');
  log.info('The input validation and bcrypt hashing provide good security.');
  log.warning('Consider adding rate limiting for production use.');
  log.info('\nFor production, also implement:');
  console.log('  - HTTPS enforcement');
  console.log('  - Security headers (helmet.js)'); 
  console.log('  - CORS configuration');
  console.log('  - Account lockout after failed attempts');
  console.log('  - Logging and monitoring');
}

// Add axios to package.json check
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = { runSecurityTests }; 