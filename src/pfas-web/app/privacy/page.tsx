import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox, TableOfContents } from '@/components/content';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy - PFAS-Free Kitchen',
  description: 'Our privacy policy explains how we collect, use, and protect your personal information when you use PFAS-Free Kitchen.',
  keywords: ['privacy policy', 'data protection', 'cookies', 'GDPR', 'CCPA'],
};

const TOC_HEADINGS = [
  { id: 'information-collected', text: 'Information We Collect', level: 2 },
  { id: 'how-we-use', text: 'How We Use Information', level: 2 },
  { id: 'cookies', text: 'Cookies & Tracking', level: 2 },
  { id: 'third-party', text: 'Third-Party Services', level: 2 },
  { id: 'data-sharing', text: 'Data Sharing', level: 2 },
  { id: 'your-rights', text: 'Your Rights', level: 2 },
  { id: 'data-retention', text: 'Data Retention', level: 2 },
  { id: 'children', text: 'Children\'s Privacy', level: 2 },
  { id: 'changes', text: 'Policy Changes', level: 2 },
  { id: 'contact', text: 'Contact Us', level: 2 },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Privacy Policy</span>
        </nav>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last Updated: January 28, 2026</p>
        <p className={styles.effectiveDate}>Effective Date: January 1, 2026</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <TableOfContents headings={TOC_HEADINGS} title="Contents" />
        </aside>

        <article className={styles.content}>
          <div className={styles.intro}>
            <p>
              PFAS-Free Kitchen (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is 
              committed to protecting your personal information. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit 
              our website pfasfreekitchen.com (the &quot;Site&quot;).
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms 
              of this privacy policy, please do not access the Site.
            </p>
          </div>

          {/* Information We Collect */}
          <section className={styles.section} id="information-collected">
            <h2>Information We Collect</h2>
            
            <h3>Information You Provide</h3>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul>
              <li>
                <strong>Contact Information:</strong> Email address when you subscribe to 
                our newsletter, submit a product suggestion, or contact us
              </li>
              <li>
                <strong>Form Submissions:</strong> Information included in product 
                suggestions, error reports, or feedback forms
              </li>
              <li>
                <strong>Communications:</strong> Records of correspondence if you contact us
              </li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>When you visit the Site, we automatically collect certain information:</p>
            <ul>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, 
                device type, screen resolution
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, time spent on pages, click 
                patterns, search queries
              </li>
              <li>
                <strong>Location Data:</strong> General geographic location based on IP 
                address (country/region level only)
              </li>
              <li>
                <strong>Referral Data:</strong> How you arrived at our Site (search 
                engine, link from another site, etc.)
              </li>
            </ul>

            <h3>Information We Do NOT Collect</h3>
            <ul>
              <li>Payment information (we don&apos;t process payments)</li>
              <li>Social security numbers or government IDs</li>
              <li>Precise geolocation data</li>
              <li>Health information</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className={styles.section} id="how-we-use">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>
                <strong>To Operate the Site:</strong> Provide, maintain, and improve 
                our website and services
              </li>
              <li>
                <strong>To Communicate:</strong> Respond to your inquiries, send 
                newsletters (if subscribed), and provide updates
              </li>
              <li>
                <strong>To Analyze Usage:</strong> Understand how visitors use the Site 
                to improve content and user experience
              </li>
              <li>
                <strong>To Prevent Abuse:</strong> Detect and prevent spam, fraud, and 
                security threats
              </li>
              <li>
                <strong>To Comply with Law:</strong> Meet legal obligations and respond 
                to lawful requests
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className={styles.section} id="cookies">
            <h2>Cookies &amp; Tracking Technologies</h2>
            
            <h3>What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device when you visit a website. 
              They help websites remember information about your visit.
            </p>

            <h3>Types of Cookies We Use</h3>
            <div className={styles.cookieTable}>
              <table>
                <thead>
                  <tr>
                    <th>Cookie Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Essential</strong></td>
                    <td>Required for site functionality (e.g., preferences)</td>
                    <td>Session / 1 year</td>
                  </tr>
                  <tr>
                    <td><strong>Analytics</strong></td>
                    <td>Help us understand how visitors use the Site</td>
                    <td>Up to 2 years</td>
                  </tr>
                  <tr>
                    <td><strong>Performance</strong></td>
                    <td>Monitor site performance and errors</td>
                    <td>Session / 30 days</td>
                  </tr>
                  <tr>
                    <td><strong>Advertising</strong></td>
                    <td>Track affiliate link clicks for commission attribution</td>
                    <td>30-90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Managing Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that disabling 
              cookies may affect some Site functionality. Most browsers allow you to:
            </p>
            <ul>
              <li>View cookies stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from certain sites</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className={styles.section} id="third-party">
            <h2>Third-Party Services</h2>
            <p>We use the following third-party services that may collect information:</p>

            <h3>Google Analytics</h3>
            <p>
              We use Google Analytics to analyze Site usage. Google Analytics uses cookies 
              to collect anonymous information about how visitors use the Site. This helps 
              us understand traffic patterns and improve our content.
            </p>
            <p>
              <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy →
              </Link>
            </p>
            <p>
              You can opt out of Google Analytics by installing the{' '}
              <Link href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </Link>.
            </p>

            <h3>Affiliate Networks</h3>
            <p>
              When you click on affiliate links, our affiliate partners (including Amazon 
              Associates, Impact, and others) may place cookies to track referrals. These 
              cookies are governed by each partner&apos;s privacy policy.
            </p>

            <h3>Content Delivery Networks</h3>
            <p>
              We use Vercel for hosting and content delivery, which may log technical 
              information about your visit.
            </p>
          </section>

          {/* Data Sharing */}
          <section className={styles.section} id="data-sharing">
            <h2>How We Share Information</h2>
            
            <h3>We Do NOT Sell Your Data</h3>
            <InfoBox type="success" title="No Data Sales">
              <p>
                We do not sell, rent, or trade your personal information to third parties 
                for marketing purposes. Ever.
              </p>
            </InfoBox>

            <h3>When We May Share Information</h3>
            <p>We may share information in the following limited circumstances:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> With vendors who help operate the Site 
                (hosting, analytics, email delivery), under strict confidentiality agreements
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law, subpoena, or 
                court order
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, 
                acquisition, or sale of assets (you would be notified)
              </li>
              <li>
                <strong>Protection:</strong> To protect our rights, privacy, safety, 
                or property, or that of our users
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className={styles.section} id="your-rights">
            <h2>Your Privacy Rights</h2>
            
            <h3>All Users</h3>
            <p>Regardless of where you live, you can:</p>
            <ul>
              <li>Unsubscribe from our newsletter at any time using the link in each email</li>
              <li>Request information about what data we have about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of analytics tracking</li>
            </ul>

            <h3>California Residents (CCPA)</h3>
            <p>If you are a California resident, you have the right to:</p>
            <ul>
              <li>Know what personal information we collect, use, disclose, and sell</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of personal information (we don&apos;t sell, but you can still make this request)</li>
              <li>Non-discrimination for exercising your CCPA rights</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@pfasfreekitchen.com">privacy@pfasfreekitchen.com</a>.
            </p>

            <h3>European Users (GDPR)</h3>
            <p>If you are in the European Economic Area, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              We process personal data based on legitimate interests (analytics, site 
              operation) and consent (newsletters, forms).
            </p>
          </section>

          {/* Data Retention */}
          <section className={styles.section} id="data-retention">
            <h2>Data Retention</h2>
            <p>We retain information for as long as necessary to fulfill the purposes described in this policy:</p>
            <ul>
              <li><strong>Newsletter subscriptions:</strong> Until you unsubscribe</li>
              <li><strong>Form submissions:</strong> Up to 3 years, then deleted</li>
              <li><strong>Analytics data:</strong> Aggregated and anonymized after 26 months</li>
              <li><strong>Server logs:</strong> Automatically deleted after 90 days</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className={styles.section} id="children">
            <h2>Children&apos;s Privacy</h2>
            <p>
              The Site is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you are 
              a parent or guardian and believe we have collected information from your 
              child, please contact us immediately.
            </p>
          </section>

          {/* Data Security */}
          <section className={styles.section}>
            <h2>Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information, 
              including:
            </p>
            <ul>
              <li>HTTPS encryption for all Site traffic</li>
              <li>Secure hosting with reputable providers</li>
              <li>Limited access to personal information</li>
              <li>Regular security reviews</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. We 
              cannot guarantee absolute security.
            </p>
          </section>

          {/* International Transfers */}
          <section className={styles.section}>
            <h2>International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in the United States 
              and other countries where our service providers operate. These countries 
              may have different data protection laws than your country of residence.
            </p>
          </section>

          {/* Changes */}
          <section className={styles.section} id="changes">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you 
              of material changes by:
            </p>
            <ul>
              <li>Posting the new policy on this page</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>For significant changes, sending an email to newsletter subscribers</li>
            </ul>
            <p>
              We encourage you to review this policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section className={styles.section} id="contact">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className={styles.contactBox}>
              <p><strong>Email:</strong> <a href="mailto:privacy@pfasfreekitchen.com">privacy@pfasfreekitchen.com</a></p>
              <p><strong>Subject Line:</strong> Privacy Inquiry</p>
            </div>
            <p>
              We aim to respond to all privacy inquiries within 30 days.
            </p>
          </section>

          {/* Related Links */}
          <section className={styles.related}>
            <h2>Related Policies</h2>
            <div className={styles.relatedLinks}>
              <Link href="/terms" className={styles.relatedLink}>
                Terms of Service →
              </Link>
              <Link href="/disclosure" className={styles.relatedLink}>
                Affiliate Disclosure →
              </Link>
              <Link href="/about" className={styles.relatedLink}>
                About Us →
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
