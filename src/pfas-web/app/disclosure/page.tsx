import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox } from '@/components/content';
import styles from './disclosure.module.css';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure - FTC Compliance',
  description: 'Our complete affiliate disclosure, explaining how we earn money and how it affects (and doesn\'t affect) our content.',
  keywords: ['affiliate disclosure', 'FTC disclosure', 'Amazon Associates', 'how we make money'],
};

export default function DisclosurePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Affiliate Disclosure</h1>
        <p className={styles.updated}>Last updated: January 2026</p>
      </header>

      <article className={styles.content}>
        {/* FTC Statement */}
        <section className={styles.section}>
          <InfoBox type="info" title="FTC Disclosure Statement">
            <p>
              In accordance with the Federal Trade Commission&apos;s guidelines concerning the 
              use of endorsements and testimonials in advertising (16 CFR Part 255), we 
              provide the following disclosure regarding our affiliate relationships.
            </p>
          </InfoBox>
        </section>

        {/* How We Make Money */}
        <section className={styles.section}>
          <h2>How We Make Money</h2>
          <p>
            PFAS-Free Kitchen is a free resource supported by <strong>affiliate partnerships</strong>. 
            When you click on links to retailers on our site and make a purchase, we 
            may earn a commission at no additional cost to you.
          </p>
          <p>
            This affiliate revenue helps us:
          </p>
          <ul>
            <li>Fund our research and verification process</li>
            <li>Maintain and update our product database</li>
            <li>Keep the site free and accessible to everyone</li>
            <li>Invest in better tools for consumers</li>
          </ul>
        </section>

        {/* Amazon Associates */}
        <section className={styles.section}>
          <h2>Amazon Associates Program</h2>
          <div className={styles.amazonBox}>
            <p>
              <strong>PFAS-Free Kitchen is a participant in the Amazon Services LLC 
              Associates Program</strong>, an affiliate advertising program designed to 
              provide a means for sites to earn advertising fees by advertising and 
              linking to Amazon.com.
            </p>
          </div>
          <p>
            As an Amazon Associate, we earn from qualifying purchases. Amazon and the 
            Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
        </section>

        {/* Other Partners */}
        <section className={styles.section}>
          <h2>Other Affiliate Partners</h2>
          <p>
            In addition to Amazon, we participate in affiliate programs with:
          </p>
          <ul>
            <li>Impact Radius affiliate network</li>
            <li>ShareASale affiliate network</li>
            <li>Direct partnerships with kitchenware retailers</li>
            <li>Brand-specific affiliate programs</li>
          </ul>
          <p>
            Commission rates and terms vary by retailer and may change over time. The 
            specific retailers we link to may change as partnerships are established 
            or discontinued.
          </p>
        </section>

        {/* Independence Statement */}
        <section className={styles.section}>
          <h2>Editorial Independence</h2>
          <InfoBox type="success" title="Our Promise">
            <p>
              <strong>Our product research and verification process is completely 
              independent from our affiliate relationships.</strong> Period.
            </p>
          </InfoBox>
          <p>
            We maintain strict editorial standards:
          </p>
          <ul>
            <li>
              <strong>No pay-for-play:</strong> We do not accept payment from brands 
              to influence product ratings or tier assignments.
            </li>
            <li>
              <strong>Equal treatment:</strong> Products are included based solely on 
              their PFAS-free status, not affiliate availability. Many products in our 
              catalog do not have affiliate links.
            </li>
            <li>
              <strong>Tier independence:</strong> Verification tier is determined by 
              evidence quality, never by affiliate relationships.
            </li>
            <li>
              <strong>Transparent methodology:</strong> Our <Link href="/learn/how-we-verify">verification process</Link> is 
              publicly documented.
            </li>
          </ul>
        </section>

        {/* Where Disclosures Appear */}
        <section className={styles.section}>
          <h2>Where You&apos;ll See Disclosures</h2>
          <p>
            Per FTC guidelines, we disclose our affiliate relationships in multiple 
            places throughout the site:
          </p>
          <div className={styles.disclosureLocations}>
            <div className={styles.locationCard}>
              <h3>📄 Product Pages</h3>
              <p>Adjacent to &quot;Where to Buy&quot; buttons</p>
            </div>
            <div className={styles.locationCard}>
              <h3>📋 Category Pages</h3>
              <p>Banner at the top of product listings</p>
            </div>
            <div className={styles.locationCard}>
              <h3>🔗 Click-Out Modals</h3>
              <p>When clicking to visit a retailer</p>
            </div>
            <div className={styles.locationCard}>
              <h3>🔻 Site Footer</h3>
              <p>Link to this disclosure page on every page</p>
            </div>
          </div>
        </section>

        {/* What This Means for You */}
        <section className={styles.section}>
          <h2>What This Means for You</h2>
          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <h3>✅ What DOESN&apos;T Change</h3>
              <ul>
                <li>Product verification tiers</li>
                <li>Research quality</li>
                <li>Which products we include</li>
                <li>Our recommendations</li>
              </ul>
            </div>
            <div className={styles.impactCard}>
              <h3>ℹ️ What You Should Know</h3>
              <ul>
                <li>Some links earn us commissions</li>
                <li>You pay the same price either way</li>
                <li>We appreciate when you use our links</li>
                <li>Not all products have affiliate links</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Prices and Availability */}
        <section className={styles.section}>
          <h2>Prices and Availability</h2>
          <p>
            Product prices and availability displayed on our site are provided by 
            retailers and may not reflect real-time information. We make reasonable 
            efforts to keep this information current, but encourage you to verify 
            prices on the retailer&apos;s website before purchasing.
          </p>
          <p>
            Prices may vary by location, and some products may be out of stock or 
            discontinued. We are not responsible for pricing errors or availability 
            changes.
          </p>
        </section>

        {/* Contact */}
        <section className={styles.section}>
          <h2>Questions?</h2>
          <p>
            If you have questions about our affiliate relationships or disclosure 
            practices, please contact us:
          </p>
          <p className={styles.contactEmail}>
            <a href="mailto:disclosure@pfas-free-kitchen.com">
              disclosure@pfas-free-kitchen.com
            </a>
          </p>
        </section>

        {/* Related Links */}
        <section className={styles.related}>
          <h2>Related Information</h2>
          <div className={styles.relatedLinks}>
            <Link href="/about" className={styles.relatedLink}>
              About Us →
            </Link>
            <Link href="/learn/how-we-verify" className={styles.relatedLink}>
              How We Verify Products →
            </Link>
            <Link href="/about/editorial-policy" className={styles.relatedLink}>
              Editorial Policy →
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
