/**
 * GET /api/supabase/projects/[ref]
 * 
 * Get details and API keys for a specific Supabase project.
 * Returns: Project ID, URL, Anon Key, Service Role Key
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProjectWithKeys } from "@/lib/supabase-management";

interface RouteContext {
  params: Promise<{ ref: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ref } = await context.params;

    // Validate project ref format (should be like: abcdefghijklmnop)
    if (!ref || !/^[a-z]{16,}$/.test(ref)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Invalid project reference" },
        { status: 400 }
      );
    }

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
      .select("access_token")
      .eq("service_type", "supabase")
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        {
          error: "NOT_CONNECTED",
          message: "No Supabase account connected",
          recovery: "Connect your Supabase account first using 'Connect Supabase'",
        },
        { status: 400 }
      );
    }

    // Fetch project with API keys
    const { project, error: projectError } = await getProjectWithKeys(
      connection.access_token,
      ref
    );

    if (projectError || !project) {
      if (projectError?.includes("not found")) {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "API_ERROR", message: projectError || "Failed to fetch project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        region: project.region,
        status: project.status,
        url: project.url,
        anon_key: project.anon_key,
        service_role_key: project.service_role_key,
      },
    });
  } catch (error: unknown) {
    console.error("[Supabase Project Details] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supabase/projects/[ref]
 * 
 * Select this project for the current user project configuration.
 * Stores the project reference and optionally copies credentials.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { ref } = await context.params;

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

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid user token" },
        { status: 401 }
      );
    }

    // Parse request body for project_id (user_projects.id)
    const body = await request.json();
    const { user_project_id } = body;

    if (!user_project_id) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "user_project_id is required" },
        { status: 400 }
      );
    }

    // Get stored Supabase connection
    const { data: connection } = await supabase
      .from("connected_services")
      .select("access_token")
      .eq("service_type", "supabase")
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: "NOT_CONNECTED", message: "No Supabase account connected" },
        { status: 400 }
      );
    }

    // Fetch project with API keys to verify access
    const { project, error: projectError } = await getProjectWithKeys(
      connection.access_token,
      ref
    );

    if (projectError || !project) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Project not found or not accessible" },
        { status: 404 }
      );
    }

    // Update the user's project with Supabase connection
    const { error: updateError } = await supabase
      .from("user_projects")
      .update({
        supabase_project_id: ref,
        connected_accounts: {
          supabase_project: ref,
          supabase_url: project.url,
        },
        tool_status: {
          supabase: true,
        },
      })
      .eq("id", user_project_id);

    if (updateError) {
      console.error("[Supabase Select Project] Update error:", updateError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: "Failed to update project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase project connected",
      project: {
        id: project.id,
        name: project.name,
        url: project.url,
        anon_key: project.anon_key,
        service_role_key: project.service_role_key,
      },
    });
  } catch (error: unknown) {
    console.error("[Supabase Select Project] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to select project" },
      { status: 500 }
    );
  }
}

