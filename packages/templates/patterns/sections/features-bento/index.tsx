/**
 * Features Bento Section
 * 
 * Bento box layout with mixed sizes.
 */

import Image from "next/image";

interface BentoItem {
  size: "small" | "medium" | "large";
  image?: string;
  title: string;
  description: string;
  bgColor?: string;
}

export interface FeaturesBentoProps {
  headline?: string;
  subtext?: string;
  features: BentoItem[];
  variant?: "light" | "dark";
}

export function FeaturesBento({
  headline,
  subtext,
  features,
  variant = "light",
}: FeaturesBentoProps) {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 md:col-span-2 row-span-1",
    large: "col-span-1 md:col-span-2 row-span-2",
  };

  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {(headline || subtext) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto auto-rows-[200px]">
          {features.map((item, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden ${sizeClasses[item.size]} group`}
              style={{ backgroundColor: item.bgColor || "#f3f4f6" }}
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}

              <div className={`absolute inset-0 p-6 flex flex-col justify-end ${
                item.image ? "bg-gradient-to-t from-black/60 to-transparent" : ""
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${
                  item.image ? "text-white" : textClass
                }`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${
                  item.image ? "text-white/80" : subtextClass
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesBento;

