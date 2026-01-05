/**
 * GET /api/templates - List user's templates
 * POST /api/templates - Create new template
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
    const filter = searchParams.get("filter"); // 'favorites', 'public', 'all'
    const search = searchParams.get("search");

    let query = supabase
      .from("templates")
      .select("*")
      .order("updated_at", { ascending: false });

    // Filter by type
    if (filter === "favorites") {
      query = query.eq("is_favorite", true);
    } else if (filter === "public") {
      query = query.eq("is_public", true);
    }

    // Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error("[Templates API] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, templates });
  } catch (error: unknown) {
    console.error("[Templates API] Error:", error);
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
    const { name, description, baseTemplate, integrations, features, config, isPublic } = body;

    if (!name || !baseTemplate) {
      return NextResponse.json({ error: "Name and base template required" }, { status: 400 });
    }

    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        base_template: baseTemplate,
        integrations: integrations || [],
        features: features || [],
        config: config || {},
        is_public: isPublic || false,
      })
      .select()
      .single();

    if (error) {
      console.error("[Templates API] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_type: "create",
      p_action: "Template Created",
      p_details: `Created template: ${name}`,
      p_metadata: { templateId: template.id },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: unknown) {
    console.error("[Templates API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

