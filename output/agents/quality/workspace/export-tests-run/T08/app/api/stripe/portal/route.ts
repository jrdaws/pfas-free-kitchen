import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { createServerSupabaseClient } from "../../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Get user from Supabase
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get customer ID from user metadata
    const customerId = user.user_metadata?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
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
