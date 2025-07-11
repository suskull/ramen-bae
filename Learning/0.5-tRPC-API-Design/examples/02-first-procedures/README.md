# 🚀 Example 2: First Procedures - Queries vs Mutations

**Learning Goal**: Understand the fundamental difference between queries and mutations in tRPC, and how they compare to traditional REST APIs.

## 📚 What You'll Learn

- The difference between `.query()` and `.mutation()` in tRPC
- How tRPC procedures map to REST HTTP methods
- Best practices for naming and organizing procedures
- Input validation and error handling patterns
- Side-by-side comparison of REST vs tRPC implementations

## 🎯 Key Concepts

### Queries vs Mutations

**Queries** (`.query()`):
- **Purpose**: Read data, no side effects
- **REST Equivalent**: GET requests
- **Examples**: Get user profile, fetch list of posts, search data
- **Characteristics**: Cacheable, idempotent, safe to retry

**Mutations** (`.mutation()`):
- **Purpose**: Change data, has side effects  
- **REST Equivalent**: POST, PUT, DELETE requests
- **Examples**: Create user, update profile, delete post
- **Characteristics**: Not cacheable, may have side effects

## 🔄 REST vs tRPC Comparison

### Example: User Management API

#### Traditional REST API
```typescript
// ❌ REST - Multiple endpoints, manual typing, no validation

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id; // string (no validation)
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user); // any type
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body; // any type (no validation)
  try {
    // Manual validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    
    const user = await db.user.create({ data: { name, email } });
    res.status(201).json(user); // any type
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client side - Manual fetch calls
const getUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json(); // any type - hope it's a User!
};

const createUser = async (userData: any) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json(); // any type - hope it worked!
};
```

#### tRPC Way
```typescript
// ✅ tRPC - Type-safe, validated, organized

// Server - One router with all user operations
const userRouter = router({
  // Query - Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      createdAt: z.date()
    }))
    .query(async ({ input }) => {
      // input.id is guaranteed to be a valid UUID
      const user = await db.user.findUnique({ where: { id: input.id } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return user; // Type matches output schema
    }),

  // Mutation - Create new user
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      email: z.string().email()
    }))
    .output(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      createdAt: z.date()
    }))
    .mutation(async ({ input }) => {
      // input is fully validated and typed
      const user = await db.user.create({ data: input });
      return user; // Type-safe return
    })
});

// Client side - Type-safe function calls
const user = await trpc.user.getById.query({ id: 'uuid-here' });
// user is fully typed: { id: string, name: string, email: string, createdAt: Date }

const newUser = await trpc.user.create.mutate({
  name: 'John Doe',
  email: 'john@example.com'
});
// newUser is fully typed, validation automatic
```

## 🏗️ Project Structure

```
02-first-procedures/
├── server.ts           # Simple tRPC server with basic procedures
├── client.ts           # Client demonstrating queries and mutations
├── comparison.md       # Detailed REST vs tRPC comparison
├── package.json        # Dependencies
└── README.md           # This file
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start server
npm run server

# Run client examples (in another terminal)
npm run client
```

## 🎯 Learning Exercises

1. **Convert REST to tRPC**: Take an existing REST API and convert it to tRPC
2. **Error Handling**: Practice different error scenarios and TRPCError codes
3. **Validation**: Create complex input validation with Zod
4. **Organization**: Group related procedures into logical routers

## 💡 Best Practices

### Naming Conventions
```typescript
// ✅ Good naming - Clear and descriptive
const userRouter = router({
  getById: publicProcedure...,      // Clear what it does
  create: publicProcedure...,       // Standard CRUD naming
  updateProfile: publicProcedure..., // Specific action
  delete: publicProcedure...,       // Simple and clear
});

// ❌ Poor naming - Vague or confusing
const userRouter = router({
  get: publicProcedure...,          // Get what?
  new: publicProcedure...,          // Not standard
  modify: publicProcedure...,       // Vague action
  remove: publicProcedure...,       // Inconsistent with "delete"
});
```

### Input/Output Schemas
```typescript
// ✅ Good schemas - Specific and validated
.input(z.object({
  email: z.string().email(),
  age: z.number().min(13).max(120),
  preferences: z.object({
    newsletter: z.boolean(),
    theme: z.enum(['light', 'dark'])
  })
}))

// ❌ Poor schemas - Too loose or strict
.input(z.any())  // No validation
.input(z.object({
  data: z.string() // Too generic
}))
```

## 🎉 Success Criteria

You've mastered this example when you can:

- [ ] Explain when to use queries vs mutations
- [ ] Convert a REST endpoint to a tRPC procedure
- [ ] Implement proper input/output validation
- [ ] Handle errors with appropriate TRPCError codes
- [ ] Understand the benefits of type safety over manual APIs

---

**Next**: Move on to `examples/03-zod-validation` to master advanced schema validation patterns! 