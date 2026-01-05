"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

/**
 * Clerk Provider with lazy initialization
 * Only initializes Clerk if a valid publishable key is present
 */

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Check if we have a valid Clerk key (not a placeholder)
const isClerkConfigured = 
  CLERK_KEY && 
  CLERK_KEY.startsWith("pk_") && 
  !CLERK_KEY.includes("placeholder");

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Skip Clerk initialization if not properly configured
  if (!isClerkConfigured) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Auth] Clerk not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable authentication."
      );
    }
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

/**
 * Check if Clerk is configured (useful for conditional rendering)
 */
export function useClerkConfigured() {
  return isClerkConfigured;
}
