/**
 * API Error Handling Utilities
 *
 * Implements standard error response format per docs/standards/API_CONTRACTS.md
 */

export enum ErrorCodes {
  // Client errors (400-499)
  BAD_REQUEST = 'BAD_REQUEST',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (500-599)
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCodes;
    message: string;
    details?: any;
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}

const ERROR_STATUS_CODES: Record<ErrorCodes, number> = {
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.MISSING_FIELD]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.TOKEN_NOT_FOUND]: 404,
  [ErrorCodes.TOKEN_EXPIRED]: 410,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.TEMPLATE_NOT_FOUND]: 503,
};

/**
 * Create a standardized API error response
 *
 * @param code - Error code from ErrorCodes enum
 * @param message - Human-readable error message
 * @param status - HTTP status code (optional, defaults to code's standard status)
 * @param details - Additional error context (optional)
 * @param recovery - Actionable recovery guidance (required)
 * @param headers - Additional headers to include (e.g., CORS)
 * @returns Response object with standardized error format
 */
export function apiError(
  code: ErrorCodes,
  message: string,
  status?: number,
  details?: any,
  recovery?: string,
  headers?: Record<string, string>
): Response {
  const statusCode = status || ERROR_STATUS_CODES[code];

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      recovery: recovery || getDefaultRecovery(code),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Get default recovery message for an error code
 */
function getDefaultRecovery(code: ErrorCodes): string {
  const recoveryMessages: Record<ErrorCodes, string> = {
    [ErrorCodes.BAD_REQUEST]: 'Check your request format and try again.',
    [ErrorCodes.MISSING_FIELD]: 'Provide all required fields in the request.',
    [ErrorCodes.INVALID_INPUT]: 'Check the format of your input and try again.',
    [ErrorCodes.UNAUTHORIZED]: 'Provide valid authentication credentials.',
    [ErrorCodes.FORBIDDEN]: 'You do not have permission to access this resource.',
    [ErrorCodes.NOT_FOUND]: 'Verify the resource exists and try again.',
    [ErrorCodes.TOKEN_NOT_FOUND]: 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure',
    [ErrorCodes.TOKEN_EXPIRED]: 'Create a new project configuration at https://dawson.dev/configure',
    [ErrorCodes.RATE_LIMITED]: 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.',
    [ErrorCodes.DATABASE_ERROR]: 'Try again in a few moments. If the issue persists, contact support.',
    [ErrorCodes.INTERNAL_ERROR]: 'Try again in a few moments. If the issue persists, contact support.',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again in a few minutes.',
    [ErrorCodes.TEMPLATE_NOT_FOUND]: 'Use the CLI command instead: npx @jrdaws/framework create <template> <project-name>',
  };

  return recoveryMessages[code] || 'An error occurred. Please try again.';
}

/**
 * Create a standardized API success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers to include (e.g., CORS)
 * @returns Response object with standardized success format
 */
export function apiSuccess(
  data: any,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}
