import { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/email-auth";
import { isAdmin } from "@/lib/admin/permissions";
import { redirect } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const hasAccess = await isAdmin(user.id);
  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

