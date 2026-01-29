/**
 * Authentication middleware for PFAS-Free Kitchen Platform API
 * STUB: Implement JWT/session validation in production
 */

import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

export type AdminRole = 'super_admin' | 'reviewer' | 'editor' | 'viewer';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Verify JWT/session and attach user to request
 * STUB: Replace with actual auth provider integration
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // STUB: Validate token with auth provider
    // TODO: Implement actual JWT verification
    if (!token) {
      throw new UnauthorizedError('Invalid token');
    }

    // STUB: Decode user from token
    // TODO: Replace with actual token decoding
    req.user = {
      id: 'stub_user_id',
      email: 'admin@example.com',
      name: 'Stub Admin',
      role: 'reviewer',
    };

    logger.debug({
      requestId: req.requestId,
      userId: req.user.id,
      role: req.user.role,
    }, 'User authenticated');

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require specific roles for access
 */
export function requireRole(...allowedRoles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        requestId: req.requestId,
        userId: req.user.id,
        role: req.user.role,
        required: allowedRoles,
      }, 'Access denied: insufficient role');
      
      return next(new ForbiddenError('Insufficient permissions for this action'));
    }

    next();
  };
}

/**
 * Optional auth - attaches user if token present, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No auth provided, continue without user
    return next();
  }

  // If auth is provided, validate it
  authMiddleware(req, _res, next);
}
