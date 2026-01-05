/**
 * GET /api/webhooks/[id] - Get single webhook with deliveries
 * PATCH /api/webhooks/[id] - Update webhook
 * DELETE /api/webhooks/[id] - Delete webhook
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

    // Get webhook
    const { data: webhook, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Get recent deliveries
    const { data: deliveries } = await supabase
      .from("webhook_deliveries")
      .select("*")
      .eq("webhook_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ success: true, webhook, deliveries: deliveries || [] });
  } catch (error: unknown) {
    console.error("[Webhook API] Error:", error);
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
    const allowedFields = ["name", "url", "events", "is_active"];
    
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
        updates[dbField] = body[field];
      }
    }

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Webhook API] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, webhook });
  } catch (error: unknown) {
    console.error("[Webhook API] Error:", error);
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

    // Get webhook name for logging
    const { data: webhook } = await supabase
      .from("webhooks")
      .select("name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Webhook API] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    if (webhook) {
      await supabase.rpc("log_activity", {
        p_type: "delete",
        p_action: "Webhook Deleted",
        p_details: `Deleted webhook: ${webhook.name}`,
        p_metadata: { webhookId: id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Webhook API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

