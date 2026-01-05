/**
 * /api/projects/[id]/pages
 * 
 * GET   - List all pages in a project
 * POST  - Create a new page
 * PATCH - Reorder pages (bulk update sort_order)
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
import type {
  ProjectPage,
  CreatePageInput,
  ReorderPagesInput,
} from "@/lib/types/project";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/pages
 * List all pages in a project, ordered by sort_order
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase } = auth;

    // Verify project ownership (RLS will also enforce this)
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Fetch pages ordered by sort_order
    const { data: pages, error } = await supabase
      .from("project_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[Pages List] Error:", error);
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    return apiSuccess({ pages: pages as ProjectPage[] });
  } catch (error) {
    console.error("[Pages List] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list pages", 500);
  }
}

/**
 * POST /api/projects/[id]/pages
 * Create a new page in the project
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase } = auth;
    const body: CreatePageInput = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return apiError("VALIDATION_ERROR", "Page name is required", 400);
    }
    if (!body.path?.trim()) {
      return apiError("VALIDATION_ERROR", "Page path is required", 400);
    }

    // Validate path format
    if (!body.path.startsWith("/")) {
      return apiError("VALIDATION_ERROR", "Path must start with /", 400);
    }

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Get max sort_order for this project
    const { data: maxOrder } = await supabase
      .from("project_pages")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = body.sort_order ?? ((maxOrder?.sort_order ?? -1) + 1);

    // Detect if path is dynamic (contains [brackets])
    const isDynamic = /\[.*\]/.test(body.path);

    // Create page
    const { data: page, error } = await supabase
      .from("project_pages")
      .insert({
        project_id: projectId,
        name: body.name.trim(),
        path: body.path.trim(),
        page_type: body.page_type || "page",
        parent_id: body.parent_id || null,
        is_protected: body.is_protected || false,
        is_dynamic: isDynamic,
        layout_id: body.layout_id || null,
        meta: body.meta || {},
        components: body.components || [],
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return apiError(
          "DUPLICATE_PATH",
          `A page with path "${body.path}" already exists`,
          409
        );
      }
      console.error("[Pages Create] Error:", error);
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    return apiSuccess({ page: page as ProjectPage }, 201);
  } catch (error) {
    console.error("[Pages Create] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create page", 500);
  }
}

/**
 * PATCH /api/projects/[id]/pages
 * Bulk reorder pages
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase } = auth;
    const body: ReorderPagesInput = await request.json();

    if (!body.pages || !Array.isArray(body.pages) || body.pages.length === 0) {
      return apiError("VALIDATION_ERROR", "pages array is required", 400);
    }

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Update each page's sort_order
    const updates = body.pages.map(({ id, sort_order }) =>
      supabase
        .from("project_pages")
        .update({ sort_order })
        .eq("id", id)
        .eq("project_id", projectId) // Extra safety check
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("[Pages Reorder] Errors:", errors.map((e) => e.error));
      return apiError("DATABASE_ERROR", "Failed to reorder some pages", 500);
    }

    // Fetch updated pages
    const { data: pages } = await supabase
      .from("project_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    return apiSuccess({ pages: pages as ProjectPage[] });
  } catch (error) {
    console.error("[Pages Reorder] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to reorder pages", 500);
  }
}

