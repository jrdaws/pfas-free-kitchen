"use client";
import { useState } from "react";
import { EntitlementsCard } from "./components/EntitlementsCard";
import { AuditLogCard } from "./components/AuditLogCard";
import { UsageCard } from "./components/UsageCard";
import { ProviderHealthCard } from "./components/ProviderHealthCard";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} md:w-60 bg-gray-800 dark:bg-gray-950 text-white transition-all duration-300 overflow-hidden flex flex-col fixed md:static h-full z-20`}>
        <div className="p-4 md:p-6 border-b border-gray-700 dark:border-gray-800">
          <h2 className="m-0 text-lg md:text-xl font-bold">Flagship SaaS</h2>
        </div>
        <nav className="flex-1 py-2 md:py-4">
          {[
            { label: "Dashboard", icon: "📊", active: true },
            { label: "Entitlements", icon: "🔐" },
            { label: "Audit Logs", icon: "📝" },
            { label: "Usage", icon: "📈" },
            { label: "Providers", icon: "🔌" },
            { label: "Settings", icon: "⚙️" }
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base text-white no-underline ${item.active ? 'bg-gray-700 dark:bg-gray-900 border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent hover:bg-gray-700 dark:hover:bg-gray-900'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 md:p-6 border-t border-gray-700 dark:border-gray-800">
          <div className="text-xs md:text-sm text-gray-400">Logged in as</div>
          <div className="text-sm md:text-base font-medium mt-1 truncate">admin@example.com</div>
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
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold dark:text-white mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Flagship SaaS Template - Demonstrating advanced features
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <EntitlementsCard />
            <UsageCard />
            <AuditLogCard />
            <ProviderHealthCard />
          </div>

          {/* Info Section */}
          <div className="mt-6 sm:mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🚀 Flagship Template Features
            </h3>
            <ul className="text-sm sm:text-base text-blue-800 dark:text-blue-200 space-y-1 sm:space-y-2">
              <li>✓ <strong>Entitlements System:</strong> Role-based capability checks with can() helper</li>
              <li>✓ <strong>Audit Logs:</strong> Append-only event tracking for compliance</li>
              <li>✓ <strong>Usage Budgets:</strong> Track API calls, tokens, and enforce limits</li>
              <li>✓ <strong>Provider Health:</strong> Aggregated health status for all integrations</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
