
// 🧪 API Testing Script for Learning HTTP Methods
// Run this with: node test-api.js (after starting your Next.js server)

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
    console.error('❌ Error:', error.message);
  }
}

// 🎯 Learning Test Sequence
async function runLearningTests() {
  console.log('🚀 Starting HTTP Methods Learning Tests!');
  console.log('📚 Testing our Books API...\n');

  // Test 1: GET - Retrieve all books
  console.log('='.repeat(50));
  console.log('📖 TEST 1: GET - Retrieve all books');
  await apiCall('GET', BASE_URL);

  // Test 2: POST - Create a new book
  console.log('='.repeat(50));
  console.log('📝 TEST 2: POST - Create a new book');
  await apiCall('POST', BASE_URL, {
    title: 'Backend for Frontend Developers',
    author: 'Your Learning Journey',
    pages: 300
  });

  // Test 3: GET again - See the new book
  console.log('='.repeat(50));
  console.log('📖 TEST 3: GET - See our new book was added');
  await apiCall('GET', BASE_URL);

  // Test 4: PUT - Update entire book
  console.log('='.repeat(50));
  console.log('🔄 TEST 4: PUT - Update entire book (replace all fields)');
  await apiCall('PUT', BASE_URL, {
    id: 3,
    title: 'Full-Stack Development Mastery',
    author: 'Updated Author',
    pages: 450
  });

  // Test 5: PATCH - Partial update
  console.log('='.repeat(50));
  console.log('🔍 TEST 5: PATCH - Partial update (only change pages)');
  await apiCall('PATCH', BASE_URL, {
    id: 3,
    pages: 500  // Only updating pages, keeping title & author
  });

  // Test 6: GET - See the updates
  console.log('='.repeat(50));
  console.log('📖 TEST 6: GET - See our updates');
  await apiCall('GET', BASE_URL);

  // Test 7: DELETE - Remove a book
  console.log('='.repeat(50));
  console.log('🗑️ TEST 7: DELETE - Remove book with ID 1');
  await apiCall('DELETE', `${BASE_URL}?id=1`);

  // Test 8: GET - Final state
  console.log('='.repeat(50));
  console.log('📖 TEST 8: GET - Final state after deletion');
  await apiCall('GET', BASE_URL);

  // Test 9: Error handling - Try to create invalid book
  console.log('='.repeat(50));
  console.log('❌ TEST 9: Error handling - Invalid book data');
  await apiCall('POST', BASE_URL, {
    title: 'Missing Author and Pages'
    // Missing required fields!
  });

  // Test 10: Error handling - Try to update non-existent book
  console.log('='.repeat(50));
  console.log('❌ TEST 10: Error handling - Update non-existent book');
  await apiCall('PUT', BASE_URL, {
    id: 999,
    title: 'Non-existent Book',
    author: 'Ghost Author',
    pages: 100
  });

  console.log('\n🎉 Learning tests complete!');
  console.log('💡 Key takeaways:');
  console.log('   • GET: Retrieves data (safe, idempotent)');
  console.log('   • POST: Creates new resources (not idempotent)');
  console.log('   • PUT: Replaces entire resource (idempotent)');
  console.log('   • PATCH: Updates specific fields (idempotent)');
  console.log('   • DELETE: Removes resource (idempotent)');
  console.log('   • Status codes communicate what happened');
  console.log('   • Input validation prevents bad data');
}

// Run the tests
runLearningTests(); 