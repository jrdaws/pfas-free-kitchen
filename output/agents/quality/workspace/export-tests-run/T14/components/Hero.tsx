"use client";

import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundStyle?: "gradient" | "mesh" | "solid" | "image";
  alignment?: "center" | "left";
}

export function Hero({
  title,
  subtitle,
  ctaText,
  ctaSecondaryText,
  backgroundStyle = "gradient",
  alignment = "center",
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative w-full min-h-[600px] flex items-center justify-center px-6 py-24",
        backgroundStyle === "solid" && "bg-[#0A0A0A]",
        backgroundStyle === "gradient" && "bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]",
        backgroundStyle === "mesh" && "bg-[#0A0A0A]",
        backgroundStyle === "image" && "bg-[#0A0A0A]"
      )}
    >
      {/* Mesh overlay for mesh style */}
      {backgroundStyle === "mesh" && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Gradient orbs for gradient style */}
      {backgroundStyle === "gradient" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        </>
      )}

      <div
        className={cn(
          "relative z-10 max-w-4xl mx-auto",
          alignment === "center" && "text-center",
          alignment === "left" && "text-left"
        )}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div
          className={cn(
            "flex gap-4",
            alignment === "center" && "justify-center",
            alignment === "left" && "justify-start"
          )}
        >
          <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25">
            {ctaText}
          </button>
          {ctaSecondaryText && (
            <button className="px-8 py-4 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold text-lg transition-all">
              {ctaSecondaryText}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
