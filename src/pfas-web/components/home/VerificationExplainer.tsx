import Link from 'next/link';
import styles from './VerificationExplainer.module.css';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const VERIFICATION_STEPS: Step[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Brand Claims',
    description: 'We collect and verify manufacturer statements about PFAS-free materials and processes.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.548.091a9.02 9.02 0 01-2.934 0l-.548-.091c-1.717-.293-2.299-2.379-1.067-3.61L16.2 15.3M5 14.5l-1.402 1.402c-1.232 1.232-.65 3.318 1.067 3.611l.548.091a9.02 9.02 0 002.934 0l.548-.091c1.717-.293 2.299-2.379 1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Lab Testing',
    description: 'Independent labs test products for 40+ PFAS compounds using certified methods.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
      </svg>
    ),
    title: 'Component Analysis',
    description: 'We examine each component that touches food — body, handle, coating, lid, and gaskets.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Tier Rating',
    description: 'Products earn a tier (0-4) based on evidence quality and verification completeness.',
  },
];

export function VerificationExplainer() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>How We Verify Products</h2>
        <p className={styles.subtitle}>
          Our rigorous 4-step process ensures every product meets our PFAS-free standards
        </p>
      </div>

      <div className={styles.steps}>
        {VERIFICATION_STEPS.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.iconWrapper}>
              <div className={styles.icon}>{step.icon}</div>
              <span className={styles.stepNumber}>{index + 1}</span>
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>

      {/* Connector lines (desktop only) */}
      <div className={styles.connectors}>
        <div className={styles.connector} />
        <div className={styles.connector} />
        <div className={styles.connector} />
      </div>

      <div className={styles.cta}>
        <Link href="/education/verification-process" className={styles.ctaButton}>
          Learn More About Our Process
        </Link>
      </div>
    </section>
  );
}

export default VerificationExplainer;
