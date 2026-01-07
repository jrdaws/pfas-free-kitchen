"use client";

import React from "react";
import { BasePatternProps } from "../../types";

export interface CTASectionProps extends BasePatternProps {
  headline: string;
  subheadline?: string;
  cta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  variant?: "centered" | "split" | "gradient-bg";
}

/**
 * CTASection
 * Call-to-action section with prominent headline and button
 * Inspired by: vercel.com, linear.app
 */
export function CTASection({
  headline = "Ready to get started?",
  subheadline = "Start building for free. No credit card required.",
  cta = { text: "Get Started Free", href: "/signup" },
  secondaryCta,
  variant = "centered",
  className = "",
}: CTASectionProps) {
  const isCentered = variant === "centered";
  const isSplit = variant === "split";
  const isGradient = variant === "gradient-bg";

  const bgStyle = isGradient
    ? {
        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
      }
    : {
        backgroundColor: "var(--preview-card, #18181B)",
      };

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{ backgroundColor: "var(--preview-background, #0A0A0A)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div
          className={`rounded-3xl p-12 md:p-16 ${
            isSplit ? "flex flex-col md:flex-row items-center justify-between gap-8" : ""
          }`}
          style={{
            ...bgStyle,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Content */}
          <div className={isSplit ? "flex-1" : "text-center"}>
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${isSplit ? "" : "max-w-2xl mx-auto"}`}
              style={{
                color: "var(--preview-foreground, #FFFFFF)",
                fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
              }}
            >
              {headline}
            </h2>

            {subheadline && (
              <p
                className={`text-lg ${isSplit ? "" : "max-w-xl mx-auto"}`}
                style={{ color: "var(--preview-muted, #78716C)" }}
              >
                {subheadline}
              </p>
            )}

            {/* CTAs for centered and gradient variants */}
            {(isCentered || isGradient) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <a
                  href={cta.href}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: "var(--preview-primary, #F97316)",
                    color: "#ffffff",
                    boxShadow: "0 4px 20px rgba(249, 115, 22, 0.4)",
                  }}
                >
                  {cta.text}
                </a>

                {secondaryCta && (
                  <a
                    href={secondaryCta.href}
                    className="px-8 py-4 rounded-lg font-semibold text-lg border transition-all hover:scale-105"
                    style={{
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "var(--preview-foreground, #FFFFFF)",
                    }}
                  >
                    {secondaryCta.text}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CTA button for split variant */}
          {isSplit && (
            <div className="flex-shrink-0">
              <a
                href={cta.href}
                className="inline-flex px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--preview-primary, #F97316)",
                  color: "#ffffff",
                  boxShadow: "0 4px 20px rgba(249, 115, 22, 0.4)",
                }}
              >
                {cta.text}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

CTASection.patternId = "cta-simple";
CTASection.patternName = "CTA Section";
CTASection.patternCategory = "cta";

