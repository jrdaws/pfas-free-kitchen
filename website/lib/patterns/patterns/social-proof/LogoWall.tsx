"use client";

import React from "react";
import { BasePatternProps } from "../../types";

interface Logo {
  src: string;
  alt: string;
  href?: string;
}

export interface LogoWallProps extends BasePatternProps {
  headline?: string;
  logos?: Logo[];
  variant?: "static" | "scrolling";
  grayscale?: boolean;
}

const defaultLogos: Logo[] = [
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 1" },
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 2" },
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 3" },
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 4" },
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 5" },
  { src: "https://placehold.co/120x40/1a1a1a/888888?text=Logo", alt: "Company 6" },
];

/**
 * LogoWall
 * Displays a row of company logos for social proof
 * Inspired by: All SaaS landing pages
 */
export function LogoWall({
  headline = "Trusted by industry leaders",
  logos = defaultLogos,
  variant = "static",
  grayscale = true,
  className = "",
}: LogoWallProps) {
  const LogoItem = ({ logo }: { logo: Logo }) => {
    const imgClasses = `h-8 md:h-10 object-contain ${grayscale ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100" : ""} transition-all duration-300`;

    const img = (
      <img
        src={logo.src}
        alt={logo.alt}
        className={imgClasses}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );

    if (logo.href) {
      return (
        <a href={logo.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
          {img}
        </a>
      );
    }

    return <div className="flex items-center">{img}</div>;
  };

  return (
    <section
      className={`py-12 px-6 ${className}`}
      style={{
        backgroundColor: "var(--preview-background, #0A0A0A)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Headline */}
        {headline && (
          <p
            className="text-center text-sm font-medium uppercase tracking-wider mb-8"
            style={{
              color: "var(--preview-muted, #78716C)",
            }}
          >
            {headline}
          </p>
        )}

        {/* Logos */}
        {variant === "static" ? (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {logos.map((logo, i) => (
              <LogoItem key={i} logo={logo} />
            ))}
          </div>
        ) : (
          /* Scrolling marquee */
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-marquee">
              {/* Duplicate logos for seamless loop */}
              {[...logos, ...logos].map((logo, i) => (
                <LogoItem key={i} logo={logo} />
              ))}
            </div>
            
            {/* Gradient fade edges */}
            <div
              className="absolute inset-y-0 left-0 w-16 pointer-events-none"
              style={{
                background: `linear-gradient(to right, var(--preview-background, #0A0A0A), transparent)`,
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-16 pointer-events-none"
              style={{
                background: `linear-gradient(to left, var(--preview-background, #0A0A0A), transparent)`,
              }}
            />
          </div>
        )}
      </div>

      {variant === "scrolling" && (
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      )}
    </section>
  );
}

LogoWall.patternId = "logos-simple";
LogoWall.patternName = "Logo Wall";
LogoWall.patternCategory = "logos";

