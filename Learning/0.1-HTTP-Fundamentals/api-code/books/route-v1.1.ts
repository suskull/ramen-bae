// 🔄 API v1.1: Adding Genre Field (Production Migration Approach)
// This demonstrates Phase 1: Add optional field without breaking existing clients

// In-memory storage for learning (in real apps, this would be a database)
let books = [
  { 
    id: 1, 
    title: "Next.js Guide", 
    author: "Vercel Team", 
    pages: 200,
    genre: "Programming", // Migrated existing data
    version: "1.1",
    migrated: true
  },
  { 
    id: 2, 
    title: "React Patterns", 
    author: "Frontend Masters", 
    pages: 150,
    genre: "Programming", // Migrated existing data
    version: "1.1", 
    migrated: true
  },
];

let nextId = 3;

// 🔄 Migration helper function
function inferGenreFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('react') || titleLower.includes('javascript') || titleLower.includes('next')) return 'Programming';
  if (titleLower.includes('guide') || titleLower.includes('tutorial')) return 'Education';
  if (titleLower.includes('pattern') || titleLower.includes('design')) return 'Technical';
  if (titleLower.includes('cook') || titleLower.includes('recipe')) return 'Cooking';
  if (titleLower.includes('history') || titleLower.includes('war')) return 'History';
  return 'General';
}

// 📖 GET - Retrieve all books (unchanged - backward compatible)
export async function GET() {
  console.log("📖 GET /api/learning/books - Fetching all books (v1.1)");
  
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
      books,
      apiVersion: "1.1"
    },
    { status: 200 }
  );
}

// ➕ POST - Create new book (MIGRATION: Genre now optional with smart defaults)
export async function POST(request: Request) {
  console.log("➕ POST /api/learning/books - Creating new book (v1.1)");
  
  try {
    const body = await request.json();
    const { title, author, pages, genre } = body;

    // ✅ Existing validation (unchanged for backward compatibility)
    if (!title || !author || !pages) {
      return Response.json(
        { 
          error: "Missing required fields", 
          required: ["title", "author", "pages"],
          optional: ["genre"],
          note: "Genre will auto-detect if not provided"
        },
        { status: 400 }
      );
    }

    // ✅ Type validation
    const pageCount = parseInt(pages);
    if (isNaN(pageCount) || pageCount <= 0) {
      return Response.json(
        { error: "Pages must be a positive number" },
        { status: 400 }
      );
    }

    // 🆕 MIGRATION LOGIC: Handle genre field
    let bookGenre = genre;
    let migrationInfo = {};

    if (!genre) {
      // Smart default based on title analysis
      bookGenre = inferGenreFromTitle(title);
      migrationInfo = {
        genreInferred: true,
        inferredFrom: "title analysis",
        note: "Genre was auto-detected. You can update it using PUT/PATCH."
      };
      
      console.log(`🤖 Auto-detected genre "${bookGenre}" for book: ${title}`);
    }

    const newBook = {
      id: nextId++,
      title,
      author,
      pages: pageCount,
      genre: bookGenre, // 🆕 New field with smart default
      version: "1.1",
      createdAt: new Date().toISOString(),
      ...migrationInfo
    };

    books.push(newBook);

    return Response.json(
      { 
        message: "Book created successfully", 
        book: newBook,
        apiVersion: "1.1"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Error creating book:", error);
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
}

// 🔄 PUT - Replace entire book (MIGRATION: Now supports genre)
export async function PUT(request: Request) {
  console.log("🔄 PUT /api/learning/books - Replacing book (v1.1)");
  
  try {
    const body = await request.json();
    const { id, title, author, pages, genre } = body;

    if (!id || !title || !author || !pages) {
      return Response.json(
        { 
          error: "Missing required fields for replacement", 
          required: ["id", "title", "author", "pages"],
          optional: ["genre"]
        },
        { status: 400 }
      );
    }

    const bookIndex = books.findIndex(book => book.id === parseInt(id));
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    // 🆕 Handle genre in replacement
    const bookGenre = genre || inferGenreFromTitle(title);

    books[bookIndex] = {
      id: parseInt(id),
      title,
      author,
      pages: parseInt(pages),
      genre: bookGenre, // 🆕 Include genre
      version: "1.1",
      updatedAt: new Date().toISOString(),
      ...(genre ? {} : { genreInferred: true })
    };

    return Response.json(
      { 
        message: "Book replaced successfully", 
        book: books[bookIndex],
        apiVersion: "1.1"
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

// 🔧 PATCH - Update specific fields (MIGRATION: Genre can be updated)
export async function PATCH(request: Request) {
  console.log("🔧 PATCH /api/learning/books - Updating book fields (v1.1)");
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json(
        { error: "Book ID is required for updates" },
        { status: 400 }
      );
    }

    const bookIndex = books.findIndex(book => book.id === parseInt(id));
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    // ✅ Validate allowed fields
    const allowedFields = ['title', 'author', 'pages', 'genre']; // 🆕 Genre now allowed
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return Response.json(
        { 
          error: "Invalid fields in update", 
          invalidFields,
          allowedFields
        },
        { status: 400 }
      );
    }

    // Apply updates
    const updatedBook = { 
      ...books[bookIndex], 
      ...updates,
      version: "1.1",
      updatedAt: new Date().toISOString()
    };

    // 🆕 If title changed but no genre provided, re-infer genre
    if (updates.title && !updates.genre && !books[bookIndex].genre) {
      updatedBook.genre = inferGenreFromTitle(updates.title);
      updatedBook.genreInferred = true;
    }

    books[bookIndex] = updatedBook;

    return Response.json(
      { 
        message: "Book updated successfully", 
        book: updatedBook,
        updatedFields: Object.keys(updates),
        apiVersion: "1.1"
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

// 🗑️ DELETE - Remove book (unchanged - backward compatible)
export async function DELETE(request: Request) {
  console.log("🗑️ DELETE /api/learning/books - Deleting book (v1.1)");
  
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json(
        { error: "Book ID is required for deletion" },
        { status: 400 }
      );
    }

    const bookIndex = books.findIndex(book => book.id === parseInt(id));
    if (bookIndex === -1) {
      return Response.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    const deletedBook = books[bookIndex];
    books.splice(bookIndex, 1);

    return Response.json(
      { 
        message: "Book deleted successfully", 
        deletedBook,
        apiVersion: "1.1"
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