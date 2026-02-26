import Link from 'next/link';
import Image from 'next/image';
import { Newsletter } from './Newsletter';
import styles from './EcommerceFooter.module.css';

const FOOTER_LINKS = {
  shop: {
    title: 'Shop',
    links: [
      { name: 'Cookware', href: '/search?category=cookware' },
      { name: 'Bakeware', href: '/search?category=bakeware' },
      { name: 'Food Storage', href: '/search?category=storage' },
      { name: 'Utensils', href: '/search?category=utensils' },
      { name: 'All Products', href: '/search' },
      { name: 'Compare', href: '/compare' },
    ],
  },
  learn: {
    title: 'Learn',
    links: [
      { name: 'What is PFAS?', href: '/learn/what-is-pfas' },
      { name: 'How We Verify', href: '/learn/how-we-verify' },
      { name: 'Buyer\'s Guide', href: '/learn/buyers-guide' },
      { name: 'FAQ', href: '/faq' },
    ],
  },
  about: {
    title: 'About',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/about#mission' },
      { name: 'Affiliate Disclosure', href: '/disclosure' },
      { name: 'Contact', href: '/about#contact' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Us', href: '/about#contact' },
      { name: 'Report an Issue', href: '/report' },
      { name: 'Suggest a Product', href: '/about#contact' },
    ],
  },
};

const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.548.091a9.02 9.02 0 01-2.934 0l-.548-.091c-1.717-.293-2.299-2.379-1.067-3.61L16.2 15.3" />
      </svg>
    ),
    label: 'Independent Testing',
    description: 'Third-party lab verified',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    label: 'No Sponsored Rankings',
    description: 'Verification-based only',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: 'FTC Compliant',
    description: 'Transparent disclosures',
  },
];

export function EcommerceFooter() {
  return (
    <footer className={styles.footer}>
      {/* Main footer content */}
      <div className={styles.main}>
        <div className={styles.container}>
          {/* Logo and description */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/logo.png" 
                alt="PFAS-Free Kitchen" 
                width={40} 
                height={40} 
                className={styles.logoImage}
              />
              <div className={styles.logoText}>
                <span className={styles.logoMain}>PFAS-Free Kitchen</span>
              </div>
            </Link>
            <p className={styles.description}>
              Helping you find verified PFAS-free cookware, bakeware, and kitchen products 
              through independent testing and transparent verification.
            </p>
          </div>

          {/* Link columns */}
          <div className={styles.links}>
            {Object.entries(FOOTER_LINKS).map(([key, section]) => (
              <div key={key} className={styles.column}>
                <h3 className={styles.columnTitle}>{section.title}</h3>
                <ul className={styles.columnList}>
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.columnLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustBadges}>
            {TRUST_BADGES.map((badge, index) => (
              <div key={index} className={styles.trustBadge}>
                <div className={styles.trustIcon}>{badge.icon}</div>
                <div className={styles.trustContent}>
                  <span className={styles.trustLabel}>{badge.label}</span>
                  <span className={styles.trustDescription}>{badge.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <p>© {new Date().getFullYear()} PFAS-Free Kitchen. All rights reserved.</p>
            </div>
            
            <div className={styles.legalLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/disclosure">Affiliate Disclosure</Link>
            </div>
          </div>
          
          <p className={styles.affiliateDisclosure}>
            As an Amazon Associate and affiliate partner, we earn from qualifying purchases. 
            Product rankings are based solely on our verification process, not affiliate relationships.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default EcommerceFooter;
