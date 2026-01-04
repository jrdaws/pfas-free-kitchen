// Re-export for convenience
// Note: Only import from client.ts in client components
// and from server.ts in server components/API routes

export { createClient, getSupabaseClient } from './client';
export { createServerSupabaseClient, getUser, getSession } from './server';

