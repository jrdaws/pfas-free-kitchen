"use client";

/**
 * Simple CSS-based chart component
 * No external dependencies - uses CSS for visualization
 */

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  color?: string;
  height?: number;
}

export function BarChart({ 
  data, 
  maxValue: providedMax, 
  color = "bg-blue-500",
  height = 200 
}: BarChartProps) {
  const maxValue = providedMax || Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 justify-between" style={{ height }}>
        {data.map((item, i) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full ${color} rounded-t-md transition-all duration-300 hover:opacity-80`}
                style={{ height: `${heightPercent}%`, minHeight: 4 }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-between mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

export function LineChart({ 
  data, 
  labels,
  color = "#3B82F6",
  height = 200 
}: LineChartProps) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  // Generate SVG path for the line
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  // Generate area fill path
  const areaPath = `M0,100 L${points} L100,100 Z`;
  const linePath = `M${points}`;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Data points */}
        {data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / range) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill="white"
              stroke={color}
              strokeWidth="0.3"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span key={i} className="text-xs text-gray-500 dark:text-gray-400">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ 
  data, 
  size = 150, 
  thickness = 20 
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {data.map((item, i) => {
          const percentage = item.value / total;
          const dashLength = percentage * circumference;
          const dashOffset = -currentOffset;
          currentOffset += dashLength;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

