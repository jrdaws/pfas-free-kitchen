"use client";

import React, { useState } from "react";
import { BasePatternProps } from "../../types";

interface PricingTier {
  name: string;
  price: { monthly: number; annual: number } | "custom";
  description?: string;
  features: string[];
  cta: { text: string; href: string };
  highlighted?: boolean;
}

export interface PricingTable3TierProps extends BasePatternProps {
  headline?: string;
  subheadline?: string;
  billingToggle?: boolean;
  tiers?: PricingTier[];
}

const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for getting started",
    features: ["1 user", "5 GB storage", "Basic support", "Access to core features"],
    cta: { text: "Get Started", href: "/signup" },
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 290 },
    description: "Best for growing teams",
    features: [
      "5 users",
      "50 GB storage",
      "Priority support",
      "All features",
      "Advanced analytics",
      "API access",
    ],
    cta: { text: "Start Free Trial", href: "/signup?plan=pro" },
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "custom",
    description: "For large organizations",
    features: [
      "Unlimited users",
      "Unlimited storage",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment",
    ],
    cta: { text: "Contact Sales", href: "/contact" },
  },
];

/**
 * PricingTable3Tier
 * Three-tier pricing table with optional billing toggle
 * Inspired by: gumroad.com, lemonsqueezy.com
 */
export function PricingTable3Tier({
  headline = "Simple, transparent pricing",
  subheadline = "Choose the plan that's right for you",
  billingToggle = true,
  tiers = defaultTiers,
  className = "",
}: PricingTable3TierProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  const formatPrice = (tier: PricingTier): string => {
    if (tier.price === "custom") return "Custom";
    const price = isAnnual ? tier.price.annual / 12 : tier.price.monthly;
    return price === 0 ? "$0" : `$${Math.round(price)}`;
  };

  const getSavings = (tier: PricingTier): number | null => {
    if (tier.price === "custom" || tier.price.monthly === 0) return null;
    const monthlyCost = tier.price.monthly * 12;
    const annualCost = tier.price.annual;
    const savings = ((monthlyCost - annualCost) / monthlyCost) * 100;
    return Math.round(savings);
  };

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{ backgroundColor: "var(--preview-background, #0A0A0A)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {headline && (
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: "var(--preview-foreground, #FFFFFF)",
                fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
              }}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              className="text-lg max-w-2xl mx-auto mb-8"
              style={{ color: "var(--preview-muted, #78716C)" }}
            >
              {subheadline}
            </p>
          )}

          {/* Billing Toggle */}
          {billingToggle && (
            <div className="flex items-center justify-center gap-4">
              <span
                className={`text-sm font-medium ${!isAnnual ? "opacity-100" : "opacity-50"}`}
                style={{ color: "var(--preview-foreground, #FFFFFF)" }}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: isAnnual
                    ? "var(--preview-primary, #F97316)"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                <span
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
                  style={{
                    left: isAnnual ? "calc(100% - 1.5rem)" : "0.25rem",
                  }}
                />
              </button>
              <span
                className={`text-sm font-medium ${isAnnual ? "opacity-100" : "opacity-50"}`}
                style={{ color: "var(--preview-foreground, #FFFFFF)" }}
              >
                Annual
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: "#22C55E",
                  }}
                >
                  Save 20%
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => {
            const savings = getSavings(tier);

            return (
              <div
                key={i}
                className="relative rounded-2xl p-8"
                style={{
                  backgroundColor: tier.highlighted
                    ? "var(--preview-card, #1F1F1F)"
                    : "var(--preview-card, #18181B)",
                  border: tier.highlighted
                    ? "2px solid var(--preview-primary, #F97316)"
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: tier.highlighted
                    ? "0 0 0 4px rgba(249, 115, 22, 0.1)"
                    : "none",
                }}
              >
                {/* Popular badge */}
                {tier.highlighted && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--preview-primary, #F97316)",
                      color: "#ffffff",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Tier name */}
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--preview-foreground, #FFFFFF)" }}
                >
                  {tier.name}
                </h3>

                {/* Description */}
                {tier.description && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--preview-muted, #78716C)" }}
                  >
                    {tier.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: "var(--preview-foreground, #FFFFFF)" }}
                  >
                    {formatPrice(tier)}
                  </span>
                  {tier.price !== "custom" && (
                    <span
                      className="text-sm ml-2"
                      style={{ color: "var(--preview-muted, #78716C)" }}
                    >
                      /month
                    </span>
                  )}
                  {isAnnual && savings && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: "#22C55E" }}
                    >
                      Save {savings}% with annual billing
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <a
                  href={tier.cta.href}
                  className="block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: tier.highlighted
                      ? "var(--preview-primary, #F97316)"
                      : "rgba(255,255,255,0.1)",
                    color: tier.highlighted
                      ? "#ffffff"
                      : "var(--preview-foreground, #FFFFFF)",
                  }}
                >
                  {tier.cta.text}
                </a>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--preview-foreground, #FFFFFF)" }}
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: "#22C55E" }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

PricingTable3Tier.patternId = "pricing-three-tier";
PricingTable3Tier.patternName = "3-Tier Pricing Table";
PricingTable3Tier.patternCategory = "pricing";

