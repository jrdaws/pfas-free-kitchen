/**
 * Supabase Management API Client
 * 
 * Used to interact with users' Supabase dashboard projects.
 * Requires a personal access token from Supabase dashboard.
 * 
 * API Reference: https://supabase.com/docs/reference/api/introduction
 */

const SUPABASE_MANAGEMENT_API = "https://api.supabase.com/v1";

export interface SupabaseProject {
  id: string;
  organization_id: string;
  name: string;
  region: string;
  created_at: string;
  database: {
    host: string;
    version: string;
  };
  status: string;
}

export interface SupabaseApiKey {
  name: string;
  api_key: string;
}

export interface SupabaseProjectWithKeys extends SupabaseProject {
  url: string;
  anon_key?: string;
  service_role_key?: string;
}

/**
 * Validate a Supabase access token by attempting to list projects
 */
export async function validateSupabaseToken(accessToken: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${SUPABASE_MANAGEMENT_API}/projects`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      return { valid: false, error: "Invalid or expired access token" };
    }

    if (!response.ok) {
      return { valid: false, error: `API error: ${response.status}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Failed to connect to Supabase API" };
  }
}

/**
 * List all Supabase projects for the authenticated user
 */
export async function listSupabaseProjects(
  accessToken: string
): Promise<{ projects: SupabaseProject[]; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_MANAGEMENT_API}/projects`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { projects: [], error: "Invalid or expired access token" };
      }
      return { projects: [], error: `API error: ${response.status}` };
    }

    const projects = await response.json();
    return { projects: projects as SupabaseProject[] };
  } catch (error) {
    return { projects: [], error: "Failed to fetch projects" };
  }
}

/**
 * Get API keys for a specific Supabase project
 */
export async function getProjectApiKeys(
  accessToken: string,
  projectRef: string
): Promise<{ keys: SupabaseApiKey[]; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_MANAGEMENT_API}/projects/${projectRef}/api-keys`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { keys: [], error: "Invalid or expired access token" };
      }
      if (response.status === 404) {
        return { keys: [], error: "Project not found" };
      }
      return { keys: [], error: `API error: ${response.status}` };
    }

    const keys = await response.json();
    return { keys: keys as SupabaseApiKey[] };
  } catch (error) {
    return { keys: [], error: "Failed to fetch API keys" };
  }
}

/**
 * Get a project with its API keys
 */
export async function getProjectWithKeys(
  accessToken: string,
  projectRef: string
): Promise<{ project: SupabaseProjectWithKeys | null; error?: string }> {
  // Fetch project details
  const { projects, error: projectsError } = await listSupabaseProjects(accessToken);
  if (projectsError) {
    return { project: null, error: projectsError };
  }

  const project = projects.find((p) => p.id === projectRef);
  if (!project) {
    return { project: null, error: "Project not found" };
  }

  // Fetch API keys
  const { keys, error: keysError } = await getProjectApiKeys(accessToken, projectRef);
  if (keysError) {
    return { project: null, error: keysError };
  }

  // Find anon and service_role keys
  const anonKey = keys.find((k) => k.name === "anon")?.api_key;
  const serviceRoleKey = keys.find((k) => k.name === "service_role")?.api_key;

  return {
    project: {
      ...project,
      url: `https://${projectRef}.supabase.co`,
      anon_key: anonKey,
      service_role_key: serviceRoleKey,
    },
  };
}

/**
 * Get project URL from project ref
 */
export function getProjectUrl(projectRef: string): string {
  return `https://${projectRef}.supabase.co`;
}

