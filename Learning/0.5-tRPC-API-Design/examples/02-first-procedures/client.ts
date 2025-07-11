/**
 * tRPC Client - Queries vs Mutations Demo
 * 
 * This demonstrates how to call tRPC procedures from the client:
 * - Queries for reading data
 * - Mutations for changing data
 * - Error handling
 * - Type safety in action
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

// ===== CLIENT SETUP =====

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3002',
    }),
  ],
});

// ===== QUERY EXAMPLES =====

/**
 * Demo: Basic Queries
 * 
 * Queries are for reading data - no side effects.
 */
async function demoQueries() {
  console.log('\n🔍 === QUERY EXAMPLES ===');
  
  try {
    // Get all users
    console.log('\n📖 Getting all users...');
    const allUsers = await trpc.getAllUsers.query();
    console.log('✅ All users:', allUsers);
    console.log(`   Found ${allUsers.length} users`);
    
    // Get specific user
    console.log('\n📖 Getting user by ID...');
    const user = await trpc.getUserById.query({ id: '1' });
    console.log('✅ User found:', user);
    console.log(`   Name: ${user.name}, Email: ${user.email}`);
    
    // Search users
    console.log('\n📖 Searching users...');
    const searchResults = await trpc.searchUsers.query({ 
      query: 'alice',
      limit: 5 
    });
    console.log('✅ Search results:', searchResults);
    console.log(`   Found ${searchResults.length} matching users`);
    
    // Get statistics
    console.log('\n📖 Getting statistics...');
    const stats = await trpc.getStats.query();
    console.log('✅ Statistics:', stats);
    console.log(`   Users: ${stats.totalUsers}, Posts: ${stats.totalPosts}`);
    
  } catch (error: any) {
    console.error('❌ Query error:', error.message);
  }
}

// ===== MUTATION EXAMPLES =====

/**
 * Demo: Basic Mutations
 * 
 * Mutations are for changing data - have side effects.
 */
async function demoMutations() {
  console.log('\n✏️ === MUTATION EXAMPLES ===');
  
  try {
    // Create new user
    console.log('\n✏️ Creating new user...');
    const newUser = await trpc.createUser.mutate({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    });
    console.log('✅ User created:', newUser);
    console.log(`   ID: ${newUser.id}, Created: ${newUser.createdAt}`);
    
    // Update the user we just created
    console.log('\n✏️ Updating user...');
    const updatedUser = await trpc.updateUser.mutate({
      id: newUser.id,
      data: {
        name: 'Charlie Brown Updated',
      },
    });
    console.log('✅ User updated:', updatedUser);
    console.log(`   New name: ${updatedUser.name}`);
    
    // Try to create user with duplicate email (should fail)
    console.log('\n✏️ Trying to create duplicate user...');
    try {
      await trpc.createUser.mutate({
        name: 'Duplicate User',
        email: 'charlie@example.com', // Same email as above
      });
      console.log('❓ This should not appear (duplicate email)');
    } catch (duplicateError: any) {
      console.log('✅ Duplicate prevention worked:', duplicateError.message);
    }
    
    // Delete the user we created
    console.log('\n✏️ Deleting user...');
    const deleteResult = await trpc.deleteUser.mutate({
      id: newUser.id,
    });
    console.log('✅ User deleted:', deleteResult);
    
  } catch (error: any) {
    console.error('❌ Mutation error:', error.message);
  }
}

// ===== ERROR HANDLING EXAMPLES =====

/**
 * Demo: Error Handling
 * 
 * Shows how tRPC handles various error scenarios.
 */
async function demoErrorHandling() {
  console.log('\n🚨 === ERROR HANDLING EXAMPLES ===');
  
  // Try to get non-existent user
  try {
    console.log('\n🚨 Trying to get non-existent user...');
    await trpc.getUserById.query({ id: '999' });
    console.log('❓ This should not appear');
  } catch (error: any) {
    console.log('✅ NOT_FOUND error caught:', error.message);
    console.log(`   Error code: ${error.data?.code}`);
  }
  
  // Try to create user with invalid data
  try {
    console.log('\n🚨 Trying to create user with invalid email...');
    await trpc.createUser.mutate({
      name: 'Invalid User',
      email: 'not-an-email', // Invalid email format
    });
    console.log('❓ This should not appear');
  } catch (error: any) {
    console.log('✅ Validation error caught:', error.message);
  }
  
  // Try to update user with no data
  try {
    console.log('\n🚨 Trying to update user with no data...');
    await trpc.updateUser.mutate({
      id: '1',
      data: {}, // No fields provided
    });
    console.log('❓ This should not appear');
  } catch (error: any) {
    console.log('✅ Custom validation error caught:', error.message);
  }
}

