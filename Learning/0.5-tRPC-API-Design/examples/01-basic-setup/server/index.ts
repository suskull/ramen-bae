/**
 * tRPC Server with Express.js
 * 
 * This is the main server entry point that:
 * - Sets up Express.js server
 * - Configures CORS and middleware
 * - Creates the main tRPC router
 * - Exposes the tRPC API endpoint
 */

import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { router, createContext } from './router';
import { procedures } from './procedures';

// ===== CREATE MAIN ROUTER =====

/**
 * Main Application Router
 * 
 * This combines all procedures into a single router.
 * The router structure becomes the API structure:
 * 
 * Router: { hello: procedure, createUser: procedure }
 * API: /trpc/hello, /trpc/createUser
 */
const appRouter = router({
  // Basic procedures
  hello: procedures.hello,
  getCurrentTime: procedures.getCurrentTime,
  echo: procedures.echo,
  
  // Mutation examples
  createUser: procedures.createUser,
  updateCounter: procedures.updateCounter,
  
  // Advanced examples
  errorDemo: procedures.errorDemo,
  complexValidation: procedures.complexValidation,
});

/**
 * Export router type for client
 * 
 * This is the magic! This type will be imported by the client
 * to get full type safety across the network.
 */
export type AppRouter = typeof appRouter;

// ===== EXPRESS SERVER SETUP =====

/**
 * Create Express.js application
 */
const app = express();

/**
 * CORS Configuration
 * 
 * Allow requests from client applications.
 * In production, be more specific about allowed origins.
 */
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js default
    'http://localhost:5173',  // Vite default
    'http://localhost:8080',  // Webpack dev server
  ],
  credentials: true,
}));

/**
 * Basic middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 ${timestamp} ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 * 
 * Useful for monitoring and debugging.
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

/**
 * Root endpoint with API information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'tRPC Basic Setup Example Server',
    version: '1.0.0',
    endpoints: {
      trpc: '/trpc',
      health: '/health',
    },
    documentation: 'See README.md for usage examples',
    procedures: Object.keys(appRouter._def.procedures),
  });
});

// ===== TRPC MIDDLEWARE SETUP =====

/**
 * Create tRPC Express.js middleware
 * 
 * This handles all tRPC requests at the /trpc endpoint.
 * Context is created for each request.
 */
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => {
    // Enhanced context with Express.js request/response
    const baseContext = createContext();
    
    return {
      ...baseContext,
      // Add Express.js specific data
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      
      // In a real app, extract user from JWT token here
      user: null, // TODO: Add authentication
      
      // Add Express.js objects if needed
      req,
      res,
    };
  },
  
  /**
   * Error handling
   * 
   * This catches any unhandled errors and formats them properly.
   */
  onError: ({ error, path, type, ctx }) => {
    console.error(`🚨 tRPC Error on ${type} ${path}:`, error);
    
    // In production, you might want to log to external service
    if (process.env.NODE_ENV === 'production') {
      // Log to external service (Sentry, LogRocket, etc.)
    }
  },
}));

/**
 * 404 handler for unknown routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/', '/health', '/trpc'],
  });
});

/**
 * Global error handler
 */
app.use((error: any, req: any, res: any, next: any) => {
  console.error('🚨 Express Error:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
    requestId: req.headers['x-request-id'] || 'unknown',
  });
});

// ===== SERVER STARTUP =====

/**
 * Server configuration
 */
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

/**
 * Start the server
 */
const server = app.listen(PORT, () => {
  console.log('🚀 tRPC Server started!');
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🔗 tRPC URL: http://${HOST}:${PORT}/trpc`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
  console.log('');
  console.log('Available Procedures:');
  Object.keys(appRouter._def.procedures).forEach(proc => {
    console.log(`  📞 ${proc}`);
  });
  console.log('');
  console.log('🔥 Ready for requests!');
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// ===== EXPORTS =====

/**
 * Export router type for client use
 * 
 * The client will import this type to get full type safety.
 * This is the core of tRPC's magic!
 */
export { type AppRouter };

/**
 * Export server for testing
 */
export { app, server };

// ===== EXAMPLE USAGE =====

/**
 * Test the server manually:
 * 
 * 1. Start the server:
 *    npm run server
 * 
 * 2. Test with curl:
 *    curl "http://localhost:3001/trpc/hello?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22name%22%3A%22World%22%7D%7D%7D"
 * 
 * 3. Or use the health check:
 *    curl http://localhost:3001/health
 * 
 * 4. View available procedures:
 *    curl http://localhost:3001/
 */ 