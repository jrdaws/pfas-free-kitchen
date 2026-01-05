/**
 * App Layout
 * 
 * Authenticated app layout with sidebar navigation.
 * Use for: Dashboard, settings, admin pages
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Settings, HelpCircle, Menu, X, LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  logoText?: string;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function AppLayout({
  children,
  logoText = "App",
  navItems,
  bottomItems = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help", href: "/help", icon: HelpCircle },
  ],
  user,
  onLogout,
}: AppLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-white"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            isActive ? "bg-white/20" : "bg-primary/10 text-primary"
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            {logoText}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {bottomItems.map(renderNavItem)}
          
          {user && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-primary font-semibold">{user.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          {logoText}
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map(renderNavItem)}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
                {bottomItems.map(renderNavItem)}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:p-0 pt-16">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;

