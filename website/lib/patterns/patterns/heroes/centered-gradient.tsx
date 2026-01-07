"use client";

import React from "react";
import { HeroPatternProps } from "../../types";

/**
 * Centered Gradient Hero
 * Inspired by Linear.app - centered content with gradient background and optional orb effect
 */
export function HeroCenteredGradient({
  headline = "Build the Future of Your Product",
  subheadline = "A modern platform that helps you ship faster with less complexity.",
  primaryCta,
  secondaryCta,
  badge,
  variant = "dark",
  className = "",
}: HeroPatternProps) {
  const isDark = variant === "dark" || variant === "brand";

  return (
    <section
      className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)"
          : "linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #e8e8e8 100%)",
      }}
    >
      {/* Animated gradient orb */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, var(--preview-primary, #F97316) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        {badge && (
          <div className="mb-8 inline-flex">
            <span
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                backgroundColor: isDark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.1)",
                borderColor: "rgba(249, 115, 22, 0.3)",
                color: "var(--preview-primary, #F97316)",
              }}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          style={{
            color: isDark ? "#ffffff" : "#0f0f0f",
            fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
          }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-10"
            style={{
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            }}
          >
            {subheadline}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCta && (
            <a
              href={primaryCta.href}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: "var(--preview-primary, #F97316)",
                color: "#ffffff",
                boxShadow: "0 4px 20px rgba(249, 115, 22, 0.4)",
              }}
            >
              {primaryCta.text}
            </a>
          )}

          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                color: isDark ? "#ffffff" : "#0f0f0f",
                backgroundColor: "transparent",
              }}
            >
              {secondaryCta.text}
            </a>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}

// Pattern metadata for registry
HeroCenteredGradient.patternId = "hero-centered-gradient";
HeroCenteredGradient.patternName = "Centered Gradient Hero";
HeroCenteredGradient.patternCategory = "hero";

