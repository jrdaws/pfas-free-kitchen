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
    productCount: 77,
    image: '/images/categories/cookware.jpg',
    gradient: 'linear-gradient(135deg, #0F6E75 0%, #128088 100%)',
  },
  {
    slug: 'bakeware',
    name: 'Bakeware',
    productCount: 22,
    image: '/images/categories/bakeware.jpg',
    gradient: 'linear-gradient(135deg, #8B5A2B 0%, #A0522D 100%)',
  },
  {
    slug: 'food-storage',
    name: 'Food Storage',
    productCount: 27,
    image: '/images/categories/storage.jpg',
    gradient: 'linear-gradient(135deg, #2E5A4C 0%, #3D7A65 100%)',
  },
  {
    slug: 'appliances',
    name: 'Appliances',
    productCount: 46,
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
              {/* Category image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                className={styles.image}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
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

export default CategoryGrid;
