/**
 * Protected Routes with JWT - Real Express.js Implementation
 * 
 * This example teaches you:
 * 1. How to set up real Express.js routes with JWT protection
 * 2. Using authentication middleware in practice
 * 3. Role-based route protection
 * 4. Error handling for different scenarios
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

console.log('🛡️ PROTECTED ROUTES - Real Express.js with JWT\n');

// ========================================
// 1. SETUP EXPRESS APP AND CONFIGURATION
// ========================================

const app = express();
app.use(express.json());

// JWT Configuration (normally from .env)
const JWT_CONFIG = {
  secret: 'your-super-secret-jwt-key-change-in-production',
  expiresIn: '1h',
  issuer: 'my-app'
};

// Mock user database
const users = [
  {
    id: 1,
    email: 'john@example.com',
    hashedPassword: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHDI1mKWENUaW8mG', // 'password123'
    role: 'user',
    name: 'John Doe',
    department: 'Engineering'
  },
  {
    id: 2,
    email: 'admin@example.com',
    hashedPassword: '$2b$12$92y9vRQ8eO9dP.wR3S5XqejfOuC/Ov/mJ19fzN8p2eBBBzEJOGbhe', // 'admin123'
    role: 'admin',
    name: 'Admin User',
    department: 'IT'
  },
  {
    id: 3,
    email: 'manager@example.com',
    hashedPassword: '$2b$12$K8BZyR5qWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHDI1mKWENUaW8mG', // 'manager123'
    role: 'manager',
    name: 'Manager User',
    department: 'Operations'
  }
];

console.log('🏗️ Express app configured with mock users:');
users.forEach(user => {
  console.log(`   ${user.role}: ${user.email} (${user.name})`);
});
console.log();

// ========================================
// 2. AUTHENTICATION MIDDLEWARE
// ========================================

console.log('2️⃣ Setting up Authentication Middleware');
console.log('=========================================');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided. Please login first.'
    });
  }

  jwt.verify(token, JWT_CONFIG.secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again.'
        });
      }
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is invalid or malformed.'
      });
    }

    req.user = user;
    next();
  });
}

// ========================================
// 3. ROLE-BASED AUTHORIZATION MIDDLEWARE
// ========================================

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires ${role} role. You have ${req.user.role} role.`
      });
    }
    next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires one of: ${roles.join(', ')}. You have ${req.user.role} role.`
      });
    }
    next();
  };
}

console.log('✅ Middleware functions created');
console.log('   - authenticateToken: Verifies JWT and adds user to req');
console.log('   - requireRole: Checks for specific role');
console.log('   - requireAnyRole: Checks for any of multiple roles\n');

// ========================================
// 4. PUBLIC ROUTES (NO AUTHENTICATION)
// ========================================

console.log('3️⃣ Setting up Public Routes');
console.log('============================');

// Login route - generates JWT token
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Generate token
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn, issuer: JWT_CONFIG.issuer }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Public info route
app.get('/api/public/info', (req, res) => {
  res.json({
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

console.log('✅ Public routes configured:');
console.log('   POST /auth/login - Generate JWT token');
console.log('   GET /api/public/info - Public information\n');

// ========================================
// 5. PROTECTED ROUTES (REQUIRE AUTHENTICATION)
// ========================================

console.log('4️⃣ Setting up Protected Routes');
console.log('===============================');

// Profile route - any authenticated user
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile data retrieved successfully',
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    },
    requestTime: new Date().toISOString()
  });
});

// Dashboard - any authenticated user
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Dashboard data',
    user: req.user.name,
    data: {
      notifications: 3,
      messages: 12,
      tasks: 8
    }
  });
});

console.log('✅ Basic protected routes:');
console.log('   GET /api/profile - User profile (any authenticated user)');
console.log('   GET /api/dashboard - Dashboard data (any authenticated user)\n');

// ========================================
// 6. ROLE-BASED PROTECTED ROUTES
// ========================================

console.log('5️⃣ Setting up Role-Based Routes');
console.log('================================');

// Admin only routes
app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    message: 'All users data (admin only)',
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department
    }))
  });
});

app.post('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    message: 'User creation endpoint (admin only)',
    note: 'In real app, this would create a new user',
    requestedBy: req.user.name
  });
});

// Manager or Admin routes
app.get('/api/reports', authenticateToken, requireAnyRole(['admin', 'manager']), (req, res) => {
  res.json({
    message: 'Reports data (admin or manager only)',
    reports: [
      { id: 1, title: 'Monthly Sales', type: 'sales' },
      { id: 2, title: 'User Activity', type: 'analytics' },
      { id: 3, title: 'System Performance', type: 'technical' }
    ],
    accessLevel: req.user.role
  });
});

// User's own data (users can only access their own data)
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const requestedId = parseInt(req.params.id);
  const isAdmin = req.user.role === 'admin';
  const isOwnData = req.user.sub === requestedId;

  if (!isAdmin && !isOwnData) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own user data'
    });
  }

  const user = users.find(u => u.id === requestedId);
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'No user found with that ID'
    });
  }

  res.json({
    message: 'User data retrieved',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    },
    accessReason: isAdmin ? 'admin access' : 'own data'
  });
});

console.log('✅ Role-based protected routes:');
console.log('   GET /api/admin/users - All users (admin only)');
console.log('   POST /api/admin/users - Create user (admin only)');
console.log('   GET /api/reports - Reports (admin or manager)');
console.log('   GET /api/users/:id - User data (own data or admin)\n');

// ========================================
// 7. ERROR HANDLING MIDDLEWARE
// ========================================

app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ========================================
// 8. TESTING THE ROUTES
// ========================================

console.log('6️⃣ Testing the Protected Routes');
console.log('================================');

async function testRoutes() {
  // First, let's "login" to get a token
  console.log('🔐 Step 1: Login to get JWT token');
  
  // Simulate login request
  const loginData = {
    email: 'john@example.com',
    password: 'password123'
  };

  // Generate token manually for testing
  const testToken = jwt.sign(
    {
      sub: 1,
      email: 'john@example.com',
      role: 'user',
      name: 'John Doe'
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn, issuer: JWT_CONFIG.issuer }
  );

  console.log('✅ Login successful! Token generated.');
  console.log(`   Token preview: ${testToken.substring(0, 30)}...\n`);

  // Test different route types
  console.log('🧪 Step 2: Testing different route access levels');
  console.log();

  // Mock request function for testing
  function mockRequest(path, token = null, userId = null) {
    const req = {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      params: userId ? { id: userId } : {},
      user: null
    };
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`   ${path}: ${code} ${code < 400 ? '✅' : '❌'}`);
          if (code >= 400) {
            console.log(`     Error: ${data.message}`);
          } else {
            console.log(`     Success: ${data.message}`);
          }
        }
      }),
      json: (data) => {
        console.log(`   ${path}: 200 ✅`);
        console.log(`     Success: ${data.message}`);
      }
    };

    return { req, res };
  }

  // Test public route (no token needed)
  console.log('📂 Testing public routes:');
  const { req: pubReq, res: pubRes } = mockRequest('/api/public/info');
  pubRes.json({
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString()
  });

  // Test protected route with valid token
  console.log('\n🔒 Testing protected routes with valid token:');
  const { req: profReq, res: profRes } = mockRequest('/api/profile', testToken);
  
  // Simulate middleware execution
  authenticateToken(profReq, profRes, () => {
    profRes.json({
      message: 'Profile data retrieved successfully',
      user: profReq.user
    });
  });

  // Test admin route with user token (should fail)
  console.log('\n🚫 Testing admin route with user token (should fail):');
  const { req: adminReq, res: adminRes } = mockRequest('/api/admin/users', testToken);
  
  authenticateToken(adminReq, adminRes, () => {
    requireRole('admin')(adminReq, adminRes, () => {
      adminRes.json({ message: 'Admin data' });
    });
  });

  console.log('\n💡 Key Takeaways:');
  console.log('==================');
  console.log('✅ Public routes work without authentication');
  console.log('✅ Protected routes require valid JWT token');
  console.log('✅ Role-based routes check user permissions');
  console.log('✅ Middleware handles authentication automatically');
  console.log('✅ Different HTTP status codes for different error types');
  console.log();

  console.log('🚀 Next Steps:');
  console.log('===============');
  console.log('1. Run this server: node examples/4-protected-routes.js');
  console.log('2. Test with curl or Postman:');
  console.log('   curl http://localhost:3000/api/public/info');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/profile');
  console.log('3. Try the next example: node examples/5-refresh-tokens.js');
}

// Run the tests
testRoutes();

// ========================================
// 9. START THE SERVER (OPTIONAL)
// ========================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log('\nTry these commands:');
    console.log('curl http://localhost:3000/api/public/info');
    console.log('curl -X POST http://localhost:3000/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"john@example.com","password":"password123"}\'');
    console.log('\n(Copy the token from login response and use it in Authorization header)');
  });
}

module.exports = app; 