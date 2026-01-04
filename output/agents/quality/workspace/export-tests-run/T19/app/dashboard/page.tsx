export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl">
          <p className="text-muted-foreground text-sm">Total Users</p>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="p-6 border rounded-xl">
          <p className="text-muted-foreground text-sm">Revenue</p>
          <p className="text-3xl font-bold">$12,345</p>
        </div>
        <div className="p-6 border rounded-xl">
          <p className="text-muted-foreground text-sm">Active Now</p>
          <p className="text-3xl font-bold">42</p>
        </div>
      </div>
    </main>
  );
}
