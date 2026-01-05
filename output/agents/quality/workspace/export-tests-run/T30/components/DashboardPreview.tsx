"use client";

import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  change?: number;
}

interface DashboardPreviewProps {
  stats?: Stat[];
  chartType?: "bar" | "line" | "area";
  showSidebar?: boolean;
}

const defaultStats: Stat[] = [
  { label: "Total Users", value: "12,453", change: 12.5 },
  { label: "Revenue", value: "$45,231", change: 8.2 },
  { label: "Active Sessions", value: "1,234", change: -2.4 },
  { label: "Conversion Rate", value: "3.24%", change: 15.3 },
];

export function DashboardPreview({
  stats = defaultStats,
  chartType = "area",
  showSidebar = true,
}: DashboardPreviewProps) {
  return (
    <section className="w-full min-h-[600px] bg-[#0A0A0A]">
      <div className="flex h-full">
        {/* Sidebar */}
        {showSidebar && (
          <div className="hidden md:flex flex-col w-64 bg-[#050505] border-r border-white/5 p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500" />
              <span className="text-white font-semibold">Dashboard</span>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {["Overview", "Analytics", "Customers", "Products", "Reports", "Settings"].map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                    i === 0
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-[#111111] rounded-lg text-sm text-gray-400">
                Last 7 days
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-xl p-4 border border-white/5"
              >
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                {stat.change !== undefined && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-1 rounded",
                      stat.change >= 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    <svg
                      className={cn("w-3 h-3", stat.change < 0 && "rotate-180")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="bg-[#111111] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-medium">Revenue Overview</h3>
              <div className="flex gap-2">
                {["7D", "30D", "90D", "1Y"].map((period, i) => (
                  <button
                    key={period}
                    className={cn(
                      "px-3 py-1 rounded text-xs",
                      i === 1
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {Array.from({ length: 12 }).map((_, i) => {
                const height = Math.random() * 0.6 + 0.2;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "w-full rounded-t",
                        chartType === "bar" && "bg-indigo-500",
                        chartType === "area" && "bg-gradient-to-t from-indigo-500/20 to-indigo-500",
                        chartType === "line" && "bg-indigo-500"
                      )}
                      style={{ height: `${height * 100}%` }}
                    />
                    <span className="text-xs text-gray-600">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

