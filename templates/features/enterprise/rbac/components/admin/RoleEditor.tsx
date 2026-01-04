"use client";

import { useState } from "react";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  getPermissionsByCategory,
} from "@/lib/auth/permissions";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RoleEditorProps {
  role: Role;
  onSave: (role: Role) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function RoleEditor({ role, onSave, onDelete, onCancel }: RoleEditorProps) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [saving, setSaving] = useState(false);

  const permissionsByCategory = getPermissionsByCategory();

  const handleTogglePermission = (permissionId: string) => {
    if (permissions.includes(permissionId)) {
      setPermissions(permissions.filter((p) => p !== permissionId));
    } else {
      setPermissions([...permissions, permissionId]);
    }
  };

  const handleToggleCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category as keyof typeof permissionsByCategory];
    const allSelected = categoryPermissions.every((p) => permissions.includes(p.id));

    if (allSelected) {
      setPermissions(permissions.filter((p) => !categoryPermissions.some((cp) => cp.id === p)));
    } else {
      const newPermissions = [...permissions];
      for (const p of categoryPermissions) {
        if (!newPermissions.includes(p.id)) {
          newPermissions.push(p.id);
        }
      }
      setPermissions(newPermissions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ id: role.id, name, description, permissions });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        {role.id ? "Edit Role" : "Create Role"}
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Role Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-4 dark:text-white">Permissions</h3>
        <div className="space-y-4">
          {PERMISSION_CATEGORIES.map((category) => {
            const categoryPermissions = permissionsByCategory[category.id];
            const selectedCount = categoryPermissions.filter((p) =>
              permissions.includes(p.id)
            ).length;
            const allSelected = selectedCount === categoryPermissions.length;

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => handleToggleCategory(category.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="font-medium dark:text-white">{category.label}</span>
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCount}/{categoryPermissions.length}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {categoryPermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission.id)}
                        onChange={() => handleTogglePermission(permission.id)}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <div>
                        <p className="text-sm dark:text-gray-300">{permission.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete Role
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </form>
  );
}

