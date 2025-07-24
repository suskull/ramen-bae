# 🏗️ Architecture Patterns

## Overview

Well-structured tRPC applications require thoughtful architecture decisions. This guide covers different architectural patterns, from simple monolithic approaches to complex modular designs, plus strategies for scaling your tRPC applications effectively.

## 📐 Architectural Approaches

### Monolithic Router Design

**Best for:** Small to medium applications, prototypes, simple APIs

```typescript
// Simple monolithic approach
const appRouter = router({
  // User procedures
  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({ where: { id: input.id } });
    }),
  
  createUser: publicProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => {
      return await db.user.create({ data: input });
    }),
  
  // Post procedures
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.post.findUnique({ where: { id: input.id } });
    }),
  
  createPost: protectedProcedure
    .input(postCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return await db.post.create({
        data: { ...input, authorId: ctx.user.id }
      });
    }),
  
  // More procedures...
});

export type AppRouter = typeof appRouter;
```

**Pros:**
- Simple to understand and implement
- Easy to debug
- No complex routing logic
- Fast to prototype

**Cons:**
- Becomes unwieldy as the application grows
- Hard to organize and maintain
- Difficult for team collaboration
- No clear separation of concerns

### Modular Router Design

**Best for:** Medium to large applications, team development, organized codebases

```typescript
// Feature-based modular approach
// routers/user.ts
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await userService.getById(input.id);
    }),
  
  create: publicProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => {
      return await userService.create(input);
    }),
  
  update: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      return await userService.update(ctx.user.id, input);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await userService.delete(input.id, ctx.user.id);
      return { success: true };
    })
});

// routers/post.ts
export const postRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await postService.getById(input.id);
    }),
  
  getByAuthor: publicProcedure
    .input(z.object({ authorId: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await postService.getByAuthor(input.authorId, input.limit);
    }),
  
  create: protectedProcedure
    .input(postCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return await postService.create(input, ctx.user.id);
    })
});

// routers/index.ts
export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
  auth: authRouter
});

export type AppRouter = typeof appRouter;
```

**Pros:**
- Clear organization and separation of concerns
- Easier to maintain and test
- Better for team collaboration
- Scalable architecture
- Reusable router components

**Cons:**
- More initial setup complexity
- Requires more planning
- May be overkill for simple applications

## 🔧 Context Patterns

### Basic Context Setup

```typescript
// context/context.ts
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuth } from '../auth/auth-utils';

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  // Get user session
  const session = await getAuth(req);
  
  return {
    req,
    res,
    session,
    user: session?.user || null,
    db,                    // Database instance
    redis,                 // Cache instance
    logger: createLogger({ // Logging instance
      requestId: req.headers['x-request-id'] || 'unknown'
    })
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### Enhanced Context with Services

```typescript
// context/enhanced-context.ts
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getAuth(req);
  const requestId = (req.headers['x-request-id'] as string) || generateId();
  
  // Create service instances with context
  const logger = createLogger({ requestId });
  const dbWithLogging = createDbWithLogging(db, logger);
  
  // Service layer
  const services = {
    user: new UserService(dbWithLogging, logger),
    post: new PostService(dbWithLogging, logger),
    email: new EmailService(logger),
    upload: new UploadService(logger)
  };
  
  return {
    req,
    res,
    session,
    user: session?.user || null,
    requestId,
    logger,
    db: dbWithLogging,
    services,
    
    // Helper methods
    requireAuth: () => {
      if (!session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }
      return session.user;
    },
    
    requireRole: (role: string) => {
      const user = this.requireAuth();
      if (!user.roles.includes(role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Role '${role}' required`
        });
      }
      return user;
    }
  };
};
```

### Context with Request Scoping

```typescript
// context/scoped-context.ts
import { AsyncLocalStorage } from 'async_hooks';

const requestContext = new AsyncLocalStorage<{
  requestId: string;
  startTime: number;
  user?: User;
}>();

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getAuth(req);
  const requestId = generateId();
  const startTime = Date.now();
  
  const contextData = {
    requestId,
    startTime,
    user: session?.user
  };
  
  return {
    req,
    res,
    session,
    user: session?.user || null,
    requestId,
    startTime,
    
    // Run with request context
    runWithContext: <T>(fn: () => Promise<T>): Promise<T> => {
      return requestContext.run(contextData, fn);
    },
    
    // Get current context anywhere in the request
    getCurrentContext: () => requestContext.getStore()
  };
};

// Usage in services
export class UserService {
  async getById(id: string) {
    const context = requestContext.getStore();
    console.log(`Request ${context?.requestId}: Getting user ${id}`);
    
    return await db.user.findUnique({ where: { id } });
  }
}
```

## 🛡️ Middleware Patterns

### Authentication Middleware

```typescript
// middleware/auth.ts
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user // Now guaranteed to exist
    }
  });
});

// Role-based middleware
export const createRoleMiddleware = (requiredRole: string) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    if (!ctx.user.roles.includes(requiredRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Role '${requiredRole}' required`
      });
    }
    
    return next({ ctx });
  });
};

