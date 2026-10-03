import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

/**
 * Creates and configures the Express application instance.
 * @param {Object} options Custom options for testing
 */
export function createApp(options = {}) {
  const app = express();

  // Security and CORS configuration
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or allowed list
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'test') {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive CORS
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

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
