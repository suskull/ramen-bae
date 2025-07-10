# 🎫 JWT Deep Dive: Everything You Need to Know

## 🤔 What is JWT?

**JWT (JSON Web Token)** is a secure way to transmit information between parties as a JSON object. It's like a digital passport that contains user information and is signed to ensure it hasn't been tampered with.

### The Passport Analogy
Think of JWT like a passport:
- **Contains your information** (name, citizenship, photo)
- **Issued by trusted authority** (government)
- **Has security features** (special paper, stamps, signatures)
- **Self-contained** (doesn't need to check with issuer every time)
- **Has expiration date** (needs renewal)

## 🏗️ JWT Structure

A JWT consists of three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│──────────── HEADER ────────────│──────────── PAYLOAD ──────────────│──────── SIGNATURE ────────│
```

### 1. Header
Contains metadata about the token:

```json
{
  "alg": "HS256",  // Algorithm used for signing
  "typ": "JWT"     // Type of token
}
```

**Encoded**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### 2. Payload (Claims)
Contains the actual information:

```json
{
  "sub": "1234567890",        // Subject (user ID)
  "name": "John Doe",         // User name
  "email": "john@example.com", // User email
  "role": "admin",            // User role
  "iat": 1516239022,          // Issued at (timestamp)
  "exp": 1516325422           // Expires at (timestamp)
}
```

**Encoded**: `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

### 3. Signature
Ensures the token hasn't been tampered with:

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Result**: `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

## 🔐 How JWT Signing Works

### The Process

```javascript
// 1. Create Header
const header = {
  alg: "HS256",
  typ: "JWT"
};

// 2. Create Payload
const payload = {
  sub: "12345",
  name: "John Doe",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

// 3. Encode Header and Payload
const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));

// 4. Create Signature
const signature = HMACSHA256(
  encodedHeader + "." + encodedPayload,
  "your-secret-key"
);

// 5. Combine All Parts
const jwt = encodedHeader + "." + encodedPayload + "." + signature;
```

### Why Signing Matters

```javascript
// Original token
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOiJ1c2VyIn0.signature"

// If attacker changes payload:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOiJhZG1pbiJ9.signature"
//                                                                                     ^^^^^ Changed "user" to "admin"

// ❌ Signature verification FAILS because:
// - Server computes signature of new payload
// - Doesn't match original signature
// - Token is rejected!
```

## 🎭 JWT Claims (Payload Data)

### Standard Claims (Recommended)
```json
{
  "iss": "https://your-app.com",     // Issuer
  "sub": "user123",                  // Subject (user ID)
  "aud": "mobile-app",               // Audience
  "exp": 1234567890,                 // Expiration time
  "iat": 1234567800,                 // Issued at
  "nbf": 1234567800,                 // Not before
  "jti": "token-uuid-123"            // JWT ID (unique)
}
```

### Custom Claims (Your Data)
```json
{
  "user_id": 123,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "subscription": "premium",
  "last_login": "2024-01-15T10:00:00Z"
}
```

### ⚠️ Security Warning
**JWT payload is NOT encrypted - it's only encoded!**

```javascript
// Anyone can decode and read the payload:
const payload = atob("eyJzdWIiOiIxMjM0NSIsInNlY3JldCI6Im15X3Bhc3N3b3JkIn0");
console.log(payload); // {"sub":"12345","secret":"my_password"}

// 🚫 NEVER put secrets in JWT payload:
// - Passwords
// - API keys
// - Credit card numbers
// - Social security numbers
```

## 🔄 JWT Lifecycle

### 1. Token Generation (Login)
```javascript
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Verify credentials
  const user = await User.findOne({ email });
  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
  
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 2. Generate JWT
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // 3. Send token to client
  res.json({ token, user: { id: user.id, email: user.email } });
});
```

### 2. Token Usage (Protected Routes)
```javascript
// Client sends token in Authorization header
const response = await fetch('/api/profile', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### 3. Token Verification (Middleware)
```javascript
const authenticateToken = (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  // 2. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // 3. Add user info to request
    req.user = decoded;
    next();
  });
};

// Use middleware on protected routes
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}!` });
});
```

## ⏰ Token Expiration & Refresh

### Why Tokens Expire
- **Security**: Limits damage if token is compromised
- **Revocation**: Forces periodic re-authentication
- **Fresh data**: Ensures user info is up to date

### Short-lived Access Tokens + Refresh Tokens
```javascript
// Login returns TWO tokens
{
  "accessToken": "eyJ...", // Short-lived (15 minutes)
  "refreshToken": "eyJ..." // Long-lived (7 days)
}

