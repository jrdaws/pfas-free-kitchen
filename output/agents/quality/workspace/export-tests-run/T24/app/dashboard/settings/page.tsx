"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Overview", icon: "📊", href: "/dashboard" },
  { label: "Analytics", icon: "📈", href: "/dashboard/analytics" },
  { label: "Customers", icon: "👥", href: "/dashboard/customers" },
  { label: "Orders", icon: "🛍️", href: "/dashboard/orders" },
  { label: "Products", icon: "📦", href: "/dashboard/products" },
  { label: "Settings", icon: "⚙️", href: "/dashboard/settings", active: true },
];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

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

        {/* Settings Content */}
        <main className="flex-1 p-4 sm:p-6">
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-semibold dark:text-white">
            Settings
          </h1>

          {/* Settings Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4">
              <nav className="flex gap-4 -mb-px">
                {["profile", "billing", "team", "notifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium dark:text-white mb-4">Profile Information</h3>
                    <div className="grid gap-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue="user@example.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium w-fit">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium dark:text-white">Billing & Subscription</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium dark:text-white">Pro Plan</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">$29/month</p>
                      </div>
                      <button className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500">
                        Change Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium dark:text-white">Team Members</h3>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                      Invite Member
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "John Doe", email: "john@example.com", role: "Owner" },
                      { name: "Jane Smith", email: "jane@example.com", role: "Admin" },
                    ].map((member, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{member.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium dark:text-white">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Email notifications", description: "Receive updates via email" },
                      { label: "Push notifications", description: "Receive browser notifications" },
                      { label: "Marketing emails", description: "News and product updates" },
                    ].map((setting, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium dark:text-white">{setting.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <button className="relative w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors">
                          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


