import styles from './TrustSection.module.css';

interface TrustPillar {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TRUST_PILLARS: TrustPillar[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.548.091a9.02 9.02 0 01-2.934 0l-.548-.091c-1.717-.293-2.299-2.379-1.067-3.61L16.2 15.3" />
      </svg>
    ),
    title: 'Independent Testing',
    description: "We don't accept payment for reviews. Our verdicts are based solely on evidence.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: 'Full Transparency',
    description: 'Every product shows its complete evidence trail. See exactly what we reviewed.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: 'No Pay-to-Play',
    description: 'Rankings are based only on verification level. Brands cannot buy higher placement.',
  },
];

export function TrustSection() {
  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.pillars}>
          {TRUST_PILLARS.map((pillar, index) => (
            <div key={index} className={styles.pillar}>
              <div className={styles.iconWrapper}>
                {pillar.icon}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{pillar.title}</h3>
                <p className={styles.description}>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
