"use client";

import Link from "next/link";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  variant?: "gradient" | "solid" | "image";
}

export function Hero({
  title = "Build Something Amazing",
  subtitle = "The modern framework for building production-ready applications with AI-assisted development.",
  ctaText = "Get Started",
  ctaHref = "/signup",
  ctaSecondaryText = "Learn More",
  ctaSecondaryHref = "#features",
  variant = "gradient",
}: HeroProps) {
  const bgClasses = {
    gradient: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    solid: "bg-slate-900",
    image: "bg-slate-900 bg-cover bg-center",
  };

  return (
    <section className={`relative min-h-[90vh] flex items-center ${bgClasses[variant]}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-400 text-sm font-medium">Now Available</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {title.split(" ").map((word, i) => (
            <span key={i}>
              {i === title.split(" ").length - 1 ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  {word}
                </span>
              ) : (
                word + " "
              )}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25"
          >
            {ctaText}
          </Link>
          <Link
            href={ctaSecondaryHref}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-lg font-semibold transition-colors"
          >
            {ctaSecondaryText}
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-900"
                />
              ))}
            </div>
            <span>500+ developers</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-4 h-4 fill-yellow-500" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

