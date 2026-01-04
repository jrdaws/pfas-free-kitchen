"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Role, hasPermission, getRoleDisplayName } from "@/lib/admin/permissions";

interface AdminSidebarProps {
  userRole: Role;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    permission: "dashboard:view",
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="h-5 w-5" />,
    permission: "users:view",
  },
  {
    label: "Content",
    href: "/dashboard/content",
    icon: <FileText className="h-5 w-5" />,
    permission: "content:view",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    permission: "analytics:view",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: <CreditCard className="h-5 w-5" />,
    permission: "billing:view",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    permission: "settings:view",
  },
];

export function AdminSidebar({
  userRole,
  userName,
  userEmail,
  userAvatar,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter nav items based on permissions
  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(userRole, item.permission as any)
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!isCollapsed && (
          <span className="text-lg font-bold text-white">Admin</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800 p-3">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          {/* Avatar */}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || "User"}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {getRoleDisplayName(userRole)}
              </p>
            </div>
          )}

          {!isCollapsed && onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

