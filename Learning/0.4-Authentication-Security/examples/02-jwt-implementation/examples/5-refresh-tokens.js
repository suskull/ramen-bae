/**
 * Refresh Tokens - Advanced JWT Session Management
 * 
 * This example teaches you:
 * 1. Understanding access vs refresh tokens
 * 2. Implementing token refresh mechanism
 * 3. Secure token storage practices
 * 4. Handling token expiration gracefully
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

console.log('🔄 REFRESH TOKENS - Advanced JWT Session Management\n');

// ========================================
// 1. UNDERSTANDING ACCESS VS REFRESH TOKENS
// ========================================

console.log('1️⃣ Understanding Token Types');
console.log('============================');

console.log('🎫 ACCESS TOKENS:');
console.log('   - Short-lived (15 minutes - 1 hour)');
console.log('   - Used for API requests');
console.log('   - Contains user permissions');
console.log('   - Stored in memory (most secure)');
console.log();

console.log('🔄 REFRESH TOKENS:');
console.log('   - Long-lived (days to weeks)');
console.log('   - Used only to get new access tokens');
console.log('   - Contains minimal data');
console.log('   - Stored securely (httpOnly cookies preferred)');
console.log('   - Can be revoked/blacklisted');
console.log();

// ========================================
// 2. TOKEN CONFIGURATION
// ========================================

const TOKEN_CONFIG = {
  access: {
    secret: 'access-token-secret-change-in-production',
    expiresIn: '15m',  // Short-lived
    algorithm: 'HS256'
  },
  refresh: {
    secret: 'refresh-token-secret-different-from-access',
    expiresIn: '7d',   // Long-lived
    algorithm: 'HS256'
  },
  issuer: 'jwt-refresh-example'
};

// Mock user database
const users = [
  {
    id: 1,
    email: 'john@example.com',
    hashedPassword: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHDI1mKWENUaW8mG', // 'password123'
    name: 'John Doe',
    role: 'user'
  },
  {
    id: 2,
    email: 'admin@example.com',
    hashedPassword: '$2b$12$92y9vRQ8eO9dP.wR3S5XqejfOuC/Ov/mJ19fzN8p2eBBBzEJOGbhe', // 'admin123'
    name: 'Admin User',
    role: 'admin'
  }
];

// In-memory refresh token storage (in production: use database)
const refreshTokenStore = new Map();

console.log('⚙️ Token configuration:');
console.log(`   Access token expires: ${TOKEN_CONFIG.access.expiresIn}`);
console.log(`   Refresh token expires: ${TOKEN_CONFIG.refresh.expiresIn}`);
console.log();

// ========================================
// 3. TOKEN GENERATION FUNCTIONS
// ========================================

console.log('2️⃣ Token Generation Functions');
console.log('==============================');

function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(payload, TOKEN_CONFIG.access.secret, {
    expiresIn: TOKEN_CONFIG.access.expiresIn,
    issuer: TOKEN_CONFIG.issuer,
    algorithm: TOKEN_CONFIG.access.algorithm
  });
}

function generateRefreshToken(user) {
  const payload = {
    sub: user.id,
    type: 'refresh',
    jti: crypto.randomUUID() // Unique token ID for revocation
  };

  const token = jwt.sign(payload, TOKEN_CONFIG.refresh.secret, {
    expiresIn: TOKEN_CONFIG.refresh.expiresIn,
    issuer: TOKEN_CONFIG.issuer,
    algorithm: TOKEN_CONFIG.refresh.algorithm
  });

  // Store refresh token (in production: save to database)
  refreshTokenStore.set(payload.jti, {
    userId: user.id,
    token,
    createdAt: new Date(),
    isRevoked: false
  });

  return { token, jti: payload.jti };
}

function generateTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken: refreshToken.token,
    refreshTokenId: refreshToken.jti,
    tokenType: 'Bearer',
    expiresIn: TOKEN_CONFIG.access.expiresIn
  };
}

console.log('✅ Token generation functions created:');
console.log('   - generateAccessToken: Creates short-lived access token');
console.log('   - generateRefreshToken: Creates long-lived refresh token');
console.log('   - generateTokenPair: Creates both tokens together\n');

// ========================================
// 4. TOKEN VERIFICATION FUNCTIONS
// ========================================

console.log('3️⃣ Token Verification Functions');
console.log('=================================');

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG.access.secret, {
      issuer: TOKEN_CONFIG.issuer
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return { valid: true, decoded, error: null };
  } catch (error) {
    return { valid: false, decoded: null, error: error.message };
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG.refresh.secret, {
      issuer: TOKEN_CONFIG.issuer
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if token is revoked
    const tokenRecord = refreshTokenStore.get(decoded.jti);
    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new Error('Token has been revoked');
    }

    return { valid: true, decoded, error: null };
  } catch (error) {
    return { valid: false, decoded: null, error: error.message };
  }
}

console.log('✅ Token verification functions created:');
console.log('   - verifyAccessToken: Validates access tokens');
console.log('   - verifyRefreshToken: Validates refresh tokens + revocation\n');

// ========================================
// 5. AUTHENTICATION FLOW WITH REFRESH
// ========================================

console.log('4️⃣ Complete Authentication Flow');
console.log('================================');

async function login(email, password) {
  console.log(`🔐 Login attempt for: ${email}`);

  // Find and authenticate user
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.log('   ❌ User not found');
    return { success: false, error: 'Invalid credentials' };
  }

  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
  if (!isValidPassword) {
    console.log('   ❌ Invalid password');
    return { success: false, error: 'Invalid credentials' };
  }

  // Generate token pair
  const tokens = generateTokenPair(user);
  
  console.log('   ✅ Login successful');
  console.log(`   Access token expires in: ${TOKEN_CONFIG.access.expiresIn}`);
  console.log(`   Refresh token expires in: ${TOKEN_CONFIG.refresh.expiresIn}`);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    tokens
  };
}

async function refreshAccessToken(refreshToken) {
  console.log('🔄 Attempting to refresh access token');

  // Verify refresh token
  const verification = verifyRefreshToken(refreshToken);
  if (!verification.valid) {
    console.log(`   ❌ Refresh token invalid: ${verification.error}`);
    return { success: false, error: 'Invalid refresh token' };
  }

  // Get user data
  const user = users.find(u => u.id === verification.decoded.sub);
  if (!user) {
    console.log('   ❌ User not found');
    return { success: false, error: 'User not found' };
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);
  
  console.log('   ✅ New access token generated');
  console.log(`   Valid for: ${TOKEN_CONFIG.access.expiresIn}`);

  return {
    success: true,
    accessToken: newAccessToken,
    tokenType: 'Bearer',
    expiresIn: TOKEN_CONFIG.access.expiresIn
  };
}

function logout(refreshToken) {
  console.log('🚪 Logging out user');

  if (!refreshToken) {
    console.log('   ⚠️ No refresh token provided - logout completed');
    return { success: true, message: 'Logged out' };
  }

  // Verify and revoke refresh token
  const verification = verifyRefreshToken(refreshToken);
  if (verification.valid) {
    const tokenRecord = refreshTokenStore.get(verification.decoded.jti);
    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      console.log('   ✅ Refresh token revoked');
    }
  } else {
    console.log('   ⚠️ Refresh token was already invalid');
  }

  return { success: true, message: 'Logged out successfully' };
}

console.log('✅ Authentication flow functions created:');
console.log('   - login: Full authentication with token pair');
console.log('   - refreshAccessToken: Get new access token');
console.log('   - logout: Revoke refresh token\n');

// ========================================
// 6. MIDDLEWARE FOR AUTOMATIC REFRESH
// ========================================

console.log('5️⃣ Advanced Middleware');
console.log('=======================');

function createAuthMiddleware() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const verification = verifyAccessToken(token);
    
    if (verification.valid) {
      req.user = verification.decoded;
      return next();
    }

    // Check if token is expired
    if (verification.error.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please refresh your access token'
      });
    }

    // Token is invalid for other reasons
    return res.status(403).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  };
}

console.log('✅ Middleware created with specific error codes:');
console.log('   - NO_TOKEN: No authorization header');
console.log('   - TOKEN_EXPIRED: Access token expired (client should refresh)');
console.log('   - INVALID_TOKEN: Token is malformed or invalid\n');

// ========================================
// 7. TESTING THE REFRESH FLOW
// ========================================

console.log('6️⃣ Testing Refresh Token Flow');
console.log('==============================');

async function demonstrateRefreshFlow() {
  console.log('🧪 Step 1: Login to get initial tokens');
  
  // Step 1: Login
  const loginResult = await login('john@example.com', 'password123');
  if (!loginResult.success) {
    console.log('Login failed:', loginResult.error);
    return;
  }

  const { accessToken, refreshToken } = loginResult.tokens;
  console.log('   ✅ Login successful');
  console.log(`   Access token: ${accessToken.substring(0, 30)}...`);
  console.log(`   Refresh token: ${refreshToken.substring(0, 30)}...\n`);

  // Step 2: Use access token
  console.log('🧪 Step 2: Using access token for API request');
  const accessVerification = verifyAccessToken(accessToken);
  if (accessVerification.valid) {
    console.log('   ✅ Access token is valid');
    console.log(`   User: ${accessVerification.decoded.name} (${accessVerification.decoded.role})\n`);
  }

  // Step 3: Simulate token expiration by creating expired token
  console.log('🧪 Step 3: Simulating expired access token');
  const expiredToken = jwt.sign(
    { sub: 1, email: 'john@example.com', name: 'John Doe', role: 'user', type: 'access' },
    TOKEN_CONFIG.access.secret,
    { expiresIn: '0s', issuer: TOKEN_CONFIG.issuer }
  );

  // Wait a moment to ensure expiration
  setTimeout(() => {
    const expiredVerification = verifyAccessToken(expiredToken);
    console.log(`   ❌ Expired token verification: ${expiredVerification.error}\n`);

    // Step 4: Refresh the access token
    console.log('🧪 Step 4: Refreshing access token');
    refreshAccessToken(refreshToken).then(refreshResult => {
      if (refreshResult.success) {
        console.log('   ✅ Token refresh successful');
        console.log(`   New access token: ${refreshResult.accessToken.substring(0, 30)}...\n`);

        // Step 5: Use new access token
        console.log('🧪 Step 5: Using new access token');
        const newVerification = verifyAccessToken(refreshResult.accessToken);
        if (newVerification.valid) {
          console.log('   ✅ New access token is valid');
          console.log(`   User: ${newVerification.decoded.name}\n`);
        }

        // Step 6: Logout (revoke refresh token)
        console.log('🧪 Step 6: Logout and revoke refresh token');
        const logoutResult = logout(refreshToken);
        console.log(`   ✅ ${logoutResult.message}\n`);

        // Step 7: Try to use revoked refresh token
        console.log('🧪 Step 7: Attempting to use revoked refresh token');
        refreshAccessToken(refreshToken).then(failedRefresh => {
          if (!failedRefresh.success) {
            console.log(`   ❌ Refresh failed (expected): ${failedRefresh.error}\n`);
          }

          // Final summary
          printSummary();
        });
      }
    });
  }, 100);
}

function printSummary() {
  console.log('💡 Key Takeaways');
  console.log('=================');
  console.log('✅ Access tokens are short-lived for security');
  console.log('✅ Refresh tokens allow seamless token renewal');
  console.log('✅ Refresh tokens can be revoked for security');
  console.log('✅ Different secrets for access and refresh tokens');
  console.log('✅ Proper error codes help client handle token states');
  console.log();

  console.log('🔒 Security Benefits');
  console.log('====================');
  console.log('✅ Reduced window of access token compromise');
  console.log('✅ Ability to revoke long-term access');
  console.log('✅ User stays logged in without re-entering credentials');
  console.log('✅ Server can track and manage sessions');
  console.log();

  console.log('🏭 Production Considerations');
  console.log('============================');
  console.log('⚠️  Store refresh tokens in secure httpOnly cookies');
  console.log('⚠️  Use database instead of in-memory storage');
  console.log('⚠️  Implement refresh token rotation');
  console.log('⚠️  Add rate limiting for refresh endpoint');
  console.log('⚠️  Monitor for suspicious refresh patterns');
  console.log('⚠️  Implement proper cleanup of expired tokens');
  console.log();

  console.log('🎯 Next Steps');
  console.log('==============');
  console.log('1. Implement refresh tokens in a real Express.js app');
  console.log('2. Add proper database storage for refresh tokens');
  console.log('3. Implement refresh token rotation');
  console.log('4. Add comprehensive logging and monitoring');
  console.log('5. Test token refresh in a frontend application');
  console.log();

  console.log('🚀 You\'ve completed the JWT learning path!');
  console.log('   Next: Move to advanced security topics');
}

// ========================================
// 8. CLIENT-SIDE REFRESH PATTERN EXAMPLE
// ========================================

console.log('7️⃣ Client-Side Integration Pattern');
console.log('===================================');

function demonstrateClientPattern() {
  console.log('📱 How clients should handle token refresh:');
  console.log();

  console.log('// JavaScript client example');
  console.log('class AuthClient {');
  console.log('  async makeRequest(url, options = {}) {');
  console.log('    let response = await fetch(url, {');
  console.log('      ...options,');
  console.log('      headers: {');
  console.log('        ...options.headers,');
  console.log('        Authorization: `Bearer ${this.accessToken}`');
  console.log('      }');
  console.log('    });');
  console.log('');
  console.log('    if (response.status === 401) {');
  console.log('      const errorData = await response.json();');
  console.log('      if (errorData.code === "TOKEN_EXPIRED") {');
  console.log('        // Try to refresh token');
  console.log('        const refreshed = await this.refreshAccessToken();');
  console.log('        if (refreshed) {');
  console.log('          // Retry original request');
  console.log('          return this.makeRequest(url, options);');
  console.log('        }');
  console.log('      }');
  console.log('      // Redirect to login');
  console.log('      window.location.href = "/login";');
  console.log('    }');
  console.log('');
  console.log('    return response;');
  console.log('  }');
  console.log('}');
  console.log();

  console.log('💡 Client best practices:');
  console.log('   ✅ Store access tokens in memory only');
  console.log('   ✅ Store refresh tokens in secure httpOnly cookies');
  console.log('   ✅ Automatically retry failed requests after refresh');
  console.log('   ✅ Handle refresh failures gracefully');
  console.log('   ✅ Implement token refresh before expiration\n');
}

demonstrateClientPattern();

// ========================================
// 9. RUN THE DEMONSTRATION
// ========================================

console.log('8️⃣ Running Complete Demonstration');
console.log('==================================');

// Start the demonstration
demonstrateRefreshFlow(); 