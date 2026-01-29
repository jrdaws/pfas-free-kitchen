import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICING_PLANS } from "../../../../lib/stripe";
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

    // Get plan from request body
    const { plan } = await req.json();

    if (!plan || !PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];

    if (!selectedPlan.priceId) {
      return NextResponse.json(
        { error: "This plan does not require checkout" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = user.user_metadata?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update user metadata with customer ID
      await supabase.auth.updateUser({
        data: { stripe_customer_id: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
