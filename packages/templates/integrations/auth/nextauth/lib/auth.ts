import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

/**
 * Get the current session on the server
 * Use this in Server Components and API routes
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - throws if not logged in
 * Use in API routes and Server Actions
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: string) {
  const user = await getCurrentUser();
  return user?.role === role;
}

