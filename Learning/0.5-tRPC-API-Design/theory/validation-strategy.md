# 🛡️ Validation Strategy

## Overview

Validation is critical for building robust APIs. With tRPC and Zod, you get both compile-time type safety and runtime validation. This guide covers comprehensive validation strategies, schema design patterns, and effective error handling.

## 🎯 Validation Philosophy

### Layers of Validation

```typescript
// 1. TypeScript (Compile-time)
interface User {
  id: string;
  email: string;  // TypeScript knows this should be a string
  age: number;    // TypeScript knows this should be a number
}

// 2. Zod Schema (Runtime)
const userSchema = z.object({
  id: z.string().uuid(),              // Runtime validation
  email: z.string().email(),          // Validates email format
  age: z.number().min(13).max(120)    // Business rules
});

// 3. Business Logic (Application-level)
const createUser = publicProcedure
  .input(userSchema)
  .mutation(async ({ input }) => {
    // Additional business validation
    const existingUser = await db.user.findUnique({
      where: { email: input.email }
    });
    
    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email already exists'
      });
    }
    
    return await db.user.create({ data: input });
  });
```

### Input vs Output Validation

**Input Validation** (Always Required):
```typescript
const updateUserProcedure = publicProcedure
  .input(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().min(13).optional()
  }))
  .mutation(async ({ input }) => {
    // input is fully validated and typed
    return await updateUser(input);
  });
```

**Output Validation** (Recommended for External APIs):
```typescript
const userOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  // Exclude sensitive fields like passwordHash
});

const getUserProcedure = publicProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(userOutputSchema)
  .query(async ({ input }) => {
    const user = await db.user.findUnique({ where: { id: input.id } });
    
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    
    // This will be validated against userOutputSchema
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  });
```

## 🧩 Zod Schema Design Patterns

### Basic Schema Building Blocks

```typescript
// Primitives with validation
const email = z.string().email();
const password = z.string().min(8).max(100);
const age = z.number().int().min(0).max(150);
const uuid = z.string().uuid();
const url = z.string().url();

// Arrays and objects
const tags = z.array(z.string()).min(1).max(10);
const metadata = z.record(z.string(), z.unknown());

// Enums and literals
const status = z.enum(['pending', 'active', 'inactive']);
const role = z.literal('admin').or(z.literal('user'));

// Dates and transformations
const dateString = z.string().transform((str) => new Date(str));
const positiveInt = z.number().int().positive();
```

### Reusable Schema Components

```typescript
// Base schemas
const baseUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(13).max(120).optional()
});

const timestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
});

// Compose complex schemas
const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8).max(100)
});

const updateUserSchema = baseUserSchema.partial();

const fullUserSchema = baseUserSchema
  .extend(timestampSchema.shape)
  .extend({
    id: z.string().uuid(),
    isActive: z.boolean().default(true)
  });
```

### Advanced Schema Patterns

**Conditional Validation:**
```typescript
const postSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  status: z.enum(['draft', 'published']),
  publishedAt: z.date().optional()
}).refine((data) => {
  // If status is published, publishedAt is required
  if (data.status === 'published') {
    return data.publishedAt != null;
  }
  return true;
}, {
  message: "Published posts must have a publish date",
  path: ["publishedAt"]
});
```

**Discriminated Unions:**
```typescript
const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    recipient: z.string().email(),
    subject: z.string(),
    body: z.string()
  }),
  z.object({
    type: z.literal('sms'),
    phoneNumber: z.string().regex(/^\+\d{10,15}$/),
    message: z.string().max(160)
  }),
  z.object({
    type: z.literal('push'),
    deviceToken: z.string(),
    title: z.string(),
    body: z.string(),
    badge: z.number().optional()
  })
]);
```

**Transform and Preprocess:**
```typescript
const trimmedString = z.string().transform(str => str.trim());

const normalizedEmail = z.string()
  .email()
  .transform(email => email.toLowerCase());

const parseJsonString = z.string()
  .transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON string'
      });
      return z.NEVER;
    }
  });

const createUserSchema = z.object({
  name: trimmedString.min(1),
  email: normalizedEmail,
  metadata: parseJsonString.optional()
});
```

### Schema Organization

