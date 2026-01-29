import styles from './EvidenceBadge.module.css';

export type EvidenceType = 'lab_report' | 'material_analysis' | 'brand_documentation' | 'public_statement';

interface EvidenceTypeConfig {
  icon: string;
  label: string;
  description: string;
  strength: 'strongest' | 'strong' | 'moderate' | 'weak';
  color: string;
}

const EVIDENCE_TYPES: Record<EvidenceType, EvidenceTypeConfig> = {
  lab_report: {
    icon: '🧪',
    label: 'Lab Report',
    description: 'Independent third-party testing with quantitative results',
    strength: 'strongest',
    color: 'var(--color-green-500)',
  },
  material_analysis: {
    icon: '📋',
    label: 'Material Analysis',
    description: 'Chemical composition documentation and specifications',
    strength: 'strong',
    color: 'var(--color-cyan-500)',
  },
  brand_documentation: {
    icon: '📄',
    label: 'Brand Documentation',
    description: 'Official company policies, MSDS, supplier certifications',
    strength: 'moderate',
    color: 'var(--color-yellow-500)',
  },
  public_statement: {
    icon: '💬',
    label: 'Public Statement',
    description: 'Website claims, marketing materials, press releases',
    strength: 'weak',
    color: 'var(--color-gray-400)',
  },
};

interface EvidenceBadgeProps {
  type: EvidenceType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
  interactive?: boolean;
}

export function EvidenceBadge({ 
  type, 
  size = 'md',
  showLabel = true,
  showDescription = false,
  interactive = false,
}: EvidenceBadgeProps) {
  const config = EVIDENCE_TYPES[type];

  return (
    <div 
      className={`${styles.badge} ${styles[size]} ${interactive ? styles.interactive : ''}`}
      style={{ '--badge-color': config.color } as React.CSSProperties}
      title={!showDescription ? config.description : undefined}
    >
      <span className={styles.icon}>{config.icon}</span>
      {showLabel && (
        <span className={styles.label}>{config.label}</span>
      )}
      {showDescription && (
        <span className={styles.description}>{config.description}</span>
      )}
    </div>
  );
}

interface EvidenceListProps {
  types: EvidenceType[];
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export function EvidenceList({ 
  types, 
  size = 'md', 
  orientation = 'horizontal' 
}: EvidenceListProps) {
  return (
    <div className={`${styles.list} ${styles[orientation]}`}>
      {types.map((type) => (
        <EvidenceBadge key={type} type={type} size={size} />
      ))}
    </div>
  );
}

interface EvidenceExplainerProps {
  showStrength?: boolean;
}

export function EvidenceExplainer({ showStrength = true }: EvidenceExplainerProps) {
  const types = Object.entries(EVIDENCE_TYPES) as [EvidenceType, EvidenceTypeConfig][];

  return (
    <div className={styles.explainer}>
      <h4 className={styles.explainerTitle}>Types of Evidence</h4>
      <div className={styles.explainerGrid}>
        {types.map(([type, config]) => (
          <div 
            key={type} 
            className={styles.explainerCard}
            style={{ '--badge-color': config.color } as React.CSSProperties}
          >
            <div className={styles.explainerHeader}>
              <span className={styles.explainerIcon}>{config.icon}</span>
              <div>
                <h5 className={styles.explainerLabel}>{config.label}</h5>
                {showStrength && (
                  <span className={`${styles.strengthBadge} ${styles[config.strength]}`}>
                    {config.strength === 'strongest' ? 'Strongest Evidence' :
                     config.strength === 'strong' ? 'Strong Evidence' :
                     config.strength === 'moderate' ? 'Moderate Evidence' :
                     'Requires Additional Verification'}
                  </span>
                )}
              </div>
            </div>
            <p className={styles.explainerDescription}>{config.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidenceBadge;
