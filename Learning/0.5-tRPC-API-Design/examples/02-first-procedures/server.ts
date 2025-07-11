/**
 * Basic tRPC Server - Queries vs Mutations Example
 * 
 * This demonstrates the fundamental concepts:
 * - Queries for reading data (no side effects)
 * - Mutations for changing data (has side effects)
 * - Input/output validation with Zod
 * - Error handling with TRPCError
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { z } from 'zod';

// ===== TRPC SETUP =====

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

// ===== SIMPLE IN-MEMORY DATA STORE =====

// Simulate a simple database
let users: Array<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}> = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    createdAt: new Date('2024-01-02'),
  },
];

let posts: Array<{
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: Date;
}> = [
  {
    id: '1',
    title: 'Introduction to tRPC',
    content: 'tRPC is a fantastic way to build type-safe APIs...',
    authorId: '1',
    published: true,
    createdAt: new Date('2024-01-10'),
  },
];

// ===== QUERY EXAMPLES =====

/**
 * Query: Get all users
 * 
 * This is a QUERY because:
 * - It only reads data
 * - No side effects
 * - Safe to call multiple times
 * - Cacheable
 */
const getAllUsers = publicProcedure
  .output(z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  })))
  .query(() => {
    console.log('📖 Query: Getting all users');
    return users;
  });

/**
 * Query: Get user by ID
 * 
 * Input validation with Zod ensures ID is provided and valid.
 */
const getUserById = publicProcedure
  .input(z.object({
    id: z.string().min(1, 'User ID is required'),
  }))
  .output(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  }))
  .query(({ input }) => {
    console.log(`📖 Query: Getting user with ID ${input.id}`);
    
    const user = users.find(u => u.id === input.id);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User with ID ${input.id} not found`,
      });
    }
    
    return user;
  });

/**
 * Query: Search users by name
 * 
 * Demonstrates optional parameters and filtering.
 */
const searchUsers = publicProcedure
  .input(z.object({
    query: z.string().min(1, 'Search query is required'),
    limit: z.number().min(1).max(100).default(10),
  }))
  .output(z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  })))
  .query(({ input }) => {
    console.log(`📖 Query: Searching users for "${input.query}"`);
    
    const filteredUsers = users
      .filter(user => 
        user.name.toLowerCase().includes(input.query.toLowerCase()) ||
        user.email.toLowerCase().includes(input.query.toLowerCase())
      )
      .slice(0, input.limit);
    
    return filteredUsers;
  });

// ===== MUTATION EXAMPLES =====

/**
 * Mutation: Create new user
 * 
 * This is a MUTATION because:
 * - It changes data (adds to users array)
 * - Has side effects
 * - Not safe to call multiple times
 * - Not cacheable
 */
const createUser = publicProcedure
  .input(z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email format'),
  }))
  .output(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  }))
  .mutation(({ input }) => {
    console.log(`✏️ Mutation: Creating user ${input.name}`);
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === input.email);
    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email already exists',
      });
    }
    
    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name: input.name,
      email: input.email,
      createdAt: new Date(),
    };
    
    // Add to our "database"
    users.push(newUser);
    
    console.log(`✅ User created with ID ${newUser.id}`);
    return newUser;
  });

/**
 * Mutation: Update user
 * 
 * Demonstrates partial updates and optimistic validation.
 */
const updateUser = publicProcedure
  .input(z.object({
    id: z.string().min(1, 'User ID is required'),
    data: z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    }).refine(data => data.name || data.email, {
      message: 'At least one field (name or email) must be provided',
    }),
  }))
  .output(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  }))
  .mutation(({ input }) => {
    console.log(`✏️ Mutation: Updating user ${input.id}`);
    
    const userIndex = users.findIndex(u => u.id === input.id);
    if (userIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User with ID ${input.id} not found`,
      });
    }
    
    // Check email uniqueness if email is being updated
    if (input.data.email) {
      const emailExists = users.some(u => 
        u.email === input.data.email && u.id !== input.id
      );
      if (emailExists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already in use by another user',
        });
      }
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...(input.data.name && { name: input.data.name }),
      ...(input.data.email && { email: input.data.email }),
    };
    
    users[userIndex] = updatedUser;
    
    console.log(`✅ User ${input.id} updated`);
    return updatedUser;
  });

/**
 * Mutation: Delete user
 * 
 * Demonstrates destructive operations and cascade handling.
 */
const deleteUser = publicProcedure
  .input(z.object({
    id: z.string().min(1, 'User ID is required'),
  }))
  .output(z.object({
    success: z.boolean(),
    message: z.string(),
  }))
  .mutation(({ input }) => {
    console.log(`✏️ Mutation: Deleting user ${input.id}`);
    
    const userIndex = users.findIndex(u => u.id === input.id);
    if (userIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User with ID ${input.id} not found`,
      });
    }
    
    const user = users[userIndex];
    
    // Remove user
    users.splice(userIndex, 1);
    
    // Also remove their posts (cascade delete)
    const removedPosts = posts.filter(p => p.authorId === input.id).length;
    posts = posts.filter(p => p.authorId !== input.id);
    
    console.log(`✅ User ${input.id} deleted (${removedPosts} posts also removed)`);
    
    return {
      success: true,
      message: `User ${user.name} deleted successfully`,
    };
  });

// ===== ROUTER SETUP =====

/**
 * Main application router
 * 
 * Organizes procedures by functionality:
 * - Queries for reading data
 * - Mutations for changing data
 */
const appRouter = router({
  // === QUERIES (Read Operations) ===
  getAllUsers,
  getUserById,
  searchUsers,
  
  // === MUTATIONS (Write Operations) ===
  createUser,
  updateUser,
  deleteUser,
  
  // === UTILITY PROCEDURES ===
  getStats: publicProcedure
    .output(z.object({
      totalUsers: z.number(),
      totalPosts: z.number(),
      timestamp: z.date(),
    }))
    .query(() => {
      console.log('📊 Query: Getting statistics');
      return {
        totalUsers: users.length,
        totalPosts: posts.length,
        timestamp: new Date(),
      };
    }),
});

export type AppRouter = typeof appRouter;

// ===== SERVER STARTUP =====

const server = createHTTPServer({
  router: appRouter,
});

const PORT = 3002;

server.listen(PORT, () => {
  console.log('🚀 tRPC Server (First Procedures Example) started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available Procedures:');
  console.log('  📖 Queries (read data):');
  console.log('    - getAllUsers');
  console.log('    - getUserById');
  console.log('    - searchUsers');
  console.log('    - getStats');
  console.log('');
  console.log('  ✏️ Mutations (change data):');
  console.log('    - createUser');
  console.log('    - updateUser');
  console.log('    - deleteUser');
  console.log('');
  console.log('🔥 Ready for requests!');
});

// ===== EDUCATIONAL NOTES =====

/**
 * KEY DIFFERENCES:
 * 
 * QUERIES (.query()):
 * - Read operations only
 * - No side effects
 * - Cacheable and safe to retry
 * - Map to GET requests in REST
 * - Examples: getUser, searchPosts, getStats
 * 
 * MUTATIONS (.mutation()):
 * - Write operations
 * - Have side effects
 * - Not cacheable, not safe to retry
 * - Map to POST/PUT/DELETE in REST
 * - Examples: createUser, updatePost, deleteComment
 * 
 * VALIDATION:
 * - .input() validates incoming data
 * - .output() validates outgoing data
 * - Zod provides runtime validation + TypeScript types
 * - TRPCError provides structured error handling
 */ 