```typescript
// schemas/user.ts
export const userSchemas = {
  base: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().min(13).optional()
  }),
  
  create: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    age: z.number().int().min(13).optional()
  }),
  
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    age: z.number().int().min(13).optional()
  }),
  
  output: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
    age: z.number().optional(),
    createdAt: z.date()
  })
};

// schemas/post.ts
export const postSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    tags: z.array(z.string()).max(10).default([]),
    status: z.enum(['draft', 'published']).default('draft')
  }),
  
  update: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    tags: z.array(z.string()).max(10).optional(),
    status: z.enum(['draft', 'published']).optional()
  })
};
```

## ⚠️ Error Handling Strategies

### Types of Validation Errors

**1. Input Validation Errors (Automatic)**
```typescript
const getUserProcedure = publicProcedure
  .input(z.object({
    id: z.string().uuid() // Will automatically throw BAD_REQUEST if invalid
  }))
  .query(async ({ input }) => {
    // If we reach here, input is valid
    return await db.user.findUnique({ where: { id: input.id } });
  });
```

**2. Business Logic Errors (Manual)**
```typescript
const deleteUserProcedure = protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ input, ctx }) => {
    const user = await db.user.findUnique({ where: { id: input.id } });
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found'
      });
    }
    
    if (user.id === ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete your own account'
      });
    }
    
    if (user.role === 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete admin users'
      });
    }
    
    await db.user.delete({ where: { id: input.id } });
    return { success: true };
  });
```

### Custom Error Types

```typescript
// utils/errors.ts
export class ValidationError extends TRPCError {
  constructor(message: string, field?: string) {
    super({
      code: 'BAD_REQUEST',
      message,
      cause: { field }
    });
  }
}

export class BusinessLogicError extends TRPCError {
  constructor(message: string, code: 'CONFLICT' | 'FORBIDDEN' | 'NOT_FOUND' = 'CONFLICT') {
    super({ code, message });
  }
}

// Usage in procedures
const transferMoneyProcedure = protectedProcedure
  .input(z.object({
    toUserId: z.string().uuid(),
    amount: z.number().positive()
  }))
  .mutation(async ({ input, ctx }) => {
    const fromAccount = await getAccount(ctx.user.id);
    const toAccount = await getAccount(input.toUserId);
    
    if (!toAccount) {
      throw new BusinessLogicError('Recipient account not found', 'NOT_FOUND');
    }
    
    if (fromAccount.balance < input.amount) {
      throw new BusinessLogicError('Insufficient funds');
    }
    
    if (input.amount > fromAccount.dailyLimit) {
      throw new BusinessLogicError('Amount exceeds daily limit');
    }
    
    // Proceed with transfer...
  });
```

### Error Formatting for Clients

```typescript
// Custom error formatter
const createContext = async ({ req, res }: CreateContextOptions) => {
  return { req, res };
};

const appRouter = router({ /* ... */ });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError: ({ error, type, path, input, ctx, req }) => {
    console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
    
    // Log validation errors with more detail
    if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
      console.error('Validation errors:', error.cause.flatten());
    }
  },
  
  // Custom error formatting
  formatError: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error details
        validationErrors: error.cause instanceof ZodError 
          ? error.cause.flatten() 
          : undefined
      }
    };
  }
});
```

## 🎨 User-Friendly Error Messages

### Good Error Messages

```typescript
// ✅ Good: Specific, actionable messages
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password cannot exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const emailSchema = z.string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const ageSchema = z.number()
  .int("Age must be a whole number")
  .min(13, "You must be at least 13 years old to register")
  .max(120, "Please enter a valid age");
```

### Bad Error Messages

```typescript
// ❌ Bad: Vague, technical messages
const passwordSchema = z.string()
  .min(8) // "String must contain at least 8 character(s)"
  .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/); // "Invalid"

const emailSchema = z.string().email(); // "Invalid email"
```

### Context-Aware Validation

```typescript
const createPostSchema = z.object({
  title: z.string()
    .min(1, "Post title is required")
    .max(200, "Post title cannot exceed 200 characters"),
    
  content: z.string()
    .min(10, "Post content must be at least 10 characters")
    .max(10000, "Post content cannot exceed 10,000 characters"),
    
  categoryId: z.string()
    .uuid("Please select a valid category"),
    
  tags: z.array(z.string())
    .max(5, "You can add up to 5 tags")
    .refine(
      tags => tags.every(tag => tag.length <= 20),
      "Each tag must be 20 characters or less"
    ),
    
  scheduledFor: z.date()
    .min(new Date(), "Scheduled date cannot be in the past")
    .optional()
}).refine(
  data => {
    if (data.scheduledFor) {
      const maxSchedule = new Date();
      maxSchedule.setMonth(maxSchedule.getMonth() + 6);
      return data.scheduledFor <= maxSchedule;
    }
    return true;
  },
  {
    message: "Posts cannot be scheduled more than 6 months in advance",
    path: ["scheduledFor"]
  }
);
```

