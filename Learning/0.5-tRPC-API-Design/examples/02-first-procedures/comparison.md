# 🔄 REST vs tRPC: Side-by-Side Comparison

This document provides a comprehensive comparison between traditional REST APIs and tRPC, showing the same functionality implemented in both approaches.

## 📋 Table of Contents

1. [User Management API](#user-management-api)
2. [Error Handling](#error-handling)
3. [Validation](#validation)
4. [Documentation](#documentation)
5. [Client Integration](#client-integration)
6. [Developer Experience](#developer-experience)
7. [Summary](#summary)

## 👤 User Management API

### REST Implementation

#### Server Setup (Express.js)
```typescript
// ❌ REST - Multiple files, manual setup, no type safety

// routes/users.ts
import express from 'express';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users); // any type
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id
router.get('/:id', 
  param('id').isUUID().withMessage('Invalid user ID'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await db.user.findUnique({ 
        where: { id: req.params.id } 
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user); // any type
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/users
router.post('/',
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, email } = req.body; // any type
      const user = await db.user.create({ data: { name, email } });
      res.status(201).json(user); // any type
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/users/:id
router.put('/:id',
  param('id').isUUID(),
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('email').optional().isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, email } = req.body; // any type
      const user = await db.user.update({
        where: { id: req.params.id },
        data: { ...(name && { name }), ...(email && { email }) }
      });
      res.json(user); // any type
    } catch (error) {
      if (error.code === 'P2025') { // Prisma record not found
        return res.status(404).json({ error: 'User not found' });
      }
      if (error.code === 'P2002') { // Unique constraint
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/users/:id
router.delete('/:id',
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      await db.user.delete({ where: { id: req.params.id } });
      res.json({ message: 'User deleted successfully' }); // any type
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

// app.ts
import express from 'express';
import userRoutes from './routes/users';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
```

#### Client Usage (REST)
```typescript
// ❌ REST Client - Manual fetch, no type safety

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // Manual typing, could be wrong!
}

class UserService {
  private baseUrl = '/api/users';
  
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json(); // Hope it matches User[] interface!
  }
  
  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json(); // Hope it matches User interface!
  }
  
  async createUser(data: { name: string; email: string }): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 409) {
        throw new Error('Email already exists');
      }
      if (response.status === 400) {
        throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json(); // Hope it matches User interface!
  }
  
  async updateUser(id: string, data: Partial<{ name: string; email: string }>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      // Manual error handling for each possible case...
      const error = await response.json();
      throw new Error(`Update failed: ${error.error}`);
    }
    
    return response.json(); // Hope it matches User interface!
  }
  
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Delete failed: ${error.error}`);
    }
    
    return response.json();
  }
}

// Usage
const userService = new UserService();

try {
  const users = await userService.getAllUsers();
  console.log(users); // any[] - no guarantees about structure
  
  const newUser = await userService.createUser({
    name: 'John Doe',
    email: 'john@example.com'
  });
  console.log(newUser); // any - hope it's a User!
  
} catch (error) {
  console.error('Error:', error.message); // Generic error handling
}
```

### tRPC Implementation

#### Server Setup (tRPC)
```typescript
// ✅ tRPC - Single file, automatic validation, full type safety

import { z } from 'zod';
import { router, publicProcedure } from './trpc';

// Define schemas once, use everywhere
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name required').max(100, 'Name too long'),
  email: z.string().email('Valid email required'),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}).refine(data => data.name || data.email, {
  message: 'At least one field must be provided'
});

// All user operations in one router
export const userRouter = router({
  // Query: Get all users
  getAll: publicProcedure
    .output(z.array(UserSchema))
    .query(async () => {
      return await db.user.findMany(); // Fully typed return
    }),
  
  // Query: Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid('Invalid user ID') }))
    .output(UserSchema)
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return user; // Fully typed
    }),
  
  // Mutation: Create user
  create: publicProcedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(async ({ input }) => {
      try {
        return await db.user.create({ data: input }); // Fully typed
      } catch (error) {
        if (error.code === 'P2002') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
      }
    }),
  
  // Mutation: Update user
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: UpdateUserSchema,
    }))
    .output(UserSchema)
    .mutation(async ({ input }) => {
      try {
        return await db.user.update({
          where: { id: input.id },
          data: input.data,
        }); // Fully typed
      } catch (error) {
        if (error.code === 'P2025') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        if (error.code === 'P2002') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user' });
      }
    }),
  
  // Mutation: Delete user
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await db.user.delete({ where: { id: input.id } });
        return { message: 'User deleted successfully' }; // Fully typed
      } catch (error) {
        if (error.code === 'P2025') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete user' });
      }
    }),
});

