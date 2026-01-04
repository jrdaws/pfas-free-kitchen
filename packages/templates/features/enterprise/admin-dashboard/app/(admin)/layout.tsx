import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { canAccessDashboard, Role } from "@/lib/admin/permissions";

// TODO: Replace with your auth solution
async function getUser() {
  // Example: Check session and return user with role
  // const session = await getServerSession();
  // if (!session?.user) return null;
  // const user = await db.user.findUnique({ where: { id: session.user.id } });
  // return user;
  
  // Placeholder: Return mock admin user
  return {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as Role,
    avatarUrl: undefined,
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Redirect if user doesn't have dashboard access
  if (!canAccessDashboard(user.role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        userRole={user.role}
        userName={user.name}
        userEmail={user.email}
        userAvatar={user.avatarUrl}
        // onLogout is client-side, handle via client component if needed
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

