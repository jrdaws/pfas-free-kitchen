import "./globals.css";

export const metadata = {
  title: "My Blog - Thoughts and Stories",
  description: "A beautiful blog built with Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        background: "#fafafa"
      }}>
        {children}
      </body>
    </html>
  );
}
