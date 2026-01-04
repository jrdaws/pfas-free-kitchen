/**
 * Rate Limiting Middleware
 * 
 * Apply rate limits to protected routes.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldRateLimit, rateLimitedResponse, RateLimitType } from "@/lib/security/rate-limiter";

// Define rate limit types for different routes
const RATE_LIMIT_ROUTES: Record<string, RateLimitType> = {
  "/api/auth": "auth",
  "/api/search": "search",
  "/api/export": "heavy",
  "/api/admin/bulk": "heavy",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Determine rate limit type
  let rateLimitType: RateLimitType = "standard";
  for (const [route, type] of Object.entries(RATE_LIMIT_ROUTES)) {
    if (pathname.startsWith(route)) {
      rateLimitType = type;
      break;
    }
  }

  // Check rate limit
  const { limited, headers } = await shouldRateLimit(request, rateLimitType);

  if (limited) {
    return rateLimitedResponse(headers);
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};