// Usage
export const protectedProcedure = publicProcedure.use(authMiddleware);
export const adminProcedure = publicProcedure.use(createRoleMiddleware('admin'));
```

### Logging Middleware

```typescript
// middleware/logging.ts
export const loggingMiddleware = t.middleware(async ({ path, type, input, ctx, next }) => {
  const start = Date.now();
  
  ctx.logger.info(`🚀 ${type.toUpperCase()} ${path} started`, {
    input: process.env.NODE_ENV === 'development' ? input : '[HIDDEN]',
    user: ctx.user?.id || 'anonymous'
  });
  
  try {
    const result = await next();
    const duration = Date.now() - start;
    
    ctx.logger.info(`✅ ${type.toUpperCase()} ${path} completed in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    ctx.logger.error(`❌ ${type.toUpperCase()} ${path} failed after ${duration}ms`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw error;
  }
});

// Apply to all procedures
export const loggedProcedure = publicProcedure.use(loggingMiddleware);
```

### Rate Limiting Middleware

```typescript
// middleware/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const createRateLimitMiddleware = (
  maxRequests: number,
  windowMs: number,
  keyGenerator?: (ctx: Context) => string
) => {
  return t.middleware(async ({ ctx, path, next }) => {
    const key = keyGenerator 
      ? keyGenerator(ctx)
      : `rate_limit:${ctx.user?.id || ctx.req.ip}:${path}`;
    
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    if (current > maxRequests) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${windowMs / 1000} seconds.`
      });
    }
    
    return next();
  });
};

// Usage
const emailLimitMiddleware = createRateLimitMiddleware(
  5,      // 5 requests
  60000,  // per minute
  (ctx) => `email:${ctx.user?.id}` // per user
);

export const sendEmailProcedure = protectedProcedure
  .use(emailLimitMiddleware)
  .input(emailSchema)
  .mutation(async ({ input, ctx }) => {
    await ctx.services.email.send(input);
    return { success: true };
  });
```

### Caching Middleware

```typescript
// middleware/cache.ts
export const createCacheMiddleware = (
  ttlSeconds: number = 300,
  keyGenerator?: (path: string, input: any) => string
) => {
  return t.middleware(async ({ path, input, next }) => {
    const cacheKey = keyGenerator 
      ? keyGenerator(path, input)
      : `cache:${path}:${JSON.stringify(input)}`;
    
    // Try cache first
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
    if (result.ok && result.data !== null) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result.data));
    }
    
    return result;
  });
};

// Usage
const publicDataProcedure = publicProcedure.use(
  createCacheMiddleware(600) // 10 minutes
);
```

## 🏢 Service Layer Patterns

### Service-Oriented Architecture

```typescript
// services/user-service.ts
export class UserService {
  constructor(
    private db: PrismaClient,
    private logger: Logger,
    private cache: Redis
  ) {}
  
  async getById(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.cache.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });
    
    // Cache result
    if (user) {
      await this.cache.setex(`user:${id}`, 300, JSON.stringify(user));
    }
    
    return user;
  }
  
  async create(data: UserCreateInput): Promise<User> {
    // Validate business rules
    await this.validateUniqueEmail(data.email);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user
    const user = await this.db.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
    
    // Log activity
    this.logger.info('User created', { userId: user.id });
    
    // Send welcome email (async)
    this.emailService.sendWelcomeEmail(user).catch(err => {
      this.logger.error('Failed to send welcome email', { error: err });
    });
    
    return user;
  }
  
  private async validateUniqueEmail(email: string): Promise<void> {
    const existing = await this.db.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Email already exists'
      });
    }
  }
}

