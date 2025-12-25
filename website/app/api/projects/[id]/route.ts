/**
 * /api/projects/[id]
 * 
 * GET    - Get a single project by ID
 * PATCH  - Update a project
 * DELETE - Delete a project
 * 
 * Requires authentication via Supabase Auth
 * RLS ensures users can only access their own projects
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UpdateUserProjectInput, UserProject } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Helper to create authenticated Supabase client
async function getAuthenticatedClient(request: NextRequest) {
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
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;

    // Fetch project - RLS ensures user can only access their own
    const { data: project, error: selectError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (selectError) {
      if (selectError.code === "PGRST116") {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Project not found" },
          { status: 404 }
        );
      }
      console.error("[Projects Get] Select error:", selectError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: selectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: project as UserProject,
    });
  } catch (error: unknown) {
    console.error("[Projects Get] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to get project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;
    const body: UpdateUserProjectInput = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.template !== undefined) updateData.template = body.template;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.integrations !== undefined) updateData.integrations = body.integrations;
    if (body.tool_status !== undefined) {
      // Merge with existing tool_status
      const { data: current } = await supabase
        .from("user_projects")
        .select("tool_status")
        .eq("id", id)
        .single();
      
      updateData.tool_status = { ...(current?.tool_status || {}), ...body.tool_status };
    }
    if (body.supabase_project_id !== undefined) updateData.supabase_project_id = body.supabase_project_id;
    if (body.status !== undefined) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "No fields to update" },
        { status: 400 }
      );
    }

    // Update project - RLS ensures user can only update their own
    const { data: project, error: updateError } = await supabase
      .from("user_projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Project not found" },
          { status: 404 }
        );
      }
      console.error("[Projects Update] Update error:", updateError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: project as UserProject,
    });
  } catch (error: unknown) {
    console.error("[Projects Update] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;

    // Delete project - RLS ensures user can only delete their own
    const { error: deleteError } = await supabase
      .from("user_projects")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[Projects Delete] Delete error:", deleteError);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted",
    });
  } catch (error: unknown) {
    console.error("[Projects Delete] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to delete project" },
      { status: 500 }
    );
  }
}

