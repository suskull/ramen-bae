/**
 * Shared Types for tRPC Basic Setup Example
 * 
 * These types are used across both server and client to ensure
 * consistency and avoid duplication. In a real application,
 * these might be more complex domain types.
 */

import { z } from 'zod';

// ===== BASIC TYPES =====

/**
 * Simple greeting message structure
 * Used by the hello procedure
 */
export const GreetingSchema = z.object({
  message: z.string(),
  timestamp: z.number().optional(),
});

export type Greeting = z.infer<typeof GreetingSchema>;

/**
 * User input for greeting
 * Demonstrates input validation
 */
export const GreetingInputSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(50, 'Name too long'),
  includeTimestamp: z.boolean().optional().default(false),
});

export type GreetingInput = z.infer<typeof GreetingInputSchema>;

// ===== EXAMPLE DOMAIN TYPES =====

/**
 * Basic user representation
 * Shows how to structure more complex types
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.date(),
  isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Input for creating a new user
 * Notice how this omits generated fields like id and createdAt
 */
export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ===== API RESPONSE TYPES =====

/**
 * Standard API response wrapper
 * Useful for consistent response formatting
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
  });

/**
 * Error response structure
 * Consistent error handling across the API
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  success: z.literal(false),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ===== CONFIGURATION TYPES =====

/**
 * Server configuration
 * Useful for sharing config types
 */
export const ServerConfigSchema = z.object({
  port: z.number().min(1000).max(65535),
  host: z.string().default('localhost'),
  cors: z.object({
    origin: z.string().or(z.array(z.string())),
    credentials: z.boolean().default(true),
  }),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

// ===== UTILITY TYPES =====

/**
 * Pagination parameters
 * Common pattern for list endpoints
 */
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Paginated response wrapper
 * Combines data with pagination info
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// ===== EXPORT COLLECTIONS =====

/**
 * All schemas for easy import
 * Use: import { schemas } from './shared/types'
 */
export const schemas = {
  Greeting: GreetingSchema,
  GreetingInput: GreetingInputSchema,
  User: UserSchema,
  CreateUser: CreateUserSchema,
  Pagination: PaginationSchema,
  ServerConfig: ServerConfigSchema,
  ErrorResponse: ErrorResponseSchema,
} as const;

/**
 * All types for easy import
 * Use: import type { types } from './shared/types'
 */
export type types = {
  Greeting: Greeting;
  GreetingInput: GreetingInput;
  User: User;
  CreateUserInput: CreateUserInput;
  Pagination: Pagination;
  ServerConfig: ServerConfig;
  ErrorResponse: ErrorResponse;
};

// ===== EXAMPLES AND DOCUMENTATION =====

/**
 * Example usage of these types:
 * 
 * SERVER SIDE:
 * ```typescript
 * import { GreetingInputSchema, GreetingSchema } from '../shared/types';
 * 
 * const helloRouter = router({
 *   hello: publicProcedure
 *     .input(GreetingInputSchema)
 *     .output(GreetingSchema)
 *     .query(({ input }) => {
 *       return {
 *         message: `Hello ${input.name}!`,
 *         timestamp: input.includeTimestamp ? Date.now() : undefined
 *       };
 *     })
 * });
 * ```
 * 
 * CLIENT SIDE:
 * ```typescript
 * import type { Greeting, GreetingInput } from '../shared/types';
 * 
 * const greeting: Greeting = await trpc.hello.query({
 *   name: 'World',
 *   includeTimestamp: true
 * });
 * ```
 */ 