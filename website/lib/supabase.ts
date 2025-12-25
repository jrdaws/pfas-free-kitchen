import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy-initialized Supabase client singleton.
 * 
 * Uses lazy initialization pattern to:
 * 1. Allow build without env vars (Vercel preview builds)
 * 2. Fail fast at runtime with clear error message
 * 3. Create only one client instance per process
 * 
 * @example
 * import { getSupabase } from "@/lib/supabase";
 * const supabase = getSupabase();
 * const { data } = await supabase.from("projects").select();
 */

let _supabase: SupabaseClient | null = null;
let _initError: Error | null = null;

export function getSupabase(): SupabaseClient {
  // Return cached client if already initialized
  if (_supabase) return _supabase;
  
  // Re-throw cached initialization error
  if (_initError) throw _initError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    _initError = new Error(
      "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "See docs/deploy/VERCEL_DEPLOYMENT.md for setup instructions."
    );
    throw _initError;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

/**
 * Check if Supabase is configured (without throwing)
 * Useful for conditional logic and health checks
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Type definitions for projects table
export interface Project {
  id: string;
  token: string;
  template: string;
  project_name: string;
  output_dir: string;
  integrations: Record<string, string>;
  env_keys?: Record<string, string>;
  vision?: string;
  mission?: string;
  success_criteria?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  description?: string;
  created_at: string;
  expires_at: string;
  last_accessed_at: string;
}

export interface CreateProjectInput {
  template: string;
  project_name: string;
  output_dir: string;
  integrations: Record<string, string>;
  env_keys?: Record<string, string>;
  vision?: string;
  mission?: string;
  success_criteria?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  description?: string;
}

// Types for user-owned projects (5DS clone)
export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface ToolStatus {
  cursor: boolean;
  github: boolean;
  claude: boolean;
  supabase: boolean;
  vercel: boolean;
}

export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  template?: string;
  features: string[];
  integrations: Record<string, string>;
  tool_status: ToolStatus;
  supabase_project_id?: string;
  npx_token: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProjectInput {
  name: string;
  description?: string;
  template?: string;
  features?: string[];
  integrations?: Record<string, string>;
}

export interface UpdateUserProjectInput {
  name?: string;
  description?: string;
  template?: string;
  features?: string[];
  integrations?: Record<string, string>;
  tool_status?: Partial<ToolStatus>;
  supabase_project_id?: string;
  status?: ProjectStatus;
}

// Generate a human-readable token
export function generateToken(): string {
  const adjectives = ["fast", "bright", "smart", "cool", "bold", "swift", "keen", "wise", "true", "pure"];
  const nouns = ["lion", "eagle", "wolf", "bear", "hawk", "fox", "tiger", "shark", "raven", "dragon"];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, "0");

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}-${noun}-${numbers}`;
}
