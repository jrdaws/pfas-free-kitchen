import "./globals.css";

export const metadata = {
  title: "T10-DashboardAuthAnalytics",
  description: "Modern admin dashboard built with Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans m-0 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
