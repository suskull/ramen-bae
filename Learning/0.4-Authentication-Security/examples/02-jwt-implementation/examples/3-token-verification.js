/**
 * JWT Token Verification - Protecting Routes with Middleware
 * 
 * This example teaches you:
 * 1. How to verify JWT tokens
 * 2. Creating authentication middleware
 * 3. Protecting API routes
 * 4. Handling token errors gracefully
 */

const jwt = require('jsonwebtoken');

console.log('🛡️ JWT TOKEN VERIFICATION - Protecting Routes\n');

// ========================================
// 1. UNDERSTANDING TOKEN VERIFICATION
// ========================================

console.log('1️⃣ Understanding Token Verification');
console.log('====================================');

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Sample token from previous example (you'd get this from login)
const sampleToken = jwt.sign(
  {
    sub: 1,
    email: 'john@example.com',
    role: 'user',
    name: 'John Doe'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('📱 Sample token (what client sends):');
console.log(sampleToken.substring(0, 50) + '...\n');

// ========================================
// 2. BASIC TOKEN VERIFICATION
// ========================================

console.log('2️⃣ Basic Token Verification');
console.log('============================');

function verifyToken(token) {
  try {
    console.log('🔍 Verifying token...');
    
    // This is the core verification process
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token is valid!');
    console.log('📋 Decoded user data:');
    console.log(`   User ID: ${decoded.sub}`);
    console.log(`   Email: ${decoded.email}`);
    console.log(`   Role: ${decoded.role}`);
    console.log(`   Name: ${decoded.name}`);
    
    return { success: true, user: decoded };
    
  } catch (error) {
    console.log('❌ Token verification failed!');
    console.log(`   Error: ${error.message}`);
    
    // Different types of errors
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token has expired' };
    } else if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token' };
    } else {
      return { success: false, error: 'Token verification failed' };
    }
  }
}

// Test basic verification
console.log('🧪 Testing valid token:');
verifyToken(sampleToken);
console.log();

console.log('🧪 Testing invalid token:');
verifyToken('invalid.token.here');
console.log();

// ========================================
// 3. CREATING AUTHENTICATION MIDDLEWARE
// ========================================

console.log('3️⃣ Creating Authentication Middleware');
console.log('======================================');

function createAuthMiddleware() {
  return function authenticateToken(req, res, next) {
    console.log('🔐 Authentication middleware triggered');
    
    // Step 1: Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log(`   Authorization header: ${authHeader || 'Not provided'}`);
    
    if (!authHeader) {
      console.log('   ❌ No authorization header found');
      return res.status(401).json({
        error: 'Authorization header required',
        message: 'Please provide a valid token'
      });
    }
    
    // Step 2: Check header format (should be "Bearer TOKEN")
    const headerParts = authHeader.split(' ');
    if (headerParts.length !== 2 || headerParts[0] !== 'Bearer') {
      console.log('   ❌ Invalid authorization header format');
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Header should be: Authorization: Bearer <token>'
      });
    }
    
    const token = headerParts[1];
    console.log(`   Token extracted: ${token.substring(0, 20)}...`);
    
    // Step 3: Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`   ✅ Token verified for user: ${decoded.email}`);
      
      // Step 4: Add user info to request object
      req.user = decoded;
      req.token = token; // Sometimes useful to have the raw token
      
      // Step 5: Continue to the next middleware/route handler
      next();
      
    } catch (error) {
      console.log(`   ❌ Token verification failed: ${error.message}`);
      
      // Handle different error types
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please login again'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({
          error: 'Invalid token',
          message: 'Token is malformed or invalid'
        });
      } else {
        return res.status(500).json({
          error: 'Authentication error',
          message: 'Could not verify token'
        });
      }
    }
  };
}

// ========================================
// 4. ROLE-BASED AUTHORIZATION MIDDLEWARE
// ========================================

console.log('4️⃣ Role-Based Authorization');
console.log('============================');

