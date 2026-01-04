/**
 * Role-based permission system for admin features
 */

export type Role = "user" | "editor" | "moderator" | "admin" | "super_admin";

export type Permission =
  | "dashboard:view"
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "content:view"
  | "content:create"
  | "content:edit"
  | "content:delete"
  | "content:publish"
  | "settings:view"
  | "settings:edit"
  | "analytics:view"
  | "billing:view"
  | "billing:manage";

/**
 * Role-permission mapping
 */
const rolePermissions: Record<Role, Permission[]> = {
  user: [],
  editor: [
    "dashboard:view",
    "content:view",
    "content:create",
    "content:edit",
  ],
  moderator: [
    "dashboard:view",
    "users:view",
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "content:publish",
  ],
  admin: [
    "dashboard:view",
    "users:view",
    "users:create",
    "users:edit",
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "content:publish",
    "settings:view",
    "settings:edit",
    "analytics:view",
  ],
  super_admin: [
    "dashboard:view",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "content:publish",
    "settings:view",
    "settings:edit",
    "analytics:view",
    "billing:view",
    "billing:manage",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Check if role is admin level (admin or super_admin)
 */
export function isAdmin(role: Role): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Check if role can manage users
 */
export function canManageUsers(role: Role): boolean {
  return hasAnyPermission(role, ["users:create", "users:edit", "users:delete"]);
}

/**
 * Check if role can access admin dashboard
 */
export function canAccessDashboard(role: Role): boolean {
  return hasPermission(role, "dashboard:view");
}

/**
 * Role hierarchy (higher = more permissions)
 */
const roleHierarchy: Record<Role, number> = {
  user: 0,
  editor: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

/**
 * Check if roleA is higher than roleB in hierarchy
 */
export function isHigherRole(roleA: Role, roleB: Role): boolean {
  return roleHierarchy[roleA] > roleHierarchy[roleB];
}

/**
 * Check if roleA is at least as high as roleB
 */
export function isAtLeastRole(roleA: Role, minRole: Role): boolean {
  return roleHierarchy[roleA] >= roleHierarchy[minRole];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    user: "User",
    editor: "Editor",
    moderator: "Moderator",
    admin: "Administrator",
    super_admin: "Super Administrator",
  };
  return names[role];
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    user: "bg-gray-100 text-gray-800",
    editor: "bg-blue-100 text-blue-800",
    moderator: "bg-purple-100 text-purple-800",
    admin: "bg-orange-100 text-orange-800",
    super_admin: "bg-red-100 text-red-800",
  };
  return colors[role];
}

