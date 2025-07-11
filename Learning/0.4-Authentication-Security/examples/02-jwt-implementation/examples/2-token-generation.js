/**
 * JWT Token Generation - Creating Tokens for Authentication
 * 
 * This example teaches you:
 * 1. How to generate tokens after successful login
 * 2. What data to include in tokens
 * 3. Setting appropriate expiration times
 * 4. Best practices for token creation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

console.log('🔐 JWT TOKEN GENERATION - Authentication Tokens\n');

// ========================================
// 1. SETTING UP USER DATA (LIKE YOUR BASIC AUTH)
// ========================================

console.log('1️⃣ Setting Up User Data');
console.log('========================');

// Simulate user database (like in your basic auth example)
const users = [
  {
    id: 1,
    email: 'john@example.com',
    hashedPassword: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHDI1mKWENUaW8mG', // 'password123'
    role: 'user',
    name: 'John Doe'
  },
  {
    id: 2,
    email: 'admin@example.com',
    hashedPassword: '$2b$12$92y9vRQ8eO9dP.wR3S5XqejfOuC/Ov/mJ19fzN8p2eBBBzEJOGbhe', // 'admin123'
    role: 'admin',
    name: 'Admin User'
  }
];

console.log('👥 Mock users in our system:');
users.forEach(user => {
  console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
});
console.log('   (Passwords are hashed with bcrypt, just like your basic auth!)\n');

// ========================================
// 2. SIMULATING AUTHENTICATION (FROM YOUR BASIC AUTH)
// ========================================

console.log('2️⃣ Authentication Process (From Basic Auth)');
console.log('=============================================');

async function authenticateUser(email, password) {
  console.log(`🔍 Authenticating user: ${email}`);
  
  // Step 1: Find user by email (same as your basic auth)
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.log('   ❌ User not found');
    return null;
  }
  
  // Step 2: Compare password with bcrypt (same as your basic auth)
  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
  if (!isValidPassword) {
    console.log('   ❌ Invalid password');
    return null;
  }
  
  console.log('   ✅ Authentication successful!');
  return user;
}

// ========================================
// 3. GENERATING JWT TOKENS AFTER LOGIN
// ========================================

console.log('3️⃣ Generating JWT Tokens');
console.log('=========================');

// Environment-like configuration (normally from .env file)
const JWT_CONFIG = {
  secret: 'your-super-secret-jwt-key-change-in-production',
  expiresIn: '1h',
  issuer: 'my-app',
  audience: 'my-app-users'
};

function generateTokens(user) {
  console.log(`🎫 Generating tokens for user: ${user.email}`);
  
  // Payload - What goes INTO the token
  const payload = {
    sub: user.id,        // Subject (user ID) - standard JWT claim
    email: user.email,   // User email
    role: user.role,     // User role for authorization
    name: user.name      // User name for display
    // NOTE: Never include password or sensitive data!
  };
  
  console.log('📦 Token payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  // Generate access token
  const accessToken = jwt.sign(
    payload,
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
  
  // Generate refresh token (longer-lived, minimal data)
  const refreshTokenPayload = {
    sub: user.id,
    type: 'refresh'
  };
  
  const refreshToken = jwt.sign(
    refreshTokenPayload,
    JWT_CONFIG.secret,
    {
      expiresIn: '7d',
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
  
  console.log('✨ Tokens generated successfully!');
  console.log(`   Access token length: ${accessToken.length} characters`);
  console.log(`   Refresh token length: ${refreshToken.length} characters\n`);
  
  return { accessToken, refreshToken };
}

// ========================================
// 4. COMPLETE LOGIN FLOW (BASIC AUTH → JWT)
// ========================================

console.log('4️⃣ Complete Login Flow');
console.log('=======================');

async function loginWithJWT(email, password) {
  console.log(`🚪 Login attempt for: ${email}`);
  
  // Step 1: Authenticate (same as basic auth)
  const user = await authenticateUser(email, password);
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  // Step 2: Generate JWT tokens (NEW!)
  const tokens = generateTokens(user);
  
  // Step 3: Return tokens to client
  return {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    tokens
  };
}

// ========================================
// 5. TESTING THE LOGIN FLOW
// ========================================

console.log('5️⃣ Testing Login Flow');
console.log('======================');

async function testLogin() {
  // Test 1: Valid credentials
  console.log('🧪 Test 1: Valid credentials');
  const result1 = await loginWithJWT('john@example.com', 'password123');
  console.log('Result:', result1.success ? 'SUCCESS' : 'FAILED');
  if (result1.success) {
    console.log('Access Token:', result1.tokens.accessToken.substring(0, 50) + '...');
    console.log('User Info:', result1.user);
  }
  console.log();
  
  // Test 2: Invalid credentials
  console.log('🧪 Test 2: Invalid credentials');
  const result2 = await loginWithJWT('john@example.com', 'wrongpassword');
  console.log('Result:', result2.success ? 'SUCCESS' : 'FAILED');
  console.log('Error:', result2.error);
  console.log();
  
  // Test 3: Admin user
  console.log('🧪 Test 3: Admin user');
  const result3 = await loginWithJWT('admin@example.com', 'admin123');
  console.log('Result:', result3.success ? 'SUCCESS' : 'FAILED');
  if (result3.success) {
    console.log('Admin Token Generated! Role:', result3.user.role);
  }
  console.log();
  
  return result1.success ? result1.tokens : null;
}

// ========================================
// 6. UNDERSTANDING TOKEN EXPIRATION
// ========================================

console.log('6️⃣ Understanding Token Expiration');
console.log('===================================');

function analyzeToken(token) {
  try {
    // Decode without verification (just to see contents)
    const decoded = jwt.decode(token);
    
    console.log('📊 Token Analysis:');
    console.log(`   User ID: ${decoded.sub}`);
    console.log(`   Email: ${decoded.email}`);
    console.log(`   Role: ${decoded.role}`);
    console.log(`   Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
    console.log(`   Expires at: ${new Date(decoded.exp * 1000).toISOString()}`);
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    const minutesLeft = Math.floor(timeUntilExpiry / 60);
    
    console.log(`   Time until expiry: ${minutesLeft} minutes`);
    console.log(`   Is expired: ${timeUntilExpiry <= 0 ? 'YES' : 'NO'}`);
    
    return decoded;
  } catch (error) {
    console.log('❌ Error analyzing token:', error.message);
    return null;
  }
}

// ========================================
// 7. DIFFERENT TOKEN STRATEGIES
// ========================================

console.log('\n7️⃣ Different Token Strategies');
console.log('==============================');

function generateShortLivedToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_CONFIG.secret,
    { expiresIn: '15m' } // Very short for high security
  );
}

function generateLongLivedToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_CONFIG.secret,
    { expiresIn: '30d' } // Long for convenience
  );
}

function generateTokenWithCustomClaims(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.role === 'admin' ? ['read', 'write', 'delete'] : ['read'],
      loginTime: Math.floor(Date.now() / 1000),
      department: 'engineering'
    },
    JWT_CONFIG.secret,
    { expiresIn: '1h' }
  );
}

// ========================================
// 8. RUNNING THE EXAMPLES
// ========================================

async function runExamples() {
  // Test the login flow
  const tokens = await testLogin();
  
  if (tokens) {
    console.log('📋 Analyzing Generated Token:');
    console.log('==============================');
    analyzeToken(tokens.accessToken);
    
    console.log('\n🔄 Different Token Strategies:');
    console.log('===============================');
    
    const user = users[0]; // John Doe
    
    console.log('Short-lived token (15 minutes):');
    const shortToken = generateShortLivedToken(user);
    analyzeToken(shortToken);
    
    console.log('\nLong-lived token (30 days):');
    const longToken = generateLongLivedToken(user);
    analyzeToken(longToken);
    
    console.log('\nToken with custom claims:');
    const customToken = generateTokenWithCustomClaims(user);
    analyzeToken(customToken);
  }
}

// ========================================
// 9. KEY TAKEAWAYS & BEST PRACTICES
// ========================================

console.log('\n9️⃣ Key Takeaways & Best Practices');
console.log('===================================');

console.log('🎯 What you learned:');
console.log('   1. JWT generation replaces session creation');
console.log('   2. Include user info in payload (not secrets!)');
console.log('   3. Set appropriate expiration times');
console.log('   4. Use different tokens for different purposes');
console.log('   5. Always use strong secret keys');
console.log();

console.log('✅ Best Practices:');
console.log('   • Short-lived access tokens (15m-1h)');
console.log('   • Longer refresh tokens (7d-30d)');
console.log('   • Include user ID, email, and role');
console.log('   • Never include passwords or sensitive data');
console.log('   • Use environment variables for secrets');
console.log('   • Set issuer and audience for validation');
console.log();

console.log('⚠️  Security Tips:');
console.log('   • Tokens are like keys - protect them!');
console.log('   • Use HTTPS to prevent token interception');
console.log('   • Validate tokens on every protected request');
console.log('   • Implement token refresh for better UX');
console.log('   • Consider token blacklisting for logout');
console.log();

console.log('🚀 Next steps:');
console.log('   Run: node examples/3-token-verification.js');
console.log('   Learn how to verify tokens in middleware!');

// Run the examples
runExamples(); 