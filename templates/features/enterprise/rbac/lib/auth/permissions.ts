/**
 * Permissions Configuration
 * 
 * Define and organize available permissions.
 */

export interface PermissionDefinition {
  id: string;
  label: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionCategory =
  | "users"
  | "content"
  | "analytics"
  | "billing"
  | "settings"
  | "admin";

export const PERMISSION_CATEGORIES: { id: PermissionCategory; label: string }[] = [
  { id: "users", label: "User Management" },
  { id: "content", label: "Content" },
  { id: "analytics", label: "Analytics" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Settings" },
  { id: "admin", label: "Administration" },
];

export const PERMISSIONS: PermissionDefinition[] = [
  // Users
  { id: "read:users", label: "View Users", description: "View user profiles and lists", category: "users" },
  { id: "write:users", label: "Edit Users", description: "Create and edit user profiles", category: "users" },
  { id: "delete:users", label: "Delete Users", description: "Delete user accounts", category: "users" },

  // Content
  { id: "read:content", label: "View Content", description: "View all content", category: "content" },
  { id: "write:content", label: "Edit Content", description: "Create and edit content", category: "content" },
  { id: "delete:content", label: "Delete Content", description: "Delete content", category: "content" },

  // Analytics
  { id: "view:analytics", label: "View Analytics", description: "Access analytics dashboards", category: "analytics" },

  // Billing
  { id: "manage:billing", label: "Manage Billing", description: "Access and manage billing", category: "billing" },

  // Settings
  { id: "manage:settings", label: "Manage Settings", description: "Configure system settings", category: "settings" },
  { id: "manage:roles", label: "Manage Roles", description: "Create and edit roles", category: "settings" },

  // Admin
  { id: "admin:all", label: "Full Access", description: "Complete system access", category: "admin" },
];

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(): Record<PermissionCategory, PermissionDefinition[]> {
  const result: Record<PermissionCategory, PermissionDefinition[]> = {
    users: [],
    content: [],
    analytics: [],
    billing: [],
    settings: [],
    admin: [],
  };

  for (const permission of PERMISSIONS) {
    result[permission.category].push(permission);
  }

  return result;
}

/**
 * Get permission label
 */
export function getPermissionLabel(permissionId: string): string {
  const permission = PERMISSIONS.find((p) => p.id === permissionId);
  return permission?.label || permissionId;
}

/**
 * Check if permission exists
 */
export function isValidPermission(permissionId: string): boolean {
  return PERMISSIONS.some((p) => p.id === permissionId);
}

