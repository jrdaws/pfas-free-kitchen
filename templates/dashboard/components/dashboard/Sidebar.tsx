"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface SidebarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  logoText?: string;
  isOpen?: boolean;
  onClose?: () => void;
  footer?: React.ReactNode;
}

export function Sidebar({
  items,
  logo,
  logoText = "Dashboard",
  isOpen = true,
  onClose,
  footer,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {logo || (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
            )}
            <span className="font-semibold text-lg">{logoText}</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white border-l-3 border-blue-500"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white border-l-3 border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-800">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

