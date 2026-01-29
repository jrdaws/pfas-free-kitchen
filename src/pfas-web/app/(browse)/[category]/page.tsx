import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AffiliateDisclosure } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { Pagination, LoadingSpinner } from '@/components/ui';
import { fetchProducts, fetchCategories, isAPIError } from '@/lib';
import styles from './category.module.css';

// Category display info (could also come from API)
const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  cookware: {
    name: 'Cookware',
    description: 'PFAS-free pots, pans, and cooking vessels',
  },
  bakeware: {
    name: 'Bakeware',
    description: 'PFAS-free baking sheets, pans, and dishes',
  },
  'food-storage': {
    name: 'Food Storage',
    description: 'PFAS-free containers and storage solutions',
  },
  storage: {
    name: 'Storage',
    description: 'PFAS-free containers and storage solutions',
  },
  'utensils-tools': {
    name: 'Utensils & Tools',
    description: 'PFAS-free kitchen utensils and tools',
  },
  'appliance-accessories': {
    name: 'Appliance Accessories',
    description: 'PFAS-free accessories for kitchen appliances',
  },
};

interface CategoryPageProps {
  params: { category: string };
  searchParams: Record<string, string>;
}

async function CategoryContent({ 
  category, 
  searchParams 
}: { 
  category: string; 
  searchParams: Record<string, string>;
}) {
  const filters = {
    category,
    tier: searchParams.tier ? searchParams.tier.split(',').map(Number) : undefined,
    material: searchParams.material?.split(','),
    coating: searchParams.coating?.split(','),
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: 24,
    sort: searchParams.sort || 'tier_desc',
  };

  try {
    const data = await fetchProducts(filters);

    if (data.data.length === 0) {
      return <EmptyState />;
    }

    return (
      <>
        <ProductGrid products={data.data} facets={data.facets} />
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalCount={data.pagination.totalCount}
          limit={data.pagination.limit}
        />
      </>
    );
  } catch (error) {
    if (isAPIError(error)) {
      console.error('API Error:', error.message);
      return <ErrorState message={error.message} />;
    }
    throw error;
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categoryInfo = CATEGORY_INFO[params.category];

  if (!categoryInfo) {
    // Try to fetch from API categories
    try {
      const categories = await fetchCategories();
      const found = categories.find(c => c.slug === params.category);
      if (!found) {
        notFound();
      }
    } catch {
      notFound();
    }
  }

  const displayInfo = categoryInfo || { 
    name: params.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: `Browse PFAS-free ${params.category} products`
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{displayInfo.name}</h1>
          <p className={styles.description}>{displayInfo.description}</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />

        {/* Product Grid with Suspense */}
        <Suspense fallback={<LoadingState />}>
          <CategoryContent category={params.category} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No products found</p>
      <p className={styles.emptyText}>
        Try adjusting your filters or browse a different category.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      <LoadingSpinner size="lg" />
      <p>Loading products...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={styles.error}>
      <p className={styles.errorTitle}>Unable to load products</p>
      <p className={styles.errorText}>{message}</p>
      <p className={styles.errorText}>Please try again later.</p>
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryInfo = CATEGORY_INFO[params.category];

  if (!categoryInfo) {
    return {
      title: params.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: `Browse PFAS-free ${params.category} products`,
    };
  }

  return {
    title: categoryInfo.name,
    description: categoryInfo.description,
  };
}
