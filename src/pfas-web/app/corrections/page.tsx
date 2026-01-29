import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox } from '@/components/content';
import { CorrectionForm } from '@/components/forms';
import styles from './corrections.module.css';

export const metadata: Metadata = {
  title: 'Report a Correction - PFAS-Free Kitchen',
  description: 'Found incorrect information on our site? Help us maintain accuracy by reporting errors.',
  keywords: ['report error', 'correction', 'feedback', 'fix error', 'update information'],
};

export default function CorrectionsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/contact">Contact</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Report Correction</span>
        </nav>
        <h1 className={styles.title}>Report a Correction</h1>
        <p className={styles.subtitle}>
          Found incorrect information on our site? Please let us know. 
          Accuracy is our top priority.
        </p>
      </header>

      <main className={styles.content}>
        <div className={styles.formSection}>
          <CorrectionForm />
        </div>

        <aside className={styles.sidebar}>
          <InfoBox type="success" title="We Appreciate Your Help">
            <p>
              Maintaining accurate information is critical to our mission. 
              Every correction report helps us improve and serve our community better.
            </p>
          </InfoBox>

          <div className={styles.infoCard}>
            <h3>What We Can Correct</h3>
            <ul className={styles.correctionList}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Product information (materials, specifications)
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Brand or manufacturer details
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                PFAS status or verification tier
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Broken links or outdated URLs
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Typos or grammatical errors
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Discontinued products
              </li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>Response Time</h3>
            <p className={styles.responseTime}>
              <strong>1-2 business days</strong>
            </p>
            <p className={styles.responseNote}>
              We prioritize error reports to maintain the accuracy of our information. 
              Critical errors affecting safety information are addressed immediately.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>Tips for Helpful Reports</h3>
            <ul className={styles.tipsList}>
              <li>Include the exact page URL</li>
              <li>Quote the specific text that&apos;s incorrect</li>
              <li>Provide a source for the correct information</li>
              <li>Be as specific as possible</li>
            </ul>
          </div>

          <div className={styles.alternativeContact}>
            <p>
              For urgent corrections or media inquiries, email us directly at{' '}
              <a href="mailto:corrections@pfasfreekitchen.com">
                corrections@pfasfreekitchen.com
              </a>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
