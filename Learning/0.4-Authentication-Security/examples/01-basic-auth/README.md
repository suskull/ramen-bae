# 🔑 Example 1: Basic Authentication

## 🎯 What You'll Learn

This example demonstrates the fundamentals of secure authentication:
- Password hashing with bcrypt
- User registration and login
- Basic input validation
- Secure error handling

## 🏗️ Project Structure

```
01-basic-auth/
├── README.md
├── package.json
├── server.js           # Main server file
├── models/
│   └── User.js         # User model with password hashing
├── routes/
│   └── auth.js         # Authentication routes
├── middleware/
│   └── validation.js   # Input validation middleware
├── utils/
│   └── logger.js       # Secure logging utility
└── .env.example        # Environment variables template
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Learning/0.4-Authentication-Security/examples/01-basic-auth
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run the Server
```bash
npm start
```

### 4. Test the API
```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securePassword123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securePassword123"}'
```

## 🔍 Key Learning Points

### 1. Password Security
- **Never store plain text passwords**
- **Use bcrypt with sufficient salt rounds**
- **Validate password strength**

### 2. Input Validation
- **Validate email format**
- **Enforce password requirements**
- **Sanitize all input data**

### 3. Error Handling
- **Generic error messages for security**
- **Proper HTTP status codes**
- **Secure logging without sensitive data**

### 4. Security Best Practices
- **Environment variable configuration**
- **Input sanitization**
- **Rate limiting preparation**

## 🧪 Try These Experiments

1. **Test with weak passwords** - See how validation works
2. **Try SQL injection** - Test input sanitization
3. **Check error messages** - Verify they don't leak information
4. **Test duplicate registration** - See how it's handled

## 📚 Next Steps

After understanding this basic example:
1. Move to `02-jwt-implementation/` for token-based auth
2. Practice the exercises in `../../exercises/`
3. Try to break the security and then fix it!

## 🚨 Security Notes

This is a **learning example** - for production use:
- Add HTTPS/TLS
- Implement rate limiting
- Add proper logging
- Use a real database
- Add comprehensive error handling
- Implement account lockouts 