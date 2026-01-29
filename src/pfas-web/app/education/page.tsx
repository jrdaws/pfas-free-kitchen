import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './education.module.css';

export const metadata: Metadata = {
  title: 'Education Hub',
  description: 'Learn about PFAS, how we verify products, and make informed choices for your kitchen.',
};

const EDUCATION_TOPICS = [
  {
    href: '/education/what-is-pfas',
    icon: '🧪',
    title: 'What are PFAS?',
    description: 'Understanding "forever chemicals" and why they matter',
  },
  {
    href: '/education/pfoa-vs-pfas',
    icon: '⚠️',
    title: 'PFOA-Free ≠ PFAS-Free',
    description: 'Why "PFOA-free" labels can be misleading',
  },
  {
    href: '/education/how-we-verify',
    icon: '🔍',
    title: 'How We Verify',
    description: 'Our research process and verification tiers',
  },
  {
    href: '/education/tier-guide',
    icon: '🏆',
    title: 'Understanding Tiers',
    description: 'What each verification tier means for you',
  },
  {
    href: '/education/materials-guide',
    icon: '🍳',
    title: 'Safe Materials Guide',
    description: 'Cookware materials that are naturally PFAS-free',
  },
  {
    href: '/education/making-the-switch',
    icon: '♻️',
    title: 'Making the Switch',
    description: 'How to transition your kitchen to PFAS-free',
  },
];

export default function EducationPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Education Hub</h1>
          <p className={styles.subtitle}>
            Learn about PFAS, understand our verification process, and make 
            informed decisions about the products in your kitchen.
          </p>
        </div>
      </header>

      <section className={styles.topics}>
        <div className={styles.topicGrid}>
          {EDUCATION_TOPICS.map((topic) => (
            <Link key={topic.href} href={topic.href} className={styles.topicCard}>
              <span className={styles.topicIcon}>{topic.icon}</span>
              <h2 className={styles.topicTitle}>{topic.title}</h2>
              <p className={styles.topicDescription}>{topic.description}</p>
              <span className={styles.topicArrow}>Read more →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.quickFacts}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Quick Facts</h2>
          <div className={styles.factGrid}>
            <div className={styles.fact}>
              <span className={styles.factNumber}>12,000+</span>
              <span className={styles.factLabel}>PFAS compounds exist</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factNumber}>Forever</span>
              <span className={styles.factLabel}>How long PFAS persist in the environment</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factNumber}>97%</span>
              <span className={styles.factLabel}>of Americans have PFAS in their blood</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
