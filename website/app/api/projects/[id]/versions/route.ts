/**
 * /api/projects/[id]/versions
 * 
 * GET  - List all versions of a project
 * POST - Create a new version snapshot
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedClient,
  isAuthError,
  unauthorizedResponse,
  apiError,
  apiSuccess,
  verifyProjectOwnership,
} from "@/lib/api/auth";
import type { ProjectVersion, CreateVersionInput, ProjectSnapshot } from "@/lib/types/project";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/versions
 * List all versions of a project, newest first
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase } = auth;

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Fetch versions (without full snapshot for list view)
    const { data: versions, error } = await supabase
      .from("project_versions")
      .select("id, project_id, version_number, name, created_by, created_at")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("[Versions List] Error:", error);
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    return apiSuccess({ 
      versions: versions as Omit<ProjectVersion, 'snapshot'>[],
      count: versions.length,
    });
  } catch (error) {
    console.error("[Versions List] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list versions", 500);
  }
}

/**
 * POST /api/projects/[id]/versions
 * Create a new version snapshot of the current project state
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase, user } = auth;
    
    let body: CreateVersionInput = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Fetch current project state
    const { data: project, error: projectError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("[Versions Create] Project error:", projectError);
      return apiError("DATABASE_ERROR", "Failed to fetch project", 500);
    }

    // Fetch all pages
    const { data: pages, error: pagesError } = await supabase
      .from("project_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (pagesError) {
      console.error("[Versions Create] Pages error:", pagesError);
      return apiError("DATABASE_ERROR", "Failed to fetch pages", 500);
    }

    // Fetch all component slots for all pages
    const pageIds = (pages || []).map((p) => p.id);
    let slots: unknown[] = [];
    
    if (pageIds.length > 0) {
      const { data: slotsData, error: slotsError } = await supabase
        .from("component_slots")
        .select("*")
        .in("page_id", pageIds)
        .order("position", { ascending: true });

      if (slotsError) {
        console.error("[Versions Create] Slots error:", slotsError);
        // Continue without slots
      } else {
        slots = slotsData || [];
      }
    }

    // Build snapshot
    const snapshot: ProjectSnapshot = {
      project,
      pages: pages || [],
      slots: slots as ProjectSnapshot["slots"],
    };

    // Get next version number
    const { data: maxVersion } = await supabase
      .from("project_versions")
      .select("version_number")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (maxVersion?.version_number ?? 0) + 1;

    // Create version
    const { data: version, error: versionError } = await supabase
      .from("project_versions")
      .insert({
        project_id: projectId,
        version_number: nextVersionNumber,
        name: body.name || `Version ${nextVersionNumber}`,
        snapshot,
        created_by: user.id,
      })
      .select()
      .single();

    if (versionError) {
      console.error("[Versions Create] Error:", versionError);
      return apiError("DATABASE_ERROR", versionError.message, 500);
    }

    return apiSuccess(
      { 
        version: version as ProjectVersion,
        message: `Version ${nextVersionNumber} created`,
      },
      201
    );
  } catch (error) {
    console.error("[Versions Create] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create version", 500);
  }
}

