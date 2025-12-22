import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flagship SaaS",
  description: "Enterprise SaaS with entitlements, audit logs, and usage tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans m-0 bg-white dark:bg-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
