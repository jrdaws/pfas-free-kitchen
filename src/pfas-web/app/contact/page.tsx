import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox } from '@/components/content';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us - PFAS-Free Kitchen',
  description: 'Get in touch with PFAS-Free Kitchen. Contact us for general inquiries, product suggestions, error reports, or brand verification.',
  keywords: ['contact', 'email', 'support', 'feedback', 'product suggestion'],
};

interface ContactCardProps {
  icon: string;
  title: string;
  description: string;
  email?: string;
  link?: { href: string; label: string };
}

function ContactCard({ icon, title, description, email, link }: ContactCardProps) {
  return (
    <div className={styles.contactCard}>
      <div className={styles.contactIcon}>{icon}</div>
      <h3 className={styles.contactTitle}>{title}</h3>
      <p className={styles.contactDescription}>{description}</p>
      {email && (
        <a href={`mailto:${email}`} className={styles.contactEmail}>
          {email}
        </a>
      )}
      {link && (
        <Link href={link.href} className={styles.contactLink}>
          {link.label} →
        </Link>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Contact</span>
        </nav>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          We&apos;d love to hear from you. Choose the best way to reach us based on your needs.
        </p>
      </header>

      <main className={styles.content}>
        {/* Primary Contact Methods */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How Can We Help?</h2>
          
          <div className={styles.contactGrid}>
            <ContactCard
              icon="❓"
              title="General Questions"
              description="Questions about our site, PFAS-free products, or how we verify products."
              email="info@pfasfreekitchen.com"
            />
            
            <ContactCard
              icon="💡"
              title="Suggest a Product"
              description="Know of a PFAS-free product we should review? Let us know!"
              link={{ href: '/suggest', label: 'Submit a product suggestion' }}
            />
            
            <ContactCard
              icon="⚠️"
              title="Report an Error"
              description="Found incorrect information? Help us fix it."
              link={{ href: '/corrections', label: 'Report a correction' }}
            />
            
            <ContactCard
              icon="🏢"
              title="Brand Inquiries"
              description="For manufacturers interested in product verification."
              email="brands@pfasfreekitchen.com"
            />
            
            <ContactCard
              icon="📰"
              title="Press &amp; Media"
              description="For interviews, quotes, or press resources."
              email="press@pfasfreekitchen.com"
            />
            
            <ContactCard
              icon="📢"
              title="Advertising"
              description="For advertising partnership inquiries."
              email="advertising@pfasfreekitchen.com"
            />
          </div>
        </section>

        {/* Response Times */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Response Times</h2>
          <p className={styles.responseIntro}>
            We aim to respond to all inquiries promptly. Here&apos;s what to expect:
          </p>
          
          <div className={styles.responseGrid}>
            <div className={styles.responseCard}>
              <div className={styles.responseTime}>2-3 days</div>
              <div className={styles.responseType}>General questions</div>
            </div>
            <div className={styles.responseCard}>
              <div className={styles.responseTime}>1-2 days</div>
              <div className={styles.responseType}>Error reports</div>
            </div>
            <div className={styles.responseCard}>
              <div className={styles.responseTime}>5-7 days</div>
              <div className={styles.responseType}>Product suggestions</div>
            </div>
            <div className={styles.responseCard}>
              <div className={styles.responseTime}>3-5 days</div>
              <div className={styles.responseType}>Brand inquiries</div>
            </div>
          </div>

          <InfoBox type="info" title="Note">
            <p>
              Response times are for business days. During high volume periods, 
              responses may take slightly longer.
            </p>
          </InfoBox>
        </section>

        {/* Before You Contact */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Before You Contact Us</h2>
          <p>
            Many common questions are answered in our resources:
          </p>
          
          <div className={styles.resourceGrid}>
            <Link href="/faq" className={styles.resourceCard}>
              <span className={styles.resourceIcon}>❓</span>
              <div>
                <h3>FAQ</h3>
                <p>Frequently asked questions about PFAS and our site</p>
              </div>
            </Link>
            
            <Link href="/learn/how-we-verify" className={styles.resourceCard}>
              <span className={styles.resourceIcon}>🔍</span>
              <div>
                <h3>How We Verify</h3>
                <p>Learn about our verification process and tiers</p>
              </div>
            </Link>
            
            <Link href="/learn/buyers-guide" className={styles.resourceCard}>
              <span className={styles.resourceIcon}>📖</span>
              <div>
                <h3>Buyer&apos;s Guide</h3>
                <p>Tips for choosing PFAS-free products</p>
              </div>
            </Link>
            
            <Link href="/learn/what-are-pfas" className={styles.resourceCard}>
              <span className={styles.resourceIcon}>🧪</span>
              <div>
                <h3>What Are PFAS?</h3>
                <p>Everything you need to know about PFAS</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Social Media */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Connect With Us</h2>
          
          <div className={styles.socialGrid}>
            <a 
              href="https://twitter.com/pfasfreekitchen" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <span className={styles.socialIcon}>𝕏</span>
              <span>@pfasfreekitchen</span>
            </a>
            
            <a 
              href="https://instagram.com/pfasfreekitchen" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <span className={styles.socialIcon}>📷</span>
              <span>@pfasfreekitchen</span>
            </a>
            
            <Link href="/newsletter" className={styles.socialCard}>
              <span className={styles.socialIcon}>📧</span>
              <span>Newsletter</span>
            </Link>
          </div>
        </section>

        {/* Privacy Note */}
        <section className={styles.privacyNote}>
          <p>
            <strong>Privacy:</strong> When you contact us, we&apos;ll only use your information 
            to respond to your inquiry. See our{' '}
            <Link href="/privacy">Privacy Policy</Link> for details.
          </p>
        </section>
      </main>
    </div>
  );
}
