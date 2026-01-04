import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "from last month",
  icon: Icon,
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
        {Icon && (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trendColor}`}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="font-medium">
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

