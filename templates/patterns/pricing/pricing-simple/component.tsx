/**
 * Pricing Pattern - Simple
 * 
 * Clean 2-3 tier pricing cards.
 * Best for: SaaS, subscription products, simple pricing
 */

import Link from "next/link";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
  };
  popular?: boolean;
}

interface PricingSimpleProps {
  headline: string;
  subtext?: string;
  plans: Plan[];
  billingPeriod?: "monthly" | "yearly";
}

export function PricingSimple({
  headline,
  subtext,
  plans,
  billingPeriod = "monthly",
}: PricingSimpleProps) {
  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headline}
          </h2>
          {subtext && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-primary text-white ring-4 ring-primary/20 scale-105"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "" : "text-gray-900 dark:text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-white/80" : "text-gray-600 dark:text-gray-400"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={`ml-2 ${plan.popular ? "text-white/80" : "text-gray-500"}`}>
                    /{billingPeriod === "yearly" ? "year" : "month"}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-white" : "text-green-500"}`} />
                    <span className={plan.popular ? "" : "text-gray-700 dark:text-gray-300"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={`block w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                  plan.popular
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

export default PricingSimple;

