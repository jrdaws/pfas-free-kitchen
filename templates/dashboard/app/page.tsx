"use client";
import { useState } from "react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: "Total Revenue", value: "$45,231.89", change: "+20.1%", positive: true },
    { label: "Active Users", value: "2,350", change: "+12.3%", positive: true },
    { label: "Conversions", value: "456", change: "-3.2%", positive: false },
    { label: "Total Orders", value: "1,234", change: "+8.7%", positive: true }
  ];

  const recentActivity = [
    { user: "Sarah Johnson", action: "Created new project", time: "2 minutes ago" },
    { user: "Mike Chen", action: "Updated settings", time: "15 minutes ago" },
    { user: "Emma Davis", action: "Completed task", time: "1 hour ago" },
    { user: "John Smith", action: "Added new member", time: "2 hours ago" },
    { user: "Lisa Brown", action: "Exported report", time: "3 hours ago" }
  ];

  const tableData = [
    { id: "#3210", customer: "Sarah Johnson", status: "Completed", amount: "$299.00", date: "Dec 20, 2024" },
    { id: "#3209", customer: "Mike Chen", status: "Pending", amount: "$149.00", date: "Dec 20, 2024" },
    { id: "#3208", customer: "Emma Davis", status: "Completed", amount: "$499.00", date: "Dec 19, 2024" },
    { id: "#3207", customer: "John Smith", status: "Cancelled", amount: "$199.00", date: "Dec 19, 2024" },
    { id: "#3206", customer: "Lisa Brown", status: "Completed", amount: "$349.00", date: "Dec 18, 2024" }
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "240px" : "0",
        background: "#1f2937",
        color: "white",
        transition: "width 0.3s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #374151" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Dashboard</h2>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { label: "Overview", icon: "📊", active: true },
            { label: "Analytics", icon: "📈" },
            { label: "Customers", icon: "👥" },
            { label: "Orders", icon: "🛍️" },
            { label: "Products", icon: "📦" },
            { label: "Settings", icon: "⚙️" }
          ].map((item, i) => (
            <a key={i} href={item.label === "Settings" ? "/settings" : "#"} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              color: "white",
              textDecoration: "none",
              background: item.active ? "#374151" : "transparent",
              borderLeft: item.active ? "3px solid #3b82f6" : "3px solid transparent"
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: "24px", borderTop: "1px solid #374151" }}>
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Logged in as</div>
          <div style={{ fontWeight: "500", marginTop: "4px" }}>admin@example.com</div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Header */}
        <header style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer"
          }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer"
            }}>🔔</button>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600"
            }}>A</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main style={{ flex: 1, padding: "24px" }}>
          <h1 style={{ margin: "0 0 24px 0", fontSize: "28px", fontWeight: "600" }}>Overview</h1>

          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "24px"
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: "white",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>{stat.value}</div>
                <div style={{ fontSize: "14px", color: stat.positive ? "#10b981" : "#ef4444" }}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
            {/* Chart Placeholder */}
            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>Revenue Chart</h2>
              <div style={{
                height: "300px",
                background: "linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px"
              }}>
                Chart Component Placeholder
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>Recent Activity</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {recentActivity.map((activity, i) => (
                  <div key={i} style={{ paddingBottom: "16px", borderBottom: i < recentActivity.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>{activity.user}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{activity.action}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>Recent Orders</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Order ID</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Customer</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Amount</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{row.id}</td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{row.customer}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: row.status === "Completed" ? "#dcfce7" : row.status === "Pending" ? "#fef3c7" : "#fee2e2",
                          color: row.status === "Completed" ? "#166534" : row.status === "Pending" ? "#92400e" : "#991b1b"
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500" }}>{row.amount}</td>
                      <td style={{ padding: "12px", fontSize: "14px", color: "#6b7280" }}>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
