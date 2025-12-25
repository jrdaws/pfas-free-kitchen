import { Suspense } from "react";

async function getStats() {
  // Replace with actual data fetching
  return {
    totalUsers: 1234,
    activeToday: 89,
    newThisWeek: 42,
    revenue: "$12,345",
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} />
        <StatCard title="Active Today" value={stats.activeToday.toString()} />
        <StatCard title="New This Week" value={stats.newThisWeek.toString()} color="green" />
        <StatCard title="Revenue" value={stats.revenue} color="blue" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Activity</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <ActivityList />
        </Suspense>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color = "default",
}: {
  title: string;
  value: string;
  color?: "default" | "green" | "blue";
}) {
  const colorClasses = {
    default: "bg-white dark:bg-gray-800",
    green: "bg-green-50 dark:bg-green-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6 shadow`}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
  );
}

async function ActivityList() {
  // Replace with actual data fetching
  const activities = [
    { id: 1, action: "User signed up", user: "john@example.com", time: "2 min ago" },
    { id: 2, action: "Order placed", user: "jane@example.com", time: "15 min ago" },
    { id: 3, action: "Product added", user: "admin@example.com", time: "1 hour ago" },
  ];

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {activities.map((activity) => (
        <li key={activity.id} className="py-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium dark:text-white">{activity.action}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</p>
          </div>
          <span className="text-xs text-gray-400">{activity.time}</span>
        </li>
      ))}
    </ul>
  );
}

