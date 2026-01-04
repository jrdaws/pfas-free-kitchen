/**
 * RBAC Middleware
 * 
 * Protect routes based on user permissions.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Define protected routes and their required permissions
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin": ["admin:all", "manage:settings"],
  "/admin/users": ["read:users", "admin:all"],
  "/admin/roles": ["manage:roles", "admin:all"],
  "/admin/settings": ["manage:settings", "admin:all"],
  "/billing": ["manage:billing", "admin:all"],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if route is protected
  const pathname = request.nextUrl.pathname;
  let requiredPermissions: string[] | undefined;

  for (const [route, permissions] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      requiredPermissions = permissions;
      break;
    }
  }

  if (!requiredPermissions) {
    return response;
  }

  // Require authentication
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check permissions
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      roles (permissions)
    `)
    .eq("user_id", session.user.id);

  const userPermissions = new Set<string>();
  for (const userRole of userRoles || []) {
    const permissions = (userRole.roles as Record<string, unknown>)?.permissions as string[];
    if (permissions) {
      for (const p of permissions) {
        userPermissions.add(p);
      }
    }
  }

  // Check if user has any required permission
  const hasPermission = requiredPermissions.some((p) => userPermissions.has(p));

  if (!hasPermission) {
    // Redirect to unauthorized page
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/billing/:path*"],
};

