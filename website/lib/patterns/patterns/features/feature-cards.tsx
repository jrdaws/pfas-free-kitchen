"use client";

import React from "react";
import { FeaturesPatternProps, FeatureItem } from "../../types";

const defaultFeatures: FeatureItem[] = [
  {
    title: "Easy Integration",
    description: "Connect with your existing tools in minutes. No complex setup required.",
  },
  {
    title: "Real-time Sync",
    description: "Changes sync instantly across all devices and team members.",
  },
  {
    title: "Advanced Analytics",
    description: "Deep insights into your performance with customizable reports.",
  },
  {
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance certifications.",
  },
];

/**
 * Features Cards
 * Simple card layout with hover effects
 */
export function FeaturesCards({
  title = "Why choose us",
  subtitle,
  features = defaultFeatures,
  columns = 2,
  variant = "dark",
  className = "",
}: FeaturesPatternProps) {
  const isDark = variant === "dark";

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-2";

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

        {/* Cards Grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
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
              {/* Hover gradient effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 50%)`,
                }}
              />

              {/* Number badge */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-6 text-sm font-bold"
                style={{
                  backgroundColor: "rgba(249, 115, 22, 0.1)",
                  color: "var(--preview-primary, #F97316)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Image (if provided) */}
              {feature.image && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={feature.image}
                    alt=""
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.parentElement!.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <h3
                className="text-xl font-semibold mb-3 transition-colors"
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
                className="leading-relaxed"
                style={{
                  color: isDark
                    ? "var(--preview-muted, #78716C)"
                    : "var(--preview-muted, #6b7280)",
                }}
              >
                {feature.description}
              </p>

              {/* Arrow icon on hover */}
              <div
                className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--preview-primary, #F97316)" }}
              >
                <span className="text-sm font-medium">Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FeaturesCards.patternId = "features-cards";
FeaturesCards.patternName = "Feature Cards";
FeaturesCards.patternCategory = "features";

