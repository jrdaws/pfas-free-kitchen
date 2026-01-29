/**
 * PFAS-Free Kitchen Admin Console - Session Management
 * 
 * JWT-based session handling with refresh token rotation.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md "1.3 Access Control"
 */

import * as jose from 'jose';
import type { AdminRole } from '../config/permissions';

// Environment configuration with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '8', 10);
const REFRESH_TOKEN_DAYS = 30;

/**
 * Authenticated user payload stored in JWT.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  mfaVerified?: boolean;
}

/**
 * Session tokens returned after authentication.
 */
export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Decoded session from JWT verification.
 */
export interface DecodedSession {
  user: AuthenticatedUser;
  sessionId: string;
  issuedAt: Date;
  expiresAt: Date;
}

// In-memory session store for revocation tracking
// In production, use Redis or database
const revokedSessions = new Set<string>();
const refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * Get secret key for JWT operations.
 */
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Generate a cryptographically random session ID.
 */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session for an authenticated user.
 * Issues both access and refresh tokens.
 */
export async function createSession(user: AuthenticatedUser): Promise<SessionTokens> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  // Create access token
  const accessToken = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mfaVerified: user.mfaVerified ?? false,
    sid: sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setIssuer('pfas-free-kitchen-admin')
    .setAudience('pfas-admin-console')
    .sign(getSecretKey());

  // Create refresh token
  const refreshToken = await new jose.SignJWT({
    sub: user.id,
    sid: sessionId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(refreshExpiresAt)
    .setIssuer('pfas-free-kitchen-admin')
    .sign(getSecretKey());

  // Store refresh token for rotation tracking
  refreshTokenStore.set(sessionId, { userId: user.id, expiresAt: refreshExpiresAt });

  return { accessToken, refreshToken, expiresAt };
}

/**
 * Verify and decode an access token.
 * Throws if token is invalid, expired, or revoked.
 */
export async function verifySession(token: string): Promise<DecodedSession> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecretKey(), {
      issuer: 'pfas-free-kitchen-admin',
      audience: 'pfas-admin-console',
    });

    const sessionId = payload.sid as string;

    // Check if session was revoked
    if (revokedSessions.has(sessionId)) {
      throw new Error('Session has been revoked');
    }

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as AdminRole,
        mfaVerified: payload.mfaVerified as boolean,
      },
      sessionId,
      issuedAt: new Date((payload.iat as number) * 1000),
      expiresAt: new Date((payload.exp as number) * 1000),
    };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Session expired');
    }
    if (error instanceof jose.errors.JWTInvalid) {
      throw new Error('Invalid session token');
    }
    throw error;
  }
}

/**
 * Refresh an expired access token using a refresh token.
 * Implements refresh token rotation - old refresh token is invalidated.
 */
export async function refreshSession(
  refreshToken: string,
  getUserById: (id: string) => Promise<AuthenticatedUser | null>
): Promise<SessionTokens> {
  try {
    const { payload } = await jose.jwtVerify(refreshToken, getSecretKey(), {
      issuer: 'pfas-free-kitchen-admin',
    });

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const sessionId = payload.sid as string;
    const userId = payload.sub as string;

    // Verify refresh token is still valid
    const storedToken = refreshTokenStore.get(sessionId);
    if (!storedToken || storedToken.userId !== userId) {
      throw new Error('Refresh token not found or invalid');
    }

    // Invalidate old session
    refreshTokenStore.delete(sessionId);
    revokedSessions.add(sessionId);

    // Fetch fresh user data
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Issue new session (rotation)
    return createSession(user);
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
}

/**
 * Revoke a session immediately.
 * Used for logout or security incidents.
 */
export function revokeSession(sessionId: string): void {
  revokedSessions.add(sessionId);
  refreshTokenStore.delete(sessionId);
}

/**
 * Revoke all sessions for a user.
 * Used when user changes password or account is compromised.
 */
export function revokeAllUserSessions(userId: string): void {
  for (const [sessionId, token] of refreshTokenStore.entries()) {
    if (token.userId === userId) {
      revokedSessions.add(sessionId);
      refreshTokenStore.delete(sessionId);
    }
  }
}

/**
 * Check if a session is valid without full verification.
 * Useful for quick checks before expensive operations.
 */
export function isSessionRevoked(sessionId: string): boolean {
  return revokedSessions.has(sessionId);
}

/**
 * Clean up expired sessions from memory.
 * Should be run periodically in production.
 */
export function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [sessionId, token] of refreshTokenStore.entries()) {
    if (token.expiresAt < now) {
      refreshTokenStore.delete(sessionId);
    }
  }
}
