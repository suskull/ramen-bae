// Learning API: Books Resource
// This is your first backend API! 📚

// In-memory storage for learning (in real apps, this would be a database)
let books = [
  { id: 1, title: "Next.js Guide", author: "Vercel Team", pages: 200 },
  { id: 2, title: "React Patterns", author: "Frontend Masters", pages: 150 },
];

let nextId = 3; // Simple ID counter

// 📖 GET - Retrieve all books
// Purpose: Read data without side effects (safe & idempotent)
// Status: 200 OK (success), 404 if no books found
export async function GET() {
  console.log("📖 GET /api/learning/books - Fetching all books");
  
  if (books.length === 0) {
    return Response.json(
      { message: "No books found", books: [] },
      { status: 404 }
    );
  }

  return Response.json(
    { 
      message: "Books retrieved successfully", 
      count: books.length,
      books 
    },
    { status: 200 }
  );
}

// 📝 POST - Create a new book
// Purpose: Create new resource (NOT idempotent - calling twice creates 2 books)
// Status: 201 Created (new resource), 400 Bad Request (invalid data)
export async function POST(request: Request) {
  console.log("📝 POST /api/learning/books - Creating new book");
  
  try {
    const body = await request.json();
    const { title, author, pages } = body;

    // Input validation (important for security!)
    if (!title || !author || !pages) {
      return Response.json(
        { 
          error: "Missing required fields", 
          required: ["title", "author", "pages"],
          received: body
        },
        { status: 400 }
      );
    }

    if (typeof pages !== 'number' || pages <= 0) {
      return Response.json(
        { error: "Pages must be a positive number" },
        { status: 400 }
      );
    }

    // Create new book
    const newBook = {
      id: nextId++,
      title,
      author,
      pages: Number(pages)
    };

    books.push(newBook);

    return Response.json(
      { 
        message: "Book created successfully", 
        book: newBook 
      },
      { status: 201 } // 201 = Created (not 200!)
    );

  } catch (error) {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
}

// 🔄 PUT - Update/replace entire book
// Purpose: Update resource (idempotent - same result if called multiple times)
// Status: 200 OK (updated), 404 Not Found (book doesn't exist)
export async function PUT(request: Request) {
  console.log("🔄 PUT /api/learning/books - Updating book");
  
  try {
    const body = await request.json();
    const { id, title, author, pages } = body;

    if (!id) {
      return Response.json(
        { error: "Book ID is required for updates" },
        { status: 400 }
      );
    }

    // Find book to update
    const bookIndex = books.findIndex(book => book.id === Number(id));
    
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!title || !author || !pages) {
      return Response.json(
        { error: "All fields required for PUT (title, author, pages)" },
        { status: 400 }
      );
    }

    // Replace entire book (that's what PUT does!)
    books[bookIndex] = {
      id: Number(id),
      title,
      author,
      pages: Number(pages)
    };

    return Response.json(
      { 
        message: "Book updated successfully", 
        book: books[bookIndex] 
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
}

// 🗑️ DELETE - Remove a book
// Purpose: Delete resource (idempotent - deleting same book twice = same result)
// Status: 204 No Content (deleted), 404 Not Found (book doesn't exist)
export async function DELETE(request: Request) {
  console.log("🗑️ DELETE /api/learning/books - Deleting book");
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: "Book ID is required for deletion" },
        { status: 400 }
      );
    }

    // Find book to delete
    const bookIndex = books.findIndex(book => book.id === Number(id));
    
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Remove book from array
    const deletedBook = books.splice(bookIndex, 1)[0];

    // 204 No Content = successful deletion with no response body
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// 🔍 PATCH - Partial update (bonus method!)
// Purpose: Update only specific fields (idempotent)
// Status: 200 OK (updated), 404 Not Found (book doesn't exist)
export async function PATCH(request: Request) {
  console.log("🔍 PATCH /api/learning/books - Partial update");
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json(
        { error: "Book ID is required for updates" },
        { status: 400 }
      );
    }

    // Find book to update
    const bookIndex = books.findIndex(book => book.id === Number(id));
    
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Update only provided fields (that's what PATCH does!)
    books[bookIndex] = { ...books[bookIndex], ...updates };

    return Response.json(
      { 
        message: "Book partially updated successfully", 
        book: books[bookIndex] 
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
} 