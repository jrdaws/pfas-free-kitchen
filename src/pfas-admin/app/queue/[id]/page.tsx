import Link from 'next/link';
import { fetchProductForReview, fetchRiskAssessment, fetchEvidence } from '@/lib/api';
import { getCategoryChecklists } from '@/lib/checklists';
import styles from './review.module.css';

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const [product, riskAssessment, evidence] = await Promise.all([
    fetchProductForReview(params.id),
    fetchRiskAssessment(params.id),
    fetchEvidence({ productId: params.id }),
  ]);

  const checklists = getCategoryChecklists(product.category.slug);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/queue" className={styles.backLink}>← Back to Queue</Link>
          <h1 className={styles.title}>Review: {product.name}</h1>
          <p className={styles.subtitle}>{product.brand.name} • {product.category.name}</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-secondary">Save Draft</button>
          <button className="btn btn-ghost">×</button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Product Info */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Product Info</h3>
            <dl className={styles.infoList}>
              <dt>Source</dt>
              <dd>
                {product.sourceUrl ? (
                  <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
                    View original →
                  </a>
                ) : (
                  'Manual entry'
                )}
              </dd>
              <dt>Created</dt>
              <dd>{new Date(product.createdAt).toLocaleDateString()}</dd>
            </dl>
          </div>

          {/* Risk Assessment */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Risk Assessment</h3>
            <div className={styles.riskScore}>
              <span
                className={styles.riskLevel}
                data-level={riskAssessment.level}
              >
                {riskAssessment.level.toUpperCase()}
              </span>
              <span className={styles.riskValue}>{riskAssessment.score}/100</span>
            </div>
            {riskAssessment.terms.length > 0 && (
              <div className={styles.riskTerms}>
                <p className={styles.riskTermsLabel}>Detected terms:</p>
                <ul>
                  {riskAssessment.terms.map((term) => (
                    <li key={term.term} data-level={term.level}>
                      {term.term}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {riskAssessment.ceramicNonstick && (
              <div className={`${styles.alert} ${styles.alertWarning}`}>
                ⚠️ Ceramic nonstick detected - check sol-gel confirmation
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Components */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Component Model</h2>
            <div className={styles.components}>
              {product.components.map((comp) => (
                <div key={comp.id} className={styles.component}>
                  <span className={styles.componentRole}>{comp.role.replace('_', ' ')}</span>
                  <span className={styles.componentMaterial}>
                    {comp.materialName || 'Unknown material'}
                  </span>
                  {comp.coatingName && (
                    <span className={styles.componentCoating}>
                      Coating: {comp.coatingName}
                    </span>
                  )}
                  <select defaultValue={comp.pfasStatus} className={styles.componentStatus}>
                    <option value="unknown">Unknown</option>
                    <option value="verified_free">Verified PFAS-Free</option>
                    <option value="claimed_free">Claimed PFAS-Free</option>
                    <option value="contains_pfas">Contains PFAS</option>
                  </select>
                </div>
              ))}
              <button className="btn btn-secondary">+ Add Component</button>
            </div>
          </section>

          {/* Evidence */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Evidence</h2>
            {evidence.length > 0 ? (
              <div className={styles.evidenceList}>
                {evidence.map((ev) => (
                  <div key={ev.id} className={styles.evidenceItem}>
                    <span className={styles.evidenceIcon}>📄</span>
                    <div className={styles.evidenceInfo}>
                      <span className={styles.evidenceTitle}>{ev.title}</span>
                      <span className={styles.evidenceType}>{ev.type.replace('_', ' ')}</span>
                    </div>
                    <button className="btn btn-ghost">View</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No evidence linked</p>
            )}
            <div className={styles.evidenceActions}>
              <button className="btn btn-secondary">Link Existing</button>
              <button className="btn btn-primary">Upload New</button>
            </div>
          </section>

          {/* Checklist */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Verification Checklist</h2>
            <div className={styles.checklist}>
              {checklists.map((item) => (
                <label key={item.id} className={styles.checklistItem}>
                  <input type="checkbox" />
                  <span className={styles.checklistLabel}>
                    {item.label}
                    {item.required && <span className={styles.required}>*</span>}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Decision */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Decision</h2>
            <div className={styles.decision}>
              {/* Tier Selection */}
              <fieldset className={styles.tierSelection}>
                <legend>Verification Tier</legend>
                <div className={styles.tierOptions}>
                  {[0, 1, 2, 3, 4].map((tier) => (
                    <label key={tier} className={styles.tierOption}>
                      <input type="radio" name="tier" value={tier} />
                      <span className={styles.tierBadge} data-tier={tier}>
                        {tier}
                      </span>
                      <span className={styles.tierLabel}>
                        {['Unknown', 'Brand Statement', 'Policy Reviewed', 'Lab Tested', 'Monitored'][tier]}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Claim Type */}
              <div className={styles.field}>
                <label>Claim Type</label>
                <select>
                  <option value="">Select claim type</option>
                  <option value="A">A - No intentionally added PFAS</option>
                  <option value="B">B - Below detection limit (lab tested)</option>
                  <option value="C">C - Total fluorine screen</option>
                </select>
              </div>

              {/* Scope */}
              <div className={styles.field}>
                <label>Scope</label>
                <input
                  type="text"
                  placeholder="e.g., Food-contact surfaces (pan body)"
                />
              </div>

              {/* Rationale */}
              <div className={styles.field}>
                <label>Rationale (required)</label>
                <textarea
                  placeholder="Explain the verification decision..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className={styles.decisionActions}>
                <button className="btn btn-ghost">Cancel</button>
                <button className="btn btn-secondary">Save as Draft</button>
                <button className="btn" style={{ background: 'var(--color-error)', color: 'white' }}>
                  Reject & Archive
                </button>
                <button className="btn btn-primary">Approve ✓</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Product Review',
};
