import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox } from '@/components/content';
import { Button } from '@/components/ui';
import styles from './guide.module.css';

export const metadata: Metadata = {
  title: 'PFAS-Free Cookware Buyer\'s Guide',
  description: 'Everything you need to know to choose PFAS-free cookware. Compare materials, understand coatings, and avoid common pitfalls.',
  keywords: ['PFAS-free cookware guide', 'buying guide', 'cookware materials', 'ceramic coating', 'non-stick alternatives'],
};

export default function BuyersGuidePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/learn">Learn</Link>
          <span>/</span>
          <span>Buyer&apos;s Guide</span>
        </nav>

        <h1 className={styles.title}>PFAS-Free Cookware Buyer&apos;s Guide</h1>
        <p className={styles.subtitle}>
          Everything you need to make informed decisions about PFAS-free cookware
        </p>
      </header>

      <article className={styles.content}>
        {/* Quick Links */}
        <nav className={styles.quickLinks}>
          <a href="#materials">Choosing Materials</a>
          <a href="#ceramic">Ceramic Coatings</a>
          <a href="#pfoa-vs-pfas">PFOA vs PFAS</a>
          <a href="#questions">Questions to Ask</a>
          <a href="#red-flags">Red Flags</a>
          <a href="#picks">Our Top Picks</a>
        </nav>

        {/* Materials Section */}
        <section className={styles.section}>
          <h2 id="materials">Choosing the Right Material</h2>
          
          <p>
            Different materials suit different cooking styles. Here&apos;s what to consider:
          </p>

          <div className={styles.materialComparison}>
            <MaterialComparisonCard
              name="Stainless Steel"
              pros={['Durable and long-lasting', 'Great for searing and browning', 'Non-reactive with acidic foods', 'Dishwasher safe']}
              cons={['Food can stick without technique', 'Heavier than some alternatives', 'Hot spots if not clad']}
              bestFor="All-purpose cooking, searing, deglazing"
            />
            <MaterialComparisonCard
              name="Cast Iron"
              pros={['Excellent heat retention', 'Naturally non-stick when seasoned', 'Induction compatible', 'Virtually indestructible']}
              cons={['Heavy', 'Requires maintenance/seasoning', 'Not dishwasher safe', 'Slow to heat']}
              bestFor="High-heat cooking, baking, frying"
            />
            <MaterialComparisonCard
              name="Carbon Steel"
              pros={['Lighter than cast iron', 'Heats quickly', 'Develops natural non-stick', 'Great for wok cooking']}
              cons={['Requires seasoning', 'Can react with acidic foods', 'Not dishwasher safe']}
              bestFor="Stir-frying, omelettes, searing"
            />
            <MaterialComparisonCard
              name="Enameled Cast Iron"
              pros={['No seasoning required', 'Non-reactive surface', 'Beautiful colors available', 'Easy to clean']}
              cons={['Can chip if dropped', 'Heavy', 'Expensive']}
              bestFor="Braising, stews, baking bread"
            />
          </div>
        </section>

        {/* Ceramic Coatings */}
        <section className={styles.section}>
          <h2 id="ceramic">Understanding Ceramic Coatings</h2>

          <InfoBox type="warning" title="Ceramic ≠ Ceramic">
            <p>
              There are two very different types of &quot;ceramic&quot; cookware. Understanding the 
              difference is crucial.
            </p>
          </InfoBox>

          <div className={styles.comparisonTable}>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonCell}>
                <h3>True Ceramic (100% Ceramic)</h3>
                <p>
                  Made entirely from clay and minerals, kiln-fired at high temperatures. 
                  These are naturally PFAS-free.
                </p>
                <span className={styles.verdict}>✓ Always PFAS-free</span>
              </div>
              <div className={styles.comparisonCell}>
                <h3>Ceramic-Coated (Sol-Gel)</h3>
                <p>
                  Metal pan with a ceramic-like coating applied. The coating is usually 
                  PFAS-free, but verify with the manufacturer.
                </p>
                <span className={styles.verdictCaution}>⚠ Usually PFAS-free, verify</span>
              </div>
            </div>
          </div>

          <h3>What to look for in ceramic coatings:</h3>
          <ul className={styles.checkList}>
            <li>Manufacturer explicitly states &quot;PFAS-free&quot; (not just &quot;PFOA-free&quot;)</li>
            <li>Third-party testing or certification available</li>
            <li>Clear ingredient/material disclosure</li>
            <li>Reputable brand with transparency practices</li>
          </ul>
        </section>

        {/* PFOA vs PFAS */}
        <section className={styles.section}>
          <h2 id="pfoa-vs-pfas">What &quot;PFOA-Free&quot; Actually Means</h2>

          <InfoBox type="danger" title="Critical Distinction">
            <p>
              <strong>&quot;PFOA-free&quot; does NOT mean &quot;PFAS-free&quot;.</strong> PFOA is just one of 
              over 15,000 PFAS chemicals. Many products labeled &quot;PFOA-free&quot; contain 
              other PFAS compounds like GenX, which may have similar health concerns.
            </p>
          </InfoBox>

          <div className={styles.vennDiagram}>
            <div className={styles.vennOuter}>
              <span className={styles.vennLabel}>PFAS (15,000+ chemicals)</span>
              <div className={styles.vennInner}>
                <span className={styles.vennInnerLabel}>PFOA (1 chemical)</span>
              </div>
            </div>
          </div>

          <h3>What to look for instead:</h3>
          <ul className={styles.checkList}>
            <li>&quot;PFAS-free&quot; or &quot;Free of all PFAS&quot;</li>
            <li>&quot;No fluorinated compounds&quot;</li>
            <li>&quot;Fluorine-free&quot;</li>
            <li>Products made from inherently PFAS-free materials</li>
          </ul>
        </section>

        {/* Questions to Ask */}
        <section className={styles.section}>
          <h2 id="questions">Questions to Ask Before Buying</h2>

          <div className={styles.questionGrid}>
            <div className={styles.questionCard}>
              <span className={styles.questionNumber}>1</span>
              <h3>Is it PFAS-free, not just PFOA-free?</h3>
              <p>Make sure the manufacturer specifies all PFAS, not just one type.</p>
            </div>
            <div className={styles.questionCard}>
              <span className={styles.questionNumber}>2</span>
              <h3>What materials are in contact with food?</h3>
              <p>Check all food-contact surfaces including handles, rivets, and lids.</p>
            </div>
            <div className={styles.questionCard}>
              <span className={styles.questionNumber}>3</span>
              <h3>Is there independent verification?</h3>
              <p>Look for third-party lab testing or credible certifications.</p>
            </div>
            <div className={styles.questionCard}>
              <span className={styles.questionNumber}>4</span>
              <h3>Does the coating degrade safely?</h3>
              <p>For non-stick alternatives, understand how the coating performs over time.</p>
            </div>
          </div>
        </section>

        {/* Red Flags */}
        <section className={styles.section}>
          <h2 id="red-flags">Red Flags to Watch For</h2>

          <div className={styles.redFlagList}>
            <div className={styles.redFlag}>
              <span className={styles.redFlagIcon}>🚩</span>
              <div>
                <h3>&quot;PFOA-free&quot; claims without mentioning PFAS</h3>
                <p>This often means other PFAS compounds are still present.</p>
              </div>
            </div>
            <div className={styles.redFlag}>
              <span className={styles.redFlagIcon}>🚩</span>
              <div>
                <h3>Vague marketing language</h3>
                <p>&quot;Eco-friendly&quot; or &quot;green&quot; without specific PFAS claims.</p>
              </div>
            </div>
            <div className={styles.redFlag}>
              <span className={styles.redFlagIcon}>🚩</span>
              <div>
                <h3>No material transparency</h3>
                <p>Manufacturers who won&apos;t disclose coating ingredients.</p>
              </div>
            </div>
            <div className={styles.redFlag}>
              <span className={styles.redFlagIcon}>🚩</span>
              <div>
                <h3>Too-good-to-be-true non-stick claims</h3>
                <p>True PFAS-free non-stick alternatives have some limitations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Picks */}
        <section className={styles.section}>
          <h2 id="picks">Our Top Picks by Category</h2>

          <div className={styles.pickGrid}>
            <Link href="/search?category=skillets&tier=4,3" className={styles.pickCard}>
              <h3>Best Skillets</h3>
              <p>Top-rated PFAS-free skillets and frying pans</p>
              <span className={styles.pickLink}>View verified products →</span>
            </Link>
            <Link href="/search?category=dutch-ovens&tier=4,3" className={styles.pickCard}>
              <h3>Best Dutch Ovens</h3>
              <p>Enameled cast iron for braising and baking</p>
              <span className={styles.pickLink}>View verified products →</span>
            </Link>
            <Link href="/search?category=saucepans&tier=4,3" className={styles.pickCard}>
              <h3>Best Saucepans</h3>
              <p>Stainless steel and cast iron options</p>
              <span className={styles.pickLink}>View verified products →</span>
            </Link>
            <Link href="/search?category=bakeware&tier=4,3" className={styles.pickCard}>
              <h3>Best Bakeware</h3>
              <p>Safe baking sheets and pans</p>
              <span className={styles.pickLink}>View verified products →</span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2>Ready to shop?</h2>
          <p>Browse our complete catalog of verified PFAS-free products.</p>
          <div className={styles.ctaButtons}>
            <Link href="/search">
              <Button size="lg">Browse All Products</Button>
            </Link>
            <Link href="/learn/how-we-verify">
              <Button variant="outline" size="lg">How We Verify</Button>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}

function MaterialComparisonCard({ 
  name, 
  pros, 
  cons, 
  bestFor 
}: { 
  name: string; 
  pros: string[]; 
  cons: string[]; 
  bestFor: string 
}) {
  return (
    <div className={styles.materialCard}>
      <h3 className={styles.materialName}>{name}</h3>
      <div className={styles.materialPros}>
        <h4>Pros</h4>
        <ul>
          {pros.map((pro, i) => <li key={i}>{pro}</li>)}
        </ul>
      </div>
      <div className={styles.materialCons}>
        <h4>Cons</h4>
        <ul>
          {cons.map((con, i) => <li key={i}>{con}</li>)}
        </ul>
      </div>
      <p className={styles.materialBestFor}>
        <strong>Best for:</strong> {bestFor}
      </p>
    </div>
  );
}
