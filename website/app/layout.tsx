import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dawson.does.framework'),
  title: '@jrdaws/framework - Ship faster with trusted scaffolding',
  description:
    'From idea to production in minutes, not days. A CLI scaffolding system with plugins, templates, and provider integrations.',
  keywords: ['framework', 'scaffolding', 'CLI', 'templates', 'nextjs', 'saas', 'typescript'],
  authors: [{ name: 'jrdaws' }],
  openGraph: {
    title: '@jrdaws/framework',
    description: 'From idea to production in minutes, not days',
    type: 'website',
    images: ['/images/redesign/screenshots/dashboard-preview.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '@jrdaws/framework',
    description: 'From idea to production in minutes, not days',
    images: ['/images/redesign/screenshots/dashboard-preview.webp'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
