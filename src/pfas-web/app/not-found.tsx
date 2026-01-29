import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svg}
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <text x="100" y="115" textAnchor="middle" fontSize="48" fontWeight="bold" fill="currentColor">
              404
            </text>
          </svg>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>
        
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go to Homepage
          </Link>
          
          <Link href="/search" className={styles.secondaryButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Browse Products
          </Link>
        </div>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>Popular categories:</p>
          <div className={styles.links}>
            <Link href="/search?category=skillets">Cast Iron Skillets</Link>
            <Link href="/search?category=dutch-ovens">Dutch Ovens</Link>
            <Link href="/search?category=bakeware">Bakeware</Link>
            <Link href="/learn/what-is-pfas">Learn About PFAS</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
