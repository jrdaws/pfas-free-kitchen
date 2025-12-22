import "./globals.css";

export const metadata = {
  title: "Dashboard - Admin Panel",
  description: "Modern admin dashboard built with Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans m-0 bg-gray-50">
        {children}
      </body>
    </html>
  );
}
