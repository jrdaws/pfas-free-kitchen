"use client";

import React from "react";
import { HeroPatternProps } from "../../types";

/**
 * Split Image Hero
 * Inspired by Vercel - half content, half image showcase
 */
export function HeroSplitImage({
  headline = "Ship to production, instantly",
  subheadline = "Deploy your code with zero configuration. Just push your code and we handle the rest.",
  primaryCta,
  secondaryCta,
  badge,
  image,
  variant = "dark",
  className = "",
}: HeroPatternProps) {
  const isDark = variant === "dark";
  const isReversed = variant === "reversed";

  return (
    <section
      className={`relative min-h-[80vh] flex items-center ${className}`}
      style={{
        backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            isReversed ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Content Side */}
          <div className={`${isReversed ? "lg:order-2" : ""}`}>
            {/* Badge */}
            {badge && (
              <div className="mb-6 inline-flex">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: "rgba(249, 115, 22, 0.15)",
                    color: "var(--preview-primary, #F97316)",
                  }}
                >
                  {badge}
                </span>
              </div>
            )}

            {/* Headline */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
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
                className="text-lg md:text-xl mb-8 max-w-lg"
                style={{
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                {subheadline}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
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
                  className="px-6 py-3 rounded-lg font-semibold border transition-all hover:scale-105"
                  style={{
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    color: isDark ? "#ffffff" : "#0f0f0f",
                  }}
                >
                  {secondaryCta.text}
                </a>
              )}
            </div>
          </div>

          {/* Image Side */}
          <div className={`relative ${isReversed ? "lg:order-1" : ""}`}>
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                aspectRatio: "16/10",
                backgroundColor: isDark ? "#1a1a1a" : "#e5e5e5",
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(249, 115, 22, 0.1)",
                    }}
                  >
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: "var(--preview-primary, #F97316)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Decorative gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, transparent 50%)",
                }}
              />
            </div>

            {/* Floating elements */}
            <div
              className="absolute -bottom-4 -left-4 w-24 h-24 rounded-xl blur-3xl"
              style={{
                backgroundColor: "var(--preview-primary, #F97316)",
                opacity: 0.3,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

HeroSplitImage.patternId = "hero-split-image";
HeroSplitImage.patternName = "Split Image Hero";
HeroSplitImage.patternCategory = "hero";

