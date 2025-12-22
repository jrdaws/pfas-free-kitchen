"use client";

export default function SettingsPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>Settings</h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>Manage your account settings and preferences</p>

      {/* Profile Settings */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Profile</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Full Name
            </label>
            <input type="text" placeholder="John Doe" style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px"
            }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Email
            </label>
            <input type="email" placeholder="john@example.com" style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px"
            }} />
          </div>
          <button style={{
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            alignSelf: "flex-start"
          }}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Notifications</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Email notifications", description: "Receive email updates about your account" },
            { label: "Push notifications", description: "Receive push notifications on your devices" },
            { label: "Weekly reports", description: "Get weekly reports about your activity" }
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{item.label}</div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{item.description}</div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input type="checkbox" defaultChecked={i === 0} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: i === 0 ? "#3b82f6" : "#d1d5db",
                  borderRadius: "24px",
                  transition: "0.4s"
                }} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #fee2e2"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#dc2626" }}>Danger Zone</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
          Irreversible and destructive actions
        </p>
        <button style={{
          background: "white",
          color: "#dc2626",
          border: "1px solid #dc2626",
          borderRadius: "6px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer"
        }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
