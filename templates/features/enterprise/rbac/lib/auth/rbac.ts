/**
 * Role-Based Access Control
 * 
 * Manage user roles and permissions.
 */

import { createClient } from "@/lib/supabase";

export type Permission =
  | "read:users"
  | "write:users"
  | "delete:users"
  | "read:content"
  | "write:content"
  | "delete:content"
  | "manage:roles"
  | "manage:settings"
  | "view:analytics"
  | "manage:billing"
  | "admin:all";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
  createdAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  role?: Role;
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  
  for (const userRole of userRoles) {
    if (userRole.role?.permissions.includes(permission)) {
      return true;
    }
    // Admin has all permissions
    if (userRole.role?.permissions.includes("admin:all")) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has any of the permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      user_id,
      role_id,
      roles (
        id,
        name,
        description,
        permissions,
        is_default,
        created_at
      )
    `)
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    userId: row.user_id,
    roleId: row.role_id,
    role: row.roles ? {
      id: (row.roles as Record<string, unknown>).id as string,
      name: (row.roles as Record<string, unknown>).name as string,
      description: (row.roles as Record<string, unknown>).description as string,
      permissions: (row.roles as Record<string, unknown>).permissions as Permission[],
      isDefault: (row.roles as Record<string, unknown>).is_default as boolean,
      createdAt: new Date((row.roles as Record<string, unknown>).created_at as string),
    } : undefined,
  }));
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  });

  return !error;
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string, roleId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId);

  return !error;
}

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Create role
 */
export async function createRole(
  name: string,
  description: string,
  permissions: Permission[]
): Promise<Role | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("roles")
    .insert({
      name,
      description,
      permissions,
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    permissions: data.permissions,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
  };
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: Permission[]
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("roles")
    .update({ permissions })
    .eq("id", roleId);

  return !error;
}

/**
 * Delete role
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("roles").delete().eq("id", roleId);

  return !error;
}

/**
 * Default roles for seeding
 */
export const DEFAULT_ROLES: Omit<Role, "id" | "createdAt">[] = [
  {
    name: "Admin",
    description: "Full system access",
    permissions: ["admin:all"],
    isDefault: false,
  },
  {
    name: "Editor",
    description: "Can manage content",
    permissions: ["read:content", "write:content", "delete:content"],
    isDefault: false,
  },
  {
    name: "Viewer",
    description: "Read-only access",
    permissions: ["read:content", "view:analytics"],
    isDefault: true,
  },
];

