import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * NextAuth.js middleware for protecting routes
 * 
 * Configure which routes require authentication by updating the matcher
 */
export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

/**
 * Specify which routes should be protected
 * Update this matcher to include your protected routes
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    // Add more protected routes here
  ],
};

