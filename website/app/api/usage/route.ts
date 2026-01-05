/**
 * GET /api/usage - Get user's usage stats
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

// Plan limits
const PLAN_LIMITS = {
  free: {
    exports: 10,
    projects: 5,
    apiCalls: 1000,
    storage: 100 * 1024 * 1024, // 100 MB
  },
  pro: {
    exports: -1, // Unlimited
    projects: -1,
    apiCalls: 100000,
    storage: 10 * 1024 * 1024 * 1024, // 10 GB
  },
  enterprise: {
    exports: -1,
    projects: -1,
    apiCalls: -1,
    storage: -1,
  },
};

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

    // Get current period dates
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get usage for current period
    const { data: usage } = await supabase
      .from("usage")
      .select("*")
      .eq("user_id", user.id)
      .gte("period_start", periodStart.toISOString().split("T")[0])
      .single();

    // Get project count
    const { count: projectCount } = await supabase
      .from("user_projects")
      .select("*", { count: "exact", head: true });

    // Determine user plan (for now, everyone is on free)
    const plan = "free";
    const limits = PLAN_LIMITS[plan];

    // Calculate days remaining in period
    const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      success: true,
      plan,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        daysTotal: daysInPeriod,
        daysRemaining,
      },
      usage: {
        exports: {
          used: usage?.exports_count || 0,
          limit: limits.exports,
        },
        projects: {
          used: projectCount || 0,
          limit: limits.projects,
        },
        apiCalls: {
          used: usage?.api_calls_count || 0,
          limit: limits.apiCalls,
        },
        storage: {
          used: usage?.storage_bytes || 0,
          limit: limits.storage,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[Usage API] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

