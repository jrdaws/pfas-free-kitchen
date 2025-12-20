import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Generate a human-readable token
export function generateToken(): string {
  const adjectives = ["fast", "bright", "smart", "cool", "bold", "swift", "keen", "wise", "true", "pure"];
  const nouns = ["lion", "eagle", "wolf", "bear", "hawk", "fox", "tiger", "shark", "raven", "dragon"];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, "0");

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}-${noun}-${numbers}`;
}
