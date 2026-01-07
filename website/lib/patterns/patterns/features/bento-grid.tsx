"use client";

import React from "react";
import { FeaturesPatternProps, FeatureItem } from "../../types";

const defaultFeatures: FeatureItem[] = [
  { title: "Analytics Dashboard", description: "Real-time insights into your business metrics." },
  { title: "Team Collaboration", description: "Work together seamlessly with your team." },
  { title: "API Access", description: "Integrate with your existing tools and workflows." },
  { title: "Security First", description: "Enterprise-grade encryption and compliance." },
  { title: "24/7 Support", description: "Get help whenever you need it." },
  { title: "Custom Workflows", description: "Automate your processes with ease." },
];

/**
 * Features Bento Grid
 * Modern asymmetric grid layout inspired by Apple/Linear
 */
export function FeaturesBentoGrid({
  title = "Powerful features",
  subtitle,
  features = defaultFeatures,
  variant = "dark",
  className = "",
}: FeaturesPatternProps) {
  const isDark = variant === "dark";

  // Bento grid layout - first item is large, rest are smaller
  const bentoItems = features.slice(0, 6); // Max 6 items for bento

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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bentoItems.map((feature, i) => {
            // First item spans 2 columns on large screens
            const isLarge = i === 0;
            // Third item spans 2 rows
            const isTall = i === 2;

            return (
              <div
                key={i}
                className={`p-8 rounded-2xl transition-all group hover:scale-[1.02] ${
                  isLarge ? "lg:col-span-2" : ""
                } ${isTall ? "lg:row-span-2" : ""}`}
                style={{
                  backgroundColor: isDark
                    ? "var(--preview-card, #18181B)"
                    : "var(--preview-card, #FFFFFF)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  minHeight: isTall ? "320px" : isLarge ? "200px" : "160px",
                }}
              >
                {/* Feature image or placeholder */}
                {feature.image ? (
                  <div className="mb-6 rounded-xl overflow-hidden h-32">
                    <img
                      src={feature.image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="mb-6 h-16 w-16 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: "var(--preview-primary, #F97316)" }}
                    />
                  </div>
                )}

                {/* Title */}
                <h3
                  className={`font-semibold mb-2 ${isLarge ? "text-2xl" : "text-lg"}`}
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
                  className={`${isLarge ? "text-base" : "text-sm"}`}
                  style={{
                    color: isDark
                      ? "var(--preview-muted, #78716C)"
                      : "var(--preview-muted, #6b7280)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

FeaturesBentoGrid.patternId = "features-bento";
FeaturesBentoGrid.patternName = "Bento Grid Features";
FeaturesBentoGrid.patternCategory = "features";

