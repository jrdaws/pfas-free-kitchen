import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  DO_NOT_BUY_BRANDS,
  getCookwareToAvoid,
  getAirFryersToAvoid,
  getAppliancesToAvoid,
} from '@/data/do-not-buy';
import styles from './do-not-buy.module.css';

export const metadata: Metadata = {
  title: 'Products to Avoid - PFAS Confirmed | PFAS-Free Kitchen',
  description: 'List of cookware, air fryers, and kitchen appliances confirmed to contain PFAS. Based on California AB1200 disclosures and independent testing.',
  keywords: ['PFAS cookware', 'products to avoid', 'PFAS air fryers', 'toxic cookware', 'do not buy'],
};

export default function DoNotBuyPage() {
  const cookware = getCookwareToAvoid();
  const airFryers = getAirFryersToAvoid();
  const appliances = getAppliancesToAvoid();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.warningIcon}>⚠️</span>
        <h1 className={styles.title}>Products to Avoid</h1>
        <p className={styles.subtitle}>
          These products have been confirmed to contain PFAS based on California AB1200 
          chemical disclosures and independent laboratory testing.
        </p>
      </header>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <strong>Important:</strong> This list focuses on specific product lines known to contain PFAS. 
        Many of these brands also offer PFAS-free alternatives (like stainless steel or enameled cast iron). 
        Always check the specific product line before purchasing.
      </div>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{DO_NOT_BUY_BRANDS.length}</span>
            <span className={styles.statLabel}>Brands with PFAS products</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{cookware.length}</span>
            <span className={styles.statLabel}>Cookware lines to avoid</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{airFryers.length}</span>
            <span className={styles.statLabel}>Air fryer brands to avoid</span>
          </div>
        </div>
      </section>

      {/* Air Fryers Section */}
      <section className={styles.categorySection}>
        <div className={styles.categoryHeader}>
          <span className={styles.categoryIcon}>🍟</span>
          <h2 className={styles.categoryTitle}>Air Fryers to Avoid</h2>
          <p className={styles.categoryDescription}>
            Most air fryers use PTFE (Teflon) coatings on their cooking baskets. 
            These products tested positive for PFAS by Mamavation independent testing.
          </p>
        </div>
        
        <div className={styles.productsGrid}>
          {airFryers.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productHeader}>
                <h3 className={styles.productBrand}>{product.brand}</h3>
                <span className={styles.pfasBadge}>Contains PFAS</span>
              </div>
              <p className={styles.productLine}>{product.productLine}</p>
              <div className={styles.pfasTypes}>
                {product.pfasType.map((type) => (
                  <span key={type} className={styles.pfasType}>{type}</span>
                ))}
              </div>
              <div className={styles.productSource}>
                <span className={styles.sourceLabel}>Source:</span>
                {product.sourceUrl ? (
                  <a 
                    href={product.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    {product.source}
                  </a>
                ) : (
                  <span>{product.source}</span>
                )}
              </div>
              {product.notes && (
                <p className={styles.productNotes}>{product.notes}</p>
              )}
            </div>
          ))}
        </div>

        <div className={styles.safeAlternative}>
          <h4>Safe Alternative:</h4>
          <p>
            <strong>Fritaire Glass Air Fryer</strong> - Uses a tempered glass cooking bowl 
            instead of coated baskets. Verified PFAS-free.
          </p>
          <Link href="/search?q=fritaire">
            <Button size="sm">View PFAS-Free Air Fryers</Button>
          </Link>
        </div>
      </section>

      {/* Cookware Section */}
      <section className={styles.categorySection}>
        <div className={styles.categoryHeader}>
          <span className={styles.categoryIcon}>🍳</span>
          <h2 className={styles.categoryTitle}>Nonstick Cookware to Avoid</h2>
          <p className={styles.categoryDescription}>
            These nonstick cookware lines use PTFE (Teflon) or similar fluoropolymer coatings 
            per California AB1200 chemical disclosures.
          </p>
        </div>
        
        <div className={styles.productsGrid}>
          {cookware.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productHeader}>
                <h3 className={styles.productBrand}>{product.brand}</h3>
                <span className={styles.pfasBadge}>Contains PFAS</span>
              </div>
              <p className={styles.productLine}>{product.productLine}</p>
              <div className={styles.pfasTypes}>
                {product.pfasType.map((type) => (
                  <span key={type} className={styles.pfasType}>{type}</span>
                ))}
              </div>
              <div className={styles.productSource}>
                <span className={styles.sourceLabel}>Source:</span>
                {product.sourceUrl ? (
                  <a 
                    href={product.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    {product.source}
                  </a>
                ) : (
                  <span>{product.source}</span>
                )}
              </div>
              {product.notes && (
                <p className={styles.productNotes}>{product.notes}</p>
              )}
            </div>
          ))}
        </div>

        <div className={styles.safeAlternative}>
          <h4>Safe Alternatives:</h4>
          <ul>
            <li><strong>Cast Iron</strong> - Lodge, Staub, Victoria (inherently PFAS-free)</li>
            <li><strong>Carbon Steel</strong> - de Buyer, Made In, Matfer Bourgeat</li>
            <li><strong>Stainless Steel</strong> - All-Clad D3/D5, Demeyere, Tramontina</li>
            <li><strong>Ceramic-Coated</strong> - GreenPan, Caraway, GreenLife (verified PFAS-free)</li>
          </ul>
          <Link href="/search">
            <Button size="sm">Browse PFAS-Free Cookware</Button>
          </Link>
        </div>
      </section>

      {/* Appliances Section */}
      {appliances.length > 0 && (
        <section className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <span className={styles.categoryIcon}>🔌</span>
            <h2 className={styles.categoryTitle}>Other Appliances to Avoid</h2>
            <p className={styles.categoryDescription}>
              These kitchen appliances have PFAS-containing components.
            </p>
          </div>
          
          <div className={styles.productsGrid}>
            {appliances.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productBrand}>{product.brand}</h3>
                  <span className={styles.pfasBadge}>Contains PFAS</span>
                </div>
                <p className={styles.productLine}>{product.productLine}</p>
                <div className={styles.pfasTypes}>
                  {product.pfasType.map((type) => (
                    <span key={type} className={styles.pfasType}>{type}</span>
                  ))}
                </div>
                <div className={styles.productSource}>
                  <span className={styles.sourceLabel}>Source:</span>
                  {product.sourceUrl ? (
                    <a 
                      href={product.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.sourceLink}
                    >
                      {product.source}
                    </a>
                  ) : (
                    <span>{product.source}</span>
                  )}
                </div>
                {product.notes && (
                  <p className={styles.productNotes}>{product.notes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources Section */}
      <section className={styles.sourcesSection}>
        <h2 className={styles.sourcesTitle}>Our Sources</h2>
        <div className={styles.sourcesList}>
          <div className={styles.sourceItem}>
            <h4>California AB1200</h4>
            <p>
              California law requiring cookware manufacturers to disclose the presence of 
              PFAS chemicals. Brands selling in California must provide this information.
            </p>
          </div>
          <div className={styles.sourceItem}>
            <h4>Mamavation</h4>
            <p>
              Independent consumer advocacy organization that conducts third-party laboratory 
              testing on kitchen products for PFAS contamination.
            </p>
            <a 
              href="https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              View their air fryer testing →
            </a>
          </div>
          <div className={styles.sourceItem}>
            <h4>Colorado HB 22-1345</h4>
            <p>
              Similar disclosure requirements to California, providing additional data 
              on PFAS in consumer products.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to Switch to PFAS-Free?</h2>
        <p>Browse our catalog of verified PFAS-free kitchen products.</p>
        <div className={styles.ctaButtons}>
          <Link href="/search">
            <Button size="lg">Browse Safe Products</Button>
          </Link>
          <Link href="/learn/buyers-guide">
            <Button variant="outline" size="lg">Read Buyer&apos;s Guide</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
