import Link from 'next/link';
import styles from './Footer.module.css';

const FOOTER_LINKS = {
  browse: {
    title: 'Browse',
    links: [
      { href: '/cookware', label: 'Cookware' },
      { href: '/bakeware', label: 'Bakeware' },
      { href: '/food-storage', label: 'Food Storage' },
      { href: '/compare', label: 'Compare Products' },
    ],
  },
  learn: {
    title: 'Learn',
    links: [
      { href: '/education', label: 'Education Hub' },
      { href: '/education/how-we-verify', label: 'How We Verify' },
      { href: '/education/pfoa-vs-pfas', label: 'PFOA vs PFAS' },
      { href: '/education/tier-guide', label: 'Tier Guide' },
    ],
  },
  about: {
    title: 'About',
    links: [
      { href: '/about', label: 'Our Mission' },
      { href: '/disclosure', label: 'Affiliate Disclosure' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer */}
        <div className={styles.main}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🍳</span>
              <span className={styles.logoText}>
                PFAS-Free<span className={styles.logoAccent}>Kitchen</span>
              </span>
            </Link>
            <p className={styles.tagline}>
              Helping you find cookware that&apos;s free from forever chemicals.
            </p>
          </div>

          {/* Link Columns */}
          <div className={styles.columns}>
            {Object.entries(FOOTER_LINKS).map(([key, section]) => (
              <div key={key} className={styles.column}>
                <h3 className={styles.columnTitle}>{section.title}</h3>
                <ul className={styles.columnLinks}>
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclosure Banner */}
        <div className={styles.disclosure}>
          <p>
            <strong>Affiliate Disclosure:</strong> PFAS-Free Kitchen may earn a commission 
            when you purchase through links on our site. This helps support our research 
            and verification efforts.{' '}
            <Link href="/disclosure" className={styles.disclosureLink}>
              Learn more →
            </Link>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} PFAS-Free Kitchen. All rights reserved.
          </p>
          <p className={styles.disclaimer}>
            Product information is provided for educational purposes. Always verify 
            current materials with manufacturers.
          </p>
        </div>
      </div>
    </footer>
  );
}
