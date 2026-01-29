import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox, HealthDisclaimer, Citation, SourcesBibliography, TableOfContents } from '@/components/content';
import { Button } from '@/components/ui';
import styles from './pfas.module.css';

export const metadata: Metadata = {
  title: 'What is PFAS? - Forever Chemicals Explained | PFAS-Free Kitchen',
  description: 'Learn what PFAS (per- and polyfluoroalkyl substances) are, why they\'re called "forever chemicals," their health effects, and PFAS-free alternatives for your kitchen.',
  keywords: ['PFAS', 'forever chemicals', 'PFOA', 'PTFE', 'Teflon', 'non-stick coating', 'cookware safety', 'PFAS-free'],
  openGraph: {
    title: 'What is PFAS? - Forever Chemicals Explained',
    description: 'Understanding PFAS: the "forever chemicals" in everyday products and how to avoid them.',
    type: 'article',
  },
};

const tocHeadings = [
  { id: 'basics', text: 'The Basics', level: 2 },
  { id: 'where-found', text: 'Where Are PFAS Found?', level: 2 },
  { id: 'history', text: 'PFAS in Cookware: A History', level: 2 },
  { id: 'health-concerns', text: 'Health Concerns', level: 2 },
  { id: 'pfoa-vs-pfas', text: 'PFOA-Free vs PFAS-Free', level: 2 },
  { id: 'alternatives', text: 'PFAS-Free Alternatives', level: 2 },
  { id: 'sources', text: 'Sources & Further Reading', level: 2 },
];

const citedSources = [
  'epa_pfas',
  'cdc_atsdr',
  'fda_pfas',
  'epa_health_effects',
  'niehs_pfas',
  'sunderland_2019',
  'cousins_2020',
  'fenton_2021',
  'bartell_2020',
  'grandjean_2022',
  'ewg',
  'gspi',
] as const;

