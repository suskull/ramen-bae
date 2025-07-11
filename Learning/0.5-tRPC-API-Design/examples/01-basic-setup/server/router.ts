/**
 * tRPC Router Setup
 * 
 * This file sets up the core tRPC router, context, and procedure definitions.
 * It's the foundation that all other procedures will build upon.
 */

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// ===== CONTEXT SETUP =====

/**
 * Context interface
 * 
 * Context is data that's available to all procedures.
 * In a real app, this might include:
 * - Database connections
 * - User authentication info
 * - Request/response objects
 * - Logging utilities
 */
export interface Context {
  // Basic request info
  userAgent?: string;
  ip?: string;
  
  // Simulated user (in real apps, this comes from auth)
  user?: {
    id: string;
    name: string;
    role: 'admin' | 'user' | 'guest';
  } | null;
  
  // Request metadata
  requestId: string;
  timestamp: number;
}

/**
 * Create context function
 * 
 * This function is called for every request to create the context.
 * In Express.js, it receives req/res objects.
 * In Next.js, it receives the NextApiRequest/NextApiResponse.
 */
export function createContext(): Context {
  return {
    // Generate unique request ID for tracing
    requestId: crypto.randomUUID(),
    timestamp: Date.now(),
    
    // In a real app, you'd extract these from the request
    userAgent: 'tRPC-Example-Client',
    ip: '127.0.0.1',
    
    // Simulated user - in real apps, extract from JWT/session
    user: null, // Will be set by auth middleware
  };
}

// ===== TRPC INITIALIZATION =====

/**
 * Initialize tRPC with context
 * 
 * This creates the base tRPC instance with our context type.
 * All procedures will have access to this context.
 */
const t = initTRPC.context<Context>().create({
  /**
   * Error formatting
   * 
   * This function runs whenever an error occurs in a procedure.
   * You can customize how errors are sent to the client.
   */
  errorFormatter({ shape, error }) {
    console.error(`🚨 tRPC Error [${error.code}]:`, error.message);
    
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error data
        requestId: error.cause?.requestId,
        timestamp: Date.now(),
      },
    };
  },
  
  /**
   * Data transformers
   * 
   * These handle serialization of complex types like Dates.
   * SuperJSON is popular for this, but we'll keep it simple.
   */
  transformer: {
    serialize: (data) => data,
    deserialize: (data) => data,
  },
});

// ===== PROCEDURE BUILDERS =====

/**
 * Base router
 * 
 * This is used to create the main application router.
 * All sub-routers will be merged into this.
 */
export const router = t.router;

/**
 * Public procedure
 * 
 * A procedure that anyone can call.
 * No authentication required.
 */
export const publicProcedure = t.procedure;

/**
 * Middleware for logging
 * 
 * This runs before every procedure and logs the call.
 * Middleware can modify context, validate auth, etc.
 */
const loggingMiddleware = t.middleware(({ path, type, next, ctx }) => {
  const start = Date.now();
  console.log(`📞 tRPC ${type.toUpperCase()} ${path} [${ctx.requestId}] started`);
  
  return next({
    ctx: {
      ...ctx,
      // Add timing info to context
      startTime: start,
    },
  }).then((result) => {
    const duration = Date.now() - start;
    console.log(`✅ tRPC ${type.toUpperCase()} ${path} [${ctx.requestId}] completed in ${duration}ms`);
    return result;
  }).catch((error) => {
    const duration = Date.now() - start;
    console.log(`❌ tRPC ${type.toUpperCase()} ${path} [${ctx.requestId}] failed in ${duration}ms:`, error.message);
    throw error;
  });
});

/**
 * Logged procedure
 * 
 * Same as publicProcedure but with automatic logging.
 * Use this instead of publicProcedure for better debugging.
 */
export const loggedProcedure = publicProcedure.use(loggingMiddleware);

/**
 * Authentication middleware
 * 
 * This checks if a user is authenticated.
 * In a real app, this would validate JWT tokens or sessions.
 */
const authMiddleware = t.middleware(({ ctx, next }) => {
  // Simulate authentication check
  // In a real app, you'd check JWT token, session, etc.
  const isAuthenticated = ctx.user !== null;
  
  if (!isAuthenticated) {
    // Import TRPCError for proper error handling
    const { TRPCError } = require('@trpc/server');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this procedure',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      // Ensure user is not null for authenticated procedures
      user: ctx.user!,
    },
  });
});

/**
 * Protected procedure
 * 
 * A procedure that requires authentication.
 * Will throw UNAUTHORIZED error if user is not logged in.
 */
export const protectedProcedure = loggedProcedure.use(authMiddleware);

/**
 * Admin-only middleware
 * 
 * Checks if the authenticated user is an admin.
 */
const adminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    const { TRPCError } = require('@trpc/server');
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  return next({ ctx });
});

/**
 * Admin procedure
 * 
 * A procedure that requires admin privileges.
 * Will throw FORBIDDEN error if user is not an admin.
 */
export const adminProcedure = protectedProcedure.use(adminMiddleware);

// ===== UTILITY FUNCTIONS =====

/**
 * Simulate user login
 * 
 * In a real app, this would be handled by your auth system.
 * This is just for demonstration purposes.
 */
export function simulateLogin(userId: string, name: string, role: 'admin' | 'user' | 'guest' = 'user'): Context['user'] {
  return {
    id: userId,
    name,
    role,
  };
}

/**
 * Context with user
 * 
 * Helper function to create context with a logged-in user.
 * Useful for testing protected procedures.
 */
export function createContextWithUser(user: Context['user']): Context {
  return {
    ...createContext(),
    user,
  };
}

// ===== EXAMPLE MIDDLEWARE =====

/**
 * Rate limiting middleware
 * 
 * Example of more advanced middleware.
 * In production, you'd use Redis or similar for distributed rate limiting.
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const rateLimitMiddleware = t.middleware(({ ctx, next }) => {
  const key = ctx.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute
  
  const current = requestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset window
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    // Increment count
    current.count++;
    
    if (current.count > maxRequests) {
      const { TRPCError } = require('@trpc/server');
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Try again later.',
      });
    }
  }
  
  return next({ ctx });
});

/**
 * Rate limited procedure
 * 
 * A procedure with built-in rate limiting.
 */
export const rateLimitedProcedure = loggedProcedure.use(rateLimitMiddleware);

// ===== EDUCATIONAL NOTES =====

/**
 * KEY CONCEPTS:
 * 
 * 1. **Context**: Data available to all procedures (user, db, etc.)
 * 2. **Middleware**: Code that runs before procedures (auth, logging, etc.)
 * 3. **Procedure Types**: Different levels of access control
 * 4. **Error Handling**: Consistent error formatting and codes
 * 5. **Type Safety**: Full TypeScript support throughout
 * 
 * PROCEDURE HIERARCHY:
 * - publicProcedure: Anyone can call
 * - loggedProcedure: Same as public but with logging
 * - protectedProcedure: Requires authentication
 * - adminProcedure: Requires admin role
 * - rateLimitedProcedure: Has rate limiting
 * 
 * MIDDLEWARE CHAIN:
 * publicProcedure
 *   → loggingMiddleware
 *   → authMiddleware (for protected)
 *   → adminMiddleware (for admin)
 *   → rateLimitMiddleware (for rate limited)
 *   → your procedure function
 */

export { createContext }; 