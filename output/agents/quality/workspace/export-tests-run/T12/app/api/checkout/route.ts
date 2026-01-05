import { NextRequest, NextResponse } from "next/server";
import { processCheckout, CheckoutData } from "@/lib/checkout/process-order";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    if (!body.customer?.email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    const checkoutData: CheckoutData = {
      items: body.items.map((item: Record<string, unknown>) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: {
        email: body.customer.email,
        firstName: body.customer.firstName || "",
        lastName: body.customer.lastName || "",
        address: body.customer.address || "",
        city: body.customer.city || "",
        postalCode: body.customer.postalCode || "",
        country: body.customer.country || "US",
      },
      total: body.total || 0,
      paymentMethodId: body.paymentMethodId,
    };

    const result = await processCheckout(checkoutData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

