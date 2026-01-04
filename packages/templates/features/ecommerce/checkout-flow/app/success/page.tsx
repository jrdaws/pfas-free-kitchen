"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  useEffect(() => {
    // Get order number from URL params or generate one
    const order = searchParams.get("order");
    if (order) {
      setOrderNumber(order);
    } else {
      // Generate a mock order number for demo
      const timestamp = Date.now().toString(36).toUpperCase();
      setOrderNumber(`ORD-${timestamp}`);
    }
    
    // Clear cart after successful order
    // TODO: Integrate with your cart context/store
    // clearCart();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. We&apos;ve received your order and will begin processing it shortly.
        </p>
        
        {/* Order Number */}
        {orderNumber && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-lg font-mono font-bold">{orderNumber}</p>
          </div>
        )}
        
        {/* What's Next */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            What&apos;s Next?
          </h2>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• You&apos;ll receive an email confirmation shortly</li>
            <li>• We&apos;ll notify you when your order ships</li>
            <li>• Track your order in your account dashboard</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            View Order Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