// routers/user.ts - Thin router layer
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.services.user.getById(input.id);
    }),
  
  create: publicProcedure
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.services.user.create(input);
    })
});
```

### Repository Pattern

```typescript
// repositories/user-repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserCreateData): Promise<User>;
  update(id: string, data: UserUpdateData): Promise<User>;
  delete(id: string): Promise<void>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    return await this.db.user.findUnique({ where: { id } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({ where: { email } });
  }
  
  async create(data: UserCreateData): Promise<User> {
    return await this.db.user.create({ data });
  }
  
  async update(id: string, data: UserUpdateData): Promise<User> {
    return await this.db.user.update({
      where: { id },
      data
    });
  }
  
  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }
}

// services/user-service.ts
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}
  
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }
  
  async createUser(data: UserCreateInput): Promise<User> {
    // Business logic
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Email exists' });
    }
    
    // Create user
    const user = await this.userRepository.create({
      ...data,
      password: await this.hashPassword(data.password)
    });
    
    // Side effects
    await this.emailService.sendWelcomeEmail(user);
    this.logger.info('User created', { userId: user.id });
    
    return user;
  }
}
```

## 📈 Scalability Patterns

### Horizontal Scaling

```typescript
// config/database.ts
const createDatabasePool = () => {
  const readReplicas = [
    process.env.DATABASE_READ_URL_1,
    process.env.DATABASE_READ_URL_2,
    process.env.DATABASE_READ_URL_3
  ].filter(Boolean);
  
  return {
    write: new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_WRITE_URL } }
    }),
    
    read: readReplicas.map(url => 
      new PrismaClient({
        datasources: { db: { url } }
      })
    )
  };
};

// services/database-service.ts
export class DatabaseService {
  private writeDb: PrismaClient;
  private readDbs: PrismaClient[];
  private readIndex = 0;
  
  constructor() {
    const pool = createDatabasePool();
    this.writeDb = pool.write;
    this.readDbs = pool.read;
  }
  
  // Round-robin read replica selection
  getReadDb(): PrismaClient {
    if (this.readDbs.length === 0) return this.writeDb;
    
    const db = this.readDbs[this.readIndex];
    this.readIndex = (this.readIndex + 1) % this.readDbs.length;
    return db;
  }
  
  getWriteDb(): PrismaClient {
    return this.writeDb;
  }
}

// Usage in services
export class UserService {
  async getById(id: string): Promise<User | null> {
    // Use read replica for queries
    return await this.dbService.getReadDb().user.findUnique({
      where: { id }
    });
  }
  
  async create(data: UserCreateInput): Promise<User> {
    // Use write database for mutations
    return await this.dbService.getWriteDb().user.create({
      data
    });
  }
}
```

### Event-Driven Architecture

```typescript
// events/event-emitter.ts
import { EventEmitter } from 'events';

export interface Events {
  'user.created': { user: User };
  'user.updated': { user: User; changes: Partial<User> };
  'user.deleted': { userId: string };
  'post.created': { post: Post };
  'post.published': { post: Post };
}

export class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof Events>(event: K, data: Events[K]): boolean {
    return super.emit(event, data);
  }
  
  on<K extends keyof Events>(
    event: K, 
    listener: (data: Events[K]) => void
  ): this {
    return super.on(event, listener);
  }
}

export const eventEmitter = new TypedEventEmitter();

// services/user-service.ts
export class UserService {
  async create(data: UserCreateInput): Promise<User> {
    const user = await this.db.user.create({ data });
    
    // Emit event for other services to handle
    eventEmitter.emit('user.created', { user });
    
    return user;
  }
}

// listeners/user-listeners.ts
export const setupUserListeners = () => {
  eventEmitter.on('user.created', async ({ user }) => {
    // Send welcome email
    await emailService.sendWelcomeEmail(user);
    
    // Create default settings
    await settingsService.createDefaultSettings(user.id);
    
    // Analytics tracking
    await analyticsService.trackUserSignup(user);
  });
};
```

### Microservices with tRPC

```typescript
// services/external-service.ts
export class ExternalServiceClient {
  private client: ReturnType<typeof createTRPCClient<ExternalRouter>>;
  
