"use client";

import React, { useState, useEffect } from "react";
import { HeroPatternProps } from "../../types";

/**
 * Animated Text Hero
 * Inspired by Stripe - rotating/typewriter text effects
 */
export function HeroAnimatedText({
  headline = "Build apps that",
  subheadline = "The most flexible platform for developers to create amazing products.",
  primaryCta,
  secondaryCta,
  variant = "dark",
  className = "",
}: HeroPatternProps & {
  rotatingWords?: string[];
}) {
  const isDark = variant === "dark";
  const rotatingWords = ["scale", "delight users", "drive growth", "last forever"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA",
      }}
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, var(--preview-primary, #F97316) 0%, transparent 70%)",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
            animation: "float2 25s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Headline with rotating word */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          style={{
            color: isDark ? "#ffffff" : "#0f0f0f",
            fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
          }}
        >
          {headline}{" "}
          <span className="relative inline-block">
            <span
              className={`inline-block transition-all duration-500 ${
                isAnimating
                  ? "opacity-0 transform translate-y-8"
                  : "opacity-100 transform translate-y-0"
              }`}
              style={{
                background: "linear-gradient(90deg, var(--preview-primary, #F97316), #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {rotatingWords[currentWordIndex]}
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-10"
            style={{
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
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
              className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all relative overflow-hidden"
              style={{
                background: "linear-gradient(90deg, var(--preview-primary, #F97316), #8B5CF6)",
                color: "#ffffff",
              }}
            >
              <span className="relative z-10">{primaryCta.text}</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "linear-gradient(90deg, #8B5CF6, var(--preview-primary, #F97316))",
                }}
              />
            </a>
          )}

          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:scale-105"
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

      <style jsx>{`
        @keyframes float1 {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(10%, 10%) rotate(180deg);
          }
        }
        @keyframes float2 {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(-10%, -10%) rotate(-180deg);
          }
        }
      `}</style>
    </section>
  );
}

HeroAnimatedText.patternId = "hero-animated-gradient";
HeroAnimatedText.patternName = "Animated Text Hero";
HeroAnimatedText.patternCategory = "hero";

