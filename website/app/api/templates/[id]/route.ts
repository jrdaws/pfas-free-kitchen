/**
 * GET /api/templates/[id] - Get single template
 * PATCH /api/templates/[id] - Update template
 * DELETE /api/templates/[id] - Delete template
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.substring(7);
    const supabase = getSupabaseClient(accessToken);

    const { data: template, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: unknown) {
    console.error("[Template API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.substring(7);
    const supabase = getSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ["name", "description", "integrations", "features", "config", "is_public", "is_favorite"];
    
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Convert camelCase to snake_case for DB
        const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
        updates[dbField] = body[field];
      }
    }

    const { data: template, error } = await supabase
      .from("templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Template API] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: unknown) {
    console.error("[Template API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.substring(7);
    const supabase = getSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get template name for logging
    const { data: template } = await supabase
      .from("templates")
      .select("name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Template API] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    if (template) {
      await supabase.rpc("log_activity", {
        p_type: "delete",
        p_action: "Template Deleted",
        p_details: `Deleted template: ${template.name}`,
        p_metadata: { templateId: id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Template API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

