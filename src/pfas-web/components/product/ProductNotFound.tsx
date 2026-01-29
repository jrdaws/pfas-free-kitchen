import Link from 'next/link';
import { Button } from '../ui/Button';
import styles from './ProductNotFound.module.css';

interface ProductNotFoundProps {
  slug?: string;
}

export function ProductNotFound({ slug }: ProductNotFoundProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🔍</div>
        <h1 className={styles.title}>Product Not Found</h1>
        <p className={styles.message}>
          {slug 
            ? `We couldn't find a product matching "${slug}".`
            : "We couldn't find the product you're looking for."
          }
        </p>
        <p className={styles.suggestion}>
          The product may have been removed, or the link may be incorrect.
        </p>

        <div className={styles.actions}>
          <Link href="/search">
            <Button variant="primary" size="lg">
              Browse All Products
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="lg">
              Go to Homepage
            </Button>
          </Link>
        </div>

        <div className={styles.helpSection}>
          <h2 className={styles.helpTitle}>Looking for something specific?</h2>
          <ul className={styles.helpList}>
            <li>
              <Link href="/search?category=cookware">Browse Cookware</Link>
            </li>
            <li>
              <Link href="/search?category=bakeware">Browse Bakeware</Link>
            </li>
            <li>
              <Link href="/search?category=storage">Browse Storage</Link>
            </li>
            <li>
              <Link href="/search?tier=3&tier=4">View Lab-Tested Products</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
