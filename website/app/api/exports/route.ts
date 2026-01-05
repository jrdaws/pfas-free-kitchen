/**
 * GET /api/exports - List user's export history
 * POST /api/exports - Create new export record
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

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("exports")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ["processing", "completed", "failed"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data: exports, error, count } = await query;

    if (error) {
      console.error("[Exports API] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      exports,
      pagination: { total: count || 0, limit, offset, hasMore: (count || 0) > offset + limit },
    });
  } catch (error: unknown) {
    console.error("[Exports API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { projectId, projectName, template, format, integrations, features } = body;

    if (!projectName) {
      return NextResponse.json({ error: "Project name required" }, { status: 400 });
    }

    const { data: exportRecord, error } = await supabase
      .from("exports")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        project_name: projectName,
        template: template || null,
        format: format || "zip",
        integrations: integrations || [],
        features: features || [],
        status: "processing",
      })
      .select()
      .single();

    if (error) {
      console.error("[Exports API] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_type: "export",
      p_action: "Export Started",
      p_details: `Started export: ${projectName}`,
      p_metadata: { exportId: exportRecord.id, format },
    });

    // Update usage
    await supabase.rpc("update_usage", { p_exports: 1 });

    return NextResponse.json({ success: true, export: exportRecord });
  } catch (error: unknown) {
    console.error("[Exports API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

