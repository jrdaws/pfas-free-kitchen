/**
 * Hero Pattern - Animated
 * 
 * Modern hero with animated gradients and floating elements.
 * Best for: Tech startups, modern SaaS, innovative products
 */

import Link from "next/link";

interface HeroAnimatedProps {
  headline: string;
  subtext: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  gradientColors?: {
    from: string;
    via: string;
    to: string;
  };
}

export function HeroAnimated({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  gradientColors = {
    from: "from-violet-600",
    via: "via-purple-600",
    to: "to-indigo-600",
  },
}: HeroAnimatedProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.via} ${gradientColors.to} opacity-30`} />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500 rounded-full filter blur-3xl opacity-10 animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-8 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Now in public beta
          </div>

          {/* Headline with gradient text */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-gradient bg-300%">
              {headline}
            </span>
          </h1>
          
          {/* Subtext */}
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryCta.href}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-2xl relative overflow-hidden"
            >
              <span className="relative z-10">{primaryCta.text}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
            
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                {secondaryCta.text}
              </Link>
            )}
          </div>

          {/* Floating tech logos placeholder */}
          <div className="mt-16 flex items-center justify-center gap-8 opacity-50">
            <div className="w-8 h-8 rounded bg-white/20 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-8 h-8 rounded bg-white/20 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-8 h-8 rounded bg-white/20 animate-bounce" style={{ animationDelay: '0.4s' }} />
            <div className="w-8 h-8 rounded bg-white/20 animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </section>
  );
}

export default HeroAnimated;