export type UserRouter = typeof userRouter;
```

#### Client Usage (tRPC)
```typescript
// ✅ tRPC Client - Automatic typing, validation, and error handling

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:3000/trpc' })],
});

// All operations are fully typed automatically!
try {
  // Get all users - fully typed return
  const users = await trpc.user.getAll.query();
  // users: { id: string; name: string; email: string; createdAt: Date }[]
  console.log(users[0].name); // ✅ TypeScript knows this exists
  
  // Get user by ID - automatic validation + typing
  const user = await trpc.user.getById.query({ id: 'uuid-here' });
  // user: { id: string; name: string; email: string; createdAt: Date }
  console.log(user.email); // ✅ TypeScript knows this exists
  
  // Create user - automatic validation + typing
  const newUser = await trpc.user.create.mutate({
    name: 'John Doe',
    email: 'john@example.com'
  });
  // newUser: { id: string; name: string; email: string; createdAt: Date }
  
  // Update user - automatic validation + typing
  const updatedUser = await trpc.user.update.mutate({
    id: 'uuid-here',
    data: { name: 'John Smith' }
  });
  // updatedUser: { id: string; name: string; email: string; createdAt: Date }
  
  // Delete user - automatic validation + typing
  const result = await trpc.user.delete.mutate({ id: 'uuid-here' });
  // result: { message: string }
  
} catch (error) {
  // Structured error handling with codes
  console.error('Error code:', error.data?.code);
  console.error('Error message:', error.message);
  
  if (error.data?.code === 'NOT_FOUND') {
    console.log('User not found');
  } else if (error.data?.code === 'CONFLICT') {
    console.log('Email already exists');
  }
}
```

## 🚨 Error Handling

### REST Error Handling
```typescript
// ❌ REST - Manual error parsing, inconsistent structure

try {
  const response = await fetch('/api/users/invalid-id');
  if (!response.ok) {
    if (response.status === 404) {
      console.log('User not found');
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.log('Validation errors:', errorData.errors);
    } else if (response.status === 500) {
      console.log('Server error');
    }
    // Different endpoints might return different error formats!
  }
} catch (error) {
  console.log('Network error:', error.message);
}
```

### tRPC Error Handling
```typescript
// ✅ tRPC - Structured errors, consistent handling

try {
  await trpc.user.getById.query({ id: 'invalid-id' });
} catch (error) {
  // Consistent error structure across all procedures
  console.log('Code:', error.data?.code);     // 'BAD_REQUEST', 'NOT_FOUND', etc.
  console.log('Message:', error.message);     // Human-readable message
  console.log('HTTP Status:', error.data?.httpStatus); // HTTP status code
  
  // Type-safe error handling
  switch (error.data?.code) {
    case 'NOT_FOUND':
      console.log('User not found');
      break;
    case 'BAD_REQUEST':
      console.log('Invalid input');
      break;
    case 'CONFLICT':
      console.log('Resource conflict');
      break;
  }
}
```

## ✅ Validation

### REST Validation
```typescript
// ❌ REST - Manual validation, runtime only

import { body, validationResult } from 'express-validator';

// Server-side validation
app.post('/api/users',
  body('name').isLength({ min: 1, max: 100 }),
  body('email').isEmail(),
  body('age').isInt({ min: 0, max: 150 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process valid data...
  }
);

// Client-side validation (separate, manual)
interface CreateUserData {
  name: string;
  email: string;
  age: number;
}

function validateUser(data: CreateUserData): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.length === 0) errors.push('Name required');
  if (data.name && data.name.length > 100) errors.push('Name too long');
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.push('Valid email required');
  if (data.age < 0 || data.age > 150) errors.push('Invalid age');
  return errors;
}

