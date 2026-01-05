/**
 * Pricing Toggle Section
 * 
 * Monthly/yearly toggle pricing.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  features: string[];
  cta: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

export interface PricingToggleProps {
  headline?: string;
  subtext?: string;
  plans: Plan[];
  yearlyDiscount?: string;
  variant?: "light" | "dark";
}

export function PricingToggle({
  headline = "Choose your plan",
  subtext,
  plans,
  yearlyDiscount = "Save 20%",
  variant = "light",
}: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false);

  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
            {headline}
          </h2>
          {subtext && (
            <p className={`text-xl mb-8 ${subtextClass}`}>
              {subtext}
            </p>
          )}

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                isYearly
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Yearly
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                {yearlyDiscount}
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? "bg-primary text-white ring-4 ring-primary/20 scale-105"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "" : textClass}`}>
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className={`text-sm mb-4 ${plan.highlighted ? "text-white/80" : subtextClass}`}>
                    {plan.description}
                  </p>
                )}
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold transition-all">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className={`ml-2 ${plan.highlighted ? "text-white/80" : "text-gray-500"}`}>
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-green-500"}`} />
                    <span className={plan.highlighted ? "" : "text-gray-700 dark:text-gray-300"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={`block w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-gray-100"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {plan.cta.text}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingToggle;

