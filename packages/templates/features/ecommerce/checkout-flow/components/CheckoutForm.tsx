"use client";

import { useCheckoutContext } from "@/lib/checkout/checkout-context";
import { ShippingForm } from "./ShippingForm";
import { PaymentForm } from "./PaymentForm";
import { CheckCircle2, Truck, CreditCard, ClipboardCheck } from "lucide-react";

const STEPS = [
  { id: "cart", label: "Cart", icon: ClipboardCheck },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: CheckCircle2 },
];

export function CheckoutForm() {
  const { step, setStep, shipping, shippingMethod, loading } = useCheckoutContext();

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Checkout progress" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((s, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = s.id === step;
            const Icon = s.icon;

            return (
              <li key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => isComplete && setStep(s.id as any)}
                  disabled={!isComplete}
                  className={`flex items-center gap-2 ${
                    isComplete ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      isComplete
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isComplete ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {step === "cart" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Cart</h2>
            <p className="text-muted-foreground mb-4">
              Review the items in your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => setStep("shipping")}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Continue to Shipping
            </button>
          </div>
        )}

        {step === "shipping" && (
          <ShippingForm onComplete={() => setStep("payment")} />
        )}

        {step === "payment" && (
          <PaymentForm onComplete={() => setStep("review")} />
        )}

        {step === "review" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
            
            {/* Shipping Summary */}
            {shipping && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.address1}<br />
                  {shipping.address2 && <>{shipping.address2}<br /></>}
                  {shipping.city}, {shipping.state} {shipping.postalCode}<br />
                  {shipping.country}
                </p>
              </div>
            )}

            {/* Shipping Method */}
            {shippingMethod && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-2">Shipping Method</h3>
                <p className="text-sm text-muted-foreground">
                  {shippingMethod.name} - ${shippingMethod.price.toFixed(2)}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                // TODO: Process order
                window.location.href = "/checkout/success";
              }}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

