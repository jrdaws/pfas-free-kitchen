import Link from 'next/link';
import { Button } from '@/components/ui';
import styles from './EmptyCompare.module.css';

export function EmptyCompare() {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 120 120" 
          fill="none" 
          aria-hidden="true"
        >
          {/* Two overlapping squares representing comparison */}
          <rect 
            x="15" 
            y="25" 
            width="45" 
            height="55" 
            rx="6" 
            fill="var(--color-gray-100)" 
            stroke="var(--color-gray-300)" 
            strokeWidth="2"
          />
          <rect 
            x="60" 
            y="25" 
            width="45" 
            height="55" 
            rx="6" 
            fill="var(--color-gray-100)" 
            stroke="var(--color-gray-300)" 
            strokeWidth="2"
          />
          {/* Lines representing content */}
          <line x1="25" y1="40" x2="50" y2="40" stroke="var(--color-gray-300)" strokeWidth="2" />
          <line x1="25" y1="50" x2="45" y2="50" stroke="var(--color-gray-300)" strokeWidth="2" />
          <line x1="25" y1="60" x2="50" y2="60" stroke="var(--color-gray-300)" strokeWidth="2" />
          
          <line x1="70" y1="40" x2="95" y2="40" stroke="var(--color-gray-300)" strokeWidth="2" />
          <line x1="70" y1="50" x2="90" y2="50" stroke="var(--color-gray-300)" strokeWidth="2" />
          <line x1="70" y1="60" x2="95" y2="60" stroke="var(--color-gray-300)" strokeWidth="2" />
          
          {/* Scale icon in center */}
          <circle cx="60" cy="95" r="18" fill="var(--color-primary-100)" />
          <path 
            d="M60 88v14M53 91h14M56 85l-4 6h4l-4 6M64 85l4 6h-4l4 6" 
            stroke="var(--color-primary-600)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className={styles.title}>No products selected for comparison</h2>
      
      <p className={styles.description}>
        Add products to compare their verification status, materials, and features side by side.
      </p>

      <div className={styles.instructions}>
        <h3 className={styles.instructionsTitle}>How to compare:</h3>
        <ol className={styles.instructionsList}>
          <li>Browse our product catalog</li>
          <li>Click the &quot;Compare&quot; checkbox on products you&apos;re interested in</li>
          <li>Return here to see them side by side (up to 4 products)</li>
        </ol>
      </div>

      <div className={styles.actions}>
        <Link href="/search">
          <Button variant="primary" size="lg">
            Browse Products
          </Button>
        </Link>
        <Link href="/cookware">
          <Button variant="outline" size="lg">
            Explore Cookware
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default EmptyCompare;
