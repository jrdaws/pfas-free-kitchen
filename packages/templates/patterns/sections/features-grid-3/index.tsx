/**
 * Features Grid 3 Section
 * 
 * 3 column grid with icons.
 */

import { 
  Zap, Shield, Rocket, Heart, Star, Check, Clock, 
  Users, Settings, BarChart, Lock, Globe, Sparkles,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  zap: Zap, shield: Shield, rocket: Rocket, heart: Heart,
  star: Star, check: Check, clock: Clock, users: Users,
  settings: Settings, chart: BarChart, lock: Lock, globe: Globe,
  sparkles: Sparkles,
};

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesGrid3Props {
  headline?: string;
  subtext?: string;
  features: Feature[];
  variant?: "light" | "dark" | "cards";
}

export function FeaturesGrid3({
  headline,
  subtext,
  features,
  variant = "light",
}: FeaturesGrid3Props) {
  const bgClass = variant === "dark" ? "bg-gray-900" : variant === "cards" ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-950";
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Zap;
            
            return (
              <div
                key={index}
                className={`p-8 rounded-xl transition-shadow ${
                  variant === "cards"
                    ? "bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                    : ""
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>
                  {feature.title}
                </h3>
                <p className={subtextClass}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesGrid3;

