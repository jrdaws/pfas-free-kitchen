import Link from 'next/link';
import Image from 'next/image';
import styles from './CategoryGrid.module.css';

interface Category {
  slug: string;
  name: string;
  productCount: number;
  image: string;
  gradient: string;
}

const CATEGORIES: Category[] = [
  {
    slug: 'cookware',
    name: 'Cookware',
    productCount: 45,
    image: '/images/categories/cookware.jpg',
    gradient: 'linear-gradient(135deg, #0F6E75 0%, #128088 100%)',
  },
  {
    slug: 'bakeware',
    name: 'Bakeware',
    productCount: 28,
    image: '/images/categories/bakeware.jpg',
    gradient: 'linear-gradient(135deg, #8B5A2B 0%, #A0522D 100%)',
  },
  {
    slug: 'storage',
    name: 'Storage',
    productCount: 32,
    image: '/images/categories/storage.jpg',
    gradient: 'linear-gradient(135deg, #2E5A4C 0%, #3D7A65 100%)',
  },
  {
    slug: 'utensils',
    name: 'Utensils',
    productCount: 18,
    image: '/images/categories/utensils.jpg',
    gradient: 'linear-gradient(135deg, #4A4458 0%, #625B71 100%)',
  },
  {
    slug: 'appliances',
    name: 'Appliances',
    productCount: 12,
    image: '/images/categories/appliances.jpg',
    gradient: 'linear-gradient(135deg, #1A365D 0%, #2A4A7F 100%)',
  },
];

export function CategoryGrid() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Shop by Category</h2>
        <p className={styles.subtitle}>Browse verified PFAS-free products in every kitchen category</p>
      </div>

      <div className={styles.grid}>
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              {/* Fallback gradient background */}
              <div 
                className={styles.imagePlaceholder}
                style={{ background: category.gradient }}
              />
              {/* Actual image - commented until images exist */}
              {/* <Image
                src={category.image}
                alt={category.name}
                fill
                className={styles.image}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              /> */}
              
              {/* Category icon */}
              <div className={styles.iconWrapper}>
                <CategoryIcon slug={category.slug} />
              </div>
              
              {/* Gradient overlay */}
              <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
              <h3 className={styles.name}>{category.name}</h3>
              <span className={styles.count}>{category.productCount} products</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryIcon({ slug }: { slug: string }) {
  const icons: Record<string, React.ReactNode> = {
    cookware: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
      </svg>
    ),
    bakeware: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m18-4.5a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    storage: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    utensils: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    appliances: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  };

  return icons[slug] || null;
}

export default CategoryGrid;
