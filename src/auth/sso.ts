/**
 * PFAS-Free Kitchen Admin Console - SSO Integration
 * 
 * OAuth 2.0 / OIDC integration supporting Google Workspace and Okta.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md "1.3 Access Control"
 */

import * as client from 'openid-client';
import type { AdminRole } from '../config/permissions';
import { createSession, type AuthenticatedUser, type SessionTokens } from './session';

// Environment configuration
const AUTH_ISSUER = process.env.AUTH_ISSUER || 'https://accounts.google.com';
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID || '';
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET || '';
const AUTH_REDIRECT_URI = process.env.AUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

/**
 * Supported identity providers.
 */
export type IdentityProvider = 'google' | 'okta';

/**
 * OAuth state stored during auth flow.
 */
export interface OAuthState {
  provider: IdentityProvider;
  returnTo?: string;
  nonce: string;
  codeVerifier: string;
}

/**
 * Admin user record from database.
 */
export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  idp_subject: string;
  idp_provider: IdentityProvider;
  mfa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

/**
 * User info from IdP token claims.
 */
export interface IdPUserInfo {
  subject: string;
  email: string;
  name: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  picture?: string;
}

// OpenID client configuration cache
let googleConfig: client.Configuration | null = null;
let oktaConfig: client.Configuration | null = null;

/**
 * Get OpenID configuration for a provider.
 * Caches configuration to avoid repeated discovery requests.
 */
async function getIdPConfig(provider: IdentityProvider): Promise<client.Configuration> {
  if (provider === 'google') {
    if (!googleConfig) {
      googleConfig = await client.discovery(
        new URL(AUTH_ISSUER),
        AUTH_CLIENT_ID,
        AUTH_CLIENT_SECRET
      );
    }
    return googleConfig;
  }
  
  if (provider === 'okta') {
    if (!oktaConfig) {
      const oktaIssuer = process.env.OKTA_ISSUER || AUTH_ISSUER;
      oktaConfig = await client.discovery(
        new URL(oktaIssuer),
        process.env.OKTA_CLIENT_ID || AUTH_CLIENT_ID,
        process.env.OKTA_CLIENT_SECRET || AUTH_CLIENT_SECRET
      );
    }
    return oktaConfig;
  }
  
  throw new Error(`Unsupported identity provider: ${provider}`);
}

/**
 * Generate a cryptographically secure random string.
 */
function generateRandomString(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(36)).join('').slice(0, length);
}

/**
 * Initiate SSO login flow.
 * 
 * Returns the authorization URL to redirect the user to.
 * Store the returned state for verification in the callback.
 * 
 * Flow:
 * 1. /auth/login -> redirect to IdP
 * 2. IdP authenticates user
 * 3. IdP redirects to /auth/callback with code
 */
export async function initiateLogin(
  provider: IdentityProvider = 'google',
  returnTo?: string
): Promise<{ authUrl: string; state: OAuthState }> {
  const config = await getIdPConfig(provider);
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  
  // Generate state and nonce for security
  const nonce = generateRandomString();
  const stateParam = generateRandomString();
  
  // Build authorization URL
  const redirectUri = provider === 'okta' 
    ? (process.env.OKTA_REDIRECT_URI || AUTH_REDIRECT_URI)
    : AUTH_REDIRECT_URI;
  
  const params = new URLSearchParams({
    client_id: config.serverMetadata().issuer === 'https://accounts.google.com' 
      ? AUTH_CLIENT_ID 
      : (process.env.OKTA_CLIENT_ID || AUTH_CLIENT_ID),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: stateParam,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    // Request MFA claim for Google
    ...(provider === 'google' && { hd: process.env.GOOGLE_HOSTED_DOMAIN || '*' }),
  });
  
  const authorizationEndpoint = config.serverMetadata().authorization_endpoint;
  if (!authorizationEndpoint) {
    throw new Error('Authorization endpoint not found in IdP metadata');
  }
  
  const authUrl = `${authorizationEndpoint}?${params.toString()}`;
  
  return {
    authUrl,
    state: {
      provider,
      returnTo,
      nonce,
      codeVerifier,
    },
  };
}

/**
 * Handle OAuth callback and exchange code for tokens.
 * 
 * Flow:
 * 2. /auth/callback -> exchange code for tokens
 * 3. Create/update admin_users record
 * 4. Issue session JWT
 */
