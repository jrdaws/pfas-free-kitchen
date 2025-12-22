import { createClient } from "./supabase";

/**
 * Database helper functions
 * Add your database queries here
 */

export async function getUser(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Add more database functions as needed