// Usage
const userData = { name: 'John', email: 'john@email.com', age: 25 };
const clientErrors = validateUser(userData); // Manual validation
if (clientErrors.length > 0) {
  console.log('Client validation failed:', clientErrors);
  return;
}

// Still might fail server validation if schemas don't match!
```

### tRPC Validation
```typescript
// ✅ tRPC - Single source of truth, compile-time + runtime

import { z } from 'zod';

// Define schema once
const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name required').max(100, 'Name too long'),
  email: z.string().email('Valid email required'),
  age: z.number().min(0, 'Age must be positive').max(150, 'Age too high'),
});

// Server procedure (automatic validation)
const createUser = publicProcedure
  .input(CreateUserSchema)
  .mutation(({ input }) => {
    // input is guaranteed to be valid and fully typed!
    return createUserInDB(input);
  });

// Client usage (automatic validation + typing)
try {
  const newUser = await trpc.user.create.mutate({
    name: 'John',
    email: 'john@email.com',
    age: 25
  });
  // ✅ Automatic validation on both client and server
  // ✅ Full TypeScript support
  // ✅ Consistent validation rules
} catch (error) {
  // Detailed validation errors from Zod
  if (error.data?.zodError) {
    console.log('Validation errors:', error.data.zodError.fieldErrors);
  }
}

// TypeScript catches errors at compile time:
// trpc.user.create.mutate({
//   name: 'John',
//   email: 'invalid-email',  // ❌ TypeScript error
//   age: 'twenty-five'       // ❌ TypeScript error
// });
```

## 📚 Documentation

### REST Documentation
```yaml
# ❌ REST - Manual OpenAPI/Swagger (can get out of sync)

openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Validation error
        '409':
          description: Email already exists

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
    CreateUser:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
```

### tRPC Documentation
```typescript
// ✅ tRPC - Types ARE the documentation (always in sync)

// This IS the documentation:
const userRouter = router({
  getAll: publicProcedure
    .output(z.array(UserSchema))
    .query(/* ... */),
    
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(UserSchema)
    .query(/* ... */),
    
  create: publicProcedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(/* ... */),
});

// IDE shows complete documentation:
// - Available procedures
// - Input/output types
// - Validation rules
// - Error codes
// - Example usage

// No manual documentation needed!
// Types are always accurate!
// IntelliSense shows everything!
```

## 📊 Summary

| Aspect | REST | tRPC |
|--------|------|------|
| **Type Safety** | ❌ Manual, error-prone | ✅ Automatic, end-to-end |
| **Validation** | ❌ Separate client/server | ✅ Single source of truth |
| **Error Handling** | ❌ Inconsistent formats | ✅ Structured, consistent |
| **Documentation** | ❌ Manual, can drift | ✅ Types ARE documentation |
| **Refactoring** | ❌ Manual updates needed | ✅ Automatic across stack |
| **Development Speed** | ❌ Slower (boilerplate) | ✅ Faster (less code) |
| **Learning Curve** | ✅ Familiar to most | ❌ New concepts to learn |
| **Ecosystem** | ✅ Mature, widespread | ❌ Newer, growing |
| **Flexibility** | ✅ Any client language | ❌ TypeScript focused |
| **Performance** | ❌ Multiple requests | ✅ Request batching |

## 🎯 When to Choose What

### Choose REST when:
- Working with multiple programming languages
- Building public APIs for third parties
- Team is unfamiliar with TypeScript/tRPC
- Need maximum ecosystem compatibility
- Working with existing REST infrastructure

### Choose tRPC when:
- Full-stack TypeScript project
- Development speed is priority
- Type safety is critical
- Team values developer experience
- Building internal APIs
- Want to minimize boilerplate code

---

**🎉 Conclusion**: tRPC shines in TypeScript environments where development speed and type safety are priorities, while REST remains the go-to choice for broader ecosystem compatibility and public APIs. 