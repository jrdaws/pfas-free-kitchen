/**
 * /api/projects/[id]/pages/[pageId]
 * 
 * GET    - Get a single page by ID
 * PATCH  - Update a page
 * DELETE - Delete a page
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
import type { ProjectPage, UpdatePageInput, PageWithSlots } from "@/lib/types/project";

interface RouteContext {
  params: Promise<{ id: string; pageId: string }>;
}

/**
 * GET /api/projects/[id]/pages/[pageId]
 * Get a single page with its component slots
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, pageId } = await context.params;

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

    // Fetch page
    const { data: page, error: pageError } = await supabase
      .from("project_pages")
      .select("*")
      .eq("id", pageId)
      .eq("project_id", projectId)
      .single();

    if (pageError) {
      if (pageError.code === "PGRST116") {
        return apiError("NOT_FOUND", "Page not found", 404);
      }
      console.error("[Page Get] Error:", pageError);
      return apiError("DATABASE_ERROR", pageError.message, 500);
    }

    // Fetch component slots for this page
    const { data: slots, error: slotsError } = await supabase
      .from("component_slots")
      .select("*")
      .eq("page_id", pageId)
      .order("position", { ascending: true });

    if (slotsError) {
      console.error("[Page Get] Slots error:", slotsError);
      // Continue without slots rather than failing
    }

    const pageWithSlots: PageWithSlots = {
      ...(page as ProjectPage),
      slots: slots || [],
    };

    return apiSuccess({ page: pageWithSlots });
  } catch (error) {
    console.error("[Page Get] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to get page", 500);
  }
}

/**
 * PATCH /api/projects/[id]/pages/[pageId]
 * Update a page
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, pageId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase } = auth;
    const body: UpdatePageInput = await request.json();

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.path !== undefined) {
      if (!body.path.startsWith("/")) {
        return apiError("VALIDATION_ERROR", "Path must start with /", 400);
      }
      updateData.path = body.path.trim();
      updateData.is_dynamic = /\[.*\]/.test(body.path);
    }
    if (body.page_type !== undefined) updateData.page_type = body.page_type;
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id;
    if (body.is_protected !== undefined) updateData.is_protected = body.is_protected;
    if (body.layout_id !== undefined) updateData.layout_id = body.layout_id;
    if (body.meta !== undefined) updateData.meta = body.meta;
    if (body.components !== undefined) updateData.components = body.components;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    if (Object.keys(updateData).length === 0) {
      return apiError("VALIDATION_ERROR", "No fields to update", 400);
    }

    // Update page
    const { data: page, error } = await supabase
      .from("project_pages")
      .update(updateData)
      .eq("id", pageId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return apiError("NOT_FOUND", "Page not found", 404);
      }
      if (error.code === "23505") {
        return apiError(
          "DUPLICATE_PATH",
          `A page with path "${body.path}" already exists`,
          409
        );
      }
      console.error("[Page Update] Error:", error);
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    return apiSuccess({ page: page as ProjectPage });
  } catch (error) {
    console.error("[Page Update] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update page", 500);
  }
}

/**
 * DELETE /api/projects/[id]/pages/[pageId]
 * Delete a page and its component slots (cascade)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, pageId } = await context.params;

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

    // Check if page has children
    const { data: children } = await supabase
      .from("project_pages")
      .select("id")
      .eq("parent_id", pageId)
      .limit(1);

    if (children && children.length > 0) {
      return apiError(
        "HAS_CHILDREN",
        "Cannot delete page with child pages. Delete children first.",
        400
      );
    }

    // Delete page (component_slots will cascade delete)
    const { error } = await supabase
      .from("project_pages")
      .delete()
      .eq("id", pageId)
      .eq("project_id", projectId);

    if (error) {
      console.error("[Page Delete] Error:", error);
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    return apiSuccess({ message: "Page deleted" });
  } catch (error) {
    console.error("[Page Delete] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete page", 500);
  }
}

