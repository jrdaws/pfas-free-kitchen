/**
 * PFAS-Free Kitchen Admin Console - Auth Routes
 * 
 * Example route handlers demonstrating auth flow and route protection patterns.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md
 */

import {
  initiateLogin,
  handleCallback,
  revokeSession,
  type OAuthState,
  type AdminUserRecord,
  type IdPUserInfo,
  type IdentityProvider,
} from '../auth';
import {
  requireAuth,
  requireAdminRoute,
  requireRole,
  requirePermission,
  isAuthError,
  createAuthErrorResponse,
  type AuthenticatedRequest,
} from '../middleware/auth';
import { logAdminAction } from '../utils/audit';

// In-memory state store (use Redis in production)
const oauthStateStore = new Map<string, OAuthState>();

/**
 * GET /auth/login
 * 
 * Initiates SSO login flow. Redirects to identity provider.
 */
export async function handleLogin(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const provider = (url.searchParams.get('provider') || 'google') as IdentityProvider;
  const returnTo = url.searchParams.get('returnTo') || '/admin/dashboard';

  const { authUrl, state } = await initiateLogin(provider, returnTo);
  
  // Store state for callback verification
  const stateKey = crypto.randomUUID();
  oauthStateStore.set(stateKey, state);

  // Set state in cookie and redirect
  return new Response(null, {
    status: 302,
    headers: {
      'Location': authUrl,
      'Set-Cookie': `oauth_state=${stateKey}; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

/**
 * GET /auth/callback
 * 
 * Handles OAuth callback. Exchanges code for tokens and creates session.
 */
export async function handleAuthCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(JSON.stringify({ error: 'auth_failed', message: error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'missing_code', message: 'Authorization code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get state from cookie
  const cookies = parseCookies(req.headers.get('Cookie') || '');
  const stateKey = cookies['oauth_state'];
  const storedState = stateKey ? oauthStateStore.get(stateKey) : null;

  if (!storedState) {
    return new Response(JSON.stringify({ error: 'invalid_state', message: 'OAuth state expired or invalid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Clean up state
  oauthStateStore.delete(stateKey);

  try {
    const { tokens, user } = await handleCallback(
      code,
      storedState,
      findOrCreateAdminUser
    );

    // Log successful login
    await logAdminAction(
      user,
      'auth.login',
      'session',
      user.id,
      null,
      { provider: storedState.provider },
      { ipAddress: req.headers.get('X-Forwarded-For') }
    );

    // Set tokens in cookies and redirect
    const returnTo = storedState.returnTo || '/admin/dashboard';
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': returnTo,
        'Set-Cookie': [
          `access_token=${tokens.accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
          `refresh_token=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh`,
        ].join(', '),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    
    // Log failed login attempt
    await logAdminAction(
      null,
      'auth.login_failed',
      'session',
      'unknown',
      null,
      { error: message },
      { ipAddress: req.headers.get('X-Forwarded-For') }
    );

    return new Response(JSON.stringify({ error: 'auth_failed', message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /auth/logout
 * 
 * Revokes current session and clears cookies.
 */
export async function handleLogout(req: AuthenticatedRequest): Promise<Response> {
  const authResult = await requireAuth(req);
  
  if (isAuthError(authResult)) {
    // Already logged out or invalid session - just clear cookies
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': [
          'access_token=; HttpOnly; Secure; Max-Age=0; Path=/',
          'refresh_token=; HttpOnly; Secure; Max-Age=0; Path=/auth/refresh',
        ].join(', '),
      },
    });
  }

  // Revoke session
  if (authResult.session) {
    revokeSession(authResult.session.sessionId);
    
    // Log logout
    await logAdminAction(
      authResult.user!,
      'auth.logout',
      'session',
      authResult.session.sessionId
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': [
        'access_token=; HttpOnly; Secure; Max-Age=0; Path=/',
        'refresh_token=; HttpOnly; Secure; Max-Age=0; Path=/auth/refresh',
      ].join(', '),
    },
  });
}

// ============================================================================
// ROUTE PROTECTION PATTERNS (from spec)
// ============================================================================

/**
 * Example: Public route - no auth
 * GET /products
 */
export async function listProducts(_req: Request): Promise<Response> {
  // No auth required - public endpoint
  return new Response(JSON.stringify({ products: [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Example: Admin route - any authenticated user
 * GET /admin/queue
 */
export async function listQueue(req: AuthenticatedRequest): Promise<Response> {
  const result = await requireAdminRoute(req);
  if (isAuthError(result)) return createAuthErrorResponse(result);

  // User is authenticated with MFA (if required)
  return new Response(JSON.stringify({ queue: [], user: result.user }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Example: Role-restricted route
 * POST /admin/verification/decide
 */
export async function submitDecision(req: AuthenticatedRequest): Promise<Response> {
  let result = await requireAuth(req);
  if (isAuthError(result)) return createAuthErrorResponse(result);

  result = await requireRole(['reviewer', 'super_admin'])(result);
  if (isAuthError(result)) return createAuthErrorResponse(result);

  // User has reviewer or super_admin role
  const body = await req.json();
  
  // Log the verification decision
  await logAdminAction(
    result.user!,
    'verification.decided',
    'product',
    body.productId,
    body.oldTier ? { tier: body.oldTier } : null,
    { tier: body.newTier, claim_type: body.claimType },
    { ipAddress: req.headers.get('X-Forwarded-For') }
  );

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Example: Permission-based route
 * DELETE /admin/products/:id
 */
export async function deleteProduct(req: AuthenticatedRequest): Promise<Response> {
  let result = await requireAuth(req);
  if (isAuthError(result)) return createAuthErrorResponse(result);

  result = await requirePermission('catalog:delete')(result);
  if (isAuthError(result)) return createAuthErrorResponse(result);

  // User has catalog:delete permission (super_admin only)
  const url = new URL(req.url);
  const productId = url.pathname.split('/').pop()!;

  // Log the deletion
  await logAdminAction(
    result.user!,
    'catalog.product_deleted',
    'product',
    productId,
    { deleted: true },
    null,
    { ipAddress: req.headers.get('X-Forwarded-For') }
  );

  return new Response(JSON.stringify({ deleted: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse cookies from header string.
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });
  return cookies;
}

/**
 * Find or create admin user record.
 * In production, this queries/updates the database.
 */
async function findOrCreateAdminUser(
  info: IdPUserInfo,
  provider: IdentityProvider
): Promise<AdminUserRecord> {
  // Placeholder - in production, query admin_users table
  return {
    id: `usr_${info.subject.slice(0, 8)}`,
    email: info.email,
    name: info.name,
    role: 'viewer', // Default role for new users
    idp_subject: info.subject,
    idp_provider: provider,
    mfa_enabled: info.mfaEnabled,
    created_at: new Date(),
    updated_at: new Date(),
    last_login_at: new Date(),
  };
}
