import Link from 'next/link';
import { ImageGallery } from './ImageGallery';
import { TierBadge } from './TierBadge';
import { RetailerLinks } from './RetailerLinks';
import { AffiliateDisclosure } from '../layout/AffiliateDisclosure';
import { TIER_CONFIG, type Product, type VerificationTier } from '@/lib/types';
import styles from './ProductHero.module.css';

interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
}

interface ProductHeroProps {
  product: Product;
  affiliateLinks?: AffiliateLink[];
}

export function ProductHero({ product, affiliateLinks }: ProductHeroProps) {
  const tier = product.verification?.tier ?? 0;
  const tierConfig = TIER_CONFIG[tier as VerificationTier];

  return (
    <section className={styles.hero}>
      {/* Image Gallery */}
      <div className={styles.gallery}>
        <ImageGallery 
          images={product.images || []} 
          productName={product.name} 
        />
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        {/* Brand */}
        <p className={styles.brand}>
          <Link href={`/search?brand=${product.brand?.slug}`}>
            {product.brand?.name}
          </Link>
        </p>

        {/* Title */}
        <h1 className={styles.title}>{product.name}</h1>

        {/* Verification Box */}
        <div 
          className={styles.verificationBox}
          style={{
            '--tier-color': tierConfig.color,
            '--tier-bg': tierConfig.bgColor,
          } as React.CSSProperties}
        >
          <div className={styles.verificationHeader}>
            <TierBadge tier={tier as VerificationTier} size="lg" showTooltip={false} />
            <span className={styles.verificationLabel}>
              {tierConfig.label}
            </span>
          </div>
          {product.verification?.scopeText && (
            <p className={styles.verificationScope}>
              {product.verification.scopeText}
            </p>
          )}
          {product.verification?.hasEvidence && (
            <p className={styles.evidenceCount}>
              📄 {product.verification.evidenceCount} evidence document
              {product.verification.evidenceCount !== 1 ? 's' : ''} on file
            </p>
          )}
        </div>

        {/* Key Specifications */}
        <div className={styles.specs}>
          <h2 className={styles.specsTitle}>Key Specifications</h2>
          <dl className={styles.specsList}>
            {product.materialSummary && (
              <>
                <dt>Material</dt>
                <dd>{product.materialSummary}</dd>
              </>
            )}
            {product.coatingSummary && (
              <>
                <dt>Coating</dt>
                <dd>{product.coatingSummary}</dd>
              </>
            )}
            {product.features?.inductionCompatible !== undefined && (
              <>
                <dt>Induction</dt>
                <dd>{product.features.inductionCompatible ? 'Compatible' : 'Not compatible'}</dd>
              </>
            )}
            {product.features?.ovenSafeTempF && (
              <>
                <dt>Oven Safe</dt>
                <dd>Up to {product.features.ovenSafeTempF}°F</dd>
              </>
            )}
            {product.features?.dishwasherSafe !== undefined && (
              <>
                <dt>Dishwasher</dt>
                <dd>{product.features.dishwasherSafe ? 'Safe' : 'Hand wash only'}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Shop Section */}
        <div className={styles.shopSection}>
          <h2 className={styles.shopTitle}>Shop This Product</h2>
          <AffiliateDisclosure variant="inline" />
          <RetailerLinks 
            retailers={product.retailers || []} 
            productId={product.id}
            affiliateLinks={affiliateLinks}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.actionButton} aria-label="Add to compare">
            <span aria-hidden="true">☐</span> Add to Compare
          </button>
          <button className={styles.actionButton} aria-label="Save product">
            <span aria-hidden="true">♡</span> Save
          </button>
          <button className={styles.actionButton} aria-label="Share product">
            <span aria-hidden="true">↗</span> Share
          </button>
        </div>
      </div>
    </section>
  );
}
