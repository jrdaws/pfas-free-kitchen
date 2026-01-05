import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // Get customer email or ID from request body
    const { email, customerId } = await req.json();

    if (!email && !customerId) {
      return NextResponse.json(
        { error: "Email or customer ID is required" },
        { status: 400 }
      );
    }

    let resolvedCustomerId = customerId;

    // If email provided, look up customer
    if (!resolvedCustomerId && email) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json(
          { error: "No Stripe customer found for this email" },
          { status: 404 }
        );
      }

      resolvedCustomerId = customers.data[0].id;
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: resolvedCustomerId,
      return_url: `${req.nextUrl.origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
