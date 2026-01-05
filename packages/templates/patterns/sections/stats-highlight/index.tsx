/**
 * Stats Highlight Section
 * 
 * Key metrics/numbers display.
 */

interface Stat {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsHighlightProps {
  headline?: string;
  subtext?: string;
  stats: Stat[];
  variant?: "light" | "dark" | "primary";
}

export function StatsHighlight({
  headline,
  subtext,
  stats,
  variant = "light",
}: StatsHighlightProps) {
  const bgClasses = {
    light: "bg-white dark:bg-gray-950",
    dark: "bg-gray-900",
    primary: "bg-primary",
  };

  const textClasses = {
    light: "text-gray-900 dark:text-white",
    dark: "text-white",
    primary: "text-white",
  };

  const subtextClasses = {
    light: "text-gray-600 dark:text-gray-400",
    dark: "text-gray-400",
    primary: "text-white/80",
  };

  return (
    <section className={`py-16 lg:py-24 ${bgClasses[variant]}`}>
      <div className="container mx-auto px-4">
        {(headline || subtext) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {headline && (
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClasses[variant]}`}>
                {headline}
              </h2>
            )}
            {subtext && (
              <p className={`text-xl ${subtextClasses[variant]}`}>
                {subtext}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto ${
          !headline && !subtext ? "" : "mt-8"
        }`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${textClasses[variant]}`}>
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className={subtextClasses[variant]}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsHighlight;

