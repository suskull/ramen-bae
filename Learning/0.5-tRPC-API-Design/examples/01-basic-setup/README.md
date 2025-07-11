# 🚀 Example 1: Basic tRPC Setup

**Learning Goal**: Set up a complete tRPC server and client from scratch

## 📚 What You'll Learn

- How to install and configure tRPC
- The difference between server and client setup
- Basic project structure for tRPC applications
- How TypeScript types flow from server to client
- Environment configuration and tooling

## 🏗️ Project Structure

```
01-basic-setup/
├── server/
│   ├── index.ts         # tRPC server setup
│   ├── router.ts        # Main application router
│   └── procedures.ts    # Basic procedure definitions
├── client/
│   ├── index.ts         # tRPC client setup
│   ├── vanilla.ts       # Pure TypeScript client
│   └── react-example.tsx # React integration example
├── shared/
│   └── types.ts         # Shared types between server/client
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^4.32.6",
    "zod": "^3.22.4",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.5.0",
    "typescript": "^5.1.6",
    "tsx": "^3.12.7",
    "concurrently": "^8.2.0"
  }
}
```

## 🔧 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development servers**:
   ```bash
   npm run dev  # Starts both server and client
   ```

3. **Or run individually**:
   ```bash
   npm run server  # Server only (port 3001)
   npm run client  # Client only (port 3000)
   ```

## 📖 Step-by-Step Walkthrough

### Step 1: Understanding the Magic

tRPC works by sharing TypeScript types between your server and client. Here's the basic flow:

```
1. Define procedures on server   →   2. Generate types   →   3. Use on client
   (with input/output schemas)        (automatic)              (fully typed!)
```

### Step 2: Server Setup (`server/index.ts`)

The server is where you define your API procedures. Each procedure is like a function that can be called over the network:

```typescript
// Basic server structure
const appRouter = router({
  // This is a "procedure" - like a remote function
  hello: publicProcedure
    .input(z.object({ name: z.string() }))  // Input validation
    .query(({ input }) => {                 // The actual function
      return { message: `Hello ${input.name}!` };
    }),
});

// This type will be shared with the client
export type AppRouter = typeof appRouter;
```

### Step 3: Client Setup (`client/index.ts`)

The client connects to your server and gets full type safety:

```typescript
// Import the router type from server
import type { AppRouter } from '../server';

// Create a typed client
const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
});

// Now you can call your procedures with full type safety!
const result = await trpc.hello.query({ name: 'World' });
//    ^-- TypeScript knows this returns { message: string }
```

### Step 4: The Type Flow Magic

Here's what makes tRPC special - **the types flow automatically**:

1. **Server side**: You define a procedure with input/output types
2. **Build time**: TypeScript extracts the type signature  
3. **Client side**: Your client gets full autocomplete and type checking

**No code generation, no manual type definitions, no API documentation needed!**

## 🔄 How It Works Behind the Scenes

### Traditional REST API Problem:
```typescript
// Server (any type - no safety)
app.post('/api/users', (req, res) => {
  const userData = req.body; // Could be anything!
  // ...
});

// Client (manual typing, easy to get wrong)
interface User { name: string; email: string; }
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(userData)
});
const user: User = await response.json(); // Hope this is right!
```

### tRPC Solution:
```typescript
// Server (fully typed)
const userRouter = router({
  create: publicProcedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(({ input }) => {
      // input is { name: string, email: string } - guaranteed!
      return createUser(input);
    })
});

// Client (automatic types)
const user = await trpc.user.create.mutate({ 
  name: 'John', 
  email: 'john@example.com' 
});
// user type is automatically inferred from server return type!
```

## 🎯 Key Concepts

### 1. **Procedures vs Endpoints**
- **REST**: Endpoints like `GET /users`, `POST /users`
- **tRPC**: Procedures like `userRouter.list()`, `userRouter.create()`

### 2. **Queries vs Mutations**
- **Query**: Read data (like GET) - `publicProcedure.query()`
- **Mutation**: Change data (like POST/PUT/DELETE) - `publicProcedure.mutation()`

### 3. **Input/Output Validation**
```typescript
publicProcedure
  .input(z.string())           // What goes in
  .output(z.object({ ... }))   // What comes out (optional but recommended)
  .query(({ input }) => { ... })
```

### 4. **Router Composition**
```typescript
const appRouter = router({
  user: userRouter,     // /trpc/user.create, /trpc/user.list, etc.
  post: postRouter,     // /trpc/post.create, /trpc/post.list, etc.
  auth: authRouter,     // /trpc/auth.login, /trpc/auth.logout, etc.
});
```

## 🧪 Testing Your Setup

Run the example and try these commands:

```bash
# Test the server directly
curl http://localhost:3001/trpc/hello?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22name%22%3A%22World%22%7D%7D%7D

# Or use the client examples
npm run client
```

## 🎯 Success Criteria

You understand this example when you can:

- [ ] Explain how types flow from server to client
- [ ] Set up a basic tRPC server and client
- [ ] Understand the difference between queries and mutations
- [ ] Create simple procedures with input validation
- [ ] Connect a client to the server with full type safety

## 🔗 Next Steps

Once you're comfortable with this setup, move on to:
- **Example 2**: Creating your first real procedures
- **Example 3**: Advanced Zod validation patterns
- **Example 4**: Organizing large applications with router composition

## 💡 Pro Tips

1. **Type Export**: Always export your router type: `export type AppRouter = typeof appRouter`
2. **Development**: Use `tsx` for running TypeScript directly during development
3. **Structure**: Keep server and client in separate folders for clarity
4. **Environment**: Use environment variables for URLs in production

---

**🎉 Congratulations!** You've just set up your first tRPC application. The magic is in the type sharing - change something on the server, and your client will immediately show TypeScript errors if it's incompatible! 