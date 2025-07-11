/**
 * Basic tRPC Client Setup
 * 
 * This demonstrates how to connect to a tRPC server from a vanilla TypeScript client.
 * This is the foundation - you can adapt this for React, Vue, or any other framework.
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/index';

// ===== CLIENT SETUP =====

/**
 * Create tRPC Client
 * 
 * This creates a typed client that connects to our server.
 * The magic is in the AppRouter type - it gives us full type safety!
 */
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    /**
     * HTTP Batch Link
     * 
     * This batches multiple requests together for better performance.
     * Instead of making 3 separate HTTP requests, it can combine them into 1.
     */
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      
      /**
       * Headers for all requests
       * 
       * Useful for authentication, tracking, etc.
       */
      headers() {
        return {
          'x-client-version': '1.0.0',
          'x-client-type': 'vanilla-ts',
        };
      },
      
      /**
       * Request transformation
       * 
       * Modify requests before they're sent (add auth tokens, etc.)
       */
      fetch(url, options) {
        console.log(`🌐 tRPC Request: ${url}`);
        return fetch(url, {
          ...options,
          // Add any global request options here
        });
      },
    }),
  ],
});

// ===== EXAMPLE USAGE =====

/**
 * Demo Function: Basic Queries
 * 
 * Shows how to call tRPC procedures with full type safety.
 */
async function demoBasicQueries() {
  console.log('\n🚀 === Basic Queries Demo ===');
  
  try {
    // Simple hello query
    console.log('\n📞 Calling hello procedure...');
    const greeting = await trpc.hello.query({
      name: 'tRPC Learner',
      includeTimestamp: true,
    });
    console.log('✅ Response:', greeting);
    // TypeScript knows: greeting = { message: string, timestamp?: number }
    
    // Current time query (no input)
    console.log('\n📞 Calling getCurrentTime procedure...');
    const timeInfo = await trpc.getCurrentTime.query();
    console.log('✅ Response:', timeInfo);
    // TypeScript knows: timeInfo = { timestamp: number, iso: string, timezone: string }
    
    // Echo query (any input)
    console.log('\n📞 Calling echo procedure...');
    const echoResult = await trpc.echo.query({
      message: 'Hello from client!',
      data: { numbers: [1, 2, 3], active: true },
    });
    console.log('✅ Response:', echoResult);
    
  } catch (error) {
    console.error('❌ Query Error:', error);
  }
}

/**
 * Demo Function: Mutations
 * 
 * Shows how mutations work (data-changing operations).
 */
