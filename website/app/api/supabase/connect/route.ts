/**
 * POST /api/supabase/connect
 * 
 * Connect a Supabase account using a personal access token (PAT).
 * The PAT is created at https://supabase.com/dashboard/account/tokens
 * 
 * Request:
 *   { access_token: string }
 * 
 * Response:
 *   { success: true, projects: SupabaseProject[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  validateSupabaseToken,
  listSupabaseProjects,
  type SupabaseProject,
} from "@/lib/supabase-management";

export async function POST(request: NextRequest) {
  try {
    // Get user auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Missing authorization header" },
        { status: 401 }
      );
    }
    const userToken = authHeader.substring(7);

    // Initialize Supabase client for user auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "CONFIG_ERROR", message: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid user token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { access_token: supabaseAccessToken } = body;

    if (!supabaseAccessToken || typeof supabaseAccessToken !== "string") {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "access_token is required",
          recovery: "Get a personal access token from https://supabase.com/dashboard/account/tokens",
        },
        { status: 400 }
      );
    }

    // Validate the Supabase access token
    const { valid, error: validationError } = await validateSupabaseToken(supabaseAccessToken);
    if (!valid) {
      return NextResponse.json(
        {
          error: "INVALID_TOKEN",
          message: validationError || "Invalid Supabase access token",
          recovery: "Check your token at https://supabase.com/dashboard/account/tokens",
        },
        { status: 401 }
      );
    }

    // List user's Supabase projects
    const { projects, error: projectsError } = await listSupabaseProjects(supabaseAccessToken);
    if (projectsError) {
      return NextResponse.json(
        { error: "API_ERROR", message: projectsError },
        { status: 500 }
      );
    }

    // Store the connection in connected_services
    const { error: upsertError } = await supabase
      .from("connected_services")
      .upsert({
        user_id: user.id,
        service_type: "supabase",
        access_token: supabaseAccessToken,
        account_data: {
          project_count: projects.length,
          connected_at: new Date().toISOString(),
        },
      }, {
        onConflict: "user_id,service_type",
      });

    if (upsertError) {
      console.error("[Supabase Connect] Upsert error:", upsertError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: "Failed to save connection" },
        { status: 500 }
      );
    }

    // Return projects (without sensitive data)
    const safeProjects: Partial<SupabaseProject>[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      status: p.status,
      created_at: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      connected: true,
      projects: safeProjects,
    });
  } catch (error: unknown) {
    console.error("[Supabase Connect] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to connect Supabase" },
      { status: 500 }
    );
  }
}

