/**
 * Shared authentication utilities for API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

export interface AuthResult {
  supabase: SupabaseClient;
  user: User;
}

export interface AuthError {
  error: string;
  status: number;
}

/**
 * Get authenticated Supabase client from request
 * Returns either the client + user or an error
 */
export async function getAuthenticatedClient(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header", status: 401 };
  }
  const accessToken = authHeader.substring(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Supabase not configured", status: 500 };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Invalid or expired token", status: 401 };
  }

  return { supabase, user };
}

/**
 * Check if auth result is an error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return "error" in result;
}

/**
 * Return unauthorized response
 */
export function unauthorizedResponse(auth: AuthError): NextResponse {
  return NextResponse.json(
    { error: "UNAUTHORIZED", message: auth.error },
    { status: auth.status }
  );
}

/**
 * Standard API error response
 */
export function apiError(
  code: string,
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: code, message }, { status });
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}

/**
 * Verify user owns the project
 */
export async function verifyProjectOwnership(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_projects")
    .select("id")
    .eq("id", projectId)
    .single();
  
  return !error && !!data;
}

