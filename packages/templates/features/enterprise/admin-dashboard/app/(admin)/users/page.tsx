"use client";

import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { getRoleDisplayName, getRoleBadgeColor, Role } from "@/lib/admin/permissions";
import { MoreHorizontal, Mail, Trash2, Edit } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

// Example data - replace with real data fetching
const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "admin", status: "active", createdAt: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "editor", status: "active", createdAt: "2024-02-20" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "user", status: "inactive", createdAt: "2024-03-10" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "moderator", status: "active", createdAt: "2024-03-15" },
  { id: "5", name: "Charlie Wilson", email: "charlie@example.com", role: "user", status: "pending", createdAt: "2024-04-01" },
];

const statusStyles = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
          {row.original.name[0]}
        </div>
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(row.original.role)}`}>
        {getRoleDisplayName(row.original.role)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

function UserActions({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                console.log("Edit user:", user.id);
                setIsOpen(false);
              }}
            >
              <Edit className="h-4 w-4" />
              Edit User
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                console.log("Email user:", user.email);
                setIsOpen(false);
              }}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={() => {
                console.log("Delete user:", user.id);
                setIsOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{mockUsers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {mockUsers.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {mockUsers.filter((u) => u.status === "pending").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-orange-600">
            {mockUsers.filter((u) => u.role === "admin" || u.role === "super_admin").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <DataTable
          columns={columns}
          data={mockUsers}
          searchPlaceholder="Search users..."
          searchColumn="name"
        />
      </div>
    </div>
  );
}

