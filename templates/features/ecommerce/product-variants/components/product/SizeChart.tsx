"use client";

import { useState } from "react";

interface SizeChartEntry {
  size: string;
  measurements: Record<string, string>;
}

interface SizeChartProps {
  entries: SizeChartEntry[];
  measurementLabels?: Record<string, string>;
  unit?: "in" | "cm";
  className?: string;
}

export function SizeChart({
  entries,
  measurementLabels = {},
  unit = "in",
  className = "",
}: SizeChartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const measurementKeys =
    entries.length > 0 ? Object.keys(entries[0].measurements) : [];

  const getLabel = (key: string) => measurementLabels[key] || key;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        Size Chart
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">Size Chart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              All measurements are in {unit === "in" ? "inches" : "centimeters"}.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Size
                    </th>
                    {measurementKeys.map((key) => (
                      <th
                        key={key}
                        className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize"
                      >
                        {getLabel(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.size}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-2 px-3 font-medium dark:text-white">
                        {entry.size}
                      </td>
                      {measurementKeys.map((key) => (
                        <td key={key} className="py-2 px-3 dark:text-gray-300">
                          {entry.measurements[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Tip:</strong> If you're between sizes, we recommend sizing up
                for a more comfortable fit.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

