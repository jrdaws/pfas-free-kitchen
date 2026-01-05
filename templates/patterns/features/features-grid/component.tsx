/**
 * Features Pattern - Grid
 * 
 * 3-column grid with icons.
 * Best for: SaaS, product features, capabilities
 */

import { 
  Zap, Shield, Rocket, Heart, Star, Check, Clock, 
  Users, Settings, BarChart, Lock, Globe,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  zap: Zap, shield: Shield, rocket: Rocket, heart: Heart,
  star: Star, check: Check, clock: Clock, users: Users,
  settings: Settings, chart: BarChart, lock: Lock, globe: Globe,
};

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesGridProps {
  headline: string;
  subtext?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export function FeaturesGrid({
  headline,
  subtext,
  features,
  columns = 3,
}: FeaturesGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headline}
          </h2>
          {subtext && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        {/* Features grid */}
        <div className={`grid ${gridCols[columns]} gap-8 max-w-6xl mx-auto`}>
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Zap;
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
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

export default FeaturesGrid;

