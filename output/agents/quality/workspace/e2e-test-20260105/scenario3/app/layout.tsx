import "./globals.css";

export const metadata = {
  title: "scenario3-content",
  description: "A beautiful blog built with Next.js"
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
