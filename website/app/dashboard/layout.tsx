import { Metadata } from "next";
import Link from "next/link";
import { 
  Settings, 
  LinkIcon, 
  User, 
  Home, 
  FolderOpen, 
  Download,
  CreditCard,
  Key,
  Layout,
  Activity,
  Webhook,
  Bot,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - Dawson Does Framework",
  description: "Manage your connected services and project settings",
};

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: Home },
      { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
      { href: "/dashboard/exports", label: "Export History", icon: Download },
      { href: "/dashboard/templates", label: "Templates", icon: Layout },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
      { href: "/dashboard/services", label: "Services", icon: LinkIcon },
      { href: "/dashboard/keys", label: "API Keys", icon: Key },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/activity", label: "Activity", icon: Activity },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-border bg-card">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DD</span>
              </div>
              <span className="font-semibold text-foreground">Dashboard</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Link 
              href="/configure"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DD</span>
              </div>
              <span className="font-semibold text-foreground">Dashboard</span>
            </Link>
            
            {/* Mobile nav - simplified for header */}
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Home className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/projects"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <FolderOpen className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/assistant"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Bot className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/profile"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <User className="w-5 h-5" />
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
