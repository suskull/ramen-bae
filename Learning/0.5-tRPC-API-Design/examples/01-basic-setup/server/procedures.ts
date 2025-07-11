/**
 * Basic tRPC Procedures
 * 
 * This file contains simple procedure examples that demonstrate:
 * - Input/output validation with Zod
 * - Queries vs mutations
 * - Type safety across the stack
 * - Error handling
 */

import { z } from 'zod';
import { publicProcedure } from './router';
import { GreetingInputSchema, GreetingSchema, CreateUserSchema, UserSchema } from '../shared/types';

// ===== SIMPLE PROCEDURES =====

/**
 * Hello World Procedure
 * 
 * This is the simplest possible tRPC procedure:
 * - Takes a name as input
 * - Returns a greeting message
 * - Demonstrates basic input/output validation
 */
export const helloProcedure = publicProcedure
  .input(GreetingInputSchema)
  .output(GreetingSchema)
  .query(({ input }) => {
    console.log(`📞 Hello procedure called with:`, input);
    
    return {
      message: `Hello ${input.name}! Welcome to tRPC.`,
      timestamp: input.includeTimestamp ? Date.now() : undefined,
    };
  });

/**
 * Get Current Time Procedure
 * 
 * Example of a procedure with no input:
 * - No input validation needed
 * - Returns current server time
 * - Useful for testing server connectivity
 */
export const getCurrentTimeProcedure = publicProcedure
  .output(z.object({
    timestamp: z.number(),
    iso: z.string(),
    timezone: z.string(),
  }))
  .query(() => {
    const now = new Date();
    console.log(`📞 Current time procedure called at ${now.toISOString()}`);
    
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  });

/**
 * Echo Procedure
 * 
 * Demonstrates handling any type of input:
 * - Accepts any JSON-serializable data
 * - Returns it unchanged
 * - Useful for testing data serialization
 */
export const echoProcedure = publicProcedure
  .input(z.any())
  .output(z.object({
    echoed: z.any(),
    receivedAt: z.number(),
    type: z.string(),
  }))
  .query(({ input }) => {
    console.log(`📞 Echo procedure called with:`, typeof input, input);
    
    return {
      echoed: input,
      receivedAt: Date.now(),
      type: typeof input,
    };
  });

// ===== MUTATION EXAMPLES =====

/**
 * Create User Procedure (Mutation)
 * 
 * Demonstrates a mutation (changes data):
 * - Uses .mutation() instead of .query()
 * - Validates complex input structure
 * - Simulates database creation
 * - Returns created user with generated fields
 */
export const createUserProcedure = publicProcedure
  .input(CreateUserSchema)
  .output(UserSchema)
  .mutation(({ input }) => {
    console.log(`📞 Create user mutation called with:`, input);
    
    // Simulate database creation
    const newUser = {
      id: crypto.randomUUID(), // Generate unique ID
      name: input.name,
      email: input.email,
      createdAt: new Date(),
      isActive: true,
    };
    
    console.log(`✅ User created:`, newUser);
    return newUser;
  });

/**
 * Update Counter Procedure (Mutation)
 * 
 * Demonstrates stateful mutations:
 * - Maintains server-side state
 * - Shows increment/decrement operations
 * - Returns new state after mutation
 */
let counter = 0; // Simple in-memory state

export const updateCounterProcedure = publicProcedure
  .input(z.object({
    action: z.enum(['increment', 'decrement', 'reset']),
    amount: z.number().min(1).default(1),
  }))
  .output(z.object({
    value: z.number(),
    previousValue: z.number(),
    action: z.string(),
  }))
  .mutation(({ input }) => {
    const previousValue = counter;
    
    switch (input.action) {
      case 'increment':
        counter += input.amount;
        break;
      case 'decrement':
        counter -= input.amount;
        break;
      case 'reset':
        counter = 0;
        break;
    }
    
    console.log(`📞 Counter ${input.action}: ${previousValue} → ${counter}`);
    
    return {
      value: counter,
      previousValue,
      action: input.action,
    };
  });

