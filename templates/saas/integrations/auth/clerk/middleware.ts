import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Clerk Middleware with lazy initialization
 * Only protects routes if Clerk is properly configured
 */

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Check if we have a valid Clerk key (not a placeholder)
const isClerkConfigured = 
  CLERK_KEY && 
  CLERK_KEY.startsWith("pk_") && 
  !CLERK_KEY.includes("placeholder");

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/webhook(.*)",
  "/api/health(.*)",
]);

// Export middleware - conditionally use Clerk or pass-through
export default function middleware(request: NextRequest) {
  // If Clerk is not configured, allow all requests through
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // Use Clerk middleware when configured
  return clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
      auth().protect();
    }
  })(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
