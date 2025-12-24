/**
 * Health Check Endpoint
 * 
 * GET /api/health - Check service health status
 * 
 * Returns:
 * - status: "healthy" | "degraded" | "unhealthy"
 * - services: Status of individual services
 */

import { NextRequest, NextResponse } from "next/server";
import { isRedisAvailable } from "@/lib/rate-limiter";
import { isCostTrackingAvailable, getUsageStats } from "@/lib/cost-tracker";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface ServiceStatus {
  status: "up" | "down" | "degraded";
  message?: string;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    redis: ServiceStatus;
    anthropic: ServiceStatus;
    costTracking: ServiceStatus;
  };
  timestamp: string;
  version: string;
}

async function checkSupabase(): Promise<ServiceStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { status: "down", message: "Missing Supabase configuration" };
  }

  try {
    const supabase = createClient(url, key);
    // Simple health check - try to query metadata
    const { error } = await supabase.from("projects").select("id").limit(1);
    
    if (error && !error.message.includes("does not exist")) {
      return { status: "degraded", message: error.message };
    }
    
    return { status: "up" };
  } catch (error: any) {
    return { status: "down", message: error.message };
  }
}

async function checkAnthropic(): Promise<ServiceStatus> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { status: "down", message: "Missing Anthropic API key" };
  }

  // We don't actually call Anthropic API here (costs money)
  // Just verify the key format looks valid
  if (apiKey.startsWith("sk-ant-")) {
    return { status: "up" };
  }

  return { status: "degraded", message: "API key format unexpected" };
}

async function checkCostTracking(): Promise<ServiceStatus> {
  if (!isCostTrackingAvailable()) {
    return { status: "degraded", message: "Running in memory-only mode (Redis not configured)" };
  }

  try {
    const stats = await getUsageStats();
    
    // Warn if approaching limits
    if (stats.daily.percentUsed >= 95 || stats.monthly.percentUsed >= 95) {
      return { status: "degraded", message: "Approaching usage limits" };
    }
    
    return { status: "up" };
  } catch (error: any) {
    return { status: "down", message: error.message };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check all services in parallel
    const [supabaseStatus, anthropicStatus, costStatus] = await Promise.all([
      checkSupabase(),
      checkAnthropic(),
      checkCostTracking(),
    ]);

    const redisStatus: ServiceStatus = isRedisAvailable()
      ? { status: "up" }
      : { status: "degraded", message: "Redis not available, using in-memory rate limiting" };

    const services = {
      api: { status: "up" as const },
      database: supabaseStatus,
      redis: redisStatus,
      anthropic: anthropicStatus,
      costTracking: costStatus,
    };

    // Determine overall status
    const statusCounts = {
      down: Object.values(services).filter(s => s.status === "down").length,
      degraded: Object.values(services).filter(s => s.status === "degraded").length,
    };

    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
    
    if (statusCounts.down > 0) {
      // If any critical service is down (database, anthropic)
      if (services.database.status === "down" || services.anthropic.status === "down") {
        overallStatus = "unhealthy";
      } else {
        overallStatus = "degraded";
      }
    } else if (statusCounts.degraded > 0) {
      overallStatus = "degraded";
    }

    const health: HealthStatus = {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.0",
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      { ...health, responseTimeMs: responseTime },
      { status: overallStatus === "unhealthy" ? 503 : 200 }
    );
  } catch (error: any) {
    console.error("[Health Check] Error:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

