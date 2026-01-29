import Link from 'next/link';
import type { Metadata } from 'next';
import { TierBadge } from '@/components/product';
import { Button } from '@/components/ui';
import styles from './verify.module.css';

export const metadata: Metadata = {
  title: 'How We Verify Products',
  description: 'Learn about our research process and verification tiers for PFAS-free products.',
};

export default function HowWeVerifyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/education" className={styles.backLink}>
          ← Back to Education
        </Link>
        <h1 className={styles.title}>How We Verify Products</h1>
        <p className={styles.subtitle}>
          Our mission is to help you find kitchen products that are genuinely free 
          from PFAS. Here&apos;s how we research and verify every product in our catalog.
        </p>
      </header>

      <article className={styles.content}>
        {/* Process Overview */}
        <section className={styles.section}>
          <h2>Our Research Process</h2>
          <p>
            Every product in our catalog goes through a multi-step verification process. 
            We don&apos;t just take marketing claims at face value — we dig deeper to 
            understand what&apos;s actually in each product.
          </p>
          
          <ol className={styles.processList}>
            <li>
              <strong>Product identification</strong> — We identify products that claim 
              to be PFAS-free or use materials known to be inherently PFAS-free.
            </li>
            <li>
              <strong>Material analysis</strong> — We research all materials used in 
              food-contact surfaces, including coatings, sealants, and treatments.
            </li>
            <li>
              <strong>Documentation review</strong> — We review brand statements, 
              certifications, lab reports, and manufacturing policies.
            </li>
            <li>
              <strong>Tier assignment</strong> — Based on the evidence, we assign a 
              verification tier that reflects our confidence in the product&apos;s PFAS-free status.
            </li>
            <li>
              <strong>Ongoing monitoring</strong> — We watch for material changes, 
              reformulations, and new information that might affect a product&apos;s status.
            </li>
          </ol>
        </section>

        {/* Tiers Explained */}
        <section className={styles.section}>
          <h2>Understanding Verification Tiers</h2>
          <p>
            Our tier system helps you quickly understand how confident we are in a 
            product&apos;s PFAS-free status. Higher tiers indicate stronger evidence.
          </p>

          <div className={styles.tierList}>
            <TierCard
              tier={4}
              title="Monitored"
              description="These products have the highest level of verification. They've been lab tested and are subject to ongoing monitoring and periodic re-verification. The manufacturer has committed to supply chain transparency."
            />
            <TierCard
              tier={3}
              title="Lab Tested"
              description="Third-party lab testing has confirmed these products are PFAS-free. We've reviewed the lab reports and verified the testing methodology."
            />
            <TierCard
              tier={2}
              title="Policy Reviewed"
              description="We've reviewed the manufacturer's PFAS-free policies and documentation. While not lab tested, the evidence supports the PFAS-free claim."
            />
            <TierCard
              tier={1}
              title="Brand Statement"
              description="The manufacturer claims this product is PFAS-free, but we haven't been able to independently verify the claim. Use with appropriate caution."
            />
            <TierCard
              tier={0}
              title="Unknown"
              description="We haven't yet verified the PFAS status of this product. It may be PFAS-free, but we don't have enough information to confirm."
            />
          </div>
        </section>

        {/* What We Look For */}
        <section className={styles.section}>
          <h2>What We Look For</h2>
          
          <h3>Materials</h3>
          <p>
            Some materials are inherently PFAS-free because they don&apos;t contain 
            fluorinated compounds:
          </p>
          <ul>
            <li>Cast iron (with oil-based seasoning)</li>
            <li>Carbon steel (with oil-based seasoning)</li>
            <li>Stainless steel</li>
            <li>Enameled cast iron or steel</li>
            <li>Ceramic (true ceramic, not ceramic-coated)</li>
            <li>Glass</li>
          </ul>

          <h3>Coatings</h3>
          <p>
            We pay special attention to coatings, as many &quot;non-stick&quot; coatings 
            contain PFAS. Safe coating alternatives include:
          </p>
          <ul>
            <li>Vitreous enamel</li>
            <li>Vegetable oil seasoning</li>
            <li>Sol-gel ceramic coatings</li>
            <li>Silicone-based coatings (PFAS-free varieties)</li>
          </ul>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2>Ready to find PFAS-free products?</h2>
          <p>
            Browse our catalog of verified PFAS-free kitchen products.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/cookware">
              <Button>Browse Cookware</Button>
            </Link>
            <Link href="/education/tier-guide">
              <Button variant="secondary">Learn more about tiers</Button>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}

function TierCard({ tier, title, description }: { tier: 0 | 1 | 2 | 3 | 4; title: string; description: string }) {
  return (
    <div className={styles.tierCard}>
      <div className={styles.tierHeader}>
        <TierBadge tier={tier} showTooltip={false} size="lg" />
        <h3 className={styles.tierTitle}>{title}</h3>
      </div>
      <p className={styles.tierDescription}>{description}</p>
    </div>
  );
}
