# 🛡️ Example 3: Advanced Zod Validation Patterns

**Learning Goal**: Master comprehensive input/output validation using Zod schemas in tRPC procedures.

## 📚 What You'll Learn

- Advanced Zod schema patterns and techniques
- Custom validation logic and transformations
- Nested object and array validation
- Conditional validation and refinements
- Error handling and user-friendly messages
- Schema composition and reusability

## 🎯 Key Concepts

### Why Zod + tRPC is Powerful

**Traditional API Validation Problems**:
- Validation scattered across client and server
- Runtime errors from invalid data
- Manual type definitions that can drift
- Inconsistent error messages
- No compile-time guarantees

**Zod + tRPC Solution**:
- Single source of truth for validation
- Runtime validation + TypeScript types
- Automatic type inference
- Consistent error handling
- Compile-time type checking

## 🏗️ Validation Patterns

### 1. Basic Validation
```typescript
// Simple field validation
const UserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(13, 'Must be at least 13').max(120, 'Age too high'),
});
```

### 2. Complex Nested Validation
```typescript
// Nested objects with validation
const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().length(2, 'Use 2-letter country code'),
});

const UserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  address: AddressSchema,
  phoneNumbers: z.array(z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')),
  preferences: z.object({
    newsletter: z.boolean(),
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().length(2),
  }),
});
```

### 3. Conditional Validation
```typescript
// Different validation based on conditions
const EventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['online', 'in-person']),
  date: z.date().min(new Date(), 'Event must be in the future'),
  
  // Conditional fields based on type
  location: z.string().optional(),
  videoUrl: z.string().url().optional(),
}).refine((data) => {
  // In-person events must have location
  if (data.type === 'in-person' && !data.location) {
    return false;
  }
  // Online events must have video URL
  if (data.type === 'online' && !data.videoUrl) {
    return false;
  }
  return true;
}, {
  message: 'Location required for in-person events, video URL required for online events',
});
```

### 4. Custom Transformations
```typescript
// Transform and validate data
const CreatePostSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .transform(str => str.trim()) // Remove whitespace
    .refine(str => str.length > 0, 'Title cannot be only whitespace'),
    
  content: z.string()
    .transform(str => str.trim())
    .refine(str => str.length >= 10, 'Content must be at least 10 characters'),
    
  tags: z.array(z.string())
    .transform(tags => tags.map(tag => tag.toLowerCase().trim())) // Normalize tags
    .refine(tags => tags.length <= 10, 'Maximum 10 tags allowed')
    .refine(tags => new Set(tags).size === tags.length, 'Duplicate tags not allowed'),
    
  publishedAt: z.string()
    .datetime()
    .transform(str => new Date(str)), // Convert string to Date
});
```

## 🚀 Project Structure

```
03-zod-validation/
├── schemas/
│   ├── base.ts              # Base schemas and utilities
│   ├── user.ts              # User-related schemas
│   ├── product.ts           # Product schemas with complex validation
│   └── advanced.ts          # Advanced validation patterns
├── server.ts                # tRPC server with validation examples
├── client.ts                # Client demonstrating validation
├── validation-tests.ts      # Test different validation scenarios
├── package.json             # Dependencies
└── README.md               # This file
```

## 🛡️ Validation Categories

### Input Validation
- **Purpose**: Validate incoming data before processing
- **Benefits**: Prevent invalid data from reaching business logic
- **Examples**: User registration, form submissions, API parameters

### Output Validation
- **Purpose**: Ensure response data matches expected format
- **Benefits**: Catch bugs early, maintain API contracts
- **Examples**: Database query results, external API responses

### Transform + Validate
- **Purpose**: Clean and normalize data while validating
- **Benefits**: Consistent data format, automatic cleanup
- **Examples**: Trimming strings, normalizing emails, parsing dates

## 🎯 Real-World Examples

