/**
 * PFAS-Free Kitchen Platform API
 * Entry point
 * 
 * Endpoints scaffolded (19 total):
 * 
 * PUBLIC (12):
 * ✓ GET  /api/v1/products
 * ✓ GET  /api/v1/products/:id
 * ✓ GET  /api/v1/products/:id/compare
 * ✓ GET  /api/v1/products/:id/verification
 * ✓ GET  /api/v1/products/:id/affiliate-links
 * ✓ GET  /api/v1/categories
 * ✓ GET  /api/v1/evidence/:id
 * ✓ GET  /api/v1/evidence/:id/artifact
 * ✓ GET  /api/v1/search
 * ✓ GET  /api/v1/search/autocomplete
 * ✓ POST /api/v1/reports
 * ✓ POST /api/v1/affiliate-clicks
 * 
 * ADMIN (7):
 * ✓ POST   /api/v1/admin/verification/decide
 * ✓ POST   /api/v1/admin/evidence/upload
 * ✓ GET    /api/v1/admin/reports
 * ✓ PATCH  /api/v1/admin/reports/:id
 * ✓ GET    /api/v1/admin/queue
 * ✓ POST   /api/v1/admin/queue/:id/assign
 * ✓ GET    /api/v1/admin/audit-log
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { logger } from './config/logger.js';
import { initDatabase } from './config/database.js';
import { initSearch } from './config/search.js';
import { initStorage } from './config/storage.js';
import { requestIdMiddleware, requestLoggerMiddleware } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const API_PREFIX = '/api/v1';

// Trust proxy for accurate IP addresses behind load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Session-Id'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID and logging
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Health check endpoint (before routes)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

// Readiness check (checks dependencies)
app.get('/ready', async (_req, res) => {
  try {
    // STUB: Add actual health checks in production
    const checks = {
      database: true, // await db.healthCheck()
      search: true,   // await searchClient.healthCheck()
      storage: true,  // await storageClient.healthCheck()
    };

    const allHealthy = Object.values(checks).every(Boolean);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use(API_PREFIX, routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Start server
 */
async function start(): Promise<void> {
  try {
    logger.info('Starting PFAS-Free Kitchen API...');

    // Initialize dependencies (stubs for now)
    await Promise.all([
      initDatabase(),
      initSearch(),
      initStorage(),
    ]);

    app.listen(PORT, () => {
      logger.info({
        port: PORT,
        apiPrefix: API_PREFIX,
        env: process.env.NODE_ENV || 'development',
      }, `PFAS-Free Kitchen API listening on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
start();

export { app };
