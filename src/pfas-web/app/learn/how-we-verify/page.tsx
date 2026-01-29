import type { Metadata } from 'next';
import Link from 'next/link';
import { TierBadge } from '@/components/product';
import { InfoBox, TableOfContents } from '@/components/content';
import { Button } from '@/components/ui';
import { TierExplainer, ComponentDiagram, EvidenceExplainer } from '@/components/verification';
import styles from './verify.module.css';

export const metadata: Metadata = {
  title: 'How We Verify Products | Our Rigorous PFAS Testing Process',
  description: 'Learn about our multi-tier verification system for PFAS-free products. We use independent lab testing, component analysis, and transparent evidence evaluation.',
  keywords: ['PFAS verification', 'product testing', 'lab testing', 'verification tiers', 'PFAS-free certification', 'component analysis', 'LC-MS/MS testing'],
  openGraph: {
    title: 'How We Verify PFAS-Free Products',
    description: 'Our rigorous verification process ensures every product recommendation is backed by evidence.',
  },
};

const TOC_HEADINGS = [
  { id: 'philosophy', text: 'Our Philosophy', level: 2 },
  { id: 'tiers', text: 'Verification Tiers', level: 2 },
  { id: 'component-analysis', text: 'Component Analysis', level: 2 },
  { id: 'evidence-types', text: 'Evidence Types', level: 2 },
  { id: 'lab-testing', text: 'Lab Testing Methods', level: 2 },
  { id: 'unknowns', text: 'How We Handle Unknowns', level: 2 },
  { id: 'independence', text: 'Our Independence', level: 2 },
  { id: 'request', text: 'Request Verification', level: 2 },
];

