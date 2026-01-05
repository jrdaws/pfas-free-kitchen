/**
 * Marketing Layout
 * 
 * Public-facing pages layout with header and footer.
 * Use for: Landing pages, marketing pages, blog
 */

import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

interface MarketingLayoutProps {
  children: React.ReactNode;
  logoText?: string;
  logoSrc?: string;
  navItems?: NavItem[];
  ctaText?: string;
  ctaHref?: string;
  footerLinks?: {
    title: string;
    links: NavItem[];
  }[];
}

export function MarketingLayout({
  children,
  logoText = "Company",
  navItems = [],
  ctaText = "Get Started",
  ctaHref = "/signup",
  footerLinks = [],
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              {logoText}
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <Link
              href={ctaHref}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} {logoText}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingLayout;

