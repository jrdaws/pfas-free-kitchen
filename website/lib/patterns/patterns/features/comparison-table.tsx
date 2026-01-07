"use client";

import React from "react";
import { BasePatternProps } from "../../types";

interface ComparisonFeature {
  name: string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface FeaturesComparisonTableProps extends BasePatternProps {
  title?: string;
  subtitle?: string;
  features?: ComparisonFeature[];
  tiers?: {
    name: string;
    price: string;
    description?: string;
  }[];
}

const defaultTiers = [
  { name: "Basic", price: "$9/mo", description: "For individuals" },
  { name: "Pro", price: "$29/mo", description: "For teams" },
  { name: "Enterprise", price: "Custom", description: "For organizations" },
];

const defaultFeatures: ComparisonFeature[] = [
  { name: "Users", basic: "1", pro: "5", enterprise: "Unlimited" },
  { name: "Storage", basic: "5 GB", pro: "50 GB", enterprise: "Unlimited" },
  { name: "API Access", basic: false, pro: true, enterprise: true },
  { name: "Priority Support", basic: false, pro: true, enterprise: true },
  { name: "Custom Domain", basic: false, pro: false, enterprise: true },
  { name: "SSO", basic: false, pro: false, enterprise: true },
];

/**
 * Features Comparison Table
 * Side-by-side feature comparison across tiers
 */
export function FeaturesComparisonTable({
  title = "Compare plans",
  subtitle,
  features = defaultFeatures,
  tiers = defaultTiers,
  variant = "dark",
  className = "",
}: FeaturesComparisonTableProps) {
  const isDark = variant === "dark";

  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#22C55E" }}>
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5 mx-auto opacity-30" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return <span className="font-medium">{value}</span>;
  };

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{
        backgroundColor: isDark
          ? "var(--preview-background, #0A0A0A)"
          : "var(--preview-background, #FAFAFA)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: isDark
                  ? "var(--preview-foreground, #FFFFFF)"
                  : "var(--preview-foreground, #0f0f0f)",
                fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                color: isDark ? "var(--preview-muted, #78716C)" : "var(--preview-muted, #6b7280)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: isDark
              ? "var(--preview-card, #18181B)"
              : "var(--preview-card, #FFFFFF)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
          }}
        >
          {/* Header Row */}
          <div
            className="grid grid-cols-4 p-6 border-b"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            }}
          >
            <div></div>
            {tiers.map((tier, i) => (
              <div key={i} className="text-center">
                <h3
                  className="font-semibold text-lg"
                  style={{
                    color: isDark
                      ? "var(--preview-foreground, #FFFFFF)"
                      : "var(--preview-foreground, #0f0f0f)",
                  }}
                >
                  {tier.name}
                </h3>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "var(--preview-primary, #F97316)" }}
                >
                  {tier.price}
                </p>
                {tier.description && (
                  <p
                    className="text-sm mt-1"
                    style={{
                      color: isDark
                        ? "var(--preview-muted, #78716C)"
                        : "var(--preview-muted, #6b7280)",
                    }}
                  >
                    {tier.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {features.map((feature, i) => (
            <div
              key={i}
              className="grid grid-cols-4 p-4 border-b last:border-b-0"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                backgroundColor: i % 2 === 0 ? "transparent" : isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
              }}
            >
              <div
                className="flex items-center"
                style={{
                  color: isDark
                    ? "var(--preview-foreground, #FFFFFF)"
                    : "var(--preview-foreground, #0f0f0f)",
                }}
              >
                {feature.name}
              </div>
              <div className="flex items-center justify-center" style={{
                color: isDark
                  ? "var(--preview-foreground, #FFFFFF)"
                  : "var(--preview-foreground, #0f0f0f)",
              }}>
                {renderCell(feature.basic)}
              </div>
              <div className="flex items-center justify-center" style={{
                color: isDark
                  ? "var(--preview-foreground, #FFFFFF)"
                  : "var(--preview-foreground, #0f0f0f)",
              }}>
                {renderCell(feature.pro)}
              </div>
              <div className="flex items-center justify-center" style={{
                color: isDark
                  ? "var(--preview-foreground, #FFFFFF)"
                  : "var(--preview-foreground, #0f0f0f)",
              }}>
                {renderCell(feature.enterprise)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FeaturesComparisonTable.patternId = "features-comparison";
FeaturesComparisonTable.patternName = "Feature Comparison Table";
FeaturesComparisonTable.patternCategory = "features";

