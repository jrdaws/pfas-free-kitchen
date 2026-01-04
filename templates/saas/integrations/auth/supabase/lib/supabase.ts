/**
 * Supabase Client Re-export Shim
 * 
 * This file exists for backward compatibility with code that imports from '@/lib/supabase'.
 * New code should import directly from '@/lib/supabase/client' or '@/lib/supabase/server'.
 */

// Re-export everything from the supabase directory
export * from './supabase/index';

// Default to client-side createClient for backward compatibility
export { createClient as default } from './supabase/client';

