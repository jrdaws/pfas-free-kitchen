/**
 * Order Processing Module
 * 
 * Handles checkout and order creation.
 */

import { createClient } from "@/lib/supabase";

export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  customer: CustomerInfo;
  total: number;
  paymentMethodId?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Process checkout and create order
 */
export async function processCheckout(data: CheckoutData): Promise<CheckoutResult> {
  const supabase = createClient();

  try {
    // 1. Validate stock availability
    for (const item of data.items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        return { success: false, error: `Product ${item.productId} not found` };
      }

      if (product.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for product ${item.productId}` };
      }
    }

    // 2. Create order
    const orderId = generateOrderId();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_email: data.customer.email,
      customer_name: `${data.customer.firstName} ${data.customer.lastName}`,
      shipping_address: {
        address: data.customer.address,
        city: data.customer.city,
        postalCode: data.customer.postalCode,
        country: data.customer.country,
      },
      total: data.total,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (orderError) {
      console.error("Order creation failed:", orderError);
      return { success: false, error: "Failed to create order" };
    }

    // 3. Create order items
    const orderItems = data.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation failed:", itemsError);
      // Rollback order
      await supabase.from("orders").delete().eq("id", orderId);
      return { success: false, error: "Failed to create order items" };
    }

    // 4. Update stock
    for (const item of data.items) {
      await supabase.rpc("decrement_stock", {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }

    // 5. Process payment (placeholder)
    // In production, integrate with Stripe, Paddle, etc.

    // 6. Update order status
    await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId);

    return { success: true, orderId };
  } catch (error) {
    console.error("Checkout error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Get order status display
 */
export function getOrderStatusDisplay(status: string): {
  label: string;
  color: "gray" | "yellow" | "blue" | "green" | "red";
} {
  switch (status) {
    case "pending":
      return { label: "Pending", color: "gray" };
    case "confirmed":
      return { label: "Confirmed", color: "blue" };
    case "processing":
      return { label: "Processing", color: "yellow" };
    case "shipped":
      return { label: "Shipped", color: "blue" };
    case "delivered":
      return { label: "Delivered", color: "green" };
    case "cancelled":
      return { label: "Cancelled", color: "red" };
    default:
      return { label: status, color: "gray" };
  }
}

