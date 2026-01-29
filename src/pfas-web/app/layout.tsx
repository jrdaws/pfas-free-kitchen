import type { Metadata, Viewport } from 'next';
import { CompareProvider } from '@/contexts/CompareContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { EcommerceShell } from '@/components/layout/EcommerceShell';
import { ToastContainer } from '@/components/ui/Toast';
import { Analytics } from '@/components/analytics/Analytics';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pfasfreekitchen.com'),
  title: {
    default: 'PFAS-Free Kitchen | Verified Cookware & Kitchen Products',
    template: '%s | PFAS-Free Kitchen',
  },
  description:
    'Find independently verified PFAS-free cookware, bakeware, and kitchen products. Lab-tested products with transparent verification.',
  keywords: [
    'PFAS-free',
    'cookware',
    'nonstick alternatives',
    'safe cookware',
    'Teflon alternatives',
    'PTFE-free',
    'non-toxic cookware',
    'cast iron',
    'stainless steel',
    'ceramic cookware',
    'verified PFAS-free',
    'lab tested cookware',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PFAS-Free Kitchen',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PFAS-Free Kitchen - Verified Safe Cookware',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pfasfreekitchen',
    creator: '@pfasfreekitchen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://pfasfreekitchen.com',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to font providers for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Structured data for organization and search */}
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body>
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        
        <ToastProvider>
          <CompareProvider>
            <EcommerceShell>
              <main id="main-content">
                {children}
              </main>
            </EcommerceShell>
            <ToastContainer />
          </CompareProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
