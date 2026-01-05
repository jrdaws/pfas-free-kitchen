/**
 * Clerk Helper Utilities with Lazy Initialization
 *
 * This module provides utility functions for common Clerk authentication
 * and user management tasks. All functions gracefully handle missing
 * configuration.
 */

// Check if Clerk is configured
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = 
  CLERK_KEY && 
  CLERK_KEY.startsWith("pk_") && 
  !CLERK_KEY.includes("placeholder");

// Lazy import Clerk functions to avoid initialization errors
async function getClerkAuth() {
  if (!isClerkConfigured) {
    throw new Error("Clerk is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable authentication.");
  }
  const { auth } = await import("@clerk/nextjs/server");
  return auth;
}

async function getClerkCurrentUser() {
  if (!isClerkConfigured) {
    return null;
  }
  const { currentUser } = await import("@clerk/nextjs/server");
  return currentUser;
}

async function getClerkClient() {
  if (!isClerkConfigured) {
    throw new Error("Clerk is not configured. Set CLERK_SECRET_KEY to enable admin operations.");
  }
  const { clerkClient } = await import("@clerk/nextjs/server");
  return clerkClient;
}

/**
 * Check if Clerk authentication is configured
 */
export function isAuthConfigured(): boolean {
  return isClerkConfigured;
}

/**
 * Get the current authenticated user's ID
 * Returns null if not authenticated or Clerk not configured
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isClerkConfigured) {
    return null;
  }
  
  const auth = await getClerkAuth();
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current authenticated user's full data
 * Returns null if not authenticated or Clerk not configured
 */
export async function getCurrentUser() {
  const currentUser = await getClerkCurrentUser();
  if (!currentUser) return null;
  
  const user = await currentUser();
  return user;
}

/**
 * Require authentication - throws error if not authenticated
 * Useful for server actions and API routes
 */
export async function requireAuth(): Promise<string> {
  if (!isClerkConfigured) {
    throw new Error("Authentication is not configured");
  }

  const auth = await getClerkAuth();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized - Authentication required");
  }

  return userId;
}

/**
 * Check if user has a specific role
 * @param role - The role to check for (e.g., "admin", "moderator")
 */
export async function hasRole(role: string): Promise<boolean> {
  if (!isClerkConfigured) {
    return false;
  }

  const auth = await getClerkAuth();
  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    return false;
  }

  const roles = (sessionClaims.metadata as any)?.roles as string[] | undefined;
  return roles ? roles.includes(role) : false;
}

/**
 * Get user by ID (requires admin privileges)
 * @param userId - The Clerk user ID
 */
export async function getUserById(userId: string) {
  const clerkClient = await getClerkClient();
  
  try {
    const user = await clerkClient().users.getUser(userId);
    return user;
  } catch (error: any) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Update user metadata
 * @param userId - The Clerk user ID
 * @param metadata - Public or private metadata to update
 */
export async function updateUserMetadata(
  userId: string,
  metadata: {
    publicMetadata?: Record<string, any>;
    privateMetadata?: Record<string, any>;
  }
) {
  const clerkClient = await getClerkClient();
  
  try {
    const user = await clerkClient().users.updateUser(userId, metadata);
    return user;
  } catch (error: any) {
    throw new Error(`Failed to update user metadata: ${error.message}`);
  }
}

/**
 * Get user's email addresses
 */
export async function getUserEmails(): Promise<string[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return user.emailAddresses.map((email) => email.emailAddress);
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user || !user.primaryEmailAddress) {
    return false;
  }

  return user.primaryEmailAddress.verification?.status === "verified";
}

/**
 * Get user's organization memberships
 */
export async function getUserOrganizations() {
  if (!isClerkConfigured) {
    return null;
  }

  const auth = await getClerkAuth();
  const { userId, orgId, orgRole, orgSlug } = await auth();

  if (!userId) {
    return null;
  }

  return {
    currentOrgId: orgId,
    currentOrgRole: orgRole,
    currentOrgSlug: orgSlug,
  };
}

/**
 * Ban a user (requires admin privileges)
 * @param userId - The Clerk user ID to ban
 */
export async function banUser(userId: string) {
  const clerkClient = await getClerkClient();
  
  try {
    const user = await clerkClient().users.banUser(userId);
    return user;
  } catch (error: any) {
    throw new Error(`Failed to ban user: ${error.message}`);
  }
}

/**
 * Unban a user (requires admin privileges)
 * @param userId - The Clerk user ID to unban
 */
export async function unbanUser(userId: string) {
  const clerkClient = await getClerkClient();
  
  try {
    const user = await clerkClient().users.unbanUser(userId);
    return user;
  } catch (error: any) {
    throw new Error(`Failed to unban user: ${error.message}`);
  }
}

/**
 * Get user's session information
 */
export async function getSession() {
  if (!isClerkConfigured) {
    return { sessionId: null, sessionClaims: null };
  }

  const auth = await getClerkAuth();
  const { sessionId, sessionClaims } = await auth();

  return {
    sessionId,
    sessionClaims,
  };
}
