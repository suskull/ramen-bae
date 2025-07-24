# ⚡ Performance Considerations

## Overview

Performance is crucial for any API, and tRPC provides several built-in optimizations while also allowing you to implement additional performance strategies. This guide covers request batching, caching, serialization optimization, and various performance patterns.

## 🚀 Built-in tRPC Optimizations

### Request Batching

tRPC automatically batches multiple queries into a single HTTP request when they're called simultaneously:

```typescript
// Client code - these will be batched automatically
const [user, posts, comments] = await Promise.all([
  trpc.user.getById.query("123"),
  trpc.post.getByAuthor.query("123"),  
  trpc.comment.getByUser.query("123")
]);

// Results in a single HTTP request instead of three
// POST /api/trpc/user.getById,post.getByAuthor,comment.getByUser
```

**Batching Configuration:**
```typescript
// Client setup with custom batching
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      maxBatchSize: 10,        // Maximum procedures per batch
      maxURLLength: 2048,      // Fallback to individual requests if URL too long
    })
  ]
});

// Disable batching for specific scenarios
const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({ url: '/api/trpc' }) // No batching
  ]
});
```

### Efficient Data Serialization

**SuperJSON for Complex Data Types:**
```typescript
// server.ts
import { transformer } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson  // Handles Date, Map, Set, BigInt, etc.
});

// Now you can return complex types directly
const getUserProcedure = publicProcedure
  .query(async () => {
    return {
      id: "123",
      createdAt: new Date(),      // Serialized correctly
      metadata: new Map([         // Serialized correctly
        ['lastLogin', new Date()],
        ['preferences', { theme: 'dark' }]
      ]),
      bigNumber: BigInt(9007199254740991) // Serialized correctly
    };
  });
```

**Custom Transformers for Performance:**
```typescript
// Custom lightweight transformer for better performance
const customTransformer = {
  serialize: (object: any) => {
    // Custom serialization logic
    if (object instanceof Date) {
      return { __type: 'Date', value: object.toISOString() };
    }
    return object;
  },
  
  deserialize: (object: any) => {
    // Custom deserialization logic
    if (object?.__type === 'Date') {
      return new Date(object.value);
    }
    return object;
  }
};

const t = initTRPC.create({
  transformer: customTransformer
});
```

## 📦 Caching Strategies

### Client-Side Caching

**React Query Integration (Recommended):**
```typescript
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      cacheTime: 10 * 60 * 1000,    // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component usage with caching
const UserProfile = ({ userId }: { userId: string }) => {
  // This will be cached automatically
  const { data: user, isLoading } = trpc.user.getById.useQuery(
    { id: userId },
    {
      staleTime: 10 * 60 * 1000,    // Override default stale time
      cacheTime: 30 * 60 * 1000,    // Override default cache time
    }
  );

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{user?.name}</div>;
};
```

**Manual Cache Management:**
```typescript
const UserManagement = () => {
  const utils = trpc.useUtils();
  
  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess: (updatedUser) => {
      // Update cache manually for better UX
      utils.user.getById.setData({ id: updatedUser.id }, updatedUser);
      
      // Invalidate related queries
      utils.user.getAll.invalidate();
      utils.user.getProfile.invalidate({ id: updatedUser.id });
    }
  });
  
  const { mutate: deleteUser } = trpc.user.delete.useMutation({
    onSuccess: (_, variables) => {
      // Remove from cache
      utils.user.getById.setData({ id: variables.id }, undefined);
      
      // Update list cache optimistically
      utils.user.getAll.setData(undefined, (old) => 
        old?.filter(user => user.id !== variables.id)
      );
    }
  });
  
  return <div>{/* UI */}</div>;
};
```

### Server-Side Caching

**Redis Caching Middleware:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const createCachedProcedure = (ttlSeconds: number = 300) => {
  return publicProcedure.use(async ({ path, input, next }) => {
    const cacheKey = `trpc:${path}:${JSON.stringify(input)}`;
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: JSON.parse(cached),
        ctx: {}
      };
    }
    
    // Execute procedure
    const result = await next();
    
    // Cache successful results
    if (result.ok) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result.data));
    }
    
    return result;
  });
};

// Usage
const getUserProcedure = createCachedProcedure(300) // 5 minutes
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return await db.user.findUnique({ where: { id: input.id } });
  });
```

**In-Memory Caching with LRU:**
```typescript
import LRU from 'lru-cache';

const cache = new LRU<string, any>({
  max: 1000,              // Maximum items
  ttl: 5 * 60 * 1000,     // 5 minutes TTL
});

