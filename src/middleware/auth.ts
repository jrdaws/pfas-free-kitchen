/**
 * PFAS-Free Kitchen Admin Console - Authentication Middleware
 * 
 * Provides middleware for protecting admin routes with authentication and authorization.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md "1.3 Access Control"
 */

import type { AdminRole, Permission } from '../config/permissions';
import { hasPermission, hasRole, requiresMfa } from '../config/permissions';
import { verifySession, type AuthenticatedUser, type DecodedSession } from '../auth/session';

/**
 * Extended Request type with authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  session?: DecodedSession;
}

/**
 * Middleware response for unauthorized requests.
 */
export interface AuthError {
  status: 401 | 403;
  code: string;
  message: string;
}

/**
 * Middleware handler type.
 */
export type MiddlewareHandler = (
  req: AuthenticatedRequest
) => Promise<AuthenticatedRequest | AuthError>;

/**
 * Check if result is an auth error.
 */
export function isAuthError(result: AuthenticatedRequest | AuthError): result is AuthError {
  return 'status' in result && 'code' in result;
}

/**
 * Create an unauthorized error response.
 */
function unauthorized(code: string, message: string): AuthError {
  return { status: 401, code, message };
}

/**
 * Create a forbidden error response.
 */
function forbidden(code: string, message: string): AuthError {
  return { status: 403, code, message };
}

/**
 * Extract bearer token from Authorization header.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Middleware: requireAuth
 * 
 * Validates JWT and attaches user to request.
 * Returns 401 if no valid token present.
 * 
 * @example
 * router.get('/admin/queue', async (req) => {
 *   const result = await requireAuth(req);
 *   if (isAuthError(result)) return new Response(result.message, { status: result.status });
 *   // result.user is now available
 * });
 */
export async function requireAuth(req: AuthenticatedRequest): Promise<AuthenticatedRequest | AuthError> {
  const token = extractBearerToken(req);
  
  if (!token) {
    return unauthorized('NO_TOKEN', 'Authentication required');
  }

  try {
    const session = await verifySession(token);
    
    // Clone request and attach user/session
    const authedReq = req as AuthenticatedRequest;
    authedReq.user = session.user;
    authedReq.session = session;
    
    return authedReq;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return unauthorized('INVALID_TOKEN', message);
  }
}

/**
 * Middleware: requireRole
 * 
 * Checks if authenticated user has one of the allowed roles.
 * Must be called after requireAuth.
 * 
 * @param roles - Array of roles that are allowed access
 * 
 * @example
 * router.post('/admin/verification/decide', async (req) => {
 *   let result = await requireAuth(req);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   result = await requireRole(['reviewer', 'super_admin'])(result);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   // User is authenticated and has reviewer or super_admin role
 * });
 */
export function requireRole(roles: AdminRole[]): MiddlewareHandler {
  return async (req: AuthenticatedRequest): Promise<AuthenticatedRequest | AuthError> => {
    if (!req.user) {
      return unauthorized('NOT_AUTHENTICATED', 'Authentication required');
    }

    if (!hasRole(req.user.role, roles)) {
      return forbidden(
        'INSUFFICIENT_ROLE',
        `Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      );
    }

    return req;
  };
}

/**
 * Middleware: requirePermission
 * 
 * Checks if authenticated user has a specific permission.
 * Uses the permission matrix from config/permissions.ts.
 * Must be called after requireAuth.
 * 
 * @param permission - The permission required for this route
 * 
 * @example
 * router.delete('/admin/products/:id', async (req) => {
 *   let result = await requireAuth(req);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   result = await requirePermission('catalog:delete')(result);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   // User has catalog:delete permission (super_admin only)
 * });
 */
export function requirePermission(permission: Permission): MiddlewareHandler {
  return async (req: AuthenticatedRequest): Promise<AuthenticatedRequest | AuthError> => {
    if (!req.user) {
      return unauthorized('NOT_AUTHENTICATED', 'Authentication required');
    }

    if (!hasPermission(req.user.role, permission)) {
      return forbidden(
        'INSUFFICIENT_PERMISSION',
        `Permission denied: ${permission}`
      );
    }

    return req;
  };
}

/**
 * Middleware: requireMfa
 * 
 * Enforces MFA verification for roles that require it.
 * Per spec: MFA required for reviewer and super_admin roles.
 * Must be called after requireAuth.
 * 
 * @param gracePeriodDays - Optional grace period for new users (default from env)
 * 
 * @example
 * router.post('/admin/verification/decide', async (req) => {
 *   let result = await requireAuth(req);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   result = await requireMfa()(result);
 *   if (isAuthError(result)) return errorResponse(result);
 *   
 *   // User has MFA verified (if required for their role)
 * });
 */
export function requireMfa(gracePeriodDays?: number): MiddlewareHandler {
  const _gracePeriod = gracePeriodDays ?? parseInt(process.env.MFA_GRACE_PERIOD_DAYS || '7', 10);
  
  return async (req: AuthenticatedRequest): Promise<AuthenticatedRequest | AuthError> => {
    if (!req.user) {
      return unauthorized('NOT_AUTHENTICATED', 'Authentication required');
    }

    // Only enforce MFA for roles that require it
    if (!requiresMfa(req.user.role)) {
      return req;
    }

    // Check MFA status from IdP claims (set during SSO auth)
    if (!req.user.mfaVerified) {
      return forbidden(
        'MFA_REQUIRED',
        'Multi-factor authentication required for this role. Please enable MFA in your identity provider.'
      );
    }

    return req;
  };
}

/**
 * Middleware: requireAdminRoute
 * 
 * Combined middleware that enforces all standard admin route requirements:
 * 1. Valid authentication
 * 2. MFA verification (if required for role)
 * 
 * @example
 * router.get('/admin/dashboard', async (req) => {
 *   const result = await requireAdminRoute(req);
 *   if (isAuthError(result)) return errorResponse(result);
 *   // All standard admin checks passed
 * });
 */
export async function requireAdminRoute(req: AuthenticatedRequest): Promise<AuthenticatedRequest | AuthError> {
  // Step 1: Authenticate
  let result = await requireAuth(req);
  if (isAuthError(result)) return result;

  // Step 2: Check MFA (if required for role)
  result = await requireMfa()(result);
  if (isAuthError(result)) return result;

  return result;
}

/**
 * Helper: Create JSON error response from AuthError.
 */
export function createAuthErrorResponse(error: AuthError): Response {
  return new Response(
    JSON.stringify({ error: error.code, message: error.message }),
    {
      status: error.status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
