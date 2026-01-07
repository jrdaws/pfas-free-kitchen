"use client";

import React from "react";
import { FeaturesPatternProps, FeatureItem } from "../../types";

// Default icons for features
const ICONS: Record<string, React.ReactNode> = {
  zap: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

const iconKeys = Object.keys(ICONS);

function getIcon(iconName?: string, index?: number) {
  if (iconName && ICONS[iconName]) {
    return ICONS[iconName];
  }
  // Cycle through icons based on index
  return ICONS[iconKeys[(index || 0) % iconKeys.length]];
}

const defaultFeatures: FeatureItem[] = [
  { title: "Lightning Fast", description: "Built for speed with optimized performance at every level." },
  { title: "Secure by Default", description: "Enterprise-grade security with encryption and compliance." },
  { title: "24/7 Support", description: "Our team is always available to help you succeed." },
];

/**
 * Features Icon Grid (3 columns)
 * Clean grid layout with icons, titles, and descriptions
 */
export function FeaturesIconGrid({
  title = "Everything you need",
  subtitle,
  features = defaultFeatures,
  columns = 3,
  variant = "dark",
  className = "",
}: FeaturesPatternProps) {
  const isDark = variant === "dark";

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{
        backgroundColor: isDark
          ? "var(--preview-background, #0A0A0A)"
          : "var(--preview-background, #FAFAFA)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
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

        {/* Feature Grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl transition-all hover:-translate-y-1"
              style={{
                backgroundColor: isDark
                  ? "var(--preview-card, #18181B)"
                  : "var(--preview-card, #FFFFFF)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                boxShadow: isDark
                  ? "0 4px 20px rgba(0,0,0,0.3)"
                  : "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "rgba(249, 115, 22, 0.1)",
                  color: "var(--preview-primary, #F97316)",
                }}
              >
                {feature.image ? (
                  <img
                    src={feature.image}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getIcon(feature.icon, i)
                )}
              </div>

              {/* Title */}
              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  color: isDark
                    ? "var(--preview-foreground, #FFFFFF)"
                    : "var(--preview-foreground, #0f0f0f)",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm"
                style={{
                  color: isDark ? "var(--preview-muted, #78716C)" : "var(--preview-muted, #6b7280)",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FeaturesIconGrid.patternId = "features-icon-grid";
FeaturesIconGrid.patternName = "Icon Grid Features";
FeaturesIconGrid.patternCategory = "features";

