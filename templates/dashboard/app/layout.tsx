import "./globals.css";

export const metadata = {
  title: "Dashboard - Admin Panel",
  description: "Modern admin dashboard built with Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        background: "#f9fafb"
      }}>
        {children}
      </body>
    </html>
  );
}
