/**
 * Logos Marquee Section
 * 
 * Scrolling logo banner.
 */

import Image from "next/image";

interface Logo {
  src: string;
  alt: string;
  url?: string;
}

export interface LogosMarqueeProps {
  headline?: string;
  logos: Logo[];
  animated?: boolean;
  grayscale?: boolean;
  variant?: "light" | "dark";
}

export function LogosMarquee({
  headline = "Trusted by industry leaders",
  logos,
  animated = true,
  grayscale = true,
  variant = "light",
}: LogosMarqueeProps) {
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-500 dark:text-gray-400";

  const LogoImage = ({ logo }: { logo: Logo }) => {
    const img = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={120}
        height={40}
        className={`h-8 w-auto object-contain transition-all ${
          grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : ""
        }`}
      />
    );

    if (logo.url) {
      return (
        <a href={logo.url} target="_blank" rel="noopener noreferrer" className="block">
          {img}
        </a>
      );
    }

    return img;
  };

  return (
    <section className={`py-16 lg:py-24 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {headline && (
          <p className={`text-sm font-medium uppercase tracking-wider text-center mb-12 ${subtextClass}`}>
            {headline}
          </p>
        )}

        {animated ? (
          <div className="relative overflow-hidden">
            <div className="flex gap-16 animate-marquee">
              {[...logos, ...logos].map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <LogoImage logo={logo} />
                </div>
              ))}
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
            `}</style>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-5xl mx-auto">
            {logos.map((logo, index) => (
              <LogoImage key={index} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LogosMarquee;

