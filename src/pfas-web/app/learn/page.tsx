import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import styles from './learn.module.css';

export const metadata: Metadata = {
  title: 'Learn About PFAS - Educational Resources',
  description: 'Educational resources about PFAS, our verification process, and how to make informed decisions about PFAS-free cookware.',
  keywords: ['PFAS education', 'learn about PFAS', 'cookware safety', 'verification process'],
};

const LEARN_CARDS = [
  {
    title: 'What is PFAS?',
    description: 'Understand what PFAS are, why they\'re called "forever chemicals," and why they matter for your health.',
    href: '/learn/what-is-pfas',
    icon: '🔬',
    color: 'blue',
  },
  {
    title: 'How We Verify Products',
    description: 'Learn about our tiered verification system and how we evaluate products for PFAS-free status.',
    href: '/learn/how-we-verify',
    icon: '✓',
    color: 'green',
  },
  {
    title: 'Buyer\'s Guide',
    description: 'Everything you need to know to choose PFAS-free cookware. Compare materials and avoid common pitfalls.',
    href: '/learn/buyers-guide',
    icon: '📖',
    color: 'purple',
  },
  {
    title: 'FAQ',
    description: 'Find answers to common questions about PFAS, our verification process, and shopping for safe cookware.',
    href: '/faq',
    icon: '❓',
    color: 'orange',
  },
];

export default function LearnPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Learn About PFAS</h1>
        <p className={styles.subtitle}>
          Educational resources to help you make informed decisions about the products in your kitchen
        </p>
      </header>

      {/* Cards Grid */}
      <section className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {LEARN_CARDS.map((card) => (
            <Link key={card.href} href={card.href} className={`${styles.card} ${styles[card.color]}`}>
              <span className={styles.cardIcon}>{card.icon}</span>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDescription}>{card.description}</p>
              <span className={styles.cardLink}>Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Facts */}
      <section className={styles.factsSection}>
        <h2 className={styles.factsTitle}>Quick Facts About PFAS</h2>
        <div className={styles.factsGrid}>
          <div className={styles.fact}>
            <span className={styles.factNumber}>15,000+</span>
            <span className={styles.factLabel}>Different PFAS chemicals exist</span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factNumber}>1940s</span>
            <span className={styles.factLabel}>When PFAS were first developed</span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factNumber}>∞</span>
            <span className={styles.factLabel}>&quot;Forever chemicals&quot; don&apos;t break down</span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factNumber}>98%</span>
            <span className={styles.factLabel}>Of Americans have PFAS in their blood</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to shop PFAS-free?</h2>
        <p>Browse our catalog of verified PFAS-free kitchen products.</p>
        <div className={styles.ctaButtons}>
          <Link href="/search">
            <Button size="lg">Browse Products</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">About Us</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
