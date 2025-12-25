/**
 * GET /api/projects/list
 * List all projects for the authenticated user
 * 
 * Query params:
 *   - status: filter by project status ('draft', 'active', 'archived')
 *   - limit: max number of results (default: 50)
 *   - offset: pagination offset (default: 0)
 * 
 * Requires authentication via Supabase Auth
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UserProject, ProjectStatus } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }
    const accessToken = authHeader.substring(7);

    // Initialize Supabase client with user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "CONFIG_ERROR", message: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ProjectStatus | null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query - RLS will automatically filter to user's projects
    let query = supabase
      .from("user_projects")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ["draft", "active", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data: projects, error: selectError, count } = await query;

    if (selectError) {
      console.error("[Projects List] Select error:", selectError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: selectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: projects as UserProject[],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error: unknown) {
    console.error("[Projects List] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to list projects" },
      { status: 500 }
    );
  }
}

