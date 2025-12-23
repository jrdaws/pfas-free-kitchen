import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "SaaS Demo" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans m-0 bg-white dark:bg-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
