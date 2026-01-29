/**
 * Global error handling middleware for PFAS-Free Kitchen Platform API
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, RateLimitError, ValidationError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string;
    requestId?: string;
  };
}

/**
 * Format Zod validation errors into a readable message
 */
function formatZodError(error: ZodError): { message: string; field?: string } {
  const firstIssue = error.issues[0];
  const field = firstIssue.path.join('.');
  const message = firstIssue.message;

  return {
    message: field ? `${field}: ${message}` : message,
    field: field || undefined,
  };
}

/**
 * Global error handler - catches all errors and returns structured responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const { message, field } = formatZodError(error);
    const validationError = new ValidationError(message, field);

    logger.warn({
      requestId,
      error: validationError.code,
      message: validationError.message,
      field,
      issues: error.issues,
    }, 'Validation error');

    const response: ErrorResponse = {
      error: {
        code: validationError.code,
        message: validationError.message,
        field,
        requestId,
      },
    };

    res.status(validationError.statusCode).json(response);
    return;
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn';

    logger[logLevel]({
      requestId,
      error: error.code,
      message: error.message,
      field: error.field,
      statusCode: error.statusCode,
      stack: error.statusCode >= 500 ? error.stack : undefined,
    }, `${error.name}: ${error.message}`);

    const response: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        field: error.field,
        requestId,
      },
    };

    // Add Retry-After header for rate limit errors
    if (error instanceof RateLimitError && error.retryAfter) {
      res.setHeader('Retry-After', error.retryAfter);
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  logger.error({
    requestId,
    error: error.name,
    message: error.message,
    stack: error.stack,
  }, `Unexpected error: ${error.message}`);

  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      requestId,
    },
  };

  res.status(500).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.requestId,
    },
  };

  logger.warn({
    requestId: req.requestId,
    method: req.method,
    path: req.path,
  }, 'Route not found');

  res.status(404).json(response);
}

/**
 * Async handler wrapper - catches async errors and passes to error handler
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
