import { NextRequest, NextResponse } from "next/server";
import { paddle, PRICING_PLANS, ensureCustomer } from "../../../../lib/paddle";
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

    // Get or create Paddle customer
    const customer = await ensureCustomer(user.email!, user.id);

    // Update user metadata with Paddle customer ID
    if (!user.user_metadata?.paddle_customer_id) {
      await supabase.auth.updateUser({
        data: { paddle_customer_id: customer.id },
      });
    }

    // Create transaction for checkout
    const transaction = await paddle.transactions.create({
      customerId: customer.id,
      items: [
        {
          priceId: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      customData: {
        userId: user.id,
        plan: plan,
      },
    });

    // Return transaction details for Paddle.js overlay checkout
    return NextResponse.json({
      transactionId: transaction.id,
      // For overlay checkout, return client-side token
      clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

