/**
 * Admin Permissions Module
 * 
 * Handles role-based access control for admin features.
 */

import { createClient } from "@/lib/supabase";

export type UserRole = "user" | "admin" | "superadmin";

export interface UserPermissions {
  canViewAdmin: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canManageSettings: boolean;
  canViewAnalytics: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  user: {
    canViewAdmin: false,
    canManageUsers: false,
    canManageContent: false,
    canManageSettings: false,
    canViewAnalytics: false,
  },
  admin: {
    canViewAdmin: true,
    canManageUsers: true,
    canManageContent: true,
    canManageSettings: false,
    canViewAnalytics: true,
  },
  superadmin: {
    canViewAdmin: true,
    canManageUsers: true,
    canManageContent: true,
    canManageSettings: true,
    canViewAnalytics: true,
  },
};

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return "user";
  }

  return (data.role as UserRole) || "user";
}

/**
 * Check if user has admin access
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin" || role === "superadmin";
}

/**
 * Get permissions for a user
 */
export async function getPermissions(userId: string): Promise<UserPermissions> {
  const role = await getUserRole(userId);
  return ROLE_PERMISSIONS[role];
}

/**
 * Check specific permission
 */
export async function hasPermission(
  userId: string,
  permission: keyof UserPermissions
): Promise<boolean> {
  const permissions = await getPermissions(userId);
  return permissions[permission];
}

/**
 * Update user role (requires superadmin)
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole,
  requestingUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if requesting user is superadmin
  const requestingRole = await getUserRole(requestingUserId);
  if (requestingRole !== "superadmin") {
    return { success: false, error: "Only superadmins can change user roles" };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({ role: newRole })
    .eq("user_id", targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create user profile with default role
 */
export async function createUserProfile(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("user_profiles").insert({
    user_id: userId,
    email,
    role: "user",
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

