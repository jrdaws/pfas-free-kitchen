/**
 * Auth utilities for Admin Console
 * STUB: Implement with actual auth provider (Supabase, NextAuth, etc.)
 */

import { redirect } from 'next/navigation';
import type { Session, AdminUser, AdminRole } from './types';

// Mock session for development
const MOCK_USER: AdminUser = {
  id: 'user_1',
  email: 'reviewer@pfas-free-kitchen.com',
  name: 'Jane Reviewer',
  role: 'senior_reviewer',
};

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  // STUB: Replace with actual auth check
  // In production, this would verify JWT/session cookie
  
  // Simulate authenticated session for development
  return {
    user: MOCK_USER,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Get current user (throws if not authenticated)
 */
export async function requireAuth(): Promise<AdminUser> {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session.user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Check if user has permission
 */
export function hasPermission(user: AdminUser, permission: Permission): boolean {
  const rolePermissions: Record<AdminRole, Permission[]> = {
    reviewer: ['view_queue', 'review_products', 'upload_evidence'],
    senior_reviewer: [
      'view_queue',
      'review_products',
      'upload_evidence',
      'approve_tier_3',
      'handle_reports',
    ],
    admin: [
      'view_queue',
      'review_products',
      'upload_evidence',
      'approve_tier_3',
      'approve_tier_4',
      'handle_reports',
      'manage_users',
      'view_audit',
    ],
    super_admin: [
      'view_queue',
      'review_products',
      'upload_evidence',
      'approve_tier_3',
      'approve_tier_4',
      'handle_reports',
      'manage_users',
      'view_audit',
      'manage_settings',
    ],
  };

  return rolePermissions[user.role]?.includes(permission) ?? false;
}

export type Permission =
  | 'view_queue'
  | 'review_products'
  | 'upload_evidence'
  | 'approve_tier_3'
  | 'approve_tier_4'
  | 'handle_reports'
  | 'manage_users'
  | 'view_audit'
  | 'manage_settings';
