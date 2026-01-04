"use client";

import { useEffect, useState } from "react";
import { RoleEditor } from "@/components/admin/RoleEditor";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((res) => res.json())
      .then((data) => {
        setRoles(data.roles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveRole = async (role: Role) => {
    const method = role.id ? "PUT" : "POST";
    const url = role.id ? `/api/admin/roles/${role.id}` : "/api/admin/roles";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(role),
    });

    // Refresh roles
    const res = await fetch("/api/admin/roles");
    const data = await res.json();
    setRoles(data.roles || []);
    setSelectedRole(null);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    await fetch(`/api/admin/roles/${roleId}`, { method: "DELETE" });

    setRoles(roles.filter((r) => r.id !== roleId));
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Roles & Permissions</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Roles & Permissions</h1>
        <button
          onClick={() => setSelectedRole({ id: "", name: "", description: "", permissions: [] })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Role
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Role list */}
        <div className="lg:col-span-1 space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedRole?.id === role.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium dark:text-white">{role.name}</h3>
                {role.isDefault && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {role.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {role.permissions.length} permissions
              </p>
            </div>
          ))}
        </div>

        {/* Role editor */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <RoleEditor
              role={selectedRole}
              onSave={handleSaveRole}
              onDelete={selectedRole.id ? () => handleDeleteRole(selectedRole.id) : undefined}
              onCancel={() => setSelectedRole(null)}
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Select a role to edit or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

