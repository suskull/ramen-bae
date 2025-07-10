# 🔍 Manual SQL Injection Testing Guide

This guide shows you how to manually test for SQL injection vulnerabilities using curl commands. This is educational - your current system is already protected!

## 🎯 What We're Testing

SQL injection happens when user input is directly inserted into SQL queries without proper validation or parameterization. Let's see how your system handles malicious input.

## 🧪 Manual Testing Commands

### 1. Classic OR Injection (Most Common)

**Attack Concept**: Bypass authentication by making the SQL query always return true.

```bash
# This is what an attacker would try:
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com'\'' OR '\''1'\''='\''1'\'' --",
    "password": "anything"
  }'
```

**Expected Result**: ✅ Should be blocked by email validation
```json
{
  "error": "Validation failed",
  "details": [
    {"message": "Must be a valid email address"}
  ]
}
```

**Why it's blocked**: Your `express-validator` validates email format, rejecting anything that's not a valid email.

### 2. Union-Based Injection

**Attack Concept**: Try to extract data from other tables or columns.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com'\'' UNION SELECT * FROM users --",
    "password": "password"
  }'
```

**Expected Result**: ✅ Blocked by email validation

### 3. Registration SQL Injection

**Attack Concept**: Try to inject SQL through the registration endpoint.

```bash
# Try to inject through email field
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com'\''; INSERT INTO users (email, password) VALUES ('\''hacker@evil.com'\'', '\''hashed'\''); --",
    "password": "ValidPassword123!"
  }'
```

**Expected Result**: ✅ Blocked by email validation

```bash
# Try to inject through password field (this might pass email validation)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "pass'\''; UPDATE users SET role='\''admin'\'' WHERE email='\''test@example.com'\''; --"
  }'
```

**Expected Result**: ⚠️ This might succeed because:
- Email passes validation (it's a valid email)
- Password passes validation (meets complexity requirements)
- But it's harmless because you're using bcrypt hashing, not raw SQL

## 🔍 How to Analyze the Results

### ✅ Good Protection Signs:
- HTTP 400 with "Validation failed" message
- HTTP 401 with "Invalid credentials" message  
- No successful authentication with malicious input

### ❌ Vulnerability Signs (you won't see these):
- HTTP 200 with successful authentication using malicious input
- Error messages revealing database structure
- Successful operations that shouldn't be possible

## 🎭 Simulating a Vulnerable System

To understand how SQL injection works, here's what a vulnerable system would look like:

### Vulnerable Code Example:
```javascript
// 🚨 NEVER DO THIS - Example of vulnerable code
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // DANGEROUS: Direct string interpolation
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  
  db.query(query, (err, results) => {
    if (results.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});
```

### Attack Scenario:
```bash
# Attacker sends this payload:
{
  "email": "admin@example.com' OR '1'='1' --",
  "password": "anything"
}

# Resulting SQL query becomes:
SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1' --' AND password = 'anything'

# The ' OR '1'='1' makes the condition always true
# The -- comments out the rest, ignoring the password check
# Result: Authentication bypassed!
```

## 🛡️ Why Your System is Protected

### 1. Input Validation
Your `express-validator` middleware validates email format:
```javascript
body('email').isEmail().normalizeEmail()
```
This rejects any non-email input, including SQL injection attempts.

### 2. No Direct SQL Queries
Your system uses an in-memory `UserStore` instead of SQL:
```javascript
const user = UserStore.findByEmail(email);
```
No SQL = No SQL injection possible!

### 3. Password Hashing
Even if someone got past validation, passwords are hashed:
```javascript
const isValid = await bcrypt.compare(password, user.hashedPassword);
```
The injection payload gets hashed and compared, not executed.

## 🧪 Additional Tests You Can Try

### Test Weak Email Validation:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "ValidPassword123!"
  }'
```

### Test XSS in Email:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<script>alert(\"xss\")</script>@example.com",
    "password": "ValidPassword123!"
  }'
```


### Test Password Injection:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "ValidPass123!; DROP TABLE users; --"
  }'
```

All of these should be safely handled by your validation and hashing.

## 🎯 Key Takeaways

1. **Input Validation is Your First Defense**: The `express-validator` catches most injection attempts
2. **Use Parameterized Queries**: When you do use SQL, always use parameterized queries
3. **Hash Passwords**: Never store or compare plain text passwords
4. **Test Regularly**: Use automated tools and manual testing to verify security

## 🚀 Next Steps

1. Try running the automated test script: `node test-security.js`
2. Add rate limiting to prevent brute force attacks
3. Implement HTTPS and security headers
4. Learn about other security vulnerabilities (XSS, CSRF, etc.)

Remember: **Security is about layers**. Your system has multiple protection layers that work together! 