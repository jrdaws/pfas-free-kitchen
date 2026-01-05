import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
}

// Inline SVG icons
const ArrowUpRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const ArrowDownRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-10 10M17 7v10M17 7H7" />
  </svg>
);

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "from last month",
  icon,
  trend,
}: StatsCardProps) {
  const isPositive = trend === "up" || (change !== undefined && change >= 0);
  const trendColor = trend === "neutral" 
    ? "text-gray-500" 
    : isPositive 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        {icon && (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trendColor}`}>
          {isPositive ? <ArrowUpRight /> : <ArrowDownRight />}
          <span className="font-medium">
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
