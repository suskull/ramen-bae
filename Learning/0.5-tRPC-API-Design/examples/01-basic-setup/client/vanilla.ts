/**
 * Vanilla tRPC Client Example
 * 
 * This is a simplified example showing the bare minimum needed
 * to connect to a tRPC server. Perfect for learning the basics.
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/index';

// ===== SIMPLE CLIENT SETUP =====

/**
 * Create the simplest possible tRPC client
 */
const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
    }),
  ],
});

// ===== BASIC EXAMPLES =====

/**
 * Example 1: Simple Query
 */
async function example1_SimpleQuery() {
  console.log('\n📞 Example 1: Simple Query');
  
  try {
    const result = await client.hello.query({
      name: 'World',
    });
    
    console.log('✅ Result:', result);
    console.log('📝 Type info: result is { message: string, timestamp?: number }');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 2: Simple Mutation
 */
async function example2_SimpleMutation() {
  console.log('\n📞 Example 2: Simple Mutation');
  
  try {
    const user = await client.createUser.mutate({
      name: 'Alice',
      email: 'alice@example.com',
    });
    
    console.log('✅ User created:', user);
    console.log('📝 Type info: user is User type with id, name, email, etc.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 3: Query with No Input
 */
async function example3_NoInputQuery() {
  console.log('\n📞 Example 3: Query with No Input');
  
  try {
    const time = await client.getCurrentTime.query();
    
    console.log('✅ Current time:', time);
    console.log('📝 Type info: time is { timestamp: number, iso: string, timezone: string }');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 4: Handling Errors
 */
async function example4_ErrorHandling() {
  console.log('\n📞 Example 4: Handling Errors');
  
  try {
    // This will throw an error
    await client.errorDemo.query({
      errorType: 'client',
      message: 'Testing error handling',
    });
    
  } catch (error: any) {
    console.log('✅ Caught error as expected:');
    console.log('   Code:', error.data?.code);
    console.log('   Message:', error.message);
    console.log('📝 tRPC errors are structured and informative');
  }
}

/**
 * Example 5: Type Safety Demo
 */
function example5_TypeSafety() {
  console.log('\n📞 Example 5: Type Safety');
  
  console.log('✅ These work (correct types):');
  console.log('   client.hello.query({ name: "World" })');
  console.log('   client.createUser.mutate({ name: "John", email: "john@example.com" })');
  
  console.log('\n❌ These would cause TypeScript errors:');
  console.log('   // client.hello.query({ name: 123 })           // name must be string');
  console.log('   // client.hello.query({})                      // name is required');
  console.log('   // client.createUser.query({ ... })           // createUser is a mutation');
  console.log('   // client.createUser.mutate({ name: "John" }) // email is required');
  
  console.log('\n🎉 TypeScript prevents these errors at compile time!');
}

// ===== RUN EXAMPLES =====

async function runAllExamples() {
  console.log('🎯 Vanilla tRPC Client Examples');
  console.log('================================');
  
  try {
    await example1_SimpleQuery();
    await example2_SimpleMutation();
    await example3_NoInputQuery();
    await example4_ErrorHandling();
    example5_TypeSafety();
    
    console.log('\n🎉 All examples completed!');
    
  } catch (error) {
    console.error('\n💥 Example failed:', error);
    console.log('🔧 Make sure the server is running: npm run server');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export client for other files to use
export { client };

// ===== KEY TAKEAWAYS =====

/**
 * What you learned:
 * 
 * 1. **Simple Setup**: Just createTRPCProxyClient + httpBatchLink + router type
 * 2. **Type Safety**: Import AppRouter type for full TypeScript support
 * 3. **Queries vs Mutations**: .query() for reads, .mutate() for writes
 * 4. **Error Handling**: Structured errors with codes and messages
 * 5. **No Manual Work**: No need to define types, schemas, or docs manually
 * 
 * Compare to traditional REST APIs:
 * - No fetch() calls with string URLs
 * - No manual typing of request/response
 * - No need to write OpenAPI/Swagger docs
 * - Automatic validation and error handling
 * - Refactoring safety across client and server
 */ 