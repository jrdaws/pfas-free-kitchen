/**
 * Pricing Comparison Section
 * 
 * Feature comparison matrix.
 */

import Link from "next/link";
import { Check, X } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  interval?: string;
  cta: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

interface FeatureRow {
  name: string;
  availability: (boolean | string)[];
}

interface FeatureCategory {
  name: string;
  features: FeatureRow[];
}

export interface PricingComparisonProps {
  headline?: string;
  subtext?: string;
  plans: Plan[];
  categories: FeatureCategory[];
  variant?: "light" | "dark";
}

export function PricingComparison({
  headline = "Compare plans",
  subtext,
  plans,
  categories,
  variant = "light",
}: PricingComparisonProps) {
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
      );
    }
    return <span className={`text-sm ${textClass}`}>{value}</span>;
  };

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
            {headline}
          </h2>
          {subtext && (
            <p className={`text-xl ${subtextClass}`}>
              {subtext}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full max-w-5xl mx-auto">
            <thead>
              <tr>
                <th className="text-left py-6 px-4 w-1/4" />
                {plans.map((plan, index) => (
                  <th
                    key={index}
                    className={`text-center py-6 px-4 ${
                      plan.highlighted ? "bg-primary/5 rounded-t-xl" : ""
                    }`}
                  >
                    <div className={`font-bold text-lg ${textClass}`}>
                      {plan.name}
                    </div>
                    <div className="mt-2">
                      <span className={`text-3xl font-bold ${textClass}`}>
                        ${plan.price}
                      </span>
                      <span className={subtextClass}>/{plan.interval || "month"}</span>
                    </div>
                    <Link
                      href={plan.cta.href}
                      className={`inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                        plan.highlighted
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {plan.cta.text}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((category, catIndex) => (
                <>
                  <tr key={`cat-${catIndex}`}>
                    <td
                      colSpan={plans.length + 1}
                      className={`py-4 px-4 font-semibold ${
                        variant === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      {category.name}
                    </td>
                  </tr>
                  
                  {category.features.map((feature, featIndex) => (
                    <tr
                      key={`feat-${catIndex}-${featIndex}`}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className={`py-4 px-4 ${subtextClass}`}>
                        {feature.name}
                      </td>
                      {feature.availability.map((value, valIndex) => (
                        <td
                          key={valIndex}
                          className={`py-4 px-4 text-center ${
                            plans[valIndex]?.highlighted ? "bg-primary/5" : ""
                          }`}
                        >
                          {renderValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default PricingComparison;

