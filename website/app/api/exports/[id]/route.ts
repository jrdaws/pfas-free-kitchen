/**
 * GET /api/exports/[id] - Get single export
 * PATCH /api/exports/[id] - Update export status
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: exportRecord, error } = await supabase
      .from("exports")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !exportRecord) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, export: exportRecord });
  } catch (error: unknown) {
    console.error("[Export API] Error:", error);
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
    const { status, fileSize, downloadUrl, errorMessage } = body;

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (fileSize !== undefined) updates.file_size = fileSize;
    if (downloadUrl) updates.download_url = downloadUrl;
    if (errorMessage) updates.error_message = errorMessage;
    if (status === "completed" || status === "failed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data: exportRecord, error } = await supabase
      .from("exports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Export API] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_type: "export",
      p_action: status === "completed" ? "Export Completed" : "Export Failed",
      p_details: `Export ${status}: ${exportRecord.project_name}`,
      p_metadata: { exportId: id, status },
    });

    return NextResponse.json({ success: true, export: exportRecord });
  } catch (error: unknown) {
    console.error("[Export API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