async function demoMutations() {
  console.log('\n🚀 === Mutations Demo ===');
  
  try {
    // Create user mutation
    console.log('\n📞 Creating a new user...');
    const newUser = await trpc.createUser.mutate({
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log('✅ User created:', newUser);
    // TypeScript knows: newUser = { id: string, name: string, email: string, createdAt: Date, isActive: boolean }
    
    // Update counter mutations
    console.log('\n📞 Updating counter...');
    
    const increment = await trpc.updateCounter.mutate({
      action: 'increment',
      amount: 5,
    });
    console.log('✅ Counter incremented:', increment);
    
    const decrement = await trpc.updateCounter.mutate({
      action: 'decrement',
      amount: 2,
    });
    console.log('✅ Counter decremented:', decrement);
    
    const reset = await trpc.updateCounter.mutate({
      action: 'reset',
    });
    console.log('✅ Counter reset:', reset);
    
  } catch (error) {
    console.error('❌ Mutation Error:', error);
  }
}

/**
 * Demo Function: Error Handling
 * 
 * Shows how tRPC handles and propagates errors.
 */
async function demoErrorHandling() {
  console.log('\n🚀 === Error Handling Demo ===');
  
  const errorTypes = ['client', 'server', 'unauthorized', 'notfound', 'custom'] as const;
  
  for (const errorType of errorTypes) {
    try {
      console.log(`\n📞 Testing ${errorType} error...`);
      await trpc.errorDemo.query({
        errorType,
        message: `This is a ${errorType} error example`,
      });
      console.log('❓ This should not appear (error expected)');
      
    } catch (error: any) {
      console.log(`✅ Caught ${errorType} error:`, {
        code: error.data?.code,
        message: error.message,
        httpStatus: error.data?.httpStatus,
      });
    }
  }
}

/**
 * Demo Function: Complex Validation
 * 
 * Shows Zod validation in action with complex nested data.
 */
async function demoComplexValidation() {
  console.log('\n🚀 === Complex Validation Demo ===');
  
  try {
    console.log('\n📞 Sending complex validated data...');
    const result = await trpc.complexValidation.mutate({
      user: {
        name: 'Alice Johnson',
        age: 28,
        email: 'alice@example.com',
      },
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
      tags: ['developer', 'typescript', 'react'],
      metadata: {
        source: 'client-demo',
        version: '1.0.0',
        timestamp: Date.now(),
      },
    });
    console.log('✅ Validation successful:', result);
    
  } catch (error: any) {
    console.error('❌ Validation Error:', error.message);
    
    // Zod validation errors are detailed and helpful
    if (error.data?.zodError) {
      console.error('📋 Validation details:', error.data.zodError.fieldErrors);
    }
  }
}

/**
 * Demo Function: Type Safety Examples
 * 
 * Shows how TypeScript catches errors at compile time.
 */
function demoTypeSafety() {
  console.log('\n🚀 === Type Safety Demo ===');
  
  // ✅ This works - correct types
  console.log('✅ This code has correct types:');
  console.log(`
    const greeting = await trpc.hello.query({
      name: 'World',           // ✅ string required
      includeTimestamp: true   // ✅ boolean optional
    });
    console.log(greeting.message);     // ✅ TypeScript knows this exists
    console.log(greeting.timestamp);   // ✅ TypeScript knows this is optional
  `);
  
  // ❌ These would cause TypeScript errors (commented out):
  console.log('❌ These would cause TypeScript errors:');
  console.log(`
    // await trpc.hello.query({ name: 123 });              // ❌ name must be string
    // await trpc.hello.query({});                          // ❌ name is required
    // await trpc.createUser.query({ ... });               // ❌ createUser is mutation, not query
    // const user = await trpc.createUser.mutate({ name: "John" }); // ❌ email is required
    // console.log(greeting.nonExistentField);              // ❌ Field doesn't exist
  `);
  
  console.log('🎉 TypeScript prevents all these errors at compile time!');
}

// ===== MAIN EXECUTION =====

/**
 * Main function to run all demos
 */
async function main() {
  console.log('🎯 tRPC Client Demo Starting...');
  console.log('📡 Connecting to server at http://localhost:3001/trpc');
  
  try {
    // Run all demos in sequence
    await demoBasicQueries();
    await demoMutations();
    await demoErrorHandling();
    await demoComplexValidation();
    demoTypeSafety();
    
    console.log('\n🎉 All demos completed successfully!');
    console.log('\n💡 Key Takeaways:');
    console.log('   ✅ Full type safety from server to client');
    console.log('   ✅ Automatic input/output validation');
    console.log('   ✅ Excellent error handling and reporting');
    console.log('   ✅ Great developer experience with autocomplete');
    console.log('   ✅ No manual API documentation needed');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error);
    console.log('\n🔧 Make sure the server is running:');
    console.log('   npm run server');
  }
}

// ===== ERROR HANDLING =====

/**
 * Global error handler
 */
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// ===== EXPORT CLIENT =====

/**
 * Export the client for use in other files
 */
export { trpc };

// ===== RUN DEMO =====

/**
 * Run the demo if this file is executed directly
 */
if (require.main === module) {
  main().catch(console.error);
}

// ===== LEARNING NOTES =====

/**
 * KEY LEARNING POINTS:
 * 
 * 1. **Type Import**: Import the router type from server for type safety
 * 2. **Client Creation**: Use createTRPCProxyClient with the router type
 * 3. **Links**: Configure how requests are sent (HTTP, WebSocket, etc.)
 * 4. **Queries vs Mutations**: .query() for reads, .mutate() for writes
 * 5. **Error Handling**: Errors are structured and include validation details
 * 6. **Type Safety**: TypeScript catches API mismatches at compile time
 * 
 * BENEFITS OVER TRADITIONAL APIs:
 * - No manual type definitions needed
 * - Automatic validation and error handling
 * - Excellent IDE support with autocomplete
 * - Refactoring safety across client/server
 * - Built-in request batching and optimization
 */ 