  constructor(baseUrl: string) {
    this.client = createTRPCClient<ExternalRouter>({
      links: [
        httpBatchLink({
          url: `${baseUrl}/api/trpc`,
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN}`
          }
        })
      ]
    });
  }
  
  async getUserProfile(userId: string) {
    return await this.client.user.getProfile.query({ id: userId });
  }
  
  async sendNotification(data: NotificationData) {
    return await this.client.notification.send.mutate(data);
  }
}

// Integration in main service
export class MainUserService {
  constructor(
    private userRepository: UserRepository,
    private externalService: ExternalServiceClient
  ) {}
  
  async getEnrichedProfile(userId: string) {
    // Get basic profile from local database
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    
    // Get additional data from external service
    const externalProfile = await this.externalService.getUserProfile(userId);
    
    return {
      ...user,
      externalData: externalProfile
    };
  }
}
```

## 🧪 Testing Architecture

### Service Layer Testing

```typescript
// __tests__/services/user-service.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserService } from '../services/user-service';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  
  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn()
    };
    
    userService = new UserService(
      mockUserRepository,
      mockEmailService,
      mockLogger
    );
  });
  
  describe('createUser', () => {
    it('should create user when email is unique', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      
      const result = await userService.createUser(mockUserData);
      
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...mockUserData,
        password: expect.any(String) // hashed password
      });
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
    
    it('should throw error when email exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockExistingUser);
      
      await expect(userService.createUser(mockUserData))
        .rejects
        .toThrow('Email exists');
    });
  });
});
```

### End-to-End Router Testing

```typescript
// __tests__/routers/user.test.ts
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../router';

const createCaller = createCallerFactory(appRouter);

describe('User Router', () => {
  it('should get user by id', async () => {
    const caller = createCaller({
      user: null,
      db: mockDb,
      services: mockServices
    });
    
    mockServices.user.getById.mockResolvedValue(mockUser);
    
    const result = await caller.user.getById({ id: 'user-1' });
    
    expect(result).toEqual(mockUser);
    expect(mockServices.user.getById).toHaveBeenCalledWith('user-1');
  });
  
  it('should require auth for protected routes', async () => {
    const caller = createCaller({
      user: null, // No authenticated user
      db: mockDb,
      services: mockServices
    });
    
    await expect(caller.user.updateProfile({ name: 'New Name' }))
      .rejects
      .toThrow('UNAUTHORIZED');
  });
});
```

## 🎯 Architecture Decision Framework

### When to Choose Each Pattern

**Monolithic Router:**
- ✅ Prototype/MVP development
- ✅ Small team (1-3 developers)
- ✅ Simple domain logic
- ✅ Quick iterations needed

**Modular Router:**
- ✅ Production applications
- ✅ Team development (3+ developers)
- ✅ Complex business logic
- ✅ Long-term maintenance

**Service Layer:**
- ✅ Complex business rules
- ✅ Multiple data sources
- ✅ Background processing needed
- ✅ Extensive testing requirements

**Microservices:**
- ✅ Large scale applications
- ✅ Multiple teams
- ✅ Independent deployment needs
- ✅ Different technology requirements per service

### Migration Strategies

**Monolithic → Modular:**
```typescript
// Step 1: Extract to files but keep same structure
// users.ts
export const userProcedures = {
  getById: publicProcedure.query(/* ... */),
  create: publicProcedure.mutation(/* ... */)
};

// router.ts
import { userProcedures } from './users';
const appRouter = router({
  ...userProcedures,
  // ... other procedures
});

// Step 2: Convert to nested routers
const appRouter = router({
  user: router(userProcedures),
  // ... other routers
});
```

**Add Service Layer:**
```typescript
// Step 1: Extract logic to services
export class UserService {
  async getById(id: string) {
    // Move logic from procedure to service
    return await db.user.findUnique({ where: { id } });
  }
}

// Step 2: Update procedures to use services
const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.services.user.getById(input.id);
    })
});
```

## 🔗 Next Steps

- **Practice**: Refactor a monolithic router to modular design
- **Examples**: Check out `examples/07-production-app/` for full architecture examples
- **Implementation**: Apply these patterns to your current project
- **Performance**: Combine with [Performance Considerations](./performance-considerations.md) for optimal results

---

**💡 Remember**: Architecture is about trade-offs. Choose the complexity level that matches your current needs, but design for future growth. You can always refactor as your application scales! 