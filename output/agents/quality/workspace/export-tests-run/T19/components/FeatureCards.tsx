"use client";

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeatureCardsProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
}

const DEFAULT_FEATURES: Feature[] = [
  { title: "Lightning Fast", description: "Built for performance with optimized builds.", icon: "⚡" },
  { title: "Fully Customizable", description: "Tailored to your needs with flexible options.", icon: "🎨" },
  { title: "Secure by Default", description: "Enterprise-grade security built-in.", icon: "🔒" },
  { title: "AI-Powered", description: "Intelligent features that adapt to you.", icon: "🤖" },
  { title: "24/7 Support", description: "Round-the-clock assistance when you need it.", icon: "💬" },
  { title: "Scale Infinitely", description: "From startup to enterprise, grow without limits.", icon: "📈" },
];

export function FeatureCards({
  title = "Why Choose Us",
  subtitle = "Everything you need to build amazing products",
  features = DEFAULT_FEATURES,
  columns = 3,
}: FeatureCardsProps) {
  const gridCols = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" };

  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-orange-500/30 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <span className="text-2xl">{feature.icon || "✨"}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;
