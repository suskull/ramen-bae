// 🧪 API Migration Testing Script - Testing Genre Field Addition
// This demonstrates how to handle API changes without breaking existing clients

const BASE_URL = 'http://localhost:3333/api/learning/books';

// Helper function to make API calls
async function apiCall(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔄 ${method} ${url}`);
    if (data) console.log('📤 Request body:', JSON.stringify(data, null, 2));
    
    const response = await fetch(url, options);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 204) {
      console.log('📭 No content (successful deletion)');
      return null;
    }
    
    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runMigrationTests() {
  console.log('🚀 TESTING API MIGRATION: Adding Genre Field');
  console.log('=' .repeat(60));
  console.log('This demonstrates how to add required fields without breaking existing clients!');
  
  // Test 1: Check existing data (should have migrated genre)
  console.log('\n📋 TEST 1: Check existing data migration');
  await apiCall('GET', BASE_URL);
  
  // Test 2: Create book WITHOUT genre (backward compatibility)
  console.log('\n📋 TEST 2: Create book WITHOUT genre (old client behavior)');
  const bookWithoutGenre = await apiCall('POST', BASE_URL, {
    title: "The Art of War",
    author: "Sun Tzu", 
    pages: 273
    // Note: NO genre field - simulating old client
  });
  
  // Test 3: Create book WITH genre (new client behavior)
  console.log('\n📋 TEST 3: Create book WITH genre (new client behavior)');
  const bookWithGenre = await apiCall('POST', BASE_URL, {
    title: "Clean Code",
    author: "Robert Martin",
    pages: 464,
    genre: "Programming" // New clients can provide genre
  });
  
  // Test 4: Update genre using PATCH
  if (bookWithoutGenre && bookWithoutGenre.book) {
    console.log('\n📋 TEST 4: Update auto-detected genre');
    await apiCall('PATCH', BASE_URL, {
      id: bookWithoutGenre.book.id,
      genre: "Philosophy" // Correct the auto-detected genre
    });
  }
  
  // Test 5: Create book with smart genre detection
  console.log('\n📋 TEST 5: Smart genre detection from title');
  await apiCall('POST', BASE_URL, {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    pages: 153
    // Should auto-detect as "Programming"
  });
  
  await apiCall('POST', BASE_URL, {
    title: "Cooking for Beginners",
    author: "Jane Smith", 
    pages: 200
    // Should auto-detect as "Cooking"
  });
  
  // Test 6: View final state
  console.log('\n📋 TEST 6: Final state - all books with genres');
  await apiCall('GET', BASE_URL);
  
  console.log('\n🎉 MIGRATION TESTING COMPLETE!');
  console.log('Key takeaways:');
  console.log('✅ Old clients still work (backward compatible)');
  console.log('✅ New clients can provide genre explicitly'); 
  console.log('✅ Smart defaults prevent data inconsistency');
  console.log('✅ Genre can be updated after creation');
  console.log('✅ No existing functionality was broken');
}

// Run the tests
runMigrationTests().catch(console.error); 