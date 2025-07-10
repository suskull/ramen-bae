# 🛡️ Authentication Security Checklist

## 🎯 Overview

This checklist helps you build secure authentication systems by covering the most critical security aspects. Use it during development and before deployment to ensure you haven't missed important security measures.

## ✅ Password Security

### Password Storage
- [ ] **Never store passwords in plain text**
  ```javascript
  // ❌ NEVER DO THIS
  const user = { email: "user@example.com", password: "plaintext123" };
  
  // ✅ DO THIS
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = { email: "user@example.com", hashedPassword };
  ```

- [ ] **Use bcrypt with sufficient rounds (minimum 10, recommended 12+)**
  ```javascript
  // ❌ Too weak
  const hash = await bcrypt.hash(password, 8);
  
  // ✅ Good security
  const hash = await bcrypt.hash(password, 12);
  ```

- [ ] **Never log passwords**
  ```javascript
  // ❌ Password might end up in logs
  console.log('Login attempt:', req.body);
  
  // ✅ Log without sensitive data
  console.log('Login attempt for:', req.body.email);
  ```

### Password Requirements
- [ ] **Minimum length of 8 characters**
- [ ] **Require mix of character types (optional but recommended)**
- [ ] **Block common passwords ("password", "123456", etc.)**
- [ ] **Don't allow passwords that contain user's email/name**

```javascript
const passwordRules = {
  minLength: 8,
  maxLength: 128, // Prevent DoS attacks
  requireMix: true, // uppercase, lowercase, numbers, symbols
  blockCommon: true,
  blockUserInfo: true
};
```

## 🔐 JWT Token Security

