/**
 * Dashboard Pattern - Sidebar
 * 
 * Fixed sidebar navigation layout.
 * Best for: SaaS admin panels, complex applications
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, LayoutDashboard, Users, Settings, FileText,
  BarChart, Bell, Menu, ChevronLeft, LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface DashboardSidebarProps {
  logo: React.ReactNode;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  children: React.ReactNode;
}

export function DashboardSidebar({
  logo,
  navItems,
  bottomItems = [],
  user,
  children,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          isActive
            ? "bg-primary text-white"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="font-medium flex-1">{item.label}</span>
            {item.badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? "bg-white/20" : "bg-primary/10 text-primary"
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && <div className="flex-1">{logo}</div>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Bottom navigation */}
        {(bottomItems.length > 0 || user) && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {bottomItems.map(renderNavItem)}
            
            {user && (
              <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 ${
                isCollapsed ? "justify-center" : ""
              }`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-primary font-semibold">{user.name[0]}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default DashboardSidebar;

