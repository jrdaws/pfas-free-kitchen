"use client";

import { useState, useEffect } from "react";
import {
  generateReport,
  getSavedReports,
  exportReportToCsv,
  ReportConfig,
  ReportData,
  ReportType,
} from "@/lib/analytics/reports";
import { ReportChart } from "@/components/analytics/ReportChart";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "traffic", label: "Traffic Sources" },
  { value: "conversions", label: "Conversions" },
  { value: "revenue", label: "Revenue" },
];

const DATE_PRESETS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("overview");
  const [datePreset, setDatePreset] = useState("30d");
  const [report, setReport] = useState<ReportData | null>(null);
  const [savedReports, setSavedReports] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSavedReports().then(setSavedReports);
  }, []);

  const handleGenerateReport = async () => {
    setIsLoading(true);

    const days = parseInt(datePreset.replace("d", ""));
    const config: ReportConfig = {
      name: `${REPORT_TYPES.find((t) => t.value === reportType)?.label} Report`,
      type: reportType,
      dateRange: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
        preset: datePreset as "7d" | "30d" | "90d",
      },
      metrics: [],
    };

    const result = await generateReport(config);
    setReport(result);
    setIsLoading(false);
  };

  const handleExport = () => {
    if (!report) return;

    const csv = exportReportToCsv(report);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.config.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Analytics Reports</h1>
      </div>

      {/* Report builder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Generate Report</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          >
            {REPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          >
            {DATE_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report results */}
      {report && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold dark:text-white">
              {report.config.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(report.summary).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-2xl font-bold dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Breakdown table */}
          {report.breakdown && report.breakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Breakdown by {report.breakdown[0].dimension}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {report.breakdown[0].dimension}
                      </th>
                      {Object.keys(report.breakdown[0].metrics).map((metric) => (
                        <th
                          key={metric}
                          className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize"
                        >
                          {metric}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.breakdown.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 dark:text-white">{row.value}</td>
                        {Object.values(row.metrics).map((value, i) => (
                          <td key={i} className="text-right py-3 dark:text-white">
                            {typeof value === "number"
                              ? value.toLocaleString()
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chart */}
          {report.breakdown && report.breakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <ReportChart data={report.breakdown} />
            </div>
          )}
        </div>
      )}

      {/* Saved reports */}
      {savedReports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Saved Reports
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {savedReports.map((saved) => (
              <div
                key={saved.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="font-medium dark:text-white">{saved.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(saved.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

