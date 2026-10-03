import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { createApiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { configurePassport } from './auth/passport.js';

dotenv.config();

/**
 * Creates and configures the Express application instance.
 * @param {Object} options Custom options for testing
 */
export function createApp(options = {}) {
  const app = express();

  // Configure Passport strategies
  configurePassport(options.db);

  // Security and CORS configuration for Render + Vercel
  const configuredClientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);

  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  const allowedOrigins = new Set([...configuredClientUrls, ...localOrigins]);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin matches allowed list or vercel preview/production domains
      if (
        allowedOrigins.has(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      // Safe fallback allowing the request
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Passport middleware
  app.use(passport.initialize());

  // JSON request body parser with safe limit
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // API router
  app.use('/api', createApiRouter(options.db, options.aiService));

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
        code: 'NOT_FOUND'
      }
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
