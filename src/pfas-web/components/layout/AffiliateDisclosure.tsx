import Link from 'next/link';
import styles from './AffiliateDisclosure.module.css';

export type AffiliateDisclosureVariant = 'banner' | 'inline' | 'footer' | 'modal';

interface AffiliateDisclosureProps {
  variant?: AffiliateDisclosureVariant;
  text?: string;
}

const DISCLOSURE_TEXT = {
  banner: 'Affiliate links may appear in results. We may earn a commission if you make a purchase.',
  inline: 'Affiliate link: We may earn a commission if you purchase through this link.',
  footer: 'Affiliate link: We may earn a commission if you purchase through this link.',
  modal: 'We may earn a commission from this purchase.',
};

export function AffiliateDisclosure({ 
  variant = 'banner',
  text,
}: AffiliateDisclosureProps) {
  const displayText = text || DISCLOSURE_TEXT[variant];

  if (variant === 'modal') {
    return (
      <div 
        className={styles.modal} 
        role="note" 
        aria-label="Affiliate disclosure"
        data-testid="affiliate-disclosure"
      >
        <p className={styles.modalText}>{displayText}</p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <p 
        className={styles.inline} 
        role="note" 
        aria-label="Affiliate disclosure"
        data-testid="affiliate-disclosure"
      >
        {displayText}{' '}
        <Link href="/disclosure" className={styles.link}>
          Learn more
        </Link>
      </p>
    );
  }

  if (variant === 'footer') {
    return (
      <p 
        className={styles.footer}
        data-testid="affiliate-disclosure"
      >
        <strong>Affiliate link:</strong> We may earn a commission if you purchase through this link.
      </p>
    );
  }

  // Default: banner
  return (
    <div 
      className={styles.banner} 
      role="note" 
      aria-label="Affiliate disclosure"
      data-testid="affiliate-disclosure"
    >
      <span className={styles.icon}>ℹ️</span>
      <p className={styles.text}>
        {displayText}{' '}
        <Link href="/disclosure" className={styles.link}>
          Learn more →
        </Link>
      </p>
    </div>
  );
}
