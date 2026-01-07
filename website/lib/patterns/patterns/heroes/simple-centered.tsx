"use client";

import React from "react";
import { HeroPatternProps } from "../../types";

/**
 * Simple Centered Hero
 * Clean minimal hero with centered content - no animations, no effects
 */
export function HeroSimpleCentered({
  headline = "Simple, powerful, effective",
  subheadline = "Everything you need, nothing you don't. Get started in minutes.",
  primaryCta,
  secondaryCta,
  badge,
  variant = "dark",
  className = "",
}: HeroPatternProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`min-h-[80vh] flex items-center justify-center ${className}`}
      style={{
        backgroundColor: isDark
          ? "var(--preview-background, #0A0A0A)"
          : "var(--preview-background, #FAFAFA)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center py-20">
        {/* Badge */}
        {badge && (
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--preview-primary, #F97316)" }}
              />
              {badge}
            </span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          style={{
            color: isDark
              ? "var(--preview-foreground, #FFFFFF)"
              : "var(--preview-foreground, #0f0f0f)",
            fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
          }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
            style={{
              color: isDark ? "var(--preview-muted, #78716C)" : "var(--preview-muted, #6b7280)",
            }}
          >
            {subheadline}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryCta && (
            <a
              href={primaryCta.href}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--preview-primary, #F97316)",
                color: "#ffffff",
              }}
            >
              {primaryCta.text}
            </a>
          )}

          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: isDark
                  ? "var(--preview-foreground, #FFFFFF)"
                  : "var(--preview-foreground, #0f0f0f)",
              }}
            >
              {secondaryCta.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

HeroSimpleCentered.patternId = "hero-centered";
HeroSimpleCentered.patternName = "Simple Centered Hero";
HeroSimpleCentered.patternCategory = "hero";

