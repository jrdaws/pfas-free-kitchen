import { redirect, notFound } from "next/navigation";
import { getTenantBySlug, hasTenanAccess } from "@/lib/tenants/tenant-manager";
import { createClient } from "@/lib/supabase";
import { TenantSwitcher } from "@/components/tenant/TenantSwitcher";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: { tenant: string };
}

async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const tenant = await getTenantBySlug(params.tenant);

  if (!tenant) {
    notFound();
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/${params.tenant}`);
  }

  const hasAccess = await hasTenanAccess(user.id, tenant.id);

  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tenant header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant.settings?.logo ? (
              <img
                src={tenant.settings.logo}
                alt={tenant.name}
                className="h-8"
              />
            ) : (
              <span className="font-bold text-xl dark:text-white">
                {tenant.name}
              </span>
            )}
          </div>
          <TenantSwitcher currentTenantId={tenant.id} />
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}

