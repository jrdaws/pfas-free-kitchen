"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  slug: string;
  name: string;
}

interface TenantSwitcherProps {
  currentTenantId: string;
}

export function TenantSwitcher({ currentTenantId }: TenantSwitcherProps) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentTenant = tenants.find((t) => t.id === currentTenantId);

  useEffect(() => {
    fetch("/api/user/tenants")
      .then((res) => res.json())
      .then((data) => {
        setTenants(data.tenants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSwitch = (tenant: Tenant) => {
    setIsOpen(false);
    router.push(`/${tenant.slug}`);
  };

  if (loading || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
          {currentTenant?.name.charAt(0).toUpperCase()}
        </span>
        <span className="dark:text-white">{currentTenant?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                Switch Workspace
              </p>
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSwitch(tenant)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                    tenant.id === currentTenantId
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="dark:text-white flex-1 text-left">{tenant.name}</span>
                  {tenant.id === currentTenantId && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <a
                href="/create-workspace"
                className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workspace
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

