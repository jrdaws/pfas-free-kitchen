import {
  HeroSection,
  CategoryGrid,
  FeaturedProducts,
  VerificationExplainer,
  MaterialGrid,
  TrustSection,
  RecentlyViewed,
} from '@/components/home';
import { fetchProducts } from '@/lib';
import styles from './page.module.css';

export default async function HomePage() {
  const { data: featuredProducts } = await fetchProducts({
    tier: [3, 4],
    limit: 6,
    sort: 'tier_desc',
  });

  return (
    <div className={styles.page}>
      <HeroSection />
      
      <section className={styles.homeSection}>
        <CategoryGrid />
      </section>
      
      <section className={`${styles.homeSection} ${styles.bgSubtle}`}>
        <div className={styles.sectionInner}>
          <FeaturedProducts products={featuredProducts} />
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
