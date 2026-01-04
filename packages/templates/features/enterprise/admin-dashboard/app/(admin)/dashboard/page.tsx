import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

// Example data - replace with real data fetching
async function getDashboardStats() {
  return {
    users: { value: 2847, change: 12.5 },
    revenue: { value: 45231, change: 8.2 },
    orders: { value: 1234, change: -3.1 },
    conversionRate: { value: 3.2, change: 0.4 },
  };
}

async function getRecentActivity() {
  return [
    { id: 1, type: "user", message: "New user registered: john@example.com", time: "2 mins ago" },
    { id: 2, type: "order", message: "New order #1234 - $99.00", time: "15 mins ago" },
    { id: 3, type: "payment", message: "Payment received for order #1230", time: "1 hour ago" },
    { id: 4, type: "user", message: "User upgraded to Pro plan", time: "2 hours ago" },
    { id: 5, type: "system", message: "System backup completed", time: "3 hours ago" },
  ];
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const activity = await getRecentActivity();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid>
        <StatsCard
          title="Total Users"
          value={stats.users.value}
          change={stats.users.change}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Revenue"
          value={stats.revenue.value}
          change={stats.revenue.change}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Orders"
          value={stats.orders.value}
          change={stats.orders.change}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatsCard
          title="Conversion Rate"
          value={stats.conversionRate.value}
          change={stats.conversionRate.change}
          format="percent"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </StatsGrid>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activity.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
          <h3 className="font-medium">Add New User</h3>
          <p className="text-sm text-muted-foreground mt-1">Create a new user account</p>
        </button>
        <button className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
          <h3 className="font-medium">View Reports</h3>
          <p className="text-sm text-muted-foreground mt-1">Analytics and insights</p>
        </button>
        <button className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
          <h3 className="font-medium">System Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure your application</p>
        </button>
      </div>
    </div>
  );
}

