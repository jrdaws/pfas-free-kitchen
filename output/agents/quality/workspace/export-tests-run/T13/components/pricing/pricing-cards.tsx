"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "Basic features",
      "Up to 10 projects",
      "Community support",
      "1 GB storage",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For professionals and growing teams",
    features: [
      "All Free features",
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
      "50 GB storage",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    description: "For larger teams and enterprises",
    features: [
      "All Pro features",
      "Team collaboration",
      "SSO authentication",
      "Advanced security",
      "Dedicated support",
      "Unlimited storage",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planId: string) => {
    if (planId === "free") {
      router.push("/signup");
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-12">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`relative rounded-2xl border-2 p-8 flex flex-col ${
            plan.popular
              ? "border-indigo-600 shadow-xl scale-105"
              : "border-gray-200"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-extrabold text-gray-900">
                ${plan.price}
              </span>
              <span className="ml-2 text-xl text-gray-600">/month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="h-6 w-6 text-indigo-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="ml-3 text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={loading === plan.id}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              plan.popular
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === plan.id ? "Loading..." : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
