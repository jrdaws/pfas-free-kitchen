import { TierBadge } from '../TierBadge';
import { TIER_CONFIG, type Product, type VerificationTier } from '@/lib/types';
import styles from './tabs.module.css';

interface VerificationTabProps {
  product: Product;
  evidence?: EvidenceItem[];
}

interface EvidenceItem {
  id: string;
  type: 'lab_report' | 'brand_statement' | 'policy_document' | 'screenshot';
  title: string;
  labName?: string;
  method?: string;
  analyteCount?: number;
  lodLoq?: { lod: number; loq: number };
  sampleScope?: { units: number; lots: number };
  testedDate?: string;
  hash?: string;
  statementText?: string;
  statementDate?: string;
}

export function VerificationTab({ product, evidence = [] }: VerificationTabProps) {
  const tier = (product.verification?.tier ?? 0) as VerificationTier;
  const tierConfig = TIER_CONFIG[tier];

  return (
    <div className={styles.tab}>
      {/* Current Status */}
      <section className={styles.section}>
        <div className={styles.statusHeader}>
          <h3 className={styles.sectionTitle}>
            Verification Status: 
            <span className={styles.tierInline}>
              <TierBadge tier={tier} size="md" showTooltip={false} />
              {tierConfig.label}
            </span>
          </h3>
        </div>
      </section>

      {/* What This Means */}
      <section className={styles.highlightBox}>
        <h4 className={styles.highlightTitle}>What This Means</h4>
        <p className={styles.highlightText}>
          {getVerificationExplanation(tier, product)}
        </p>
      </section>

      {/* Evidence on File */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Evidence on File</h4>
        
        {evidence.length > 0 ? (
          <div className={styles.evidenceList}>
            {evidence.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        ) : product.verification?.hasEvidence ? (
          <div className={styles.evidenceList}>
            {/* Placeholder evidence cards based on tier */}
            {tier >= 3 && (
              <div className={styles.evidenceCard}>
                <div className={styles.evidenceIcon}>📄</div>
                <div className={styles.evidenceContent}>
                  <h5 className={styles.evidenceTitle}>Lab Report</h5>
                  <p className={styles.evidenceDetail}>
                    Independent laboratory testing on file
                  </p>
                  <p className={styles.evidenceMeta}>
                    {product.verification.evidenceCount} document(s) available
                  </p>
                </div>
              </div>
            )}
            {tier >= 1 && (
              <div className={styles.evidenceCard}>
                <div className={styles.evidenceIcon}>📝</div>
                <div className={styles.evidenceContent}>
                  <h5 className={styles.evidenceTitle}>Brand Statement</h5>
                  <p className={styles.evidenceDetail}>
                    Brand attestation regarding PFAS-free status
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No evidence documents are currently on file for this product.</p>
          </div>
        )}
      </section>

      {/* Tier Explanation */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Understanding Our Verification Tiers</h4>
        <div className={styles.tierExplanation}>
          {([4, 3, 2, 1, 0] as VerificationTier[]).map((t) => {
            const config = TIER_CONFIG[t];
            const isCurrentTier = t === tier;
            
            return (
              <div 
                key={t} 
                className={`${styles.tierRow} ${isCurrentTier ? styles.currentTier : ''}`}
              >
                <div className={styles.tierBadgeCell}>
                  <TierBadge tier={t} size="sm" showTooltip={false} />
                </div>
                <div className={styles.tierInfo}>
                  <span className={styles.tierLabel}>{config.label}</span>
                  <span className={styles.tierDesc}>{config.description}</span>
                </div>
                {isCurrentTier && (
                  <span className={styles.currentMarker}>← This product</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Verification Date */}
      {product.verification?.decisionDate && (
        <p className={styles.verificationDate}>
          Last verified: {new Date(product.verification.decisionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const icons: Record<string, string> = {
    lab_report: '📄',
    brand_statement: '📝',
    policy_document: '📋',
    screenshot: '📷',
  };

  return (
    <div className={styles.evidenceCard}>
      <div className={styles.evidenceIcon}>{icons[evidence.type] || '📄'}</div>
      <div className={styles.evidenceContent}>
        <h5 className={styles.evidenceTitle}>{evidence.title}</h5>
        
        {evidence.type === 'lab_report' && (
          <>
            {evidence.method && (
              <p className={styles.evidenceDetail}>
                Method: {evidence.method}
              </p>
            )}
            {evidence.analyteCount && (
              <p className={styles.evidenceDetail}>
                Analytes: {evidence.analyteCount} PFAS compounds
              </p>
            )}
            {evidence.lodLoq && (
              <p className={styles.evidenceDetail}>
                LOD/LOQ: {evidence.lodLoq.lod} / {evidence.lodLoq.loq} ng/g
              </p>
            )}
            {evidence.sampleScope && (
              <p className={styles.evidenceDetail}>
                Sample: {evidence.sampleScope.units} unit(s), {evidence.sampleScope.lots} production lot(s)
              </p>
            )}
            {evidence.testedDate && (
              <p className={styles.evidenceDetail}>
                Tested: {evidence.testedDate}
              </p>
            )}
            {evidence.hash && (
              <p className={styles.evidenceHash}>
                Hash: {evidence.hash.substring(0, 16)}...
              </p>
            )}
          </>
        )}

        {evidence.type === 'brand_statement' && (
          <>
            {evidence.statementText && (
              <blockquote className={styles.statementQuote}>
                &ldquo;{evidence.statementText}&rdquo;
              </blockquote>
            )}
            {evidence.statementDate && (
              <p className={styles.evidenceDetail}>
                Date: {evidence.statementDate}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getVerificationExplanation(tier: VerificationTier, product: Product): string {
  switch (tier) {
    case 4:
      return `This product is part of our ongoing monitoring program. It has been tested by an independent laboratory and is subject to regular re-verification to ensure continued PFAS-free status.`;
    case 3:
      return `This product has been tested by an independent laboratory using LC-MS/MS (liquid chromatography-mass spectrometry) or similar methods to detect PFAS compounds. Results showed all tested PFAS were below the detection limit.`;
    case 2:
      return `We have reviewed the manufacturer's policies and documentation regarding PFAS use. The brand has provided detailed information about their manufacturing processes and material sourcing.`;
    case 1:
      return `The brand has provided a statement claiming this product is PFAS-free. This claim has not been independently verified through third-party testing.`;
    case 0:
    default:
      return `The PFAS status of this product has not been verified. We do not have sufficient information to confirm whether this product contains PFAS.`;
  }
}
