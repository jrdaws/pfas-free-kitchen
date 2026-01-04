"use client";

import { useEffect, useState } from "react";
import { initPaddle, openCheckout } from "@/lib/paddle-client";

interface PaddleCheckoutProps {
  priceId: string;
  email?: string;
  customerId?: string;
  buttonText?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function PaddleCheckout({
  priceId,
  email,
  customerId,
  buttonText = "Subscribe",
  className = "",
  variant = "primary",
}: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initPaddle().then(() => setReady(true));
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await openCheckout(priceId, { email, customerId });
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50";
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || !ready}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
}

