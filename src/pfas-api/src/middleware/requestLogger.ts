/**
 * Request logging middleware for PFAS-Free Kitchen Platform API
 */

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Add request ID and timing to all requests
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();
  next();
}

/**
 * Log incoming requests
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, url, requestId } = req;

  logger.info({
    requestId,
    method,
    url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    type: 'request',
  }, `→ ${method} ${url}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const { statusCode } = res;

    const logMethod = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[logMethod]({
      requestId,
      method,
      url,
      statusCode,
      duration,
      type: 'response',
    }, `← ${method} ${url} ${statusCode} ${duration}ms`);
  });

  next();
}
