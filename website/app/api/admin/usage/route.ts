/**
 * Admin Usage Monitoring Endpoint
 * 
 * GET /api/admin/usage - Get current token usage statistics
 * 
 * Note: In production, this should be protected with authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUsageReport } from "@/lib/cost-tracker";

export async function GET(request: NextRequest) {
  // In production, add authentication check here
  // For now, check for admin key in query params or headers
  const adminKey = request.headers.get("x-admin-key") || 
                   request.nextUrl.searchParams.get("key");
  
  const expectedKey = process.env.ADMIN_API_KEY;
  
  if (expectedKey && adminKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing admin key" },
      { status: 401 }
    );
  }

  try {
    const report = await getUsageReport();
    
    return NextResponse.json({
      success: true,
      ...report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Admin Usage] Error:", error);
    return NextResponse.json(
      { error: "Failed to get usage report", message: error.message },
      { status: 500 }
    );
  }
}

