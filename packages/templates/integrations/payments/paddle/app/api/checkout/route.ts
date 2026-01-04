import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, createCustomer } from "@/lib/paddle";

/**
 * POST /api/paddle/checkout
 * Create a checkout session for a price
 */
export async function POST(request: NextRequest) {
  try {
    const { priceId, email, customerId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Get or create customer
    let customer = customerId ? null : await getCustomerByEmail(email);
    if (!customer && email) {
      customer = await createCustomer(email);
    }

    // Return data for client-side checkout
    return NextResponse.json({
      priceId,
      customerId: customerId || customer?.id,
    });
  } catch (error) {
    console.error("[Paddle Checkout Error]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

