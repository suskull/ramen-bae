/**
 * JWT Basics - Understanding JSON Web Tokens
 * 
 * This example teaches you:
 * 1. What a JWT token looks like
 * 2. How to decode its parts
 * 3. Why it's secure
 * 4. How to create and verify tokens
 */

const jwt = require('jsonwebtoken');

console.log('🎫 JWT BASICS - Understanding JSON Web Tokens\n');

// ========================================
// 1. WHAT DOES A JWT TOKEN LOOK LIKE?
// ========================================

console.log('1️⃣ What is a JWT Token?');
console.log('========================');

// This is what a real JWT token looks like:
const exampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

console.log('📄 A JWT token is a long string with 3 parts separated by dots:');
console.log(`Token: ${exampleToken}\n`);

// Split the token to show its parts
const parts = exampleToken.split('.');
console.log('🔍 Breaking down the token:');
console.log('Header:   ', parts[0]);
console.log('Payload:  ', parts[1]); 
console.log('Signature:', parts[2]);
console.log();

// ========================================
// 2. DECODING THE PARTS (FOR LEARNING)
// ========================================

console.log('2️⃣ Decoding the Token Parts');
console.log('============================');

// HEADER - Contains token metadata
const header = JSON.parse(Buffer.from(parts[0], 'base64'));
console.log('📋 HEADER (Token metadata):');
console.log(JSON.stringify(header, null, 2));
console.log('   - alg: Algorithm used to sign the token');
console.log('   - typ: Type of token (JWT)\n');

// PAYLOAD - Contains the actual data
const payload = JSON.parse(Buffer.from(parts[1], 'base64'));
console.log('📦 PAYLOAD (Your data):');
console.log(JSON.stringify(payload, null, 2));
console.log('   - sub: Subject (usually user ID)');
console.log('   - name: User name');
console.log('   - iat: Issued at (timestamp)\n');

// SIGNATURE - Security feature (can't decode, only verify)
console.log('🔐 SIGNATURE (Security):');
console.log(`   ${parts[2]}`);
console.log('   - This ensures the token hasn\'t been tampered with');
console.log('   - Created using header + payload + secret key');
console.log('   - Cannot be decoded, only verified\n');

// ========================================
// 3. CREATING YOUR FIRST JWT TOKEN
// ========================================

console.log('3️⃣ Creating Your First JWT Token');
console.log('==================================');

// This is the data we want to put in our token
const userData = {
  userId: 123,
  email: 'john@example.com',
  role: 'user'
};

// Secret key (in real apps, this comes from environment variables)
const secretKey = 'your-secret-key-here';

console.log('📝 User data to encode:');
console.log(JSON.stringify(userData, null, 2));
console.log();

// Create the token
const myToken = jwt.sign(userData, secretKey, { 
  expiresIn: '1h',
  issuer: 'my-app'
});

console.log('✨ Generated JWT Token:');
console.log(myToken);
console.log();

// Let's see what's inside our token
const myTokenParts = myToken.split('.');
const myPayload = JSON.parse(Buffer.from(myTokenParts[1], 'base64'));

console.log('🔍 What\'s in our token:');
console.log(JSON.stringify(myPayload, null, 2));
console.log('   Notice how JWT added:');
console.log('   - iat: Issued at time');
console.log('   - exp: Expiration time');
console.log('   - iss: Issuer (who created the token)\n');

// ========================================
// 4. VERIFYING A JWT TOKEN
// ========================================

console.log('4️⃣ Verifying a JWT Token');
console.log('=========================');