## 🔄 Validation in Different Scenarios

### Form Validation

```typescript
// Real-time validation for forms
const registrationSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    
  email: z.string()
    .email("Please enter a valid email address"),
    
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
    
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Client-side usage
const SignupForm = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const validateField = (field: string, value: any) => {
    try {
      registrationSchema.pick({ [field]: true }).parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  };
  
  return (
    <form>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => {
          setFormData(prev => ({ ...prev, username: e.target.value }));
          validateField('username', e.target.value);
        }}
      />
      {errors.username && <span className="error">{errors.username}</span>}
      {/* ... other fields */}
    </form>
  );
};
```

### File Upload Validation

```typescript
const fileUploadSchema = z.object({
  file: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  }).refine(
    file => file.size <= 5 * 1024 * 1024, // 5MB
    "File size cannot exceed 5MB"
  ).refine(
    file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "Only JPEG, PNG, and WebP images are allowed"
  ).refine(
    file => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      return allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    },
    "File must have a valid image extension"
  )
});
```

### API Rate Limiting Validation

```typescript
const createRateLimitedProcedure = (maxRequests: number, windowMs: number) => {
  return publicProcedure.use(async ({ ctx, next }) => {
    const key = `rate_limit:${ctx.req?.ip || 'unknown'}`;
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    if (requests > maxRequests) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`
      });
    }
    
    return next();
  });
};

// Usage
const sendEmailProcedure = createRateLimitedProcedure(5, 60000) // 5 requests per minute
  .input(z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(5000)
  }))
  .mutation(async ({ input }) => {
    await emailService.send(input);
    return { success: true };
  });
```

## 🧪 Testing Validation

### Unit Testing Schemas

```typescript
// __tests__/schemas/user.test.ts
import { describe, it, expect } from 'vitest';
import { userSchemas } from '../schemas/user';

describe('User Schemas', () => {
  describe('create schema', () => {
    it('should accept valid user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        age: 25
      };
      
      expect(() => userSchemas.create.parse(validUser)).not.toThrow();
    });
    
    it('should reject invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!'
      };
      
      expect(() => userSchemas.create.parse(invalidUser)).toThrow();
    });
    
    it('should reject weak password', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };
      
      expect(() => userSchemas.create.parse(invalidUser)).toThrow();
    });
  });
});
```

### Integration Testing with tRPC

```typescript
// __tests__/procedures/user.test.ts
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../router';

const createCaller = createCallerFactory(appRouter);

describe('User Procedures', () => {
  it('should create user with valid data', async () => {
    const caller = createCaller({ /* mock context */ });
    
    const result = await caller.user.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    });
    
    expect(result).toMatchObject({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
  
  it('should throw error for duplicate email', async () => {
    const caller = createCaller({ /* mock context */ });
    
    // Create first user
    await caller.user.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    });
    
    // Try to create duplicate
    await expect(caller.user.create({
      name: 'Jane Doe',
      email: 'john@example.com',
      password: 'AnotherPass123!'
    })).rejects.toThrow('User with this email already exists');
  });
});
```

## 🎯 Best Practices Summary

### Do's ✅

1. **Write descriptive error messages** that help users fix their input
2. **Use transformations** to normalize data (trim strings, lowercase emails)
3. **Compose schemas** from reusable components
4. **Test your validation logic** thoroughly
5. **Use conditional validation** for complex business rules
6. **Implement rate limiting** for sensitive operations
7. **Log validation errors** for debugging

### Don'ts ❌

1. **Don't rely only on client-side validation** - always validate on the server
2. **Don't expose internal error details** to clients in production
3. **Don't use generic error messages** like "Invalid input"
4. **Don't validate the same thing multiple times** unnecessarily
5. **Don't forget to validate nested objects and arrays**
6. **Don't ignore performance** with overly complex validation rules

## 🔗 Next Steps

- **Practice**: Implement validation for a user registration system
- **Examples**: Check out `examples/03-zod-validation/` for hands-on examples
- **Performance**: Continue to [Performance Considerations](./performance-considerations.md)
- **Architecture**: Learn about [Architecture Patterns](./architecture-patterns.md) for organizing larger applications

---

**💡 Remember**: Good validation provides security, data integrity, and excellent user experience. Invest time in getting it right! 