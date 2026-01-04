import { NextRequest, NextResponse } from "next/server";
import { getPortalUrl } from "@/lib/paddle";

/**
 * POST /api/paddle/portal
 * Get a customer portal URL
 */
export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const authToken = await getPortalUrl(customerId);

    // Construct portal URL with auth token
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" 
      ? "sandbox" 
      : "production";
    
    const portalDomain = environment === "sandbox" 
      ? "sandbox-buyer-portal.paddle.com" 
      : "customer-portal.paddle.com";

    return NextResponse.json({
      url: `https://${portalDomain}?auth=${authToken}`,
    });
  } catch (error) {
    console.error("[Paddle Portal Error]", error);
    return NextResponse.json(
      { error: "Failed to get portal URL" },
      { status: 500 }
    );
  }
}

