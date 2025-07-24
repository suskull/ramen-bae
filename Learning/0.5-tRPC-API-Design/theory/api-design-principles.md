# 🎯 API Design Principles

## Overview

Good API design is the foundation of maintainable, scalable applications. This guide covers the essential principles for designing effective tRPC APIs, including when to use different patterns and how to organize your procedures.

## 🔄 RESTful vs RPC Design Patterns

### REST (Representational State Transfer)
REST is resource-oriented, treating your API as a collection of resources that can be manipulated:

```typescript
// REST-style thinking
GET    /users        // Get all users
GET    /users/123    // Get user by ID
POST   /users        // Create user
PUT    /users/123    // Update user
DELETE /users/123    // Delete user
```

### RPC (Remote Procedure Call)
RPC is action-oriented, treating your API as a collection of functions to execute:

```typescript
// RPC-style thinking (tRPC)
const userRouter = router({
  getUsers: publicProcedure.query(() => { /* ... */ }),
  getUserById: publicProcedure.input(z.number()).query(({ input }) => { /* ... */ }),
  createUser: publicProcedure.input(userSchema).mutation(({ input }) => { /* ... */ }),
  updateUser: publicProcedure.input(updateUserSchema).mutation(({ input }) => { /* ... */ }),
  deleteUser: publicProcedure.input(z.number()).mutation(({ input }) => { /* ... */ }),
});
```

### When to Choose Each Approach

**Choose REST when:**
- Building public APIs that external developers will consume
- You have clear, well-defined resources
- You want to leverage HTTP caching mechanisms
- You need to follow industry standards for integration

**Choose RPC (tRPC) when:**
- Building internal APIs for your own applications
- You want end-to-end type safety
- Your operations don't map cleanly to CRUD operations
- You prefer function-like interfaces

## 🔍 Queries vs Mutations

Understanding when to use queries vs mutations is crucial for both performance and semantics.

### Queries: Reading Data

Queries are for **reading** data and should be **idempotent** (safe to call multiple times):

```typescript
const appRouter = router({
  // ✅ Good: Reading data
  getUserProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input.userId }
      });
    }),

  // ✅ Good: Computed/derived data
  getUserStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.userId } });
      return {
        postsCount: await db.post.count({ where: { authorId: input.userId } }),
        joinedDate: user?.createdAt,
        lastActive: user?.lastLoginAt
      };
    }),

  // ✅ Good: Search/filtering operations
  searchUsers: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(async ({ input }) => {
      return await db.user.findMany({
        where: {
          name: { contains: input.query, mode: 'insensitive' }
        },
        take: input.limit
      });
    })
});
```

### Mutations: Changing Data

Mutations are for **writing/changing** data and may have **side effects**:

```typescript
const appRouter = router({
  // ✅ Good: Creating new data
  createUser: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email()
    }))
    .mutation(async ({ input }) => {
      return await db.user.create({
        data: input
      });
    }),

  // ✅ Good: Updating existing data
  updateUserProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.user.update({
        where: { id: ctx.user.id },
        data: input
      });
    }),

  // ✅ Good: Complex business operations
  transferMoney: protectedProcedure
    .input(z.object({
      toUserId: z.string(),
      amount: z.number().positive()
    }))
    .mutation(async ({ input, ctx }) => {
      // This involves multiple database operations
      return await db.$transaction(async (tx) => {
        // Debit from sender
        await tx.account.update({
          where: { userId: ctx.user.id },
          data: { balance: { decrement: input.amount } }
        });
        
        // Credit to receiver
        await tx.account.update({
          where: { userId: input.toUserId },
          data: { balance: { increment: input.amount } }
        });
        
        // Log the transaction
        return await tx.transaction.create({
          data: {
            fromUserId: ctx.user.id,
            toUserId: input.toUserId,
            amount: input.amount
          }
        });
      });
    })
});
```

### Common Mistakes

```typescript
// ❌ Bad: Using mutation for reading data
getBlogPosts: publicProcedure.mutation(() => {
  return db.post.findMany(); // This should be a query!
});

// ❌ Bad: Using query for operations with side effects
sendEmail: publicProcedure
  .input(emailSchema)
  .query(async ({ input }) => {
    await emailService.send(input); // Side effect in a query!
    return { success: true };
  });

// ✅ Good: Correct usage
getBlogPosts: publicProcedure.query(() => {
  return db.post.findMany();
});

sendEmail: publicProcedure
  .input(emailSchema)
  .mutation(async ({ input }) => {
    await emailService.send(input);
    return { success: true };
  });
```

## 🏗️ Organizing Procedures and Routers

### Single Router vs Multiple Routers

**Small applications:**
```typescript
// Simple, single router approach
const appRouter = router({
  getUserById: publicProcedure.input(z.string()).query(({ input }) => { /* ... */ }),
  createUser: publicProcedure.input(userSchema).mutation(({ input }) => { /* ... */ }),
  getPostById: publicProcedure.input(z.string()).query(({ input }) => { /* ... */ }),
  createPost: publicProcedure.input(postSchema).mutation(({ input }) => { /* ... */ })
});
```

