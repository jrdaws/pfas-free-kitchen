import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Us - PFAS-Free Kitchen',
  description: 'Learn about our mission to help consumers find verified PFAS-free kitchen products. Transparency, independence, and trust.',
  keywords: ['about PFAS-Free Kitchen', 'mission', 'who we are', 'team'],
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>About PFAS-Free Kitchen</h1>
        <p className={styles.subtitle}>
          Helping you make informed decisions about the products in your kitchen
        </p>
      </header>

      <article className={styles.content}>
        {/* Mission */}
        <section className={styles.section}>
          <h2>Our Mission</h2>
          <div className={styles.missionBox}>
            <p className={styles.missionText}>
              To provide consumers with transparent, independently verified information 
              about PFAS in kitchen products, empowering healthier purchasing decisions.
            </p>
          </div>
          <p>
            PFAS (&quot;forever chemicals&quot;) are found in many common kitchen products, from 
            non-stick pans to food storage containers. Despite growing health concerns, 
            it&apos;s often difficult for consumers to know which products contain these 
            chemicals and which don&apos;t.
          </p>
          <p>
            We started PFAS-Free Kitchen to bridge this information gap. Our team 
            researches products, reviews documentation, and creates a searchable 
            database of verified PFAS-free alternatives — all freely accessible to 
            everyone.
          </p>
        </section>

        {/* Values */}
        <section className={styles.section}>
          <h2>Our Values</h2>
          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>🔍</div>
              <h3>Transparency</h3>
              <p>
                We show our work. Every verification tier comes with an explanation 
                of the evidence we reviewed.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>⚖️</div>
              <h3>Independence</h3>
              <p>
                Our verification process is never influenced by affiliate relationships 
                or payments from brands.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>📚</div>
              <h3>Education</h3>
              <p>
                We don&apos;t just list products — we help you understand the science and 
                make informed decisions.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>🤝</div>
              <h3>Accessibility</h3>
              <p>
                Our research is free to access. Everyone deserves to know what&apos;s in 
                their kitchen products.
              </p>
            </div>
          </div>
        </section>

        {/* How We're Funded */}
        <section className={styles.section}>
          <h2>How We&apos;re Funded</h2>
          <p>
            PFAS-Free Kitchen is supported through <strong>affiliate commissions</strong>. 
            When you click a link to a retailer and make a purchase, we may earn a small 
            commission at no additional cost to you.
          </p>
          <p>
            <strong>This funding model does not affect our research.</strong>
          </p>
          <ul className={styles.fundingList}>
            <li>
              <span className={styles.check}>✓</span>
              We do not accept payment for higher ratings or placement
            </li>
            <li>
              <span className={styles.check}>✓</span>
              Products without affiliate links are included equally
            </li>
            <li>
              <span className={styles.check}>✓</span>
              Verification tier is determined solely by evidence quality
            </li>
            <li>
              <span className={styles.check}>✓</span>
              Affiliate links are always clearly disclosed
            </li>
          </ul>
          <div className={styles.linkBox}>
            <Link href="/disclosure">Read our full affiliate disclosure →</Link>
          </div>
        </section>

        {/* Editorial Policy */}
        <section className={styles.section}>
          <h2>Editorial Policy</h2>
          <p>
            Our research follows strict editorial guidelines to ensure accuracy and 
            independence:
          </p>
          <ul className={styles.policyList}>
            <li>All product claims are verified against primary sources</li>
            <li>We contact manufacturers directly for clarification when needed</li>
            <li>Verification tiers are reviewed and updated as new evidence emerges</li>
            <li>We clearly note any limitations or unknowns in our research</li>
            <li>Evidence documents are stored with cryptographic hashes for integrity</li>
          </ul>
        </section>

        {/* Contact */}
        <section className={styles.section}>
          <h2>Contact Us</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>General Inquiries</h3>
              <p>Questions about products, our process, or the site</p>
              <a href="mailto:hello@pfas-free-kitchen.com">hello@pfas-free-kitchen.com</a>
            </div>
            <div className={styles.contactCard}>
              <h3>Media & Press</h3>
              <p>For interviews, quotes, or press resources</p>
              <a href="mailto:press@pfas-free-kitchen.com">press@pfas-free-kitchen.com</a>
            </div>
            <div className={styles.contactCard}>
              <h3>Brand & Manufacturer</h3>
              <p>Submit evidence or request a product review</p>
              <a href="mailto:brands@pfas-free-kitchen.com">brands@pfas-free-kitchen.com</a>
            </div>
            <div className={styles.contactCard}>
              <h3>Report an Issue</h3>
              <p>Found incorrect information? Let us know</p>
              <a href="mailto:corrections@pfas-free-kitchen.com">corrections@pfas-free-kitchen.com</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2>Start Shopping with Confidence</h2>
          <p>Browse our catalog of verified PFAS-free kitchen products.</p>
          <div className={styles.ctaButtons}>
            <Link href="/search">
              <Button size="lg">Browse Products</Button>
            </Link>
            <Link href="/learn/how-we-verify">
              <Button variant="outline" size="lg">Learn How We Verify</Button>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
