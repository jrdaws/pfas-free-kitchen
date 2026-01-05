/**
 * Hero Split Image Section
 * 
 * Text on left, large image on right.
 * Good for product showcases.
 */

import Link from "next/link";
import Image from "next/image";

export interface HeroSplitImageProps {
  headline: string;
  subtext: string;
  cta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
  };
  features?: string[];
  reversed?: boolean;
  variant?: "light" | "dark";
}

export function HeroSplitImage({
  headline,
  subtext,
  cta,
  secondaryCta,
  image,
  features,
  reversed = false,
  variant = "light",
}: HeroSplitImageProps) {
  return (
    <section className={`py-20 lg:py-32 ${variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950"}`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${reversed ? "lg:flex-row-reverse" : ""}`}>
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight ${variant === "dark" ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {headline}
            </h1>
            
            <p className={`text-xl mb-8 max-w-xl ${variant === "dark" ? "text-gray-300" : "text-gray-600 dark:text-gray-300"}`}>
              {subtext}
            </p>

            {features && features.length > 0 && (
              <ul className="mb-8 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${variant === "dark" ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
              <Link
                href={cta.href}
                className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg text-center"
              >
                {cta.text}
              </Link>
              
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={`px-8 py-4 border font-semibold rounded-lg transition-all text-center ${
                    variant === "dark"
                      ? "border-gray-600 text-white hover:bg-gray-800"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {secondaryCta.text}
                </Link>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative w-full">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSplitImage;