**Larger applications:**
```typescript
// Organized by domain/feature
const userRouter = router({
  getById: publicProcedure.input(z.string()).query(({ input }) => { /* ... */ }),
  create: publicProcedure.input(userSchema).mutation(({ input }) => { /* ... */ }),
  update: protectedProcedure.input(updateUserSchema).mutation(({ input }) => { /* ... */ }),
  delete: protectedProcedure.input(z.string()).mutation(({ input }) => { /* ... */ })
});

const postRouter = router({
  getById: publicProcedure.input(z.string()).query(({ input }) => { /* ... */ }),
  getByAuthor: publicProcedure.input(z.string()).query(({ input }) => { /* ... */ }),
  create: protectedProcedure.input(postSchema).mutation(({ input }) => { /* ... */ }),
  update: protectedProcedure.input(updatePostSchema).mutation(({ input }) => { /* ... */ }),
  publish: protectedProcedure.input(z.string()).mutation(({ input }) => { /* ... */ })
});

const appRouter = router({
  user: userRouter,
  post: postRouter
});

// Usage:
const user = await trpc.user.getById.query("123");
const post = await trpc.post.create.mutate({ title: "Hello", content: "World" });
```

### Naming Conventions

**For procedures:**
```typescript
// ✅ Good: Clear, action-oriented names
const userRouter = router({
  // Queries - what you're getting
  getById: publicProcedure.query(/* ... */),
  getProfile: publicProcedure.query(/* ... */),
  search: publicProcedure.query(/* ... */),
  
  // Mutations - what action you're performing
  create: publicProcedure.mutation(/* ... */),
  update: publicProcedure.mutation(/* ... */),
  delete: publicProcedure.mutation(/* ... */),
  activate: publicProcedure.mutation(/* ... */),
  deactivate: publicProcedure.mutation(/* ... */)
});

// ❌ Avoid: Redundant prefixes when using nested routers
const userRouter = router({
  getUserById: publicProcedure.query(/* ... */), // Redundant "user"
  createUser: publicProcedure.mutation(/* ... */), // Redundant "user"
});
```

**For routers:**
```typescript
// ✅ Good: Clear domain boundaries
const appRouter = router({
  user: userRouter,        // User management
  post: postRouter,        // Blog posts
  comment: commentRouter,  // Comments
  auth: authRouter,        // Authentication
  admin: adminRouter       // Admin operations
});
```

### Grouping Strategies

**By Domain/Entity:**
```typescript
const appRouter = router({
  user: userRouter,     // All user-related operations
  product: productRouter, // All product-related operations
  order: orderRouter    // All order-related operations
});
```

**By Access Level:**
```typescript
const appRouter = router({
  public: publicRouter,    // Operations anyone can access
  protected: protectedRouter, // Operations requiring authentication
  admin: adminRouter       // Operations requiring admin privileges
});
```

**By Feature:**
```typescript
const appRouter = router({
  auth: authRouter,           // Login, signup, password reset
  profile: profileRouter,     // User profile management
  social: socialRouter,       // Following, likes, comments
  notifications: notificationRouter // Notification preferences
});
```

## 🎯 Best Practices

### 1. Keep Procedures Focused
```typescript
// ✅ Good: Single responsibility
const userRouter = router({
  getProfile: publicProcedure.query(/* get user profile */),
  updateProfile: protectedProcedure.mutation(/* update profile */),
  changePassword: protectedProcedure.mutation(/* change password */)
});

// ❌ Bad: Doing too much in one procedure
const userRouter = router({
  manageUser: protectedProcedure
    .input(z.object({
      action: z.enum(['get', 'update', 'delete', 'changePassword']),
      data: z.any().optional()
    }))
    .mutation(({ input }) => {
      // Complex branching logic - hard to maintain
    })
});
```

### 2. Use Consistent Input/Output Patterns
```typescript
// ✅ Good: Consistent patterns
const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => { /* ... */ }),
    
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateUserSchema
    }))
    .mutation(({ input }) => { /* ... */ })
});

// ❌ Bad: Inconsistent input shapes
const userRouter = router({
  getById: publicProcedure
    .input(z.string()) // Just the ID
    .query(({ input }) => { /* ... */ }),
    
  update: protectedProcedure
    .input(z.object({
      userId: z.string(), // Different field name
      updates: updateUserSchema // Different structure
    }))
    .mutation(({ input }) => { /* ... */ })
});
```

### 3. Design for Client Usage
```typescript
// ✅ Good: Easy to use from the client
const postRouter = router({
  // Separate procedures for different use cases
  getPublished: publicProcedure.query(/* ... */),
  getDrafts: protectedProcedure.query(/* ... */),
  getByTag: publicProcedure.input(z.string()).query(/* ... */)
});

// Client usage is clear:
const posts = await trpc.post.getPublished.query();
const drafts = await trpc.post.getDrafts.query();
const taggedPosts = await trpc.post.getByTag.query("typescript");
```

### 4. Consider Caching and Performance
```typescript
// ✅ Good: Design queries to be cacheable
const userRouter = router({
  // This can be cached effectively
  getPublicProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, name: true, avatar: true, bio: true }
      });
    })
});
```

## 🔗 Next Steps

- **Practice**: Try organizing a simple blog API using these principles
- **Examples**: Look at `examples/04-router-composition/` for practical implementations
- **Validation**: Continue to [Validation Strategy](./validation-strategy.md) to learn about input/output validation
- **Performance**: Read [Performance Considerations](./performance-considerations.md) for optimization strategies

---

**💡 Remember**: Good API design is about making your code easy to understand, maintain, and use. Start simple and refactor as your application grows. 