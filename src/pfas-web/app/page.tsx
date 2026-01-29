import {
  HeroSection,
  CategoryGrid,
  FeaturedProducts,
  VerificationExplainer,
  MaterialGrid,
  TrustSection,
  RecentlyViewed,
} from '@/components/home';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      
      <section className={styles.homeSection}>
        <CategoryGrid />
      </section>
      
      <section className={`${styles.homeSection} ${styles.bgSubtle}`}>
        <div className={styles.sectionInner}>
          <FeaturedProducts />
        </div>
      </section>
      
      <section className={styles.homeSection}>
        <VerificationExplainer />
      </section>
      
      <section className={styles.homeSection}>
        <MaterialGrid />
      </section>
      
      <section className={`${styles.homeSection} ${styles.bgSubtle}`}>
        <TrustSection />
      </section>
      
      <RecentlyViewed />
    </div>
  );
}
