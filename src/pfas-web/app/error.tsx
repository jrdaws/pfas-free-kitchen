'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

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
            <path
              d="M70 70l60 60M130 70l-60 60"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Something Went Wrong</h1>
        
        <p className={styles.description}>
          We&apos;re sorry, but something unexpected happened. 
          Our team has been notified and is working on a fix.
        </p>

        {error.digest && (
          <p className={styles.errorId}>
            Error ID: <code>{error.digest}</code>
          </p>
        )}

        <div className={styles.actions}>
          <button onClick={reset} className={styles.primaryButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Try Again
          </button>
          
          <Link href="/" className={styles.secondaryButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go to Homepage
          </Link>
        </div>

        <div className={styles.help}>
          <p>
            If the problem persists, please{' '}
            <Link href="/contact">contact our support team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
