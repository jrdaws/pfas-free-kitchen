import { createBrowserClient } from "@supabase/ssr";

// Browser client for client components
// Lazy initialization to allow builds without environment variables
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. " +
      "See: https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  return createBrowserClient(url, key);
}

// Singleton for client-side usage (lazy initialization)
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

