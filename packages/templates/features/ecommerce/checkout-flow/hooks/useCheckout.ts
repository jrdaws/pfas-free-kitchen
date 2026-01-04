"use client";

import { useCheckoutContext } from "@/lib/checkout/checkout-context";
import { calculateOrderTotal } from "@/lib/checkout/checkout-utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCheckout(items: CartItem[] = []) {
  const context = useCheckoutContext();
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = context.shippingMethod?.price || 0;
  const totals = calculateOrderTotal(subtotal, shippingCost);

  const canProceed = () => {
    switch (context.step) {
      case "cart":
        return items.length > 0;
      case "shipping":
        return !!context.shipping && !!context.shippingMethod;
      case "payment":
        return !!context.paymentIntentId;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const processOrder = async () => {
    context.setLoading(true);
    context.setError(null);

    try {
      // TODO: Call your order processing API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: context.shipping,
          shippingMethod: context.shippingMethod,
          paymentIntentId: context.paymentIntentId,
          totals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process order");
      }

      const order = await response.json();
      context.setStep("complete");
      context.reset();
      
      return order;
    } catch (error) {
      context.setError(error instanceof Error ? error.message : "An error occurred");
      throw error;
    } finally {
      context.setLoading(false);
    }
  };

  return {
    ...context,
    subtotal,
    shippingCost,
    totals,
    canProceed: canProceed(),
    processOrder,
  };
}

