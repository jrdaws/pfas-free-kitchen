import type { Product } from '@/lib/types';
import styles from './tabs.module.css';

interface SpecificationsTabProps {
  product: Product;
}

export function SpecificationsTab({ product }: SpecificationsTabProps) {
  const features = product.features || {};

  return (
    <div className={styles.tab}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Technical Specifications</h3>
      </section>

      {/* Dimensions */}
      {(features.dimensions || features.weight) && (
        <section className={styles.specSection}>
          <h4 className={styles.specSectionTitle}>Dimensions</h4>
          <table className={styles.specTable}>
            <tbody>
              {features.dimensions && (
                <tr>
                  <th scope="row">Size</th>
                  <td>{features.dimensions}</td>
                </tr>
              )}
              {features.weight && (
                <tr>
                  <th scope="row">Weight</th>
                  <td>{features.weight}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Materials */}
      <section className={styles.specSection}>
        <h4 className={styles.specSectionTitle}>Materials</h4>
        <table className={styles.specTable}>
          <tbody>
            {product.materialSummary && (
              <tr>
                <th scope="row">Body Material</th>
                <td>{product.materialSummary}</td>
              </tr>
            )}
            {product.coatingSummary && (
              <tr>
                <th scope="row">Coating</th>
                <td>{product.coatingSummary}</td>
              </tr>
            )}
            {product.components?.map((component) => (
              component.role === 'handle' && component.material && (
                <tr key={component.id}>
                  <th scope="row">Handle Material</th>
                  <td>{component.material.name}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </section>

      {/* Compatibility */}
      <section className={styles.specSection}>
        <h4 className={styles.specSectionTitle}>Compatibility</h4>
        <table className={styles.specTable}>
          <tbody>
            <tr>
              <th scope="row">Induction</th>
              <td>
                {features.inductionCompatible === true && (
                  <span className={styles.compatible}>✓ Compatible</span>
                )}
                {features.inductionCompatible === false && (
                  <span className={styles.notCompatible}>✗ Not compatible</span>
                )}
                {features.inductionCompatible === undefined && (
                  <span className={styles.unknown}>Not specified</span>
                )}
              </td>
            </tr>
            <tr>
              <th scope="row">Gas</th>
              <td><span className={styles.compatible}>✓ Compatible</span></td>
            </tr>
            <tr>
              <th scope="row">Electric</th>
              <td><span className={styles.compatible}>✓ Compatible</span></td>
            </tr>
            <tr>
              <th scope="row">Ceramic</th>
              <td><span className={styles.compatible}>✓ Compatible</span></td>
            </tr>
            {features.ovenSafeTempF && (
              <tr>
                <th scope="row">Oven Safe</th>
                <td>Up to {features.ovenSafeTempF}°F</td>
              </tr>
            )}
            <tr>
              <th scope="row">Dishwasher</th>
              <td>
                {features.dishwasherSafe === true && (
                  <span className={styles.compatible}>✓ Safe</span>
                )}
                {features.dishwasherSafe === false && (
                  <span className={styles.notCompatible}>Hand wash only</span>
                )}
                {features.dishwasherSafe === undefined && (
                  <span className={styles.unknown}>Not specified</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Brand Info */}
      <section className={styles.specSection}>
        <h4 className={styles.specSectionTitle}>Brand Information</h4>
        <table className={styles.specTable}>
          <tbody>
            <tr>
              <th scope="row">Brand</th>
              <td>{product.brand?.name || 'Unknown'}</td>
            </tr>
            {product.category && (
              <tr>
                <th scope="row">Category</th>
                <td>{product.category.name}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
