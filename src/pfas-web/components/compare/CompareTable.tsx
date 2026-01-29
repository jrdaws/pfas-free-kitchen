'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product, VerificationTier } from '@/lib/types';
import { TierBadge } from '@/components/product/TierBadge';
import { Button } from '@/components/ui';
import styles from './CompareTable.module.css';

interface CompareTableProps {
  products: Product[];
  onRemove: (productId: string) => void;
  maxProducts?: number;
}

export function CompareTable({ products, onRemove, maxProducts = 4 }: CompareTableProps) {
  const emptySlots = maxProducts - products.length;
  
  // Find best tier for highlighting
  const bestTier = Math.max(...products.map(p => p.verification?.tier || 0)) as VerificationTier;

  // Categories for comparison
  const categories = [
    { key: 'verification', label: 'Verification' },
    { key: 'materials', label: 'Materials' },
    { key: 'compatibility', label: 'Compatibility' },
    { key: 'shop', label: 'Shop' },
  ];

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {/* Product header row - sticky */}
        <thead className={styles.header}>
          <tr>
            <th className={styles.labelCell}></th>
            {products.map((product) => (
              <th key={product.id} className={styles.productCell}>
                <div className={styles.productHeader}>
                  <Link href={`/product/${product.slug}`} className={styles.imageLink}>
                    <div className={styles.productImage}>
                      <Image
                        src={product.images?.[0]?.url || product.imageUrl || '/placeholder-product.svg'}
                        alt={product.name}
                        fill
                        sizes="120px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  <p className={styles.productBrand}>{product.brand?.name}</p>
                  <h3 className={styles.productName}>
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(product.id)}
                    className={styles.removeButton}
                  >
                    Remove
                  </Button>
                </div>
              </th>
            ))}
            {/* Empty slots */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <th key={`empty-${i}`} className={`${styles.productCell} ${styles.emptyCell}`}>
                <Link href="/search" className={styles.addProductSlot}>
                  <div className={styles.addIcon}>+</div>
                  <span>Add Product</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* VERIFICATION SECTION */}
          <tr className={styles.sectionHeader}>
            <td colSpan={products.length + emptySlots + 1} className={styles.sectionTitle}>
              Verification
            </td>
          </tr>
          
          {/* Tier row */}
          <tr>
            <td className={styles.labelCell}>Tier</td>
            {products.map((product) => {
              const tier = product.verification?.tier || 0;
              const isBest = tier === bestTier && bestTier > 0;
              return (
                <td 
                  key={product.id} 
                  className={`${styles.valueCell} ${isBest ? styles.bestValue : ''}`}
                >
                  <TierBadge tier={tier} size="md" showLabel />
                  {isBest && <span className={styles.bestBadge}>Best</span>}
                </td>
              );
            })}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-tier-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* Evidence row */}
          <tr>
            <td className={styles.labelCell}>Evidence</td>
            {products.map((product) => (
              <td key={product.id} className={styles.valueCell}>
                {product.verification?.hasEvidence ? (
                  <span className={styles.positive}>
                    {product.verification.evidenceCount} document{product.verification.evidenceCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className={styles.neutral}>None</span>
                )}
              </td>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-evidence-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* Scope row */}
          <tr>
            <td className={styles.labelCell}>Scope</td>
            {products.map((product) => (
              <td key={product.id} className={styles.valueCell}>
                {product.verification?.scopeText || 'Not specified'}
              </td>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-scope-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* MATERIALS SECTION */}
          <tr className={styles.sectionHeader}>
            <td colSpan={products.length + emptySlots + 1} className={styles.sectionTitle}>
              Materials
            </td>
          </tr>

          {/* Body/Material row */}
          <tr>
            <td className={styles.labelCell}>Body</td>
            {products.map((product) => (
              <td key={product.id} className={styles.valueCell}>
                {product.materialSummary || 'Not specified'}
              </td>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-body-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* Coating row */}
          <tr>
            <td className={styles.labelCell}>Coating</td>
            {products.map((product) => (
              <td key={product.id} className={styles.valueCell}>
                {product.coatingSummary || 'None'}
              </td>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-coating-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* COMPATIBILITY SECTION */}
          <tr className={styles.sectionHeader}>
            <td colSpan={products.length + emptySlots + 1} className={styles.sectionTitle}>
              Compatibility
            </td>
          </tr>

          {/* Induction row */}
          <tr>
            <td className={styles.labelCell}>Induction</td>
            {products.map((product) => {
              const induction = product.features?.inductionCompatible;
              return (
                <td 
                  key={product.id} 
                  className={`${styles.valueCell} ${induction ? styles.different : ''}`}
                >
                  {induction === true ? (
                    <span className={styles.positive}>✓ Yes</span>
                  ) : induction === false ? (
                    <span className={styles.negative}>✗ No</span>
                  ) : (
                    <span className={styles.neutral}>Unknown</span>
                  )}
                </td>
              );
            })}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-induction-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* Oven Safe row */}
          <tr>
            <td className={styles.labelCell}>Oven Safe</td>
            {products.map((product) => {
              const temp = product.features?.ovenSafeTempF;
              return (
                <td key={product.id} className={styles.valueCell}>
                  {temp ? (
                    <span className={styles.positive}>{temp}°F</span>
                  ) : (
                    <span className={styles.neutral}>Unknown</span>
                  )}
                </td>
              );
            })}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-oven-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* Dishwasher row */}
          <tr>
            <td className={styles.labelCell}>Dishwasher</td>
            {products.map((product) => {
              const dishwasher = product.features?.dishwasherSafe;
              return (
                <td key={product.id} className={styles.valueCell}>
                  {dishwasher === true ? (
                    <span className={styles.positive}>✓ Yes</span>
                  ) : dishwasher === false ? (
                    <span className={styles.negative}>✗ No</span>
                  ) : (
                    <span className={styles.neutral}>Unknown</span>
                  )}
                </td>
              );
            })}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-dishwasher-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>

          {/* SHOP SECTION */}
          <tr className={styles.sectionHeader}>
            <td colSpan={products.length + emptySlots + 1} className={styles.sectionTitle}>
              Shop
            </td>
          </tr>

          {/* Retailers row */}
          <tr>
            <td className={styles.labelCell}>Available at</td>
            {products.map((product) => (
              <td key={product.id} className={styles.valueCell}>
                <div className={styles.retailerButtons}>
                  {product.retailers?.slice(0, 3).map((link) => (
                    <a 
                      key={link.id} 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={styles.retailerButton}
                    >
                      {link.retailer?.name || 'Shop'}
                    </a>
                  ))}
                  {(!product.retailers || product.retailers.length === 0) && (
                    <span className={styles.neutral}>Not available</span>
                  )}
                </div>
              </td>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <td key={`empty-retailers-${i}`} className={`${styles.valueCell} ${styles.emptyValue}`}>—</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CompareTable;