try {
  // Verify the token we just created
  const decoded = jwt.verify(myToken, secretKey);
  
  console.log('✅ Token is valid! Decoded data:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log();
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;
  
  console.log('⏰ Token Status:');
  console.log(`   Current time: ${now}`);
  console.log(`   Expires at:   ${decoded.exp}`);
  console.log(`   Time left:    ${Math.floor(timeUntilExpiry / 60)} minutes\n`);
  
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// ========================================
// 5. WHAT HAPPENS WITH INVALID TOKENS?
// ========================================

console.log('5️⃣ What Happens with Invalid Tokens?');
console.log('======================================');

// Test 1: Wrong secret
console.log('🔍 Test 1: Verifying with wrong secret');
try {
  jwt.verify(myToken, 'wrong-secret');
  console.log('   ✅ Token accepted (This should NOT happen!)');
} catch (error) {
  console.log('   ❌ Token rejected:', error.message);
  console.log('   ✅ Good! Wrong secret = invalid token\n');
}

// Test 2: Tampered token
console.log('🔍 Test 2: Verifying tampered token');
const tamperedToken = myToken.slice(0, -10) + 'tampered123';
try {
  jwt.verify(tamperedToken, secretKey);
  console.log('   ✅ Token accepted (This should NOT happen!)');
} catch (error) {
  console.log('   ❌ Token rejected:', error.message);
  console.log('   ✅ Good! Tampered token = invalid token\n');
}

// Test 3: Expired token (simulate)
console.log('🔍 Test 3: Creating and testing expired token');
const expiredToken = jwt.sign(userData, secretKey, { expiresIn: '0s' });

// Wait a moment to ensure it's expired
setTimeout(() => {
  try {
    jwt.verify(expiredToken, secretKey);
    console.log('   ✅ Token accepted (This should NOT happen!)');
  } catch (error) {
    console.log('   ❌ Token rejected:', error.message);
    console.log('   ✅ Good! Expired token = invalid token\n');
    
    // ========================================
    // 6. KEY TAKEAWAYS
    // ========================================
    
    console.log('6️⃣ Key Takeaways');
    console.log('=================');
    
    console.log('🎯 What you learned:');
    console.log('   1. JWT tokens have 3 parts: header.payload.signature');
    console.log('   2. Header and payload are just base64-encoded JSON');
    console.log('   3. Signature ensures the token hasn\'t been tampered with');
    console.log('   4. You need the correct secret to verify a token');
    console.log('   5. Tokens can expire automatically');
    console.log();
    
    console.log('🔒 Security features:');
    console.log('   ✅ Tampering detection (signature verification)');
    console.log('   ✅ Automatic expiration (exp claim)');
    console.log('   ✅ Issuer verification (iss claim)');
    console.log('   ✅ Stateless (no server storage needed)');
    console.log();
    
    console.log('⚠️  Important warnings:');
    console.log('   ❌ Payload is NOT encrypted (anyone can read it)');
    console.log('   ❌ Never put passwords or secrets in the payload');
    console.log('   ❌ Always use HTTPS to protect tokens in transit');
    console.log('   ❌ Use strong, random secret keys');
    console.log();
    
    console.log('🚀 Next steps:');
    console.log('   Run: node examples/2-token-generation.js');
    console.log('   Learn how to generate tokens for real authentication!');
  }
}, 100);

// ========================================
// 7. INTERACTIVE EXERCISES
// ========================================

console.log('\n7️⃣ Try This at Home!');
console.log('=====================');

console.log('📚 Exercises to reinforce learning:');
console.log();

console.log('Exercise 1: Go to https://jwt.io');
console.log('   - Paste your token in the "Encoded" section');
console.log('   - See how it decodes the header and payload');
console.log('   - Try changing the secret in the "Verify Signature" section');
console.log();

console.log('Exercise 2: Create a token with your own data');
console.log('   - Try: { name: "YourName", hobby: "coding", level: "beginner" }');
console.log('   - Use a different secret key');
console.log('   - Verify it works');
console.log();

console.log('Exercise 3: Understand why payload is visible');
console.log('   - Copy any JWT token');
console.log('   - Split by dots and base64 decode the middle part');
console.log('   - Remember: signatures provide integrity, not privacy!');
console.log();

console.log('💡 Remember: JWT is about TRUST, not SECRECY!');
console.log('   The signature lets you trust the data hasn\'t been changed,');
console.log('   but anyone can read the payload. Use HTTPS to hide the');
console.log('   entire token during transmission.'); 