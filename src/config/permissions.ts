/**
 * PFAS-Free Kitchen Admin Console - Role Permission Matrix
 * 
 * Defines which roles can perform which actions across the admin console.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md "1.2 User Roles", "1.3 Access Control"
 */

export type AdminRole = 'viewer' | 'editor' | 'reviewer' | 'super_admin';

export type Permission = 
  // Catalog operations
  | 'catalog:read'
  | 'catalog:create'
  | 'catalog:update'
  | 'catalog:delete'
  // Verification operations
  | 'verification:read'
  | 'verification:decide'
  // Evidence operations
  | 'evidence:read'
  | 'evidence:upload'
  | 'evidence:link'
  // Report operations
  | 'reports:read'
  | 'reports:resolve'
  // Admin operations
  | 'users:read'
  | 'users:manage'
  | 'settings:manage'
  | 'audit:read';

/**
 * Permission matrix mapping each permission to the roles that have it.
 * 
 * Role Hierarchy:
 * - viewer: Read-only access to all data (QA, stakeholders)
 * - editor: Create/edit products, brands, categories (Content team)
 * - reviewer: All editor + verification decisions (Verification team)
 * - super_admin: All permissions + user management (Platform admins)
 */
export const PERMISSIONS: Record<Permission, readonly AdminRole[]> = {
  // Catalog operations
  'catalog:read': ['viewer', 'editor', 'reviewer', 'super_admin'],
  'catalog:create': ['editor', 'reviewer', 'super_admin'],
  'catalog:update': ['editor', 'reviewer', 'super_admin'],
  'catalog:delete': ['super_admin'],
  
  // Verification operations
  'verification:read': ['viewer', 'editor', 'reviewer', 'super_admin'],
  'verification:decide': ['reviewer', 'super_admin'],
  
  // Evidence operations
  'evidence:read': ['viewer', 'editor', 'reviewer', 'super_admin'],
  'evidence:upload': ['editor', 'reviewer', 'super_admin'],
  'evidence:link': ['reviewer', 'super_admin'],
  
  // Report operations
  'reports:read': ['reviewer', 'super_admin'],
  'reports:resolve': ['reviewer', 'super_admin'],
  
  // Admin operations
  'users:read': ['super_admin'],
  'users:manage': ['super_admin'],
  'settings:manage': ['super_admin'],
  'audit:read': ['super_admin'],
} as const;

/**
 * Roles that require MFA enforcement.
 * Per spec: MFA required for reviewer and super_admin.
 */
export const MFA_REQUIRED_ROLES: readonly AdminRole[] = ['reviewer', 'super_admin'];

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(role);
}

/**
 * Check if a role is in a list of allowed roles.
 */
export function hasRole(userRole: AdminRole, allowedRoles: AdminRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get all permissions for a given role.
 */
export function getPermissionsForRole(role: AdminRole): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(
    permission => PERMISSIONS[permission].includes(role)
  );
}

/**
 * Check if MFA is required for a role.
 */
export function requiresMfa(role: AdminRole): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}
