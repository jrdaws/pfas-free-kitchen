import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AffiliateDisclosure } from '@/components/layout';
import { ProductGrid, CategoryTopPicks } from '@/components/product';
import { FilterSidebar, SortDropdown, MobileFilterButton } from '@/components/search';
import { Pagination, LoadingSpinner } from '@/components/ui';
import { fetchProducts, fetchCategories, fetchTopPicks, isAPIError } from '@/lib';
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
  appliances: {
    name: 'Appliances',
    description: 'PFAS-free kitchen appliances and accessories',
  },
  utensils: {
    name: 'Utensils',
    description: 'PFAS-free kitchen utensils and tools',
  },
  // Appliance subcategories
  blenders: {
    name: 'Blenders',
    description: 'PFAS-free blenders with safe containers',
  },
  'coffee-makers': {
    name: 'Coffee Makers & Grinders',
    description: 'PFAS-free coffee makers and grinders',
  },
  kettles: {
    name: 'Electric Kettles',
    description: 'PFAS-free electric kettles',
  },
  'rice-cookers': {
    name: 'Rice Cookers',
    description: 'PFAS-free rice cookers with safe inner pots',
  },
  'slow-cookers': {
    name: 'Slow Cookers',
    description: 'PFAS-free slow cookers and crockpots',
  },
  'toaster-ovens': {
    name: 'Toaster Ovens',
    description: 'PFAS-free toaster ovens and countertop ovens',
  },
  'espresso-machines': {
    name: 'Espresso Machines',
    description: 'PFAS-free espresso and coffee machines',
  },
  'induction-cooktops': {
    name: 'Induction Cooktops',
    description: 'PFAS-free portable induction cooktops',
  },
  'food-processors': {
    name: 'Food Processors',
    description: 'PFAS-free food processors and choppers',
  },
  'stand-mixers': {
    name: 'Stand Mixers',
    description: 'PFAS-free stand mixers with stainless steel bowls',
  },
  'air-fryers': {
    name: 'Air Fryers',
    description: 'PFAS-free air fryers with safe baskets',
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
    brand: searchParams.brand?.split(','),
    features: searchParams.features?.split(','),
    coating: searchParams.coating?.split(','),
    price: searchParams.price?.split(','),
    size: searchParams.size?.split(','),
    productType: searchParams.productType?.split(','),
    handle: searchParams.handle?.split(','),
    origin: searchParams.origin?.split(','),
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: 24,
    sort: searchParams.sort || 'tier_desc',
  };

  try {
    const [data, topPicks] = await Promise.all([
      fetchProducts(filters),
      fetchTopPicks(category),
    ]);

    if (data.data.length === 0) {
      return <EmptyState />;
    }

    return (
      <>
        {topPicks.topPick && (
          <CategoryTopPicks
            topPick={topPicks.topPick}
            topThree={topPicks.topThree}
          />
        )}
        <SortDropdown totalCount={data.pagination.totalCount} />
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

      <div className={styles.layout}>
        {/* Filter Sidebar - Desktop */}
        <aside className={styles.sidebar}>
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className={styles.main}>
          {/* Mobile Filter Button */}
          <div className={styles.mobileControls}>
            <MobileFilterButton />
          </div>

          {/* Affiliate Disclosure */}
          <AffiliateDisclosure />

          {/* Product Grid with Suspense */}
          <Suspense fallback={<LoadingState />}>
            <CategoryContent category={params.category} searchParams={searchParams} />
          </Suspense>
        </div>
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
