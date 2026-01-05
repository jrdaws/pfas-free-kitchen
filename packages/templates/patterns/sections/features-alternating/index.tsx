/**
 * Features Alternating Section
 * 
 * Left/right alternating with images.
 */

import Image from "next/image";
import Link from "next/link";

interface Feature {
  image: string;
  title: string;
  description: string;
  cta?: {
    text: string;
    href: string;
  };
}

export interface FeaturesAlternatingProps {
  headline?: string;
  subtext?: string;
  features: Feature[];
  variant?: "light" | "dark";
}

export function FeaturesAlternating({
  headline,
  subtext,
  features,
  variant = "light",
}: FeaturesAlternatingProps) {
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {(headline || subtext) && (
          <div className="text-center max-w-3xl mx-auto mb-20">
            {headline && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
                {headline}
              </h2>
            )}
            {subtext && (
              <p className={`text-xl ${subtextClass}`}>
                {subtext}
              </p>
            )}
          </div>
        )}

        <div className="space-y-24 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${isReversed ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${textClass}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg mb-6 ${subtextClass}`}>
                    {feature.description}
                  </p>
                  {feature.cta && (
                    <Link
                      href={feature.cta.href}
                      className="inline-flex items-center text-primary font-medium hover:underline"
                    >
                      {feature.cta.text}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesAlternating;