// ===== TYPE SAFETY EXAMPLES =====

/**
 * Demo: Type Safety Benefits
 * 
 * Shows what TypeScript prevents at compile time.
 */
function demoTypeSafety() {
  console.log('\n🛡️ === TYPE SAFETY EXAMPLES ===');
  
  console.log('✅ These work (correct types):');
  console.log('   await trpc.getUserById.query({ id: "123" })');
  console.log('   await trpc.createUser.mutate({ name: "John", email: "john@email.com" })');
  console.log('   await trpc.searchUsers.query({ query: "alice", limit: 10 })');
  
  console.log('\n❌ These would cause TypeScript errors:');
  console.log('   // await trpc.getUserById.query({ id: 123 })              // id must be string');
  console.log('   // await trpc.getUserById.query({})                       // id is required');
  console.log('   // await trpc.createUser.query({ ... })                   // createUser is mutation');
  console.log('   // await trpc.createUser.mutate({ name: "John" })         // email required');
  console.log('   // await trpc.createUser.mutate({ email: "invalid" })     // name required');
  console.log('   // const user = await trpc.getUserById.query({ id: "1" });');
  console.log('   // console.log(user.nonExistentField);                     // field doesn\'t exist');
  
  console.log('\n🎉 TypeScript catches all these errors before runtime!');
}

// ===== PERFORMANCE COMPARISON =====

/**
 * Demo: Performance Comparison
 * 
 * Shows the difference between multiple individual calls vs batched calls.
 */
async function demoPerformance() {
  console.log('\n⚡ === PERFORMANCE COMPARISON ===');
  
  try {
    // Individual calls (slower)
    console.log('\n⏱️ Making 3 individual calls...');
    const start1 = Date.now();
    
    const user1 = await trpc.getUserById.query({ id: '1' });
    const user2 = await trpc.getUserById.query({ id: '2' });
    const stats = await trpc.getStats.query();
    
    const duration1 = Date.now() - start1;
    console.log(`✅ Individual calls completed in ${duration1}ms`);
    
    // Parallel calls (faster)
    console.log('\n⚡ Making 3 parallel calls...');
    const start2 = Date.now();
    
    const [parallelUser1, parallelUser2, parallelStats] = await Promise.all([
      trpc.getUserById.query({ id: '1' }),
      trpc.getUserById.query({ id: '2' }),
      trpc.getStats.query(),
    ]);
    
    const duration2 = Date.now() - start2;
    console.log(`✅ Parallel calls completed in ${duration2}ms`);
    console.log(`🚀 Parallel was ${Math.round(duration1 / duration2)}x faster!`);
    
    // Note: tRPC automatically batches parallel calls when using httpBatchLink
    console.log('\n💡 Note: tRPC automatically batches these parallel calls into a single HTTP request!');
    
  } catch (error: any) {
    console.error('❌ Performance demo error:', error.message);
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('🎯 tRPC First Procedures Client Demo');
  console.log('=====================================');
  console.log('📡 Connecting to server at http://localhost:3002');
  
  try {
    await demoQueries();
    await demoMutations();
    await demoErrorHandling();
    demoTypeSafety();
    await demoPerformance();
    
    console.log('\n🎉 All demos completed successfully!');
    console.log('\n💡 Key Takeaways:');
    console.log('   📖 Queries: Read data, no side effects, cacheable');
    console.log('   ✏️ Mutations: Change data, has side effects, not cacheable');
    console.log('   🛡️ Type Safety: Catch errors at compile time');
    console.log('   🚨 Error Handling: Structured errors with codes');
    console.log('   ⚡ Performance: Automatic request batching');
    console.log('   🎯 Developer Experience: Autocomplete and refactoring safety');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error);
    console.log('\n🔧 Make sure the server is running:');
    console.log('   npm run server');
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
} 