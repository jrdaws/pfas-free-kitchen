import { NextRequest, NextResponse } from "next/server";
import { paddle } from "../../../../lib/paddle";
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

    const customerId = user.user_metadata?.paddle_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Get customer's subscriptions
    const subscriptions = await paddle.subscriptions.list({
      customerId: [customerId],
      status: ["active", "past_due", "paused"],
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const subscription = subscriptions[0];

    // Get the update payment method transaction URL
    // Paddle Billing creates a special transaction for updating payment methods
    const updateTransaction = await paddle.subscriptions.getPaymentMethodChangeTransaction(
      subscription.id
    );

    // Return the checkout URL for updating payment method
    return NextResponse.json({
      url: updateTransaction.checkout?.url || null,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        nextBilledAt: subscription.nextBilledAt,
        currentPeriodEnd: subscription.currentBillingPeriod?.endsAt,
      },
    });
  } catch (error: any) {
    console.error("Paddle portal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Cancel subscription endpoint
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription ID from database
    const { data: userData } = await supabase
      .from("users")
      .select("paddle_subscription_id")
      .eq("id", user.id)
      .single();

    if (!userData?.paddle_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Cancel at end of billing period
    await paddle.subscriptions.cancel(userData.paddle_subscription_id, {
      effectiveFrom: "next_billing_period",
    });

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error: any) {
    console.error("Paddle cancel error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

