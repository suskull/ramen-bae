# 🔄 Real-World API Migrations: Adding Required Fields

**Scenario:** Add a required `genre` field to our Books API without breaking existing clients or data.

## ❌ **What NOT to Do (Breaking Change)**

```typescript
// DON'T DO THIS - Will break everything!
export async function POST(request: Request) {
  const { title, author, pages, genre } = await request.json();
  
  // This will fail for existing clients who don't send genre
  if (!genre) {
    return Response.json({ error: "Genre is required" }, { status: 400 });
  }
}
```

**Problems:**
- Existing mobile apps crash
- Old data becomes invalid
- No rollback strategy
- Client applications break immediately

## ✅ **Production-Ready Approach: Phased Migration**

### **Phase 1: Add Optional Field (Non-Breaking)**

First, add the field as **optional** to maintain compatibility:

```typescript
// Phase 1: Add as optional field
export async function POST(request: Request) {
  const { title, author, pages, genre } = await request.json();
  
  // Validation for existing required fields
  if (!title || !author || !pages) {
    return Response.json({ 
      error: "Missing required fields", 
      required: ["title", "author", "pages"]
    }, { status: 400 });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
    pages: parseInt(pages),
    genre: genre || "Uncategorized", // Default value for migration
    createdAt: new Date().toISOString(),
    version: "1.1" // Track API version
  };

  books.push(newBook);
  
  return Response.json({ 
    message: "Book created successfully", 
    book: newBook 
  }, { status: 201 });
}
```

### **Phase 2: Update Existing Data (Background Migration)**

```typescript
// Migration function to update existing data
function migrateExistingBooks() {
  books.forEach(book => {
    if (!book.genre) {
      // Smart defaults based on title/author analysis
      book.genre = inferGenreFromTitle(book.title) || "General";
      book.migrated = true;
      book.version = "1.1";
    }
  });
}

function inferGenreFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('react') || titleLower.includes('javascript')) return 'Programming';
  if (titleLower.includes('guide') || titleLower.includes('tutorial')) return 'Education';
  if (titleLower.includes('pattern')) return 'Technical';
  return 'General';
}
```

### **Phase 3: API Versioning Strategy**

```typescript
// Support multiple API versions
export async function POST(request: Request) {
  const apiVersion = request.headers.get('API-Version') || '1.0';
  const body = await request.json();

  switch (apiVersion) {
    case '1.0':
      return handleV1Request(body); // Legacy support
    case '1.1':
      return handleV1_1Request(body); // New version with genre
    default:
      return Response.json({ 
        error: "Unsupported API version",
        supportedVersions: ["1.0", "1.1"]
      }, { status: 400 });
  }
}

async function handleV1Request(body: any) {
  // Original behavior - no genre required
  const { title, author, pages } = body;
  // ... original logic
}

async function handleV1_1Request(body: any) {
  // New behavior - genre handling
  const { title, author, pages, genre } = body;
  // ... new logic with genre
}
```

### **Phase 4: Gradual Enforcement**

```typescript
// Gradually make genre required with warnings
export async function POST(request: Request) {
  const { title, author, pages, genre } = await request.json();
  
  if (!genre) {
    // Log for monitoring
    console.warn(`Book created without genre: ${title} by ${author}`);
    
    // Return warning but still accept
    return Response.json({ 
      message: "Book created successfully", 
      book: newBook,
      warnings: ["Genre field will be required in API v2.0. Please update your client."]
    }, { status: 201 });
  }
}
```

### **Phase 5: New Major Version (Breaking Change)**

```typescript
// API v2.0 - Genre now required
export async function POST(request: Request) {
  const apiVersion = request.headers.get('API-Version') || '1.0';
  
  if (apiVersion === '2.0') {
    const { title, author, pages, genre } = await request.json();
    
    // Now genre is truly required
    if (!genre) {
      return Response.json({ 
        error: "Genre is required in API v2.0",
        upgradeGuide: "/docs/api/v2-migration"
      }, { status: 400 });
    }
  }
}
```

## 📋 **Migration Timeline (Real Production)**

| Week | Phase | Action | Client Impact |
|------|-------|--------|---------------|
| 1 | Add Optional | Deploy genre as optional | ✅ No impact |
| 2-3 | Migrate Data | Background data migration | ✅ No impact |
| 4-6 | Client Updates | Clients update to send genre | ✅ Gradual adoption |
| 7-8 | Warnings | Start warning about requirement | ⚠️ Warnings only |
| 9-12 | Enforcement | Gradually enforce requirement | ⚠️ Soft enforcement |
| 13+ | New Version | API v2.0 with hard requirement | 🚨 Breaking for v1.0 |

## 🛡️ **Safety Measures**

### **Feature Flags**
```typescript
const FEATURE_FLAGS = {
  REQUIRE_GENRE: process.env.REQUIRE_GENRE === 'true',
  STRICT_VALIDATION: process.env.STRICT_VALIDATION === 'true'
};

if (FEATURE_FLAGS.REQUIRE_GENRE && !genre) {
  return Response.json({ error: "Genre required" }, { status: 400 });
}
```

### **Rollback Strategy**
```typescript
// Always keep ability to rollback
const ROLLBACK_MODE = process.env.ROLLBACK_MODE === 'true';

if (ROLLBACK_MODE) {
  // Revert to old behavior
  return handleLegacyRequest(body);
}
```

### **Monitoring & Alerts**
```typescript
// Track migration progress
function logMigrationMetrics(action: string, data: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    data,
    apiVersion: request.headers.get('API-Version')
  }));
}
```

## 🎯 **Key Takeaways**

1. **Never break existing clients** - Always add fields as optional first
2. **Use API versioning** - Support multiple versions during transition
3. **Migrate data gradually** - Background jobs, not all at once
4. **Monitor everything** - Track adoption and errors
5. **Have rollback plans** - Always be able to revert changes
6. **Communicate changes** - Give clients time to adapt

This is how **real production systems** handle schema changes without downtime or breaking changes! 