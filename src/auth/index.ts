/**
 * PFAS-Free Kitchen Admin Console - Authentication Module
 * 
 * Exports all authentication, authorization, and session management utilities.
 */

// Session management
export {
  createSession,
  verifySession,
  refreshSession,
  revokeSession,
  revokeAllUserSessions,
  isSessionRevoked,
  cleanupExpiredSessions,
  type AuthenticatedUser,
  type SessionTokens,
  type DecodedSession,
} from './session';

// SSO integration
export {
  initiateLogin,
  handleCallback,
  verifyIdToken,
  getLoginUrl,
  getCallbackUrl,
  type IdentityProvider,
  type OAuthState,
  type AdminUserRecord,
  type IdPUserInfo,
} from './sso';
