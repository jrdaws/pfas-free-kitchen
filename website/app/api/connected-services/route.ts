/**
 * /api/connected-services
 * 
 * GET  - List connected services for the authenticated user
 * POST - Add/update a connected service
 * 
 * Requires authentication via Supabase Auth
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ServiceType, ConnectedService } from "@/lib/supabase";

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
 * GET /api/connected-services
 * List all connected services for the user
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase } = auth;

    const { data: services, error } = await supabase
      .from("connected_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Connected Services] List error:", error);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: error.message },
        { status: 500 }
      );
    }

    // Remove sensitive tokens from response
    const safeServices = (services || []).map((s: ConnectedService) => ({
      id: s.id,
      service_type: s.service_type,
      account_data: s.account_data,
      expires_at: s.expires_at,
      created_at: s.created_at,
      updated_at: s.updated_at,
      // Don't expose access_token or refresh_token
    }));

    return NextResponse.json({
      success: true,
      services: safeServices,
    });
  } catch (error: unknown) {
    console.error("[Connected Services] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to list connected services" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/connected-services
 * Add or update a connected service
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient(request);
    if ("error" in auth) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: auth.error },
        { status: auth.status }
      );
    }

    const { supabase, user } = auth;

    const body = await request.json();
    const { service_type, access_token, refresh_token, expires_at, account_data } = body;

    // Validate required fields
    if (!service_type || !["github", "supabase", "vercel"].includes(service_type)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Invalid service_type. Must be: github, supabase, or vercel" },
        { status: 400 }
      );
    }

    if (!access_token) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "access_token is required" },
        { status: 400 }
      );
    }

    // Upsert the connected service (unique constraint on user_id + service_type)
    const { data: service, error } = await supabase
      .from("connected_services")
      .upsert({
        user_id: user.id,
        service_type: service_type as ServiceType,
        access_token,
        refresh_token: refresh_token || null,
        expires_at: expires_at || null,
        account_data: account_data || {},
      }, {
        onConflict: "user_id,service_type",
      })
      .select()
      .single();

    if (error) {
      console.error("[Connected Services] Upsert error:", error);
      return NextResponse.json(
        { error: "DATABASE_ERROR", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        service_type: service.service_type,
        account_data: service.account_data,
        expires_at: service.expires_at,
        created_at: service.created_at,
        updated_at: service.updated_at,
      },
    });
  } catch (error: unknown) {
    console.error("[Connected Services] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to save connected service" },
      { status: 500 }
    );
  }
}

