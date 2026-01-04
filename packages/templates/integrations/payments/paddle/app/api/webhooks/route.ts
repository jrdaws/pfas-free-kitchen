import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/paddle/webhooks
 * Handle Paddle webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    console.log(`[Paddle Webhook] ${eventType}`);

    switch (eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      case "transaction.completed":
        await handleTransactionCompleted(event.data);
        break;
      case "transaction.payment_failed":
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log(`[Paddle] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Paddle Webhook Error]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("PADDLE_WEBHOOK_SECRET not set - skipping verification");
    return true; // Allow in development
  }

  // Parse the signature header
  const parts = signature.split(";");
  const tsMatch = parts.find((p) => p.startsWith("ts="));
  const h1Match = parts.find((p) => p.startsWith("h1="));

  if (!tsMatch || !h1Match) return false;

  const timestamp = tsMatch.replace("ts=", "");
  const providedSignature = h1Match.replace("h1=", "");

  // Create the signed payload
  const signedPayload = `${timestamp}:${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );
}

// Event handlers - customize these for your app
async function handleSubscriptionCreated(data: Record<string, unknown>) {
  console.log("[Paddle] Subscription created:", data.id);
  // TODO: Update user subscription status in your database
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  console.log("[Paddle] Subscription updated:", data.id);
  // TODO: Update subscription details in your database
}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  console.log("[Paddle] Subscription canceled:", data.id);
  // TODO: Update subscription status, handle access revocation
}

async function handleTransactionCompleted(data: Record<string, unknown>) {
  console.log("[Paddle] Transaction completed:", data.id);
  // TODO: Handle one-time purchases, grant access
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  console.log("[Paddle] Payment failed:", data.id);
  // TODO: Notify user, update payment status
}

