"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, formatPrice } from "@/lib/cart/cart-store";
import { processCheckout } from "@/lib/checkout/process-order";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<"info" | "payment" | "review">("info");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "US",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === "info") {
      setStep("payment");
      return;
    }

    if (step === "payment") {
      setStep("review");
      return;
    }

    // Process order
    setIsProcessing(true);
    const result = await processCheckout({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
      customer: formData,
      total: totalPrice(),
    });

    if (result.success) {
      clearCart();
      router.push(`/checkout/success?order=${result.orderId}`);
    } else {
      setError(result.error || "Checkout failed");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Cart is empty</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add some items to your cart to checkout.
          </p>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

      {/* Progress steps */}
      <div className="flex gap-4 mb-8">
        {["info", "payment", "review"].map((s, i) => (
          <div
            key={s}
            className={`flex-1 py-2 px-4 rounded-lg text-center ${
              step === s
                ? "bg-blue-600 text-white"
                : i < ["info", "payment", "review"].indexOf(step)
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === "info" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold dark:text-white">Contact Information</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold dark:text-white">Payment</h2>
                <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Payment integration placeholder
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Connect Stripe, Paddle, or other payment provider
                  </p>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold dark:text-white">Review Order</h2>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="dark:text-white">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {formData.address}, {formData.city} {formData.postalCode}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {step !== "info" && (
                <button
                  type="button"
                  onClick={() => setStep(step === "review" ? "payment" : "info")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : step === "review"
                  ? `Pay ${formatPrice(totalPrice())}`
                  : "Continue"}
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg h-fit">
          <h3 className="font-semibold mb-4 dark:text-white">Order Summary</h3>
          <ul className="space-y-3 mb-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="dark:text-gray-300">
                  {item.name} × {item.quantity}
                </span>
                <span className="dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between font-semibold">
              <span className="dark:text-white">Total</span>
              <span className="dark:text-white">{formatPrice(totalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

