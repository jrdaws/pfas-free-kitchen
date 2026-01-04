import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/lemonsqueezy";

/**
 * POST /api/lemonsqueezy/checkout
 * Create a checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const { variantId, email, name, redirectUrl } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 }
      );
    }

    const checkoutUrl = await createCheckoutUrl(variantId, {
      email,
      name,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[LemonSqueezy Checkout Error]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