export async function handleCallback(
  code: string,
  storedState: OAuthState,
  findOrCreateUser: (info: IdPUserInfo, provider: IdentityProvider) => Promise<AdminUserRecord>
): Promise<{ tokens: SessionTokens; user: AuthenticatedUser }> {
  const config = await getIdPConfig(storedState.provider);
  
  const redirectUri = storedState.provider === 'okta'
    ? (process.env.OKTA_REDIRECT_URI || AUTH_REDIRECT_URI)
    : AUTH_REDIRECT_URI;
  
  // Exchange code for tokens
  const tokens = await client.authorizationCodeGrant(config, new URL(redirectUri), {
    code,
    pkceCodeVerifier: storedState.codeVerifier,
  });
  
  // Verify ID token and extract claims
  const claims = tokens.claims();
  if (!claims) {
    throw new Error('No ID token claims received');
  }
  
  // Verify nonce
  if (claims.nonce !== storedState.nonce) {
    throw new Error('Invalid nonce in ID token');
  }
  
  // Extract user info
  const userInfo: IdPUserInfo = {
    subject: claims.sub,
    email: claims.email as string,
    name: claims.name as string || claims.email as string,
    emailVerified: claims.email_verified as boolean || false,
    // Check MFA status from claims
    // Google: amr claim contains 'mfa' or 'hwk' (hardware key)
    // Okta: amr claim or custom claim
    mfaEnabled: checkMfaStatus(claims, storedState.provider),
    picture: claims.picture as string | undefined,
  };
  
  // Validate email is verified
  if (!userInfo.emailVerified) {
    throw new Error('Email not verified with identity provider');
  }
  
  // Find or create admin user record
  const adminUser = await findOrCreateUser(userInfo, storedState.provider);
  
  // Build authenticated user
  const authenticatedUser: AuthenticatedUser = {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    mfaVerified: userInfo.mfaEnabled,
  };
  
  // Create session
  const sessionTokens = await createSession(authenticatedUser);
  
  return {
    tokens: sessionTokens,
    user: authenticatedUser,
  };
}

/**
 * Check MFA status from IdP token claims.
 */
function checkMfaStatus(claims: Record<string, unknown>, provider: IdentityProvider): boolean {
  // Authentication Methods Reference (AMR) claim
  const amr = claims.amr as string[] | undefined;
  
  if (amr) {
    // Check for MFA-related authentication methods
    const mfaMethods = ['mfa', 'hwk', 'otp', 'sms', 'swk', 'pop'];
    if (amr.some(method => mfaMethods.includes(method))) {
      return true;
    }
  }
  
  // Okta-specific: Check custom MFA claim
  if (provider === 'okta') {
    if (claims.mfa_verified === true || claims['okta:mfa_verified'] === true) {
      return true;
    }
  }
  
  // Google-specific: Check for 2FA via hd (hosted domain) + amr
  if (provider === 'google') {
    // If using Google Workspace with enforced 2FA, we can trust the session
    // This is a simplification - in production, verify with admin SDK
    if (claims.hd && amr && amr.length > 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Verify an ID token without exchanging code.
 * Useful for re-verifying tokens or handling token refresh.
 */
export async function verifyIdToken(
  idToken: string,
  provider: IdentityProvider
): Promise<IdPUserInfo> {
  const config = await getIdPConfig(provider);
  
  // Verify and decode the ID token
  const claims = await client.validateJwtAccessToken(config, idToken, {
    audience: provider === 'google' ? AUTH_CLIENT_ID : (process.env.OKTA_CLIENT_ID || AUTH_CLIENT_ID),
  });
  
  return {
    subject: claims.sub as string,
    email: claims.email as string,
    name: claims.name as string || claims.email as string,
    emailVerified: claims.email_verified as boolean || false,
    mfaEnabled: checkMfaStatus(claims as Record<string, unknown>, provider),
    picture: claims.picture as string | undefined,
  };
}

/**
 * Build login URL for direct navigation.
 * Convenience method for simple redirect flows.
 */
export function getLoginUrl(provider: IdentityProvider = 'google'): string {
  return `/auth/login?provider=${provider}`;
}

/**
 * Get callback URL for configuration.
 */
export function getCallbackUrl(provider: IdentityProvider = 'google'): string {
  return provider === 'okta'
    ? (process.env.OKTA_REDIRECT_URI || AUTH_REDIRECT_URI)
    : AUTH_REDIRECT_URI;
}
