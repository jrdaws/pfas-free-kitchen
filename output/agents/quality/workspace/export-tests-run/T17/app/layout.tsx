import "./globals.css";

export const metadata = {
  title: "test-t17",
  description: "Beautiful landing page built with Next.js and Tailwind CSS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `
          }}
        />
      </head>
      <body className="font-sans m-0 bg-white dark:bg-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
