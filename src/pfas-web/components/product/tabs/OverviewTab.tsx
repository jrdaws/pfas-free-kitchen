import type { Product } from '@/lib/types';
import styles from './tabs.module.css';

interface OverviewTabProps {
  product: Product;
}

export function OverviewTab({ product }: OverviewTabProps) {
  return (
    <div className={styles.tab}>
      {/* About Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>About This Product</h3>
        {product.description ? (
          <p className={styles.description}>{product.description}</p>
        ) : (
          <p className={styles.description}>
            {product.name} by {product.brand?.name}. A quality {product.category?.name?.toLowerCase() || 'kitchen product'} 
            verified for PFAS-free materials.
          </p>
        )}
      </section>

      {/* Why It's PFAS-Free */}
      <section className={styles.highlightBox}>
        <h3 className={styles.highlightTitle}>
          <span aria-hidden="true">✓</span> Why It&apos;s PFAS-Free
        </h3>
        <p className={styles.highlightText}>
          {getPfasFreeExplanation(product)}
        </p>
      </section>

      {/* Features */}
      {product.features && Object.keys(product.features).length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Features</h3>
          <ul className={styles.featureList}>
            {product.features.inductionCompatible && (
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                Compatible with all cooktops including induction
              </li>
            )}
            {product.features.ovenSafeTempF && (
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                Oven and broiler safe to {product.features.ovenSafeTempF}°F
              </li>
            )}
            {product.features.dishwasherSafe && (
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                Dishwasher safe
              </li>
            )}
            {product.materialSummary && (
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                Made with {product.materialSummary.toLowerCase()}
              </li>
            )}
            {product.coatingSummary && product.coatingSummary.toLowerCase().includes('none') && (
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                No nonstick coating - naturally PFAS-free surface
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Brand Info */}
      {product.brand && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>About {product.brand.name}</h3>
          <p className={styles.description}>
            {product.brand.name} is a manufacturer of kitchen products. 
            View more products from this brand in our catalog.
          </p>
        </section>
      )}
    </div>
  );
}

function getPfasFreeExplanation(product: Product): string {
  const material = product.materialSummary?.toLowerCase() || '';
  const coating = product.coatingSummary?.toLowerCase() || '';
  const tier = product.verification?.tier || 0;

  // Generate explanation based on materials and tier
  if (material.includes('stainless steel') && (coating.includes('none') || coating.includes('uncoated'))) {
    return `This product uses ${product.materialSummary?.toLowerCase()} with no nonstick coating. The cooking surface is bare metal, which naturally contains no PFAS compounds.${tier >= 3 ? ' Lab testing has confirmed PFAS levels below detection limits.' : ''}`;
  }

  if (material.includes('cast iron')) {
    return `Cast iron cookware is inherently PFAS-free. The cooking surface is either bare iron or has a natural oil-based seasoning, neither of which contains PFAS compounds.${tier >= 3 ? ' This has been verified through independent lab testing.' : ''}`;
  }

  if (material.includes('ceramic') || coating.includes('ceramic')) {
    return `This product uses a ceramic-based material or coating. While some ceramic coatings have historically contained PFAS, this product has been verified to be PFAS-free.${tier >= 3 ? ' Independent lab testing confirms PFAS levels below detection limits.' : ''}`;
  }

  if (material.includes('glass')) {
    return `Glass is an inherently PFAS-free material. This product's glass construction contains no PFAS compounds by nature.`;
  }

  // Default explanation
  return `This product has been evaluated for PFAS content and meets our verification standards. ${tier >= 3 ? 'Independent lab testing confirms PFAS levels below detection limits.' : tier >= 2 ? 'Manufacturing policies and documentation have been reviewed.' : 'The brand has provided a statement regarding PFAS-free status.'}`;
}
