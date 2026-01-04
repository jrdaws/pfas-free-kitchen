"use client";

import { useState } from "react";
import Link from "next/link";

const stats = [
  { label: "Total Revenue", value: "$45,231.89", change: "+20.1%", positive: true },
  { label: "Active Users", value: "2,350", change: "+12.3%", positive: true },
  { label: "Conversions", value: "456", change: "-3.2%", positive: false },
  { label: "Total Orders", value: "1,234", change: "+8.7%", positive: true },
];

const recentActivity = [
  { user: "Sarah Johnson", action: "Created new project", time: "2 minutes ago" },
  { user: "Mike Chen", action: "Updated settings", time: "15 minutes ago" },
  { user: "Emma Davis", action: "Completed task", time: "1 hour ago" },
  { user: "John Smith", action: "Added new member", time: "2 hours ago" },
  { user: "Lisa Brown", action: "Exported report", time: "3 hours ago" },
];

const tableData = [
  { id: "#3210", customer: "Sarah Johnson", status: "Completed", amount: "$299.00", date: "Dec 20, 2024" },
  { id: "#3209", customer: "Mike Chen", status: "Pending", amount: "$149.00", date: "Dec 20, 2024" },
  { id: "#3208", customer: "Emma Davis", status: "Completed", amount: "$499.00", date: "Dec 19, 2024" },
  { id: "#3207", customer: "John Smith", status: "Cancelled", amount: "$199.00", date: "Dec 19, 2024" },
  { id: "#3206", customer: "Lisa Brown", status: "Completed", amount: "$349.00", date: "Dec 18, 2024" },
];

const navItems = [
  { label: "Overview", icon: "📊", href: "/dashboard", active: true },
  { label: "Analytics", icon: "📈", href: "/dashboard/analytics" },
  { label: "Customers", icon: "👥", href: "/dashboard/customers" },
  { label: "Orders", icon: "🛍️", href: "/dashboard/orders" },
  { label: "Products", icon: "📦", href: "/dashboard/products" },
  { label: "Settings", icon: "⚙️", href: "/dashboard/settings" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-0"
        } md:w-60 bg-gray-800 dark:bg-gray-950 text-white transition-all duration-300 overflow-hidden flex flex-col fixed md:static h-full z-20`}
      >
        <div className="p-4 md:p-6 border-b border-gray-700 dark:border-gray-800">
          <Link href="/" className="text-lg md:text-xl font-semibold hover:text-gray-300 transition-colors">
            SaaS App
          </Link>
        </div>
        <nav className="flex-1 py-2 md:py-4">
          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base text-white no-underline ${
                item.active
                  ? "bg-gray-700 dark:bg-gray-900 border-l-[3px] border-l-blue-500"
                  : "border-l-[3px] border-l-transparent hover:bg-gray-700 dark:hover:bg-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 md:p-6 border-t border-gray-700 dark:border-gray-800">
          <div className="text-xs md:text-sm text-gray-400">Logged in as</div>
          <div className="text-sm md:text-base font-medium mt-1 truncate">user@example.com</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto w-full">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden bg-transparent border-none text-xl cursor-pointer hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <button className="bg-transparent border-none text-lg sm:text-xl cursor-pointer hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
              🔔
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              U
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6">
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-semibold dark:text-white">
            Overview
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                  {stat.label}
                </div>
                <div className="text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2 dark:text-white">
                  {stat.value}
                </div>
                <div
                  className={`text-xs sm:text-sm ${
                    stat.positive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Chart Placeholder */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold dark:text-white">
                Revenue Chart
              </h2>
              <div className="h-[250px] sm:h-[300px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm sm:text-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Chart Component</div>
                  <div className="text-xs text-gray-400 mt-1">Add your preferred charting library</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold dark:text-white">
                Recent Activity
              </h2>
              <div className="flex flex-col gap-3 sm:gap-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className={`pb-3 sm:pb-4 ${
                      i < recentActivity.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-xs sm:text-sm dark:text-white">
                      {activity.user}
                    </div>
                    <div className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold dark:text-white">
              Recent Orders
            </h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Order ID
                    </th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer
                    </th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm dark:text-gray-300">{row.id}</td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm dark:text-gray-300">{row.customer}</td>
                      <td className="p-2 sm:p-3">
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl text-xs font-medium ${
                            row.status === "Completed"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                              : row.status === "Pending"
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium dark:text-gray-200">
                        {row.amount}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {row.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


