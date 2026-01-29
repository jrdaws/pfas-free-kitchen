'use client';

import { useState } from 'react';
import styles from './TierExplainer.module.css';

interface TierData {
  tier: number;
  name: string;
  symbol: string;
  tagline: string;
  description: string;
  evidenceRequired: string[];
  howToReach: string[];
  whatItMeans: string;
  limitations?: string[];
  examples: string[];
  color: string;
}

const TIERS: TierData[] = [
  {
    tier: 4,
    name: 'Monitored',
    symbol: '✓✓',
    tagline: 'The highest level of verification',
    description: 'Products with ongoing testing programs. We receive updated lab results on a schedule (typically annually). If a product fails retest, the listing is immediately updated.',
    evidenceRequired: [
      'Initial lab report (Tier 3 equivalent)',
      'Documented retest schedule',
      'Access to ongoing results',
      'Supply chain transparency agreement',
      'Immediate notification of manufacturing changes',
    ],
    howToReach: [
      'Meet all Tier 3 requirements first',
      'Brand commits to ongoing testing program',
      'We verify retest schedule and receive results',
      'Continued monitoring for at least one testing cycle',
    ],
    whatItMeans: 'These products have the most robust verification. If something changes in manufacturing or if new testing reveals issues, we\'ll know and update the listing immediately.',
    examples: ['Caraway Home cookware', 'GreenPan certified line'],
    color: 'var(--tier-platinum)',
  },
  {
    tier: 3,
    name: 'Lab Tested',
    symbol: '✓',
    tagline: 'Independent laboratory verification',
    description: 'Products tested by an independent laboratory using validated methods. We verify the lab report is authentic and the testing method is appropriate for detecting PFAS.',
    evidenceRequired: [
      'Lab report from accredited laboratory (ISO 17025 or equivalent)',
      'Test method appropriate for PFAS detection (LC-MS/MS or total fluorine)',
      'Detection limits clearly stated (LOD/LOQ)',
      'Sample description matching the product',
      'Chain of custody documentation',
    ],
    howToReach: [
      'Submit lab report from accredited laboratory',
      'We verify lab accreditation status',
      'Confirm test method is valid for the product matrix',
      'Verify sample matches current production',
    ],
    whatItMeans: 'Independent testing has confirmed PFAS absence. This is strong evidence, though a single test represents one sample from one production run.',
    limitations: [
      'A single lab test represents one sample from one production run',
      'Manufacturing can change over time',
      'Lab tests don\'t guarantee future production',
    ],
    examples: ['Always Pan (verified samples)', 'Made In cookware'],
    color: 'var(--tier-gold)',
  },
  {
    tier: 2,
    name: 'Policy Reviewed',
    symbol: '○',
    tagline: 'Documentation review without independent testing',
    description: 'We\'ve reviewed the manufacturer\'s PFAS policy, ingredient specifications, or supply chain documentation. No independent testing, but credible documentation exists.',
    evidenceRequired: [
      'Written PFAS-free policy on company letterhead',
      'Material safety data sheets (MSDS/SDS)',
      'Supply chain certifications',
      'Detailed ingredient/material specifications',
      'OR inherently PFAS-free materials verified',
    ],
    howToReach: [
      'Submit official PFAS-free documentation',
      'Provide material specifications',
      'Document supply chain practices',
      'OR demonstrate inherent PFAS-free material composition',
    ],
    whatItMeans: 'We have reasonable confidence based on documentation, but no independent laboratory verification. The manufacturer\'s claims have not been tested by a third party.',
    examples: ['All-Clad stainless steel', 'Lodge cast iron'],
    color: 'var(--tier-silver)',
  },
  {
    tier: 1,
    name: 'Brand Statement',
    symbol: '·',
    tagline: 'Unverified brand claims',
    description: 'The brand has made a public claim that the product is PFAS-free, but we have not verified this claim with documentation or testing.',
    evidenceRequired: [
      'Public statement on brand website or packaging',
      'Customer service confirmation',
      'Marketing materials claiming PFAS-free',
    ],
    howToReach: [
      'Brand publicly claims PFAS-free status',
      'We document the claim location and date',
    ],
    whatItMeans: 'Brand statements can be accurate but unverified, based on different definitions of "PFAS-free," outdated if manufacturing has changed, or limited to certain components only.',
    limitations: [
      'May be based on different definitions of "PFAS-free"',
      'Could be outdated if manufacturing changed',
      'May only apply to certain components',
      'No verification of claim accuracy',
    ],
    examples: ['Various Amazon brands', 'Newer DTC cookware brands'],
    color: 'var(--tier-bronze)',
  },
  {
    tier: 0,
    name: 'Unknown',
    symbol: '?',
    tagline: 'No verification information available',
    description: 'Products with no publicly available PFAS information, no response to our information requests, or ambiguous material composition.',
    evidenceRequired: [
      'No evidence available',
      'No response to verification requests',
    ],
    howToReach: [
      'Product has not been evaluated',
      'Manufacturer has not responded to inquiries',
    ],
    whatItMeans: 'We cannot make any determination about PFAS content. These products are typically not listed unless commonly searched for, to inform consumers about the lack of information.',
    examples: ['Unlisted products', 'Non-responsive manufacturers'],
    color: 'var(--color-gray-400)',
  },
];