### Secret Management
- [ ] **Use cryptographically secure secrets (minimum 32 characters)**
  ```bash
  # Generate secure secret
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **Store secrets in environment variables, never in code**
  ```javascript
  // ❌ NEVER IN CODE
  const secret = "mysecret123";
  
  // ✅ ENVIRONMENT VARIABLE
  const secret = process.env.JWT_SECRET;
  ```

- [ ] **Use different secrets for different token types**
  ```bash
  JWT_ACCESS_SECRET=access_secret_here
  JWT_REFRESH_SECRET=refresh_secret_here
  JWT_RESET_SECRET=reset_secret_here
  ```

### Token Configuration
- [ ] **Set appropriate expiration times**
  ```javascript
  const expirationTimes = {
    accessToken: '15m',    // Short for security
    refreshToken: '7d',    // Reasonable for UX
    resetToken: '1h',      // Very short for security
    verifyToken: '24h'     // Reasonable for email verification
  };
  ```

- [ ] **Specify allowed algorithms explicitly**
  ```javascript
  // ❌ Vulnerable to algorithm confusion
  jwt.verify(token, secret);
  
  // ✅ Secure
  jwt.verify(token, secret, { algorithms: ['HS256'] });
  ```

- [ ] **Never put sensitive data in JWT payload**
  ```javascript
  // ❌ NEVER
  const payload = { 
    userId: 123, 
    password: "secret",
    creditCard: "1234-5678-9012-3456"
  };
  
  // ✅ SAFE
  const payload = { 
    sub: 123, 
    email: "user@example.com",
    role: "user"
  };
  ```

## 🌐 HTTP Security

### HTTPS Configuration
- [ ] **Always use HTTPS in production**
- [ ] **Redirect HTTP to HTTPS automatically**
- [ ] **Set Strict-Transport-Security header**
  ```javascript
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  ```

### Security Headers
- [ ] **Implement security headers with helmet.js**
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

- [ ] **Configure CORS properly**
  ```javascript
  const cors = require('cors');
  app.use(cors({
    origin: ['https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

- [ ] **Set secure cookie attributes**
  ```javascript
  // For session cookies
  app.use(session({
    cookie: {
      secure: true,     // HTTPS only
      httpOnly: true,   // No client-side access
      sameSite: 'strict' // CSRF protection
    }
  }));
  ```

## 🚫 Attack Prevention

### Rate Limiting
- [ ] **Implement rate limiting on authentication endpoints**
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.post('/login', authLimiter, loginHandler);
  ```

- [ ] **Implement progressive delays for failed attempts**
  ```javascript
  const failedAttempts = new Map();
  
  const getDelay = (attempts) => {
    return Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds
  };
  ```

### Input Validation
- [ ] **Validate all input data**
  ```javascript
  const { body, validationResult } = require('express-validator');
  
  const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 128 }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  
  app.post('/login', validateLogin, loginHandler);
  ```

- [ ] **Sanitize input to prevent injection attacks**
- [ ] **Use parameterized queries for database operations**
  ```javascript
  // ❌ SQL Injection vulnerable
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  
  // ✅ Safe parameterized query
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email]);
  ```

### CSRF Protection
- [ ] **Implement CSRF tokens for state-changing operations**
  ```javascript
  const csrf = require('csurf');
  app.use(csrf({ cookie: true }));
  ```

- [ ] **Use SameSite cookie attribute**
- [ ] **Verify Origin/Referer headers for sensitive operations**

## 🔍 Error Handling & Logging

### Secure Error Messages
- [ ] **Don't reveal sensitive information in error messages**
  ```javascript
  // ❌ Reveals too much information
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  // ✅ Generic message for both cases
  if (!user || !isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  ```

- [ ] **Log security events without exposing sensitive data**
  ```javascript
  // ✅ Good logging
  logger.warn('Failed login attempt', {
    email: req.body.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // ❌ Never log passwords
  logger.warn('Failed login', req.body); // Contains password!
  ```

### Monitoring & Alerting
- [ ] **Monitor for suspicious activity patterns**
- [ ] **Alert on multiple failed login attempts**
- [ ] **Track login patterns (unusual locations, times)**
- [ ] **Monitor for token abuse (same token from multiple IPs)**

## 🔄 Session Management

### Token Lifecycle
- [ ] **Implement token refresh mechanism**
  ```javascript
  // Short-lived access token + long-lived refresh token
  const tokens = {
    accessToken: jwt.sign(payload, accessSecret, { expiresIn: '15m' }),
    refreshToken: jwt.sign(payload, refreshSecret, { expiresIn: '7d' })
  };
  ```

- [ ] **Invalidate tokens on logout**
  ```javascript
  // Token blacklist for critical applications
  const blacklistedTokens = new Set();
  
  app.post('/logout', authenticateToken, (req, res) => {
    blacklistedTokens.add(req.token);
    res.json({ message: 'Logged out successfully' });
  });
  ```

- [ ] **Rotate refresh tokens on use**
- [ ] **Implement token cleanup for expired tokens**

### Account Security
- [ ] **Lock accounts after multiple failed attempts**
- [ ] **Implement account unlock mechanism (email/admin)**
- [ ] **Require email verification for new accounts**
- [ ] **Implement secure password reset flow**

## 🧪 Testing & Validation

### Security Testing
- [ ] **Test authentication with invalid credentials**
- [ ] **Test token tampering resistance**
  ```javascript
  // Test with modified tokens
  const tampered = validToken.slice(0, -10) + 'tampered123';
  // Should be rejected
  ```

- [ ] **Test rate limiting effectiveness**
- [ ] **Verify HTTPS enforcement**
- [ ] **Test CORS configuration**

### Penetration Testing
- [ ] **SQL injection testing on auth endpoints**
- [ ] **XSS testing on auth forms**
- [ ] **CSRF testing on protected operations**
- [ ] **Session hijacking resistance**
- [ ] **Brute force attack resistance**

## 📱 Additional Security Measures

### Two-Factor Authentication (Optional)
- [ ] **Implement TOTP (Time-based One-Time Passwords)**
- [ ] **Support backup codes**
- [ ] **Allow SMS verification (with warnings about SIM swapping)**

### Advanced Protection
- [ ] **Implement device fingerprinting**
- [ ] **Detect unusual login patterns**
- [ ] **Use breach detection services**
- [ ] **Implement account recovery questions**

## 🔧 Environment & Deployment

### Production Checklist
- [ ] **Environment variables properly configured**
- [ ] **Debug mode disabled**
- [ ] **Sensitive data excluded from logs**
- [ ] **Database connections secured**
- [ ] **API keys rotated regularly**

### Infrastructure Security
- [ ] **Server hardening completed**
- [ ] **Firewall rules configured**
- [ ] **SSL certificates valid and updated**
- [ ] **Database access restricted**
- [ ] **Backup systems secured**

## 📋 Pre-Deployment Checklist

### Final Security Review
- [ ] **All passwords hashed with bcrypt (12+ rounds)**
- [ ] **JWT secrets are cryptographically secure**
- [ ] **Rate limiting implemented on auth endpoints**
- [ ] **Input validation on all user inputs**
- [ ] **HTTPS enforced with security headers**
- [ ] **Error messages don't leak information**
- [ ] **Logging captures security events safely**
- [ ] **Token expiration times appropriate**
- [ ] **CORS configured for your domains only**
- [ ] **SQL injection protection verified**

### Documentation
- [ ] **Security measures documented**
- [ ] **Incident response plan created**
- [ ] **Team trained on security practices**
- [ ] **Regular security review scheduled**

## 🚨 Red Flags to Avoid

**Never Do These:**
- ❌ Store passwords in plain text
- ❌ Use weak JWT secrets ("secret", "123456")
- ❌ Put sensitive data in JWT payload
- ❌ Allow unlimited login attempts
- ❌ Use HTTP in production
- ❌ Ignore input validation
- ❌ Reveal system information in errors
- ❌ Log sensitive data
- ❌ Use deprecated crypto algorithms
- ❌ Trust client-side validation only

## 📚 Security Resources

### Essential Reading
- [OWASP Top 10](https://owasp.org/Top10/) - Most critical web application security risks
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Security Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Snyk](https://snyk.io/) - Dependency vulnerability scanning
- [Have I Been Pwned](https://haveibeenpwned.com/API/v3) - Breach detection API

---

## 🎯 Remember

**Security is not a one-time task** - it requires ongoing attention, regular updates, and continuous learning. This checklist provides a foundation, but security threats evolve constantly.

**When in doubt, err on the side of caution.** It's better to be overly secure than to leave vulnerabilities that attackers can exploit.

**Test everything.** Don't assume your security measures work - verify them through testing and code review. 