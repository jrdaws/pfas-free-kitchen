"use client";

import React from "react";
import { FeaturesPatternProps, FeatureItem } from "../../types";

const defaultFeatures: FeatureItem[] = [
  {
    title: "Intuitive Dashboard",
    description:
      "Get a bird's eye view of your entire operation. Our dashboard gives you real-time insights into what matters most.",
  },
  {
    title: "Smart Automation",
    description:
      "Automate repetitive tasks and focus on what matters. Set up workflows that run automatically.",
  },
  {
    title: "Team Collaboration",
    description:
      "Work together seamlessly with real-time updates, comments, and notifications. Keep everyone on the same page.",
  },
];

/**
 * Features Alternating Rows
 * Left-right alternating layout with images and text
 */
export function FeaturesAlternatingRows({
  title,
  subtitle,
  features = defaultFeatures,
  variant = "dark",
  className = "",
}: FeaturesPatternProps) {
  const isDark = variant === "dark";

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
        {(title || subtitle) && (
          <div className="text-center mb-20">
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
        )}

        {/* Alternating Rows */}
        <div className="space-y-24">
          {features.map((feature, i) => {
            const isReversed = i % 2 === 1;

            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-12 lg:gap-20`}
              >
                {/* Content */}
                <div className="flex-1">
                  <span
                    className="text-sm font-semibold uppercase tracking-wider mb-4 block"
                    style={{ color: "var(--preview-primary, #F97316)" }}
                  >
                    Feature {i + 1}
                  </span>
                  <h3
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{
                      color: isDark
                        ? "var(--preview-foreground, #FFFFFF)"
                        : "var(--preview-foreground, #0f0f0f)",
                      fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-lg"
                    style={{
                      color: isDark
                        ? "var(--preview-muted, #78716C)"
                        : "var(--preview-muted, #6b7280)",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Image */}
                <div className="flex-1 w-full">
                  <div
                    className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
                    style={{
                      backgroundColor: isDark
                        ? "var(--preview-card, #18181B)"
                        : "var(--preview-card, #E5E5E5)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}
                  >
                    {feature.image ? (
                      <img
                        src={feature.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, var(--preview-primary, #F97316) 0%, rgba(139, 92, 246, 0.8) 100%)`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

FeaturesAlternatingRows.patternId = "features-alternating";
FeaturesAlternatingRows.patternName = "Alternating Rows Features";
FeaturesAlternatingRows.patternCategory = "features";

