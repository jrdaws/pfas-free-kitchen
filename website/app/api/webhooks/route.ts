/**
 * GET /api/webhooks - List user's webhooks
 * POST /api/webhooks - Create new webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("base64url")}`;
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

    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Webhooks API] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, webhooks });
  } catch (error: unknown) {
    console.error("[Webhooks API] Error:", error);
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
    const { name, url, events } = body;

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json({ error: "Name, URL, and events required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const secret = generateWebhookSecret();

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .insert({
        user_id: user.id,
        name,
        url,
        events,
        secret,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("[Webhooks API] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_type: "create",
      p_action: "Webhook Created",
      p_details: `Created webhook: ${name}`,
      p_metadata: { webhookId: webhook.id, events },
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error: unknown) {
    console.error("[Webhooks API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

