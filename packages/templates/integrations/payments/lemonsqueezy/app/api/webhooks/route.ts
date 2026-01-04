import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/lemonsqueezy/webhooks
 * Handle LemonSqueezy webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifySignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    console.log(`[LemonSqueezy Webhook] ${eventName}`);

    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(event.data);
        break;
      case "subscription_resumed":
        await handleSubscriptionResumed(event.data);
        break;
      case "subscription_expired":
        await handleSubscriptionExpired(event.data);
        break;
      case "subscription_paused":
        await handleSubscriptionPaused(event.data);
        break;
      case "subscription_unpaused":
        await handleSubscriptionUnpaused(event.data);
        break;
      case "subscription_payment_success":
        await handlePaymentSuccess(event.data);
        break;
      case "subscription_payment_failed":
        await handlePaymentFailed(event.data);
        break;
      case "order_created":
        await handleOrderCreated(event.data);
        break;
      case "order_refunded":
        await handleOrderRefunded(event.data);
        break;
      default:
        console.log(`[LemonSqueezy] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[LemonSqueezy Webhook Error]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("LEMONSQUEEZY_WEBHOOK_SECRET not set - skipping verification");
    return true; // Allow in development
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(body).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Event handlers - customize these for your app
async function handleSubscriptionCreated(data: Record<string, unknown>) {
  const attrs = data.attributes as Record<string, unknown>;
  console.log("[LemonSqueezy] Subscription created:", data.id, attrs.status);
  // TODO: Create user subscription record in your database
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const attrs = data.attributes as Record<string, unknown>;
  console.log("[LemonSqueezy] Subscription updated:", data.id, attrs.status);
  // TODO: Update subscription in your database
}

async function handleSubscriptionCancelled(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Subscription cancelled:", data.id);
  // TODO: Update subscription status, handle access
}

async function handleSubscriptionResumed(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Subscription resumed:", data.id);
  // TODO: Reactivate user access
}

async function handleSubscriptionExpired(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Subscription expired:", data.id);
  // TODO: Revoke user access
}

async function handleSubscriptionPaused(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Subscription paused:", data.id);
  // TODO: Handle paused state
}

async function handleSubscriptionUnpaused(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Subscription unpaused:", data.id);
  // TODO: Resume user access
}

async function handlePaymentSuccess(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Payment success:", data.id);
  // TODO: Record payment, send receipt
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Payment failed:", data.id);
  // TODO: Notify user, handle dunning
}

async function handleOrderCreated(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Order created:", data.id);
  // TODO: Handle one-time purchases
}

async function handleOrderRefunded(data: Record<string, unknown>) {
  console.log("[LemonSqueezy] Order refunded:", data.id);
  // TODO: Handle refunds, revoke access
}

