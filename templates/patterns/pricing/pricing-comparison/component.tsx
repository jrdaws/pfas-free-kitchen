/**
 * Pricing Pattern - Comparison
 * 
 * Feature comparison table across plans.
 * Best for: B2B, enterprise, complex products
 */

import Link from "next/link";
import { Check, X } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  interval: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  highlighted?: boolean;
}

interface FeatureRow {
  name: string;
  values: (boolean | string)[];
}

interface FeatureCategory {
  name: string;
  features: FeatureRow[];
}

interface PricingComparisonProps {
  headline?: string;
  subtext?: string;
  plans: Plan[];
  categories: FeatureCategory[];
}

export function PricingComparison({
  headline = "Compare plans",
  subtext,
  plans,
  categories,
}: PricingComparisonProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-gray-900 dark:text-white text-sm">{value}</span>;
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headline}
          </h2>
          {subtext && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full max-w-5xl mx-auto">
            {/* Plan header */}
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
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {plan.name}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                    <Link
                      href={plan.ctaHref}
                      className={`inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                        plan.highlighted
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {plan.ctaText}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature categories */}
            <tbody>
              {categories.map((category, catIndex) => (
                <>
                  <tr key={`cat-${catIndex}`}>
                    <td
                      colSpan={plans.length + 1}
                      className="py-4 px-4 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white"
                    >
                      {category.name}
                    </td>
                  </tr>
                  
                  {category.features.map((feature, featIndex) => (
                    <tr
                      key={`feat-${catIndex}-${featIndex}`}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {feature.name}
                      </td>
                      {feature.values.map((value, valIndex) => (
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

