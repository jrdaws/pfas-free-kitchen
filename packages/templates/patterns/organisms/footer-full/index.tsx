/**
 * Footer Full Organism
 * 
 * Comprehensive footer with sitemap and newsletter.
 */

import Link from "next/link";

interface LinkGroup {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

interface SocialLink {
  platform: string;
  href: string;
}

export interface FooterFullProps {
  logo: React.ReactNode;
  description?: string;
  linkGroups: LinkGroup[];
  socialLinks?: SocialLink[];
  showNewsletter?: boolean;
  companyName?: string;
  variant?: "default" | "dark";
}

export function FooterFull({
  logo,
  description,
  linkGroups,
  socialLinks = [],
  showNewsletter = false,
  companyName = "Company",
  variant = "default",
}: FooterFullProps) {
  const year = new Date().getFullYear();

  const bgClass = variant === "dark" 
    ? "bg-gray-900 text-white" 
    : "bg-gray-50 dark:bg-gray-900";

  return (
    <footer className={`border-t border-gray-200 dark:border-gray-800 ${bgClass}`}>
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="mb-4">{logo}</div>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                {description}
              </p>
            )}
            
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social.platform}</span>
                    <span className="text-sm font-bold uppercase">{social.platform[0]}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {showNewsletter && (
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get the latest updates and news directly in your inbox.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {year} {companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterFull;

