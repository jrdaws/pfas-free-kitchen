"use client";

import React, { useState } from "react";
import { HeroPatternProps } from "../../types";

/**
 * Video Background Hero
 * Inspired by OpenAI - immersive video with text overlay
 */
export function HeroVideoBackground({
  headline = "Experience the Future",
  subheadline = "Transforming the way you interact with technology.",
  primaryCta,
  secondaryCta,
  videoUrl,
  backgroundImage,
  variant = "dark-overlay",
  className = "",
}: HeroPatternProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const overlayOpacity =
    variant === "light-overlay" ? 0.4 : variant === "gradient-overlay" ? 0.6 : 0.7;

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Video Background */}
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback/Poster Image */}
      {(backgroundImage || !videoUrl) && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${
            videoUrl && videoLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-1000`}
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "gradient-overlay"
              ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
              : `rgba(0,0,0,${overlayOpacity})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white"
          style={{
            fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-10"
            style={{
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {subheadline}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCta && (
            <a
              href={primaryCta.href}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
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
                borderColor: "rgba(255,255,255,0.4)",
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {secondaryCta.text}
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

HeroVideoBackground.patternId = "hero-video-bg";
HeroVideoBackground.patternName = "Video Background Hero";
HeroVideoBackground.patternCategory = "hero";

