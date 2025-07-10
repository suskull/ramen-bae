# 🚀 HTTP Methods Learning Guide

**Welcome to your first backend development lesson!** 

As a frontend developer, you've been *consuming* APIs. Now you'll learn to *build* them!

## 🎯 What You'll Learn

1. **HTTP Methods** - The verbs of the web (GET, POST, PUT, DELETE, PATCH)
2. **Status Codes** - How servers communicate success/failure (200, 201, 400, 404, etc.)
3. **API Design** - RESTful principles and best practices
4. **Input Validation** - Protecting your API from bad data
5. **Error Handling** - Graceful failure management

## 🛠️ Setup & Running

### Step 1: Start Your Development Server
```bash
npm run dev
```
Your Next.js app should be running at http://localhost:3333

### Step 2: Test Your Learning API

#### Option A: Use the Test Script (Recommended)
```bash
node test-api.js
```
This will run through all HTTP methods automatically and show you the results!

#### Option B: Manual Testing with curl
```bash
# GET - Retrieve all books
curl http://localhost:3333/api/learning/books

# POST - Create a new book
curl -X POST http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"title": "My First API Book", "author": "Me", "pages": 100}'

# PUT - Update entire book
curl -X PUT http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"id": 3, "title": "Updated Book", "author": "Updated Author", "pages": 200}'

# PATCH - Partial update
curl -X PATCH http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"id": 3, "pages": 250}'

# DELETE - Remove a book
curl -X DELETE "http://localhost:3333/api/learning/books?id=1"
```

#### Option C: Use Postman/Insomnia
Import these requests into Postman or Insomnia for a GUI experience.

## 📚 Understanding Each HTTP Method

### 🔍 GET - Reading Data
- **Purpose**: Retrieve information without changing anything
- **Safe**: No side effects (doesn't modify data)
- **Idempotent**: Same result every time
- **Status Codes**: 200 (OK), 404 (Not Found)

**Frontend Analogy**: Like reading a variable - `const books = getBooks()`

### ✏️ POST - Creating Data  
- **Purpose**: Create new resources
- **NOT Idempotent**: Calling twice creates two resources
- **Status Codes**: 201 (Created), 400 (Bad Request)

**Frontend Analogy**: Like adding to an array - `books.push(newBook)`

### 🔄 PUT - Replacing Data
- **Purpose**: Replace entire resource
- **Idempotent**: Same result if called multiple times
- **Status Codes**: 200 (OK), 404 (Not Found)

**Frontend Analogy**: Like replacing an object - `books[index] = newBook`

### 🎯 PATCH - Updating Data
- **Purpose**: Update specific fields only
- **Idempotent**: Same result if called multiple times  
- **Status Codes**: 200 (OK), 404 (Not Found)

**Frontend Analogy**: Like spreading an object - `books[index] = {...books[index], ...updates}`

### 🗑️ DELETE - Removing Data
- **Purpose**: Remove resources
- **Idempotent**: Deleting same thing twice = same result
- **Status Codes**: 204 (No Content), 404 (Not Found)

**Frontend Analogy**: Like filtering an array - `books.filter(book => book.id !== deleteId)`

## 🚦 HTTP Status Codes Explained

### 2xx Success
- **200 OK**: Request successful, returning data
- **201 Created**: New resource created successfully
- **204 No Content**: Successful deletion (no response body)

### 4xx Client Errors
- **400 Bad Request**: Invalid data sent by client
- **404 Not Found**: Resource doesn't exist
- **401 Unauthorized**: Authentication required

### 5xx Server Errors
- **500 Internal Server Error**: Something went wrong on server

## 🎓 Learning Exercises

### Exercise 1: Run the Test Script
```bash
node test-api.js
```
Watch the output and understand what each HTTP method does.

### Exercise 2: Break Things (Learning!)
Try these intentionally wrong requests to see error handling:

```bash
# Missing required fields
curl -X POST http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Incomplete Book"}'

# Update non-existent book
curl -X PUT http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"id": 999, "title": "Ghost Book", "author": "Nobody", "pages": 0}'

# Invalid JSON
curl -X POST http://localhost:3333/api/learning/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Bad JSON", "author":}'
```

### Exercise 3: Extend the API
Add a new field to books (e.g., `genre`) and update all methods to handle it.

### Exercise 4: Create Your Own Resource
Build a similar API for a different resource (e.g., movies, recipes, tasks).

## 🧠 Key Concepts to Understand

### Idempotency
**Idempotent**: Same result if called multiple times
- GET, PUT, PATCH, DELETE are idempotent
- POST is NOT idempotent

**Example**: 
- `DELETE /books/1` - First call deletes book, second call still results in book being gone
- `POST /books` - Each call creates a new book

### REST Principles
- **Resources**: Things you can perform actions on (books, users, orders)
- **HTTP Methods**: Actions you can perform (GET, POST, PUT, DELETE)
- **URLs**: Addresses for resources (`/api/books`, `/api/books/123`)

### Input Validation
Always validate incoming data:
- Check required fields exist
- Validate data types
- Sanitize inputs
- Return helpful error messages

## 🔗 Frontend Connection

This is how your backend API connects to frontend code:

```typescript
// Frontend code using your API
const api = {
  // GET request
  getBooks: () => fetch('/api/learning/books').then(r => r.json()),
  
  // POST request  
  createBook: (book) => fetch('/api/learning/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  }).then(r => r.json()),
  
  // PUT request
  updateBook: (book) => fetch('/api/learning/books', {
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  }).then(r => r.json()),
  
  // DELETE request
  deleteBook: (id) => fetch(`/api/learning/books?id=${id}`, {
    method: 'DELETE'
  })
};
```

## 📝 Learning Journal Updates

After completing this exercise, update your learning journal with:

1. **What you learned** about each HTTP method
2. **Challenges faced** and how you solved them  
3. **"Aha!" moments** when concepts clicked
4. **Questions** for further exploration

## 🎯 Next Steps

Once you're comfortable with HTTP methods:

1. **Task 0.2**: Database Design & SQL Fundamentals
2. **Task 0.3**: Docker Environment Setup
3. **Task 0.4**: Authentication & Security
4. **Task 0.5**: tRPC & Type Safety

## 🤔 Common Questions

**Q: Why use different HTTP methods instead of just POST for everything?**
A: Semantic meaning! Each method tells other developers (and tools) what the endpoint does without reading code.

**Q: What's the difference between PUT and PATCH?**
A: PUT replaces the entire resource, PATCH updates only specified fields.

**Q: When should I use 201 vs 200?**
A: 201 for creating new resources (POST), 200 for successful operations that don't create resources.

**Q: Why return 204 for DELETE instead of 200?**
A: 204 means "success, but no content to return" - perfect for deletions.

---

**🎉 Congratulations!** You're building your first backend APIs! This foundation will serve you well as we dive deeper into databases, authentication, and more complex backend concepts.

Remember: Every senior backend developer started exactly where you are now. Keep experimenting, keep learning, and don't be afraid to break things - that's how you learn! 🚀 