// ===== ERROR HANDLING EXAMPLES =====

/**
 * Error Demonstration Procedure
 * 
 * Shows how tRPC handles errors:
 * - TRPCError for controlled errors
 * - Different error codes
 * - Error data passing
 */
export const errorDemoProcedure = publicProcedure
  .input(z.object({
    errorType: z.enum(['client', 'server', 'unauthorized', 'notfound', 'custom']),
    message: z.string().optional(),
  }))
  .query(({ input }) => {
    console.log(`📞 Error demo called with:`, input);
    
    // Import TRPCError (normally at top of file)
    const { TRPCError } = require('@trpc/server');
    
    switch (input.errorType) {
      case 'client':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: input.message || 'This is a client error (400)',
        });
      
      case 'server':
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: input.message || 'This is a server error (500)',
        });
      
      case 'unauthorized':
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: input.message || 'You are not authorized (401)',
        });
      
      case 'notfound':
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: input.message || 'Resource not found (404)',
        });
      
      case 'custom':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: input.message || 'Custom error with data',
          cause: 'This is additional error data',
        });
      
      default:
        return { message: 'No error - this should not happen!' };
    }
  });

// ===== VALIDATION EXAMPLES =====

/**
 * Complex Validation Procedure
 * 
 * Demonstrates advanced Zod validation:
 * - Nested objects
 * - Arrays with validation
 * - Custom validation rules
 * - Conditional validation
 */
export const complexValidationProcedure = publicProcedure
  .input(z.object({
    user: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      age: z.number().min(0).max(150),
      email: z.string().email(),
    }),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      notifications: z.boolean(),
      language: z.string().length(2), // ISO language code
    }),
    tags: z.array(z.string().min(1)).min(1, 'At least one tag required').max(10, 'Too many tags'),
    metadata: z.record(z.unknown()).optional(), // Key-value pairs
  }))
  .output(z.object({
    success: z.boolean(),
    validatedData: z.any(),
    summary: z.string(),
  }))
  .mutation(({ input }) => {
    console.log(`📞 Complex validation procedure called`);
    console.log(`   User: ${input.user.name} (${input.user.age})`);
    console.log(`   Tags: ${input.tags.join(', ')}`);
    console.log(`   Theme: ${input.preferences.theme}`);
    
    return {
      success: true,
      validatedData: input,
      summary: `Validated data for ${input.user.name} with ${input.tags.length} tags`,
    };
  });

// ===== EXPORT ALL PROCEDURES =====

/**
 * Export all procedures for use in the main router
 * This keeps the router file clean and organized
 */
export const procedures = {
  hello: helloProcedure,
  getCurrentTime: getCurrentTimeProcedure,
  echo: echoProcedure,
  createUser: createUserProcedure,
  updateCounter: updateCounterProcedure,
  errorDemo: errorDemoProcedure,
  complexValidation: complexValidationProcedure,
} as const;

// ===== EDUCATIONAL NOTES =====

/**
 * KEY LEARNING POINTS:
 * 
 * 1. **Procedure Types**:
 *    - .query() - for reading data (GET-like)
 *    - .mutation() - for changing data (POST/PUT/DELETE-like)
 * 
 * 2. **Input/Output Validation**:
 *    - .input() - validates incoming data
 *    - .output() - validates outgoing data (optional but recommended)
 * 
 * 3. **Type Safety**:
 *    - Input is automatically typed based on Zod schema
 *    - Return type is inferred from the function
 *    - TypeScript catches mismatches at compile time
 * 
 * 4. **Error Handling**:
 *    - Use TRPCError for controlled errors
 *    - Different error codes map to HTTP status codes
 *    - Errors are automatically serialized to the client
 * 
 * 5. **Best Practices**:
 *    - Always validate inputs with Zod
 *    - Use descriptive procedure names
 *    - Include helpful error messages
 *    - Log procedure calls for debugging
 *    - Keep procedures focused and single-purpose
 */ 