import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { createServerSupabaseClient } from "../../../../lib/supabase";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    const supabase = await createServerSupabaseClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          // Update user's subscription in database
          await supabase
            .from("users")
            .update({
              subscription_plan: plan,
              subscription_status: "active",
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by customer ID
        const { data: users } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (users) {
          await supabase
            .from("users")
            .update({
              subscription_status: subscription.status,
              subscription_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("id", users.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by customer ID
        const { data: users } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (users) {
          await supabase
            .from("users")
            .update({
              subscription_plan: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("id", users.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get user by customer ID
        const { data: users } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (users) {
          await supabase
            .from("users")
            .update({
              subscription_status: "past_due",
            })
            .eq("id", users.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
