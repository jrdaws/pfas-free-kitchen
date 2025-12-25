/**
 * /api/connected-services/[type]
 * 
 * GET    - Get a specific connected service by type
 * DELETE - Disconnect a service
 * 
 * Requires authentication via Supabase Auth
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ConnectedService } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ type: string }>;
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
 * GET /api/connected-services/[type]
 * Get a specific connected service
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { type } = await context.params;

    if (!["github", "supabase", "vercel"].includes(type)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Invalid service type" },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;

    const { data: service, error } = await supabase
      .from("connected_services")
      .select("*")
      .eq("service_type", type)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          success: true,
          connected: false,
          service: null,
        });
      }
      console.error("[Connected Services] Get error:", error);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: error.message },
        { status: 500 }
      );
    }

    const s = service as ConnectedService;
    return NextResponse.json({
      success: true,
      connected: true,
      service: {
        id: s.id,
        service_type: s.service_type,
        account_data: s.account_data,
        expires_at: s.expires_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
      },
    });
  } catch (error: unknown) {
    console.error("[Connected Services] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to get connected service" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connected-services/[type]
 * Disconnect a service
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { type } = await context.params;

    if (!["github", "supabase", "vercel"].includes(type)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Invalid service type" },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;

    const { error } = await supabase
      .from("connected_services")
      .delete()
      .eq("service_type", type);

    if (error) {
      console.error("[Connected Services] Delete error:", error);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Disconnected ${type}`,
    });
  } catch (error: unknown) {
    console.error("[Connected Services] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to disconnect service" },
      { status: 500 }
    );
  }
}