export default function WhatIsPFASPage() {
  return (
    <div className={styles.pageLayout}>
      {/* Sticky TOC Sidebar (Desktop) */}
      <aside className={styles.tocSidebar}>
        <TableOfContents headings={tocHeadings} title="On this page" />
      </aside>

      <div className={styles.page}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/learn">Learn</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">What is PFAS?</span>
          </nav>

          <h1 className={styles.title}>What is PFAS?</h1>
          <p className={styles.subtitle}>
            Understanding the &quot;forever chemicals&quot; in everyday products
          </p>

          {/* Molecule illustration */}
          <div className={styles.heroIllustration}>
            <MoleculeIcon />
            <p className={styles.heroCaption}>PFAS molecular structure (simplified)</p>
          </div>
        </header>

        <article className={styles.content}>
          {/* Health Disclaimer - Prominent at top */}
          <HealthDisclaimer variant="prominent" />

          {/* The Basics */}
          <section className={styles.section}>
            <h2 id="basics">The Basics</h2>

            <p className={styles.intro}>
              <strong>PFAS</strong> (pronounced &quot;PEE-fass&quot;) stands for{' '}
              <strong>per- and polyfluoroalkyl substances</strong> — a family of over{' '}
              <strong>15,000 synthetic chemicals</strong> that have been manufactured since
              the 1940s.<Citation source="epa_pfas" inline />
            </p>

            <p>
              These chemicals contain strong carbon-fluorine bonds, which are among the
              strongest bonds in organic chemistry. This makes PFAS extremely stable and
              resistant to:
            </p>

            <ul className={styles.propertyList}>
              <li><span className={styles.propertyIcon}>🔥</span> Heat</li>
              <li><span className={styles.propertyIcon}>💧</span> Water</li>
              <li><span className={styles.propertyIcon}>🛢️</span> Oil</li>
              <li><span className={styles.propertyIcon}>☕</span> Stains</li>
              <li><span className={styles.propertyIcon}>⚗️</span> Chemical degradation</li>
            </ul>

            <InfoBox type="info" title="Forever Chemicals">
              <p>
                Because they don&apos;t break down easily in the environment or in the human
                body, PFAS are often called <strong>&quot;forever chemicals.&quot;</strong> The
                carbon-fluorine bond is so strong that these substances can persist for
                thousands of years.<Citation source="cousins_2020" inline />
              </p>
            </InfoBox>
          </section>

          {/* Where Are PFAS Found? */}
          <section className={styles.section}>
            <h2 id="where-found">Where Are PFAS Found?</h2>

            <p>
              PFAS are used in many consumer and industrial products because of their
              resistance to heat, water, and oil.<Citation source="cdc_atsdr" inline />
            </p>

            <div className={styles.productGrid}>
              <div className={styles.productCategory}>
                <h3>Kitchen Products</h3>
                <ul className={styles.productList}>
                  <li>
                    <strong>Nonstick cookware</strong> — Teflon and similar PTFE coatings
                  </li>
                  <li>
                    <strong>Food packaging</strong> — Microwave popcorn bags, fast food wrappers
                  </li>
                  <li>
                    <strong>Food storage</strong> — Some treated plastic containers
                  </li>
                  <li>
                    <strong>Kitchen textiles</strong> — Stain-resistant tablecloths and aprons
                  </li>
                </ul>
              </div>

              <div className={styles.productCategory}>
                <h3>Other Products</h3>
                <ul className={styles.productList}>
                  <li>Waterproof clothing and outdoor gear</li>
                  <li>Stain-resistant carpets and upholstery</li>
                  <li>Firefighting foams (AFFF)</li>
                  <li>Some cosmetics and personal care products</li>
                  <li>Industrial applications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* History Timeline */}
          <section className={styles.section}>
            <h2 id="history">PFAS in Cookware: A History</h2>

            <div className={styles.timeline}>
              <TimelineItem
                year="1938"
                title="Discovery of PTFE"
                description="Roy Plunkett accidentally discovered polytetrafluoroethylene (PTFE) at DuPont. The substance was trademarked as 'Teflon' in 1945."
              />
              <TimelineItem
                year="1954"
                title="First Nonstick Pan"
                description="French engineer Marc Grégoire applied PTFE to fishing gear, then his wife Colette suggested using it on cookware. The company Tefal was born."
              />
              <TimelineItem
                year="1961"
                title="US Introduction"
                description="Tefal cookware launched in the United States under the 'T-Fal' brand, becoming popular throughout the 1960s and 70s."
              />
              <TimelineItem
                year="2000s"
                title="Health Concerns Emerge"
                description="Research began linking PFOA (a chemical used to make PTFE) to health effects. DuPont and other manufacturers faced lawsuits."
              />
              <TimelineItem
                year="2006"
                title="EPA Stewardship Program"
                description="Major manufacturers agreed to phase out PFOA by 2015 as part of the EPA's PFOA Stewardship Program."
              />
              <TimelineItem
                year="2015–Present"
                title="PFOA Phaseout & Replacements"
                description="PFOA largely eliminated in US manufacturing, but replaced with other PFAS (e.g., GenX, PFBS). PTFE itself still contains fluorine. Concerns about the entire class continue."
                isLast
              />
            </div>
          </section>

          {/* Health Concerns */}
          <section className={styles.section}>
            <h2 id="health-concerns">Health Concerns</h2>

            <p>
              Research has associated PFAS exposure with various health effects. According
              to the EPA and peer-reviewed studies:<Citation source="epa_health_effects" inline />
            </p>

            <div className={styles.healthGrid}>
              <div className={styles.healthCategory}>
                <h3 className={styles.healthCategoryTitle}>Established Associations</h3>
                <ul className={styles.healthList}>
                  <li>
                    <span className={styles.healthBullet} aria-hidden="true">•</span>
                    Increased cholesterol levels<Citation source="sunderland_2019" inline />
                  </li>
                  <li>
                    <span className={styles.healthBullet} aria-hidden="true">•</span>
                    Changes in liver enzyme levels
                  </li>
                  <li>
                    <span className={styles.healthBullet} aria-hidden="true">•</span>
                    Decreased vaccine response in children<Citation source="grandjean_2022" inline />
                  </li>
                  <li>
                    <span className={styles.healthBullet} aria-hidden="true">•</span>
                    Increased risk of kidney cancer (PFOA)<Citation source="bartell_2020" inline />
                  </li>
                  <li>
                    <span className={styles.healthBullet} aria-hidden="true">•</span>
                    Increased risk of testicular cancer (PFOA)<Citation source="bartell_2020" inline />
                  </li>
                </ul>
              </div>

              <div className={styles.healthCategory}>
                <h3 className={styles.healthCategoryTitle}>Areas of Active Research</h3>
                <ul className={styles.healthList}>
                  <li>
                    <span className={styles.researchBullet} aria-hidden="true">○</span>
                    Thyroid disease
                  </li>
                  <li>
                    <span className={styles.researchBullet} aria-hidden="true">○</span>
                    Immune system effects<Citation source="fenton_2021" inline />
                  </li>
                  <li>
                    <span className={styles.researchBullet} aria-hidden="true">○</span>
                    Reproductive effects
                  </li>
                  <li>
                    <span className={styles.researchBullet} aria-hidden="true">○</span>
                    Developmental effects
                  </li>
                </ul>
              </div>
            </div>

            <InfoBox type="warning" title="Important Context">
              <p>
                <strong>Exposure routes matter.</strong> Most PFAS exposure comes from:
              </p>
              <ol>
                <li>Drinking water (near contaminated sites)</li>
                <li>Food (from packaging or bioaccumulation)</li>
                <li>Consumer products (direct contact or dust)</li>
              </ol>
              <p>
                The relative contribution of cookware to overall PFAS exposure is debated
                and depends on many factors, including cooking temperature and cookware
                condition.<Citation source="fda_pfas" inline />
              </p>
            </InfoBox>

            {/* Inline health disclaimer */}
            <HealthDisclaimer variant="inline" />
          </section>

          {/* PFOA vs PFAS */}
          <section className={styles.section}>
            <h2 id="pfoa-vs-pfas">&quot;PFOA-Free&quot; vs &quot;PFAS-Free&quot;</h2>

            <div className={styles.comparisonBox}>
              <div className={styles.comparisonWarning}>
                <strong>⚠️ These are NOT the same thing.</strong>
              </div>

              <div className={styles.comparisonGrid}>
                <div className={styles.comparisonItem}>
                  <h3>PFOA</h3>
                  <p>
                    <strong>One specific compound</strong>
                    <br />
                    Perfluorooctanoic acid — a single PFAS chemical
                  </p>
                </div>
                <div className={styles.comparisonVs}>vs</div>
                <div className={styles.comparisonItem}>
                  <h3>PFAS</h3>
                  <p>
                    <strong>Entire class of 15,000+ compounds</strong>
                    <br />
                    Includes PFOA, PTFE, PFOS, GenX, PFBS, and many more
                  </p>
                </div>
              </div>
            </div>

            <p>
              A product labeled <strong>&quot;PFOA-Free&quot;</strong> may still contain:
            </p>
            <ul className={styles.warningList}>
              <li>
                <strong>PTFE (Teflon)</strong> — a type of PFAS polymer
              </li>
              <li>
                <strong>Other PFAS compounds</strong> — GenX, PFBS, PFHxS, etc.
              </li>
              <li>
                <strong>Replacement chemicals</strong> — which may have similar concerns
              </li>
            </ul>

            <InfoBox type="info" title="What to Look For">
              <p>
                <strong>True PFAS-free</strong> means no fluoropolymers or fluorinated
                compounds in any component. Look for products verified to contain no
                intentionally added PFAS, or choose inherently PFAS-free materials like
                stainless steel, cast iron, or glass.
              </p>
            </InfoBox>
          </section>

          {/* PFAS-Free Alternatives */}
          <section className={styles.section}>
            <h2 id="alternatives">PFAS-Free Alternatives</h2>

            <p>
              The following materials are naturally PFAS-free and excellent alternatives
              for cookware:
            </p>

            <h3 className={styles.subheading}>Naturally PFAS-Free Materials</h3>
            <div className={styles.materialTable}>
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Stainless Steel</strong></td>
                    <td>Contains no coatings. Excellent for searing and browning.</td>
                  </tr>
                  <tr>
                    <td><strong>Cast Iron</strong></td>
                    <td>Seasoned with oil, not synthetic coatings. Naturally non-stick with use.</td>
                  </tr>
                  <tr>
                    <td><strong>Carbon Steel</strong></td>
                    <td>Similar to cast iron, lighter weight. Popular in professional kitchens.</td>
                  </tr>
                  <tr>
                    <td><strong>Glass</strong></td>
                    <td>Inherently inert and non-reactive. Great for baking and storage.</td>
                  </tr>
                  <tr>
                    <td><strong>True Ceramic</strong></td>
                    <td>100% kiln-fired clay glazes. Not the same as &quot;ceramic coating.&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>Enameled Cast Iron</strong></td>
                    <td>Glass-based enamel coating on cast iron. Combines durability with easy cleaning.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className={styles.subheading}>Verify Carefully</h3>
            <div className={styles.materialTable}>
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Caution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>&quot;Ceramic Coating&quot;</strong></td>
                    <td>
                      Sol-gel coatings vary widely. Some may contain PFAS. Verify with
                      manufacturer documentation.
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Anodized Aluminum</strong></td>
                    <td>
                      Often combined with nonstick coatings. Uncoated hard-anodized is
                      PFAS-free.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.materialGrid}>
              <MaterialCard
                name="Stainless Steel"
                description="Durable, non-reactive, excellent for searing"
                link="/search?material=stainless-steel"
              />
              <MaterialCard
                name="Cast Iron"
                description="Naturally non-stick when seasoned"
                link="/search?material=cast-iron"
              />
              <MaterialCard
                name="Carbon Steel"
                description="Lightweight, professional-grade"
                link="/search?material=carbon-steel"
              />
              <MaterialCard
                name="Glass"
                description="Non-reactive, perfect for storage"
                link="/search?material=glass"
              />
              <MaterialCard
                name="True Ceramic"
                description="100% ceramic, kiln-fired"
                link="/search?material=ceramic"
              />
              <MaterialCard
                name="Enameled Cast Iron"
                description="Glass enamel on cast iron"
                link="/search?material=enameled"
              />
            </div>
          </section>

          {/* Sources Bibliography */}
          <SourcesBibliography sources={[...citedSources]} />

          {/* Last Updated */}
          <p className={styles.lastUpdated}>
            Last updated: January 2026
          </p>

          {/* CTA */}
          <section className={styles.cta}>
            <h2>Start Shopping PFAS-Free</h2>
            <p>
              Browse our catalog of independently verified PFAS-free kitchen products.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/search">
                <Button size="lg">Browse All Products</Button>
              </Link>
              <Link href="/learn/how-we-verify">
                <Button variant="outline" size="lg">How We Verify Products</Button>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

