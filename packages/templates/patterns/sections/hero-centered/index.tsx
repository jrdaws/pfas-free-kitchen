/**
 * Hero Centered Section
 * 
 * Centered headline, subtext, and CTA buttons.
 * Optional background image or gradient.
 */

import Link from "next/link";

export interface HeroCenteredProps {
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
  backgroundImage?: string;
  variant?: "light" | "dark" | "gradient";
}

export function HeroCentered({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  badge,
  backgroundImage,
  variant = "light",
}: HeroCenteredProps) {
  const variantClasses = {
    light: "bg-white dark:bg-gray-950",
    dark: "bg-gray-900 text-white",
    gradient: "bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10",
  };

  const textClasses = {
    light: "text-gray-900 dark:text-white",
    dark: "text-white",
    gradient: "text-gray-900 dark:text-white",
  };

  return (
    <section
      className={`relative py-20 lg:py-32 overflow-hidden ${variantClasses[variant]}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {badge}
            </div>
          )}

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight ${backgroundImage ? 'text-white' : textClasses[variant]}`}>
            {headline}
          </h1>
          
          <p className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed ${backgroundImage ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
            {subtext}
          </p>

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
                className={`w-full sm:w-auto px-8 py-4 border font-semibold rounded-lg transition-all ${
                  backgroundImage || variant === 'dark'
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
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