### E-commerce Product Validation
```typescript
const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive('Price must be positive').max(999999),
  category: z.enum(['electronics', 'clothing', 'books', 'home']),
  images: z.array(z.string().url()).min(1, 'At least one image required').max(10),
  inventory: z.object({
    quantity: z.number().int().min(0),
    warehouse: z.string().min(1),
    reserved: z.number().int().min(0).default(0),
  }),
  specifications: z.record(z.string(), z.any()).optional(),
  
  // Conditional validation based on category
}).refine((product) => {
  if (product.category === 'electronics' && !product.specifications?.warranty) {
    return false;
  }
  return true;
}, {
  message: 'Electronics must include warranty information',
  path: ['specifications', 'warranty'],
});
```

### User Registration with Complex Rules
```typescript
const RegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username too short')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(str => str.toLowerCase()),
    
  email: z.string()
    .email('Invalid email format')
    .transform(str => str.toLowerCase().trim()),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    
  confirmPassword: z.string(),
  
  profile: z.object({
    firstName: z.string().min(1, 'First name required').max(50),
    lastName: z.string().min(1, 'Last name required').max(50),
    dateOfBirth: z.date().max(new Date(), 'Birth date cannot be in the future'),
    phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  }),
  
  agreements: z.object({
    termsOfService: z.boolean().refine(val => val === true, 'Must accept terms of service'),
    privacyPolicy: z.boolean().refine(val => val === true, 'Must accept privacy policy'),
    newsletter: z.boolean().default(false),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

## 🧪 Testing Validation

```typescript
// Test validation with different scenarios
const validationTests = [
  {
    name: 'Valid user data',
    data: { name: 'John', email: 'john@example.com', age: 25 },
    shouldPass: true,
  },
  {
    name: 'Invalid email',
    data: { name: 'John', email: 'invalid-email', age: 25 },
    shouldPass: false,
    expectedError: 'Invalid email format',
  },
  {
    name: 'Age too young',
    data: { name: 'John', email: 'john@example.com', age: 12 },
    shouldPass: false,
    expectedError: 'Must be at least 13',
  },
];

// Run validation tests
validationTests.forEach(test => {
  try {
    UserSchema.parse(test.data);
    console.log(`✅ ${test.name}: ${test.shouldPass ? 'PASS' : 'FAIL (should have failed)'}`);
  } catch (error) {
    console.log(`${test.shouldPass ? '❌' : '✅'} ${test.name}: ${error.message}`);
  }
});
```

## 💡 Best Practices

### Schema Organization
```typescript
// ✅ Good - Modular, reusable schemas
// base.ts
export const EmailSchema = z.string().email().transform(s => s.toLowerCase());
export const NameSchema = z.string().min(1).max(100).transform(s => s.trim());

// user.ts
import { EmailSchema, NameSchema } from './base';
export const UserSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  // ... other fields
});

// ❌ Poor - Monolithic, duplicated validation
const UserSchema = z.object({
  name: z.string().min(1).max(100).transform(s => s.trim()),
  email: z.string().email().transform(s => s.toLowerCase()),
  // ... duplicated in other schemas
});
```

### Error Messages
```typescript
// ✅ Good - Specific, helpful messages
const UserSchema = z.object({
  age: z.number()
    .min(13, 'You must be at least 13 years old to create an account')
    .max(120, 'Please enter a valid age'),
  email: z.string()
    .email('Please enter a valid email address (e.g., john@example.com)'),
});

// ❌ Poor - Generic, unhelpful messages
const UserSchema = z.object({
  age: z.number().min(13).max(120),
  email: z.string().email(),
});
```

## 🎉 Success Criteria

You've mastered this example when you can:

- [ ] Create complex nested validation schemas
- [ ] Use conditional validation with `.refine()`
- [ ] Implement custom transformations
- [ ] Compose reusable schema components
- [ ] Write meaningful error messages
- [ ] Test validation thoroughly
- [ ] Understand the relationship between Zod and TypeScript types

---

**Next**: Move on to `examples/04-router-composition` to learn how to organize large tRPC applications! 