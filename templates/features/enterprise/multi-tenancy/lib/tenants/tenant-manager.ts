/**
 * Multi-Tenancy Manager
 * 
 * Support multiple organizations/workspaces.
 */

import { createClient } from "@/lib/supabase";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  settings: TenantSettings;
  createdAt: Date;
}

export interface TenantSettings {
  logo?: string;
  primaryColor?: string;
  domain?: string;
  features?: string[];
}

export interface TenantMembership {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "member" | "viewer";
  tenant?: Tenant;
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapTenant(data);
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapTenant(data);
}

/**
 * Get user's tenants
 */
export async function getUserTenants(userId: string): Promise<TenantMembership[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tenant_memberships")
    .select(`
      user_id,
      tenant_id,
      role,
      tenants (*)
    `)
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    userId: row.user_id,
    tenantId: row.tenant_id,
    role: row.role,
    tenant: row.tenants ? mapTenant(row.tenants as Record<string, unknown>) : undefined,
  }));
}

/**
 * Create new tenant
 */
export async function createTenant(
  name: string,
  ownerId: string,
  settings: Partial<TenantSettings> = {}
): Promise<Tenant | null> {
  const supabase = createClient();
  const slug = generateSlug(name);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name,
      slug,
      owner_id: ownerId,
      settings,
    })
    .select()
    .single();

  if (tenantError || !tenant) {
    console.error("Failed to create tenant:", tenantError);
    return null;
  }

  // Add owner as member
  await supabase.from("tenant_memberships").insert({
    user_id: ownerId,
    tenant_id: tenant.id,
    role: "owner",
  });

  return mapTenant(tenant);
}

/**
 * Add member to tenant
 */
export async function addTenantMember(
  tenantId: string,
  userId: string,
  role: TenantMembership["role"] = "member"
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("tenant_memberships").insert({
    tenant_id: tenantId,
    user_id: userId,
    role,
  });

  return !error;
}

/**
 * Remove member from tenant
 */
export async function removeTenantMember(
  tenantId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tenant_memberships")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  return !error;
}

/**
 * Update tenant member role
 */
export async function updateMemberRole(
  tenantId: string,
  userId: string,
  role: TenantMembership["role"]
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tenant_memberships")
    .update({ role })
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  return !error;
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(
  tenantId: string,
  settings: Partial<TenantSettings>
): Promise<boolean> {
  const supabase = createClient();

  // Get current settings
  const { data: current } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single();

  const mergedSettings = { ...(current?.settings || {}), ...settings };

  const { error } = await supabase
    .from("tenants")
    .update({ settings: mergedSettings })
    .eq("id", tenantId);

  return !error;
}

/**
 * Check if user has access to tenant
 */
export async function hasTenanAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const supabase = createClient();

  const { count } = await supabase
    .from("tenant_memberships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("tenant_id", tenantId);

  return (count || 0) > 0;
}

/**
 * Generate URL-safe slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Map database row to Tenant type
 */
function mapTenant(row: Record<string, unknown>): Tenant {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    ownerId: row.owner_id as string,
    settings: (row.settings as TenantSettings) || {},
    createdAt: new Date(row.created_at as string),
  };
}