// When access token expires:
// 1. Client gets 401 error
// 2. Client sends refresh token to /refresh endpoint
// 3. Server validates refresh token
// 4. Server issues new access token
// 5. Client retries original request
```

### Implementation Example
```javascript
// Refresh endpoint
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  // Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { sub: decoded.sub, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken: newAccessToken });
  });
});
```

## 🆚 JWT vs Sessions Comparison

| Aspect | JWT | Sessions |
|--------|-----|----------|
| **Storage** | Client-side | Server-side |
| **Scalability** | High (stateless) | Low (requires shared storage) |
| **Revocation** | Hard (until expiry) | Easy (delete from server) |
| **Size** | Large (full user data) | Small (just session ID) |
| **Security** | Data visible (but signed) | Data hidden on server |
| **Mobile Apps** | Perfect | Problematic |
| **Cross-domain** | Easy | Complex |
| **Server load** | Low | High (session lookups) |

## 🔒 JWT Security Best Practices

### 1. Secret Management
```javascript
// ❌ DON'T: Weak secrets
const secret = "secret";
const secret = "123456";

// ✅ DO: Strong, random secrets
const secret = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6";

// ✅ DO: Use environment variables
const secret = process.env.JWT_SECRET;

// ✅ DO: Different secrets for different purposes
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
```

### 2. Appropriate Expiration Times
```javascript
// ✅ Good expiration times
const tokens = {
  accessToken: '15m',    // Short for security
  refreshToken: '7d',    // Longer for convenience
  passwordReset: '1h',   // Very short for security
  emailVerification: '24h' // Reasonable for user experience
};
```

### 3. Secure Transmission
```javascript
// ❌ DON'T: Send tokens over HTTP
// http://yoursite.com/login

// ✅ DO: Always use HTTPS
// https://yoursite.com/login

// ✅ DO: Secure headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

### 4. Input Validation
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // ✅ Validate header format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // ✅ Validate token presence
  if (!token || token.length === 0) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  // ✅ Verify and handle errors properly
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token' });
      }
      return res.status(500).json({ error: 'Token verification failed' });
    }
    
    req.user = decoded;
    next();
  });
};
```

## 🚨 Common JWT Vulnerabilities

### 1. Algorithm Confusion Attack
```javascript
// ❌ VULNERABLE: Accepts any algorithm
jwt.verify(token, secret); // Attacker can change alg to "none"

// ✅ SECURE: Specify allowed algorithms
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

### 2. Weak Secrets
```javascript
// ❌ Attacker can guess these secrets
const secrets = ["secret", "password", "123456", "jwt"];

// If attacker knows the secret, they can forge any token!

// ✅ Use cryptographically secure secrets
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
```

### 3. Information Disclosure
```javascript
// ❌ Sensitive data in payload
const payload = {
  sub: user.id,
  password: user.password,     // ❌ NEVER!
  creditCard: "1234-5678",     // ❌ NEVER!
  ssn: "123-45-6789"          // ❌ NEVER!
};

// ✅ Only non-sensitive data
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  iat: Math.floor(Date.now() / 1000)
};
```

## 🛠️ Practical Implementation

### Basic JWT Setup
```javascript
// Install dependencies
// npm install jsonwebtoken bcrypt express

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Mock user database
const users = [];

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Save user
  const user = { id: users.length + 1, email, hashedPassword };
  users.push(user);
  
  res.status(201).json({ message: 'User created', userId: user.id });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  res.json({ user: { id: user.id, email: user.email } });
});

// Middleware function (from earlier example)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 🔗 Next Steps

Now that you understand JWT:

1. **Practice**: Implement the example above
2. **Experiment**: Try the exercises in `../exercises/`
3. **Security**: Add token refresh mechanism
4. **Testing**: Use tools like [jwt.io](https://jwt.io) to decode tokens
5. **Production**: Learn about token blacklisting for logout

Remember: **JWT is a powerful tool, but with great power comes great responsibility!** Always prioritize security over convenience. 