"use client";

import { useState } from "react";
import { useCheckoutContext } from "@/lib/checkout/checkout-context";
import { CreditCard, Lock } from "lucide-react";

interface PaymentFormProps {
  onComplete: () => void;
}

export function PaymentForm({ onComplete }: PaymentFormProps) {
  const { setPaymentIntent, loading, setLoading, setError } = useCheckoutContext();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Integrate with your payment provider (Stripe, Paddle, etc.)
      // For demo, we just simulate a successful payment setup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPaymentIntent("demo_payment_intent");
      onComplete();
    } catch (error) {
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "card"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Credit Card
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("paypal")}
          className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "paypal"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.18l-.997 6.014-.046.37c-.07.413-.342.622-.582.622z"/>
          </svg>
          PayPal
        </button>
      </div>

      {/* Card Form */}
      {paymentMethod === "card" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVC</label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name on Card</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* PayPal Info */}
      {paymentMethod === "paypal" && (
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            You will be redirected to PayPal to complete your purchase securely.
          </p>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Your payment information is encrypted and secure.</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "Continue to Review"}
      </button>
    </form>
  );
}

