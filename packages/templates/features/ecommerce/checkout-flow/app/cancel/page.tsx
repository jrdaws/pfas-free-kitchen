"use client";

import Link from "next/link";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-amber-500" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Checkout Cancelled
        </h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. Don&apos;t worry - your cart is still saved and ready when you are.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Return to Checkout
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
        
        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Having issues? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link>
        </p>
      </div>
    </div>
  );
}

