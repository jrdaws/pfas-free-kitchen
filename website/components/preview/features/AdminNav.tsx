"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, BarChart3, FileText, Bell, ChevronRight } from "lucide-react";

interface AdminNavProps {
  projectName?: string;
  variant?: "sidebar" | "header" | "compact";
  className?: string;
}

/**
 * Preview component showing admin navigation
 * Displays when admin/dashboard features are selected
 */
export function AdminNav({ 
  projectName = "Admin", 
  variant = "sidebar",
  className 
}: AdminNavProps) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Users, label: "Users", badge: "128" },
    { icon: BarChart3, label: "Analytics" },
    { icon: FileText, label: "Content" },
    { icon: Settings, label: "Settings" },
  ];

  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-6 px-4 py-2 bg-slate-900 border-b border-white/10", className)}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-white">{projectName}</span>
        </div>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                item.active ? "text-primary" : "text-white/60 hover:text-white"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("w-16 bg-slate-900 border-r border-white/10 py-4 flex flex-col items-center gap-2", className)}>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative",
              item.active 
                ? "bg-primary/20 text-primary" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] text-white flex items-center justify-center">
                {item.badge.length > 2 ? "99+" : item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className={cn("w-56 bg-slate-900 border-r border-white/10 p-4", className)}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <LayoutDashboard className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-white">{projectName}</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              item.active 
                ? "bg-primary/10 text-primary" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary">
                {item.badge}
              </span>
            )}
            {item.active && <ChevronRight className="h-3 w-3" />}
          </button>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="flex-1 text-left">Notifications</span>
          <span className="w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </div>
  );
}

