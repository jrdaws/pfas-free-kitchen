/**
 * GET /api/supabase/projects
 * 
 * List all Supabase projects for the connected account.
 * Requires a connected Supabase account via /api/supabase/connect
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { listSupabaseProjects, type SupabaseProject } from "@/lib/supabase-management";

export async function GET(request: NextRequest) {
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

    // Initialize Supabase client
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

    // Get stored Supabase connection
    const { data: connection, error: fetchError } = await supabase
      .from("connected_services")
      .select("access_token, account_data")
      .eq("service_type", "supabase")
      .single();

    if (fetchError || !connection) {
      return NextResponse.json({
        success: true,
        connected: false,
        projects: [],
        message: "No Supabase account connected",
      });
    }

    // Fetch projects using stored token
    const { projects, error: projectsError } = await listSupabaseProjects(
      connection.access_token
    );

    if (projectsError) {
      // Token may have expired
      if (projectsError.includes("Invalid") || projectsError.includes("expired")) {
        return NextResponse.json({
          success: false,
          connected: false,
          error: "TOKEN_EXPIRED",
          message: "Supabase connection expired. Please reconnect.",
          recovery: "Click 'Connect Supabase' to reconnect with a new token.",
        });
      }
      return NextResponse.json(
        { error: "API_ERROR", message: projectsError },
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
      account_data: connection.account_data,
    });
  } catch (error: unknown) {
    console.error("[Supabase Projects] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to list projects" },
      { status: 500 }
    );
  }
}