export default function HowWeVerifyPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/learn">Learn</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">How We Verify</span>
        </nav>

        <h1 className={styles.title}>How We Verify Products</h1>
        <p className={styles.subtitle}>
          At PFAS-Free Kitchen, we don&apos;t just take manufacturers at their word. We use 
          a rigorous, multi-tier verification system to evaluate every product we list.
        </p>
      </header>

      <div className={styles.layout}>
        {/* Table of Contents (sticky sidebar) */}
        <aside className={styles.sidebar}>
          <TableOfContents headings={TOC_HEADINGS} />
        </aside>

        <article className={styles.content}>
          {/* Philosophy Section */}
          <section className={styles.section} id="philosophy">
            <h2>Our Verification Philosophy</h2>
            
            <div className={styles.philosophyGrid}>
              <div className={styles.philosophyCard}>
                <div className={styles.philosophyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3>Transparency Over Marketing</h3>
                <p>
                  We show you exactly what we know — and what we don&apos;t know — about each product.
                  Every product page displays the verification tier, evidence type, and any limitations.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.philosophyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3>Conservative Claims</h3>
                <p>
                  We never claim a product is &quot;safer&quot; or &quot;healthier.&quot; We only state what we can 
                  verify: whether PFAS are present or absent based on available evidence.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.philosophyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3>Component-Level Analysis</h3>
                <p>
                  A product isn&apos;t just one thing. A pan has a cooking surface, handle, rivets, 
                  and possibly a lid. We analyze each component that contacts food.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.philosophyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3>No Pay-to-Play</h3>
                <p>
                  Verification status is never influenced by affiliate relationships or brand 
                  partnerships. We do not accept payment for reviews or placement.
                </p>
              </div>
            </div>
          </section>

          {/* Tiers Section */}
          <section className={styles.section} id="tiers">
            <h2>The Four Verification Tiers</h2>
            
            <p className={styles.tierIntro}>
              Products earn a verification tier based on the quality and completeness of 
              evidence we have. Click each tier to learn more about requirements and limitations.
            </p>

            <TierExplainer defaultExpanded={4} showAll={true} />

            <InfoBox type="info" title="Tier ≠ Product Quality">
              <p>
                A higher tier doesn&apos;t necessarily mean a &quot;better&quot; product — it means we have 
                stronger evidence about its PFAS status. A Tier 2 cast iron pan with inherent 
                PFAS-free materials may be just as PFAS-free as a Tier 4 monitored product.
              </p>
            </InfoBox>
          </section>

          {/* Component Analysis Section */}
          <section className={styles.section} id="component-analysis">
            <h2>Component-Level Analysis</h2>
            
            <p>
              We don&apos;t just verify &quot;the product&quot; — we examine each component that 
              contacts food. This matters because some products use PFAS-free coatings 
              but have PFAS in handles, lids, or other components.
            </p>

            <div className={styles.componentExample}>
              <h3>Example: Analyzing a Frying Pan</h3>
              <ComponentDiagram showLegend={true} interactive={true} />
            </div>

            <div className={styles.whyMatters}>
              <h3>Why This Matters</h3>
              <p>
                Consider a typical nonstick pan. Even &quot;PFAS-free&quot; pans may have components 
                we can&apos;t verify:
              </p>
              <ul>
                <li><strong>Cooking surface:</strong> Primary food contact area — our main focus</li>
                <li><strong>Pan body/walls:</strong> Contact food during cooking and cleaning</li>
                <li><strong>Rivets:</strong> Often stainless steel (inherently PFAS-free)</li>
                <li><strong>Handle:</strong> May contain silicone or rubber grips with unknown status</li>
                <li><strong>Lid:</strong> Glass is safe, but silicone rims may contain PFAS</li>
              </ul>
            </div>

            <InfoBox type="warning" title="Non-Food-Contact Components">
              <p>
                We note but don&apos;t penalize for non-food-contact components with unknown status. 
                If a pan handle&apos;s silicone grip has unknown PFAS status but never touches food, 
                this doesn&apos;t lower the product&apos;s tier — but we still disclose it.
              </p>
            </InfoBox>
          </section>

          {/* Evidence Types Section */}
          <section className={styles.section} id="evidence-types">
            <h2>Evidence Types</h2>
            
            <p>
              Not all evidence is created equal. We categorize evidence by type and weight it 
              accordingly when determining verification tiers.
            </p>

            <EvidenceExplainer showStrength={true} />
          </section>

          {/* Lab Testing Methods Section */}
          <section className={styles.section} id="lab-testing">
            <h2>Lab Testing Methods</h2>
            
            <p>
              For Tier 3 (Lab Tested) and Tier 4 (Monitored) products, we require testing 
              from accredited laboratories using validated methods.
            </p>

            <div className={styles.labTable}>
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>What It Detects</th>
                    <th>Detection Limit</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>LC-MS/MS</strong>
                      <span className={styles.methodNote}>Liquid Chromatography Mass Spectrometry</span>
                    </td>
                    <td>30-50+ specific PFAS compounds</td>
                    <td>0.1-5 ng/g typically</td>
                    <td>Identifying specific PFAS</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total Fluorine (CIC/PIGE)</strong>
                      <span className={styles.methodNote}>Combustion Ion Chromatography / PIGE</span>
                    </td>
                    <td>Total organic fluorine (all PFAS)</td>
                    <td>10-100 ppm typically</td>
                    <td>Screening for any PFAS</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>TOF</strong>
                      <span className={styles.methodNote}>Total Organic Fluorine</span>
                    </td>
                    <td>All fluorinated organic compounds</td>
                    <td>Varies by method</td>
                    <td>Comprehensive screening</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.labVerification}>
              <h3>What We Verify in Lab Reports</h3>
              <ul>
                <li>
                  <strong>Lab accreditation</strong> — ISO 17025 or equivalent certification
                </li>
                <li>
                  <strong>Method validation</strong> — Test method is appropriate for the matrix (metal, ceramic, etc.)
                </li>
                <li>
                  <strong>Sample matching</strong> — Description matches the actual product
                </li>
                <li>
                  <strong>Detection limits</strong> — LOD/LOQ are clearly stated
                </li>
                <li>
                  <strong>Chain of custody</strong> — Documentation shows sample handling
                </li>
              </ul>
            </div>
          </section>

          {/* Handling Unknowns Section */}
          <section className={styles.section} id="unknowns">
            <h2>How We Handle Unknowns</h2>
            
            <p>
              Transparency means admitting what we don&apos;t know. Here&apos;s how we handle 
              various types of uncertainty:
            </p>

            <div className={styles.unknownsGrid}>
              <div className={styles.unknownCard}>
                <h3>Unknown Components</h3>
                <p>If we can&apos;t verify a component, we:</p>
                <ol>
                  <li>List it as &quot;Unknown&quot; in the component table</li>
                  <li>Note this limitation in the verification summary</li>
                  <li>Lower the overall tier if the unknown affects food-contact surfaces</li>
                </ol>
              </div>

              <div className={styles.unknownCard}>
                <h3>Changing Products</h3>
                <p>Products can change without notice. We:</p>
                <ol>
                  <li>Date all evidence in our system</li>
                  <li>Show when evidence was last updated</li>
                  <li>Encourage users to verify with manufacturers</li>
                  <li>Update listings when we receive new information</li>
                </ol>
              </div>

              <div className={styles.unknownCard}>
                <h3>Regional Variations</h3>
                <p>Some products have different formulations by market. We:</p>
                <ol>
                  <li>Specify which region our verification applies to</li>
                  <li>Note when we know about regional variations</li>
                  <li>Default to US market unless otherwise specified</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Independence Section */}
          <section className={styles.section} id="independence">
            <h2>Our Independence</h2>
            
            <div className={styles.principleGrid}>
              <div className={styles.principleCard}>
                <div className={styles.principleIcon}>✗</div>
                <h3>No Pay-for-Play</h3>
                <p>We do not accept payment for reviews or rankings</p>
              </div>
              <div className={styles.principleCard}>
                <div className={styles.principleIcon}>📢</div>
                <h3>Clear Disclosure</h3>
                <p>Affiliate links are always clearly disclosed</p>
              </div>
              <div className={styles.principleCard}>
                <div className={styles.principleIcon}>⚖️</div>
                <h3>Tier Independence</h3>
                <p>Verification tier is never influenced by affiliate relationships</p>
              </div>
              <div className={styles.principleCard}>
                <div className={styles.principleIcon}>🔒</div>
                <h3>Evidence Integrity</h3>
                <p>All evidence documents are stored with SHA-256 hashes</p>
              </div>
            </div>

            <div className={styles.commitment}>
              <h3>Our Commitment</h3>
              <ul>
                <li><strong>Accuracy:</strong> Only stating what we can verify</li>
                <li><strong>Transparency:</strong> Showing our evidence and limitations</li>
                <li><strong>Independence:</strong> Never selling verification status</li>
                <li><strong>Updates:</strong> Revising listings when new information emerges</li>
              </ul>
            </div>

            <div className={styles.policyLink}>
              <Link href="/about/editorial-policy">
                Read Our Full Editorial Policy →
              </Link>
            </div>
          </section>

          {/* Request Verification Section */}
          <section className={styles.section} id="request">
            <h2>Request Verification</h2>
            
            <div className={styles.requestGrid}>
              <div className={styles.requestCard}>
                <div className={styles.requestIcon}>🛒</div>
                <h3>For Consumers</h3>
                <p>
                  Found a product you&apos;d like us to verify? Submit a suggestion and we&apos;ll 
                  add it to our research queue.
                </p>
                <Link href="/contact?type=product-suggestion">
                  <Button variant="outline" size="md">
                    Suggest a Product
                  </Button>
                </Link>
              </div>

              <div className={styles.requestCard}>
                <div className={styles.requestIcon}>🏢</div>
                <h3>For Brands</h3>
                <p>
                  Want your products verified? We offer several options based on 
                  the evidence you can provide.
                </p>
                <ul className={styles.brandOptions}>
                  <li><strong>Tier 2:</strong> Submit documentation (MSDS, policies)</li>
                  <li><strong>Tier 3:</strong> Share existing lab reports</li>
                  <li><strong>Tier 4:</strong> Enroll in monitoring program</li>
                </ul>
                <Link href="/contact?type=brand-verification">
                  <Button variant="primary" size="md">
                    Contact for Verification
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.cta}>
            <h2>Ready to shop with confidence?</h2>
            <p>Browse our catalog of verified PFAS-free products.</p>
            <div className={styles.ctaButtons}>
              <Link href="/search">
                <Button size="lg">Browse Products</Button>
              </Link>
              <Link href="/learn/buyers-guide">
                <Button variant="outline" size="lg">Read the Buyer&apos;s Guide</Button>
              </Link>
            </div>
          </section>

          {/* Last Updated */}
          <footer className={styles.pageFooter}>
            <p>Last updated: January 2026</p>
            <p>
              Found an error or have additional evidence?{' '}
              <Link href="/contact">Contact us</Link>.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
