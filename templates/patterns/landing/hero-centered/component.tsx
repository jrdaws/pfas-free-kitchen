/**
 * Hero Pattern - Centered
 * 
 * Clean centered hero with headline, subtext, and CTA buttons.
 * Best for: SaaS, startup, product launches
 */

import Link from "next/link";

interface HeroCenteredProps {
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
  badge?: string;
}

export function HeroCentered({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  badge,
}: HeroCenteredProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {badge}
            </div>
          )}

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            {headline}
          </h1>
          
          {/* Subtext */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryCta.href}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {primaryCta.text}
            </Link>
            
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="w-full sm:w-auto px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {secondaryCta.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCentered;