interface TierExplainerProps {
  defaultExpanded?: number;
  showAll?: boolean;
}

export function TierExplainer({ defaultExpanded = 4, showAll = true }: TierExplainerProps) {
  const [expandedTier, setExpandedTier] = useState<number | null>(defaultExpanded);
  
  const tiersToShow = showAll ? TIERS : TIERS.filter(t => t.tier > 0);

  const toggleTier = (tier: number) => {
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  return (
    <div className={styles.container}>
      {tiersToShow.map((tierData) => (
        <div 
          key={tierData.tier}
          className={`${styles.tierCard} ${expandedTier === tierData.tier ? styles.expanded : ''}`}
          style={{ '--tier-color': tierData.color } as React.CSSProperties}
        >
          <button 
            className={styles.tierHeader}
            onClick={() => toggleTier(tierData.tier)}
            aria-expanded={expandedTier === tierData.tier}
          >
            <div className={styles.tierBadge}>
              <span className={styles.tierNumber}>{tierData.tier}</span>
              <span className={styles.tierSymbol}>{tierData.symbol}</span>
            </div>
            <div className={styles.tierMeta}>
              <h3 className={styles.tierName}>
                Tier {tierData.tier} · {tierData.name}
              </h3>
              <p className={styles.tierTagline}>{tierData.tagline}</p>
            </div>
            <span className={styles.expandIcon} aria-hidden="true">
              {expandedTier === tierData.tier ? '−' : '+'}
            </span>
          </button>

          {expandedTier === tierData.tier && (
            <div className={styles.tierContent}>
              <p className={styles.description}>{tierData.description}</p>

              <div className={styles.evidenceSection}>
                <h4>Evidence Required</h4>
                <ul>
                  {tierData.evidenceRequired.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.howToSection}>
                <h4>How Products Reach Tier {tierData.tier}</h4>
                <ol>
                  {tierData.howToReach.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>

              <div className={styles.meaningSection}>
                <h4>What Tier {tierData.tier} Means for You</h4>
                <p>{tierData.whatItMeans}</p>
              </div>

              {tierData.limitations && tierData.limitations.length > 0 && (
                <div className={styles.limitationsSection}>
                  <h4>Limitations</h4>
                  <ul>
                    {tierData.limitations.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.examplesSection}>
                <h4>Example Products</h4>
                <div className={styles.examplesList}>
                  {tierData.examples.map((example, i) => (
                    <span key={i} className={styles.exampleTag}>
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TierExplainer;