function requireRole(requiredRole) {
  return function(req, res, next) {
    console.log(`🔑 Checking role requirement: ${requiredRole}`);
    
    // This middleware should run AFTER authentication middleware
    if (!req.user) {
      console.log('   ❌ No user in request - authentication middleware missing?');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'This endpoint requires authentication'
      });
    }
    
    const userRole = req.user.role;
    console.log(`   User role: ${userRole}`);
    
    if (userRole !== requiredRole) {
      console.log(`   ❌ Access denied: required ${requiredRole}, got ${userRole}`);
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires ${requiredRole} role`
      });
    }
    
    console.log('   ✅ Role check passed');
    next();
  };
}

// ========================================
// 5. SIMULATING EXPRESS.JS ROUTES
// ========================================

console.log('5️⃣ Simulating Protected Routes');
console.log('===============================');

// Mock Express.js request/response objects for demonstration
function createMockRequest(headers = {}) {
  return {
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };
}

function createMockResponse() {
  const res = {
    statusCode: 200,
    data: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      console.log(`   📤 Response (${this.statusCode}):`, JSON.stringify(data, null, 2));
      return this;
    }
  };
  return res;
}

// Create middleware instances
const authenticateToken = createAuthMiddleware();
const requireAdmin = requireRole('admin');

// ========================================
// 6. TESTING PROTECTED ROUTES
// ========================================

console.log('6️⃣ Testing Protected Routes');
console.log('============================');

function testProtectedRoute(description, headers, shouldSucceed = true) {
  console.log(`🧪 Test: ${description}`);
  
  const req = createMockRequest(headers);
  const res = createMockResponse();
  let middlewarePassed = false;
  
  const next = () => {
    middlewarePassed = true;
    console.log('   ✅ Middleware passed - route handler would execute');
  };
  
  // Run the authentication middleware
  authenticateToken(req, res, next);
  
  if (!middlewarePassed && shouldSucceed) {
    console.log('   ❌ Test failed: Expected to pass but was blocked');
  } else if (middlewarePassed && !shouldSucceed) {
    console.log('   ❌ Test failed: Expected to be blocked but passed');
  } else {
    console.log(`   ✅ Test ${shouldSucceed ? 'passed' : 'correctly blocked'}`);
  }
  
  console.log();
  return middlewarePassed;
}

// Test 1: No authorization header
testProtectedRoute('No authorization header', {}, false);

// Test 2: Invalid header format
testProtectedRoute('Invalid header format', {
  authorization: 'InvalidFormat'
}, false);

// Test 3: Valid token
testProtectedRoute('Valid token', {
  authorization: `Bearer ${sampleToken}`
}, true);

// Test 4: Invalid token
testProtectedRoute('Invalid token', {
  authorization: 'Bearer invalid.token.here'
}, false);

// ========================================
// 7. TESTING ROLE-BASED ACCESS
// ========================================

console.log('7️⃣ Testing Role-Based Access');
console.log('=============================');

// Create tokens for different roles
const userToken = jwt.sign(
  { sub: 1, email: 'user@example.com', role: 'user', name: 'Regular User' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { sub: 2, email: 'admin@example.com', role: 'admin', name: 'Admin User' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function testRoleBasedAccess(description, token, requiredRole, shouldSucceed) {
  console.log(`🧪 Test: ${description}`);
  
  const req = createMockRequest({
    authorization: `Bearer ${token}`
  });
  const res = createMockResponse();
  let authPassed = false;
  let rolePassed = false;
  
  const nextAfterAuth = () => {
    authPassed = true;
    
    // Now test role requirement
    const roleMiddleware = requireRole(requiredRole);
    const nextAfterRole = () => {
      rolePassed = true;
      console.log('   ✅ Full access granted');
    };
    
    roleMiddleware(req, res, nextAfterRole);
  };
  
  authenticateToken(req, res, nextAfterAuth);
  
  if (authPassed && rolePassed && shouldSucceed) {
    console.log('   ✅ Test passed: Access granted as expected');
  } else if (!authPassed || (!rolePassed && shouldSucceed)) {
    console.log('   ❌ Test failed: Access denied when it should be granted');
  } else if (rolePassed && !shouldSucceed) {
    console.log('   ❌ Test failed: Access granted when it should be denied');
  } else {
    console.log('   ✅ Test passed: Access correctly denied');
  }
  
  console.log();
}

// Test role-based access
testRoleBasedAccess('User accessing user endpoint', userToken, 'user', true);
testRoleBasedAccess('Admin accessing admin endpoint', adminToken, 'admin', true);
testRoleBasedAccess('User accessing admin endpoint', userToken, 'admin', false);
testRoleBasedAccess('Admin accessing user endpoint', adminToken, 'user', false);

// ========================================
// 8. PRACTICAL MIDDLEWARE USAGE
// ========================================

console.log('8️⃣ Practical Middleware Usage');
console.log('==============================');

console.log('📝 How to use in real Express.js app:');
console.log(`
// Import middleware
const authenticateToken = createAuthMiddleware();
const requireAdmin = requireRole('admin');

// Public routes (no middleware)
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is public' });
});

// Protected routes (authentication required)
app.get('/api/profile', authenticateToken, (req, res) => {
  // req.user contains decoded token data
  res.json({ 
    message: 'Your profile',
    user: req.user 
  });
});

// Admin-only routes (authentication + role check)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  // Only admins can access this
  res.json({ message: 'Admin endpoint', users: [] });
});

// Multiple role checks
app.get('/api/dashboard', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    res.json({ message: 'Admin dashboard' });
  } else if (req.user.role === 'user') {
    res.json({ message: 'User dashboard' });
  } else {
    res.status(403).json({ error: 'Unknown role' });
  }
});
`);

// ========================================
// 9. ERROR HANDLING BEST PRACTICES
// ========================================

console.log('9️⃣ Error Handling Best Practices');
console.log('==================================');

console.log('🎯 Key principles:');
console.log('   1. Always validate the Authorization header');
console.log('   2. Check token format before verification');
console.log('   3. Handle different JWT error types specifically');
console.log('   4. Provide helpful error messages');
console.log('   5. Use appropriate HTTP status codes');
console.log();

console.log('📊 HTTP Status Codes:');
console.log('   401 Unauthorized: Missing or invalid token');
console.log('   403 Forbidden: Valid token but insufficient permissions');
console.log('   500 Internal Server Error: Unexpected verification error');
console.log();

console.log('🔒 Security considerations:');
console.log('   • Don\'t reveal too much in error messages');
console.log('   • Log authentication failures for monitoring');
console.log('   • Rate limit authentication attempts');
console.log('   • Use HTTPS to protect tokens in transit');
console.log();

console.log('🚀 Next steps:');
console.log('   Run: node examples/4-protected-routes.js');
console.log('   See middleware in action with Express.js!'); 