const createMemoryCachedProcedure = () => {
  return publicProcedure.use(async ({ path, input, next }) => {
    const cacheKey = `${path}:${JSON.stringify(input)}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        ctx: {}
      };
    }
    
    const result = await next();
    
    if (result.ok) {
      cache.set(cacheKey, result.data);
    }
    
    return result;
  });
};
```

**Conditional Caching:**
```typescript
const createSmartCachedProcedure = () => {
  return publicProcedure.use(async ({ path, input, ctx, next }) => {
    // Don't cache authenticated user-specific data
    if (ctx.user && path.includes('user.getProfile')) {
      return next();
    }
    
    // Don't cache if it's a mutation
    if (path.includes('create') || path.includes('update') || path.includes('delete')) {
      return next();
    }
    
    // Cache public data only
    const cacheKey = `public:${path}:${JSON.stringify(input)}`;
    
    // ... caching logic
    return next();
  });
};
```

## 🗃️ Database Optimization

### Efficient Queries

**Select Only What You Need:**
```typescript
// ❌ Bad: Fetching unnecessary data
const getBlogPosts = publicProcedure.query(async () => {
  return await db.post.findMany(); // Returns all fields
});

// ✅ Good: Select specific fields
const getBlogPosts = publicProcedure.query(async () => {
  return await db.post.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    },
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20  // Limit results
  });
});
```

**Efficient Pagination:**
```typescript
// Cursor-based pagination (recommended for performance)
const getPostsPaginated = publicProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(10),
    cursor: z.string().optional()
  }))
  .query(async ({ input }) => {
    const posts = await db.post.findMany({
      take: input.limit + 1, // Take one more to check if there's a next page
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        createdAt: true
      }
    });
    
    let nextCursor: string | undefined = undefined;
    if (posts.length > input.limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }
    
    return {
      posts,
      nextCursor
    };
  });

// Client usage
const PostList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.post.getPostsPaginated.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  return (
    <div>
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </div>
  );
};
```

**Batched Database Operations:**
```typescript
const getUsersWithStats = publicProcedure
  .input(z.object({
    userIds: z.array(z.string()).max(100) // Limit batch size
  }))
  .query(async ({ input }) => {
    // Batch database queries instead of N+1
    const [users, posts, comments] = await Promise.all([
      db.user.findMany({
        where: { id: { in: input.userIds } },
        select: { id: true, name: true, email: true }
      }),
      
      db.post.groupBy({
        by: ['authorId'],
        where: { authorId: { in: input.userIds } },
        _count: { id: true }
      }),
      
      db.comment.groupBy({
        by: ['authorId'],
        where: { authorId: { in: input.userIds } },
        _count: { id: true }
      })
    ]);
    
    // Combine results efficiently
    const postCounts = new Map(posts.map(p => [p.authorId, p._count.id]));
    const commentCounts = new Map(comments.map(c => [c.authorId, c._count.id]));
    
    return users.map(user => ({
      ...user,
      postsCount: postCounts.get(user.id) || 0,
      commentsCount: commentCounts.get(user.id) || 0
    }));
  });
```

### Connection Pooling

```typescript
// Database connection optimization
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connection pool configuration
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Ensure proper cleanup
process.on('beforeExit', async () => {
  await db.$disconnect();
});
```

## 🚦 Request Optimization

### Request Deduplication

```typescript
// Client-side request deduplication
const useUserProfile = (userId: string) => {
  // Multiple components can call this - tRPC will deduplicate
  return trpc.user.getProfile.useQuery(
    { id: userId },
    {
      staleTime: 5 * 60 * 1000, // Don't refetch for 5 minutes
    }
  );
};

// Usage in multiple components
const Header = ({ userId }: { userId: string }) => {
  const { data: user } = useUserProfile(userId); // Request #1
  return <div>Welcome, {user?.name}</div>;
};

const Sidebar = ({ userId }: { userId: string }) => {
  const { data: user } = useUserProfile(userId); // Same request - deduped
  return <div>Profile: {user?.email}</div>;
};
```

### Parallel vs Sequential Execution

```typescript
// ❌ Bad: Sequential execution
const getUserDashboard = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const user = await db.user.findUnique({ where: { id: input.userId } });
    const posts = await db.post.findMany({ where: { authorId: input.userId } });
    const comments = await db.comment.findMany({ where: { authorId: input.userId } });
    
    return { user, posts, comments };
  });

// ✅ Good: Parallel execution
const getUserDashboard = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const [user, posts, comments] = await Promise.all([
      db.user.findUnique({ where: { id: input.userId } }),
      db.post.findMany({ where: { authorId: input.userId } }),
      db.comment.findMany({ where: { authorId: input.userId } })
    ]);
    
    return { user, posts, comments };
  });
```

### Lazy Loading Patterns

```typescript
// Separate procedures for different data needs
const userRouter = router({
  getBasicProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, avatar: true }
      });
    }),
    
  getFullProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input.id },
        include: {
          posts: { take: 5, orderBy: { createdAt: 'desc' } },
          followers: { take: 10 },
          following: { take: 10 }
        }
      });
    }),
    
  getProfileStats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [postsCount, followersCount, followingCount] = await Promise.all([
        db.post.count({ where: { authorId: input.id } }),
        db.follow.count({ where: { followingId: input.id } }),
        db.follow.count({ where: { followerId: input.id } })
      ]);
      
      return { postsCount, followersCount, followingCount };
    })
});

// Client usage - load data as needed
const UserProfile = ({ userId }: { userId: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Always load basic info
  const { data: basicProfile } = trpc.user.getBasicProfile.useQuery({ id: userId });
  
  // Load full profile only when needed
  const { data: fullProfile } = trpc.user.getFullProfile.useQuery(
    { id: userId },
    { enabled: showDetails }
  );
  
  // Load stats on demand
  const { data: stats } = trpc.user.getProfileStats.useQuery(
    { id: userId },
    { enabled: showDetails }
  );
  
  return (
    <div>
      <h1>{basicProfile?.name}</h1>
      
      {!showDetails && (
        <button onClick={() => setShowDetails(true)}>
          Show Details
        </button>
      )}
      
      {showDetails && (
        <div>
          <p>Posts: {stats?.postsCount}</p>
          <p>Followers: {stats?.followersCount}</p>
          {/* Full profile data */}
        </div>
      )}
    </div>
  );
};
```

## 📊 Performance Monitoring

### Built-in Performance Tracking

```typescript
const createContext = async ({ req, res }: CreateContextOptions) => {
  return { 
    req, 
    res,
    startTime: Date.now()
  };
};

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError: ({ error, type, path, input, ctx }) => {
    const duration = Date.now() - (ctx?.startTime || 0);
    
    console.error(`❌ ${path} failed after ${duration}ms:`, error.message);
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`🐌 Slow query detected: ${path} took ${duration}ms`);
    }
  },
  
  // Custom response headers for monitoring
  responseMeta: ({ ctx, type, errors }) => {
    if (ctx?.startTime) {
      const duration = Date.now() - ctx.startTime;
      return {
        headers: {
          'x-response-time': duration.toString(),
          'x-procedure-type': type
        }
      };
    }
    return {};
  }
});
```

### Performance Middleware

```typescript
const performanceMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  
  const result = await next();
  
  const duration = Date.now() - start;
  
  // Log performance metrics
  console.log(`📊 ${type.toUpperCase()} ${path}: ${duration}ms`);
  
  // Alert on slow operations
  if (duration > 2000) {
    console.warn(`🚨 Very slow operation: ${path} took ${duration}ms`);
    // Could send to monitoring service
  }
  
  return result;
});

// Apply to all procedures
const performantProcedure = publicProcedure.use(performanceMiddleware);
```

### Memory Usage Optimization

```typescript
// Streaming for large datasets
const exportLargeDataset = protectedProcedure
  .input(z.object({ format: z.enum(['json', 'csv']) }))
  .mutation(async ({ input, ctx }) => {
    // Instead of loading all data into memory
    const stream = new ReadableStream({
      async start(controller) {
        const batchSize = 1000;
        let offset = 0;
        
        while (true) {
          const batch = await db.record.findMany({
            skip: offset,
            take: batchSize,
            orderBy: { id: 'asc' }
          });
          
          if (batch.length === 0) break;
          
          // Process and stream data
          const chunk = input.format === 'json' 
            ? JSON.stringify(batch) 
            : convertToCSV(batch);
            
          controller.enqueue(chunk);
          offset += batchSize;
          
          // Prevent memory leaks
          if (offset % 10000 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': input.format === 'json' 
          ? 'application/json' 
          : 'text/csv',
        'Content-Disposition': `attachment; filename=export.${input.format}`
      }
    });
  });
```

## 🎯 Performance Best Practices

### Do's ✅

1. **Use cursor-based pagination** for large datasets
2. **Implement proper caching** at multiple levels
3. **Select only needed fields** from the database
4. **Batch database operations** when possible
5. **Use parallel execution** for independent operations
6. **Monitor and log performance** metrics
7. **Implement request deduplication** on the client
8. **Use proper database indexes** for query optimization

### Don'ts ❌

1. **Don't fetch unnecessary data** just because it's available
2. **Don't use N+1 queries** - batch related data fetching
3. **Don't cache everything** - be selective about what to cache
4. **Don't ignore database connection pooling**
5. **Don't serialize large objects** unnecessarily
6. **Don't use offset-based pagination** for large datasets
7. **Don't perform heavy computations** in request handlers
8. **Don't ignore memory usage** for long-running operations

### Performance Checklist

- [ ] Database queries are optimized and indexed
- [ ] Caching is implemented where appropriate
- [ ] Request batching is enabled
- [ ] Pagination is cursor-based for large datasets
- [ ] Error handling doesn't leak performance data
- [ ] Monitoring is in place for slow queries
- [ ] Memory usage is optimized for large operations
- [ ] Client-side caching is configured properly

## 🔗 Next Steps

- **Practice**: Optimize a slow tRPC procedure
- **Examples**: Check out performance examples in the codebase
- **Architecture**: Continue to [Architecture Patterns](./architecture-patterns.md)
- **Implementation**: Apply these patterns to your current project

---

**💡 Remember**: Premature optimization is the root of all evil, but planning for performance from the start will save you headaches later. Measure first, then optimize! 