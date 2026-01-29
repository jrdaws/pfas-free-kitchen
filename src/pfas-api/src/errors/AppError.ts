/**
 * Custom error classes for PFAS-Free Kitchen Platform API
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NOT_IMPLEMENTED';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  field?: string;
  statusCode: number;
  requestId?: string;
}

/**
 * Base application error with structured error details
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly field?: string;
  public readonly isOperational: boolean;

  constructor(details: Omit<ErrorDetails, 'requestId'>) {
    super(details.message);
    this.name = 'AppError';
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.field = details.field;
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      field: this.field,
    };
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      field,
      statusCode: 400,
    });
    this.name = 'ValidationError';
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super({
      code: 'NOT_FOUND',
      message,
      statusCode: 404,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict - State conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super({
      code: 'CONFLICT',
      message,
      statusCode: 409,
    });
    this.name = 'ConflictError';
  }
}

/**
 * 429 Too Many Requests - Rate limiting
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded. Please try again later.', retryAfter?: number) {
    super({
      code: 'RATE_LIMITED',
      message,
      statusCode: 429,
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 401 Unauthorized - Missing or invalid auth
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super({
      code: 'UNAUTHORIZED',
      message,
      statusCode: 401,
    });
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super({
      code: 'FORBIDDEN',
      message,
      statusCode: 403,
    });
    this.name = 'ForbiddenError';
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super({
      code: 'INTERNAL_ERROR',
      message,
      statusCode: 500,
    });
    this.name = 'InternalError';
  }
}

/**
 * 503 Service Unavailable - Dependency down
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string, message?: string) {
    super({
      code: 'SERVICE_UNAVAILABLE',
      message: message || `${service} is temporarily unavailable. Please try again later.`,
      statusCode: 503,
    });
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * 501 Not Implemented - For stub implementations
 */
export class NotImplementedError extends AppError {
  constructor(methodName: string) {
    super({
      code: 'NOT_IMPLEMENTED',
      message: `${methodName} is not yet implemented`,
      statusCode: 501,
    });
    this.name = 'NotImplementedError';
  }
}
