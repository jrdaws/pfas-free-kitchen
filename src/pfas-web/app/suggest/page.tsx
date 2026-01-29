import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox } from '@/components/content';
import { SuggestionForm } from '@/components/forms';
import styles from './suggest.module.css';

export const metadata: Metadata = {
  title: 'Suggest a Product - PFAS-Free Kitchen',
  description: 'Know of a PFAS-free product we should review? Submit your suggestion and help us build a comprehensive database.',
  keywords: ['suggest product', 'product submission', 'PFAS-free suggestion', 'product review request'],
};

export default function SuggestPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/contact">Contact</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Suggest a Product</span>
        </nav>
        <h1 className={styles.title}>Suggest a Product</h1>
        <p className={styles.subtitle}>
          Help us build a comprehensive database of PFAS-free kitchen products. 
          If you know of a product we should review, let us know!
        </p>
      </header>

      <main className={styles.content}>
        <div className={styles.formSection}>
          <SuggestionForm />
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3>What Happens Next?</h3>
            <ol className={styles.processList}>
              <li>
                <strong>Review</strong>
                <p>Our team reviews your submission</p>
              </li>
              <li>
                <strong>Research</strong>
                <p>We gather information and contact the manufacturer</p>
              </li>
              <li>
                <strong>Verification</strong>
                <p>Product is assigned a verification tier</p>
              </li>
              <li>
                <strong>Publication</strong>
                <p>Product is added to our database</p>
              </li>
            </ol>
            <p className={styles.timeline}>
              <strong>Timeline:</strong> Most products are reviewed within 2-4 weeks.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>What We Look For</h3>
            <ul className={styles.criteriaList}>
              <li>Products used for food preparation or storage</li>
              <li>Products that contact food directly</li>
              <li>Clear PFAS-free claims from the manufacturer</li>
              <li>Available for purchase from major retailers</li>
            </ul>
          </div>

          <InfoBox type="info" title="Already Listed?">
            <p>
              Before submitting, check if the product is already in our{' '}
              <Link href="/search">product database</Link>. If it&apos;s listed 
              but has incorrect information,{' '}
              <Link href="/corrections">report a correction</Link> instead.
            </p>
          </InfoBox>
        </aside>
      </main>
    </div>
  );
}
