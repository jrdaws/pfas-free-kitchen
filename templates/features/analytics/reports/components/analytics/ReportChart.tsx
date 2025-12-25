"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface BreakdownData {
  dimension: string;
  value: string;
  metrics: Record<string, number>;
}

interface ReportChartProps {
  data: BreakdownData[];
  type?: "bar" | "pie";
  height?: number;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ReportChart({
  data,
  type = "bar",
  height = 300,
}: ReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data to display
      </div>
    );
  }

  // Get the first metric key for the chart
  const metricKey = Object.keys(data[0].metrics)[0];

  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.value,
    value: item.metrics[metricKey],
  }));

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Bar chart (default)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "none",
            borderRadius: "8px",
            color: "white",
          }}
          formatter={(value: number) => [value.toLocaleString(), metricKey]}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Simple metric display component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel = "vs last period",
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold dark:text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% {changeLabel}
        </p>
      )}
    </div>
  );
}

/**
 * Sparkline for inline trends
 */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#3b82f6",
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