// Helper Components
function MaterialCard({
  name,
  description,
  link,
}: {
  name: string;
  description: string;
  link: string;
}) {
  return (
    <Link href={link} className={styles.materialCard}>
      <h4 className={styles.materialName}>{name}</h4>
      <p className={styles.materialDesc}>{description}</p>
      <span className={styles.materialLink}>Browse →</span>
    </Link>
  );
}

function TimelineItem({
  year,
  title,
  description,
  isLast = false,
}: {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ''}`}>
      <div className={styles.timelineYear}>{year}</div>
      <div className={styles.timelineContent}>
        <h3 className={styles.timelineTitle}>{title}</h3>
        <p className={styles.timelineDesc}>{description}</p>
      </div>
    </div>
  );
}

// Icons
function MoleculeIcon() {
  return (
    <svg viewBox="0 0 200 100" fill="none" className={styles.moleculeIcon} role="img" aria-label="PFAS molecule diagram showing carbon-fluorine bonds">
      {/* Carbon backbone */}
      <circle cx="40" cy="50" r="12" fill="var(--color-gray-700)" />
      <circle cx="90" cy="50" r="12" fill="var(--color-gray-700)" />
      <circle cx="140" cy="50" r="12" fill="var(--color-gray-700)" />

      {/* C-C bonds */}
      <line x1="52" y1="50" x2="78" y2="50" stroke="var(--color-gray-500)" strokeWidth="3" />
      <line x1="102" y1="50" x2="128" y2="50" stroke="var(--color-gray-500)" strokeWidth="3" />

      {/* Fluorine atoms - top */}
      <circle cx="40" cy="20" r="9" fill="var(--color-primary-500)" />
      <circle cx="90" cy="20" r="9" fill="var(--color-primary-500)" />
      <circle cx="140" cy="20" r="9" fill="var(--color-primary-500)" />

      {/* Fluorine atoms - bottom */}
      <circle cx="40" cy="80" r="9" fill="var(--color-primary-500)" />
      <circle cx="90" cy="80" r="9" fill="var(--color-primary-500)" />
      <circle cx="140" cy="80" r="9" fill="var(--color-primary-500)" />

      {/* C-F bonds */}
      <line x1="40" y1="38" x2="40" y2="29" stroke="var(--color-gray-400)" strokeWidth="2" />
      <line x1="90" y1="38" x2="90" y2="29" stroke="var(--color-gray-400)" strokeWidth="2" />
      <line x1="140" y1="38" x2="140" y2="29" stroke="var(--color-gray-400)" strokeWidth="2" />
      <line x1="40" y1="62" x2="40" y2="71" stroke="var(--color-gray-400)" strokeWidth="2" />
      <line x1="90" y1="62" x2="90" y2="71" stroke="var(--color-gray-400)" strokeWidth="2" />
      <line x1="140" y1="62" x2="140" y2="71" stroke="var(--color-gray-400)" strokeWidth="2" />

      {/* Labels */}
      <text x="170" y="22" fontSize="12" fill="var(--color-primary-600)" fontWeight="600">F (Fluorine)</text>
      <text x="170" y="54" fontSize="12" fill="var(--color-gray-600)" fontWeight="600">C (Carbon)</text>

      {/* Carbon labels */}
      <text x="36" y="54" fontSize="10" fill="white" fontWeight="600">C</text>
      <text x="86" y="54" fontSize="10" fill="white" fontWeight="600">C</text>
      <text x="136" y="54" fontSize="10" fill="white" fontWeight="600">C</text>

      {/* Fluorine labels */}
      <text x="37" y="24" fontSize="9" fill="white" fontWeight="600">F</text>
      <text x="87" y="24" fontSize="9" fill="white" fontWeight="600">F</text>
      <text x="137" y="24" fontSize="9" fill="white" fontWeight="600">F</text>
      <text x="37" y="84" fontSize="9" fill="white" fontWeight="600">F</text>
      <text x="87" y="84" fontSize="9" fill="white" fontWeight="600">F</text>
      <text x="137" y="84" fontSize="9" fill="white" fontWeight="600">F</text>
    </svg>
  );
}
