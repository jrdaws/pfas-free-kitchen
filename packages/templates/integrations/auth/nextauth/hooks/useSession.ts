"use client";

import { useSession as useNextAuthSession, signIn, signOut } from "next-auth/react";

/**
 * Enhanced session hook with convenience methods
 */
export function useSession() {
  const session = useNextAuthSession();

  return {
    ...session,
    user: session.data?.user ?? null,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
    signIn,
    signOut,
  };
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function useRequireAuth(redirectTo = "/login") {
  const session = useSession();

  if (typeof window !== "undefined" && !session.isLoading && !session.isAuthenticated) {
    signIn(undefined, { callbackUrl: redirectTo });
  }

  return session;
}

