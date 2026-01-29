import Link from 'next/link';
import type { EducationBanner as EducationBannerType } from '@/lib/types';
import styles from './EducationBanner.module.css';

interface EducationBannerProps {
  banner: EducationBannerType;
}

export function EducationBanner({ banner }: EducationBannerProps) {
  return (
    <div className={styles.banner} role="note">
      <div className={styles.icon}>💡</div>
      <div className={styles.content}>
        <h3 className={styles.title}>{banner.title}</h3>
        <p className={styles.message}>{banner.message}</p>
        <Link href={banner.link} className={styles.link}>
          {banner.linkText}
        </Link>
      </div>
    </div>
  );
}
