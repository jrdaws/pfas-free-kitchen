/**
 * Dashboard Pattern - Cards
 * 
 * Card-based metric dashboard.
 * Best for: Analytics, metrics, overview pages
 */

import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange";
}

interface ChartCard {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

interface DashboardCardsProps {
  title: string;
  subtitle?: string;
  metrics: MetricCard[];
  charts?: ChartCard[];
}

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  purple: "bg-purple-500/10 text-purple-500",
  orange: "bg-orange-500/10 text-orange-500",
};

export function DashboardCards({
  title,
  subtitle,
  metrics,
  charts = [],
}: DashboardCardsProps) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const color = metric.color || "blue";

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  {metric.change && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      metric.change.isPositive ? "text-green-500" : "text-red-500"
                    }`}>
                      {metric.change.isPositive ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(metric.change.value)}%</span>
                      <span className="text-gray-500">vs last month</span>
                    </div>
                  )}
                </div>
                {Icon && (
                  <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart cards */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chart.title}
                </h3>
                {chart.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chart.subtitle}
                  </p>
                )}
              </div>
              <div className="h-64">{chart.children}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardCards;

