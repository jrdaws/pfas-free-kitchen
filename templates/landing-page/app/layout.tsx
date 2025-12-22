import "./globals.css";

export const metadata = {
  title: "Your Product - Tagline Here",
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
      <body style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        background: "white"
      }}>
        {children}
      </body>
    </html>
  );
}
