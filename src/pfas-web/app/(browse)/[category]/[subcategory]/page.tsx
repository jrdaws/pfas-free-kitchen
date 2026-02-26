import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { AffiliateDisclosure } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { FilterSidebar, SortDropdown, MobileFilterButton } from '@/components/search';
import { Pagination, LoadingSpinner } from '@/components/ui';
import { fetchProducts, isAPIError } from '@/lib';
import styles from '../category.module.css';

// Subcategory display info
const SUBCATEGORY_INFO: Record<string, { name: string; description: string; parent: string }> = {
  // Appliance subcategories
  blenders: {
    name: 'Blenders',
    description: 'PFAS-free blenders with safe containers',
    parent: 'appliances',
  },
  'coffee-makers': {
    name: 'Coffee Makers & Grinders',
    description: 'PFAS-free coffee makers and grinders',
    parent: 'appliances',
  },
  kettles: {
    name: 'Electric Kettles',
    description: 'PFAS-free electric kettles',
    parent: 'appliances',
  },
  'rice-cookers': {
    name: 'Rice Cookers',
    description: 'PFAS-free rice cookers with safe inner pots',
    parent: 'appliances',
  },
  'slow-cookers': {
    name: 'Slow Cookers',
    description: 'PFAS-free slow cookers and crockpots',
    parent: 'appliances',
  },
  'toaster-ovens': {
    name: 'Toaster Ovens',
    description: 'PFAS-free toaster ovens and countertop ovens',
    parent: 'appliances',
  },
  'espresso-machines': {
    name: 'Espresso Machines',
    description: 'PFAS-free espresso and coffee machines',
    parent: 'appliances',
  },
  'induction-cooktops': {
    name: 'Induction Cooktops',
    description: 'PFAS-free portable induction cooktops',
    parent: 'appliances',
  },
  'food-processors': {
    name: 'Food Processors',
    description: 'PFAS-free food processors and choppers',
    parent: 'appliances',
  },
  'stand-mixers': {
    name: 'Stand Mixers',
    description: 'PFAS-free stand mixers with stainless steel bowls',
    parent: 'appliances',
  },
  'air-fryers': {
    name: 'Air Fryers',
    description: 'PFAS-free air fryers with safe baskets',
    parent: 'appliances',
  },
  // Cookware subcategories
  'fry-pans': {
    name: 'Fry Pans & Skillets',
    description: 'PFAS-free frying pans and skillets',
    parent: 'cookware',
  },
  'cookware-sets': {
    name: 'Cookware Sets',
    description: 'Complete PFAS-free cookware sets',
    parent: 'cookware',
  },
  'dutch-ovens': {
    name: 'Dutch Ovens',
    description: 'PFAS-free dutch ovens and braising pots',
    parent: 'cookware',
  },
  'sauce-pans': {
    name: 'Sauce Pans',
    description: 'PFAS-free sauce pans and sauciers',
    parent: 'cookware',
  },
  'cutting-boards': {
    name: 'Cutting Boards',
    description: 'PFAS-free cutting boards and butcher blocks',
    parent: 'cookware',
  },
  // Storage subcategories
  'glass-containers': {
    name: 'Glass Containers',
    description: 'PFAS-free glass food storage containers',
    parent: 'storage',
  },
  'stainless-containers': {
    name: 'Stainless Steel Containers',
    description: 'PFAS-free stainless steel food storage',
    parent: 'storage',
  },
  'silicone-bags': {
    name: 'Silicone Bags',
    description: 'PFAS-free reusable silicone storage bags',
    parent: 'storage',
  },
  'beeswax-wraps': {
    name: 'Beeswax Wraps',
    description: 'PFAS-free beeswax food wraps',
    parent: 'storage',
  },
  // Bakeware subcategories
  'baking-sheets': {
    name: 'Baking Sheets',
    description: 'PFAS-free baking sheets and cookie pans',
    parent: 'bakeware',
  },
  'baking-dishes': {
    name: 'Baking Dishes',
    description: 'PFAS-free baking dishes and casseroles',
    parent: 'bakeware',
  },
  'silicone-mats': {
    name: 'Silicone Baking Mats',
    description: 'PFAS-free silicone baking mats',
    parent: 'bakeware',
  },
};

interface SubcategoryPageProps {
  params: { category: string; subcategory: string };
  searchParams: Record<string, string>;
}

async function SubcategoryContent({ 
  subcategory, 
  searchParams 
}: { 
  subcategory: string; 
  searchParams: Record<string, string>;
}) {
  const filters = {
    category: subcategory,
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

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const subcategoryInfo = SUBCATEGORY_INFO[params.subcategory];

  if (!subcategoryInfo || subcategoryInfo.parent !== params.category) {
    notFound();
  }

  const parentName = params.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link href={`/${params.category}`} className={styles.breadcrumbLink}>
              {parentName}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span>{subcategoryInfo.name}</span>
          </nav>
          <h1 className={styles.title}>{subcategoryInfo.name}</h1>
          <p className={styles.description}>{subcategoryInfo.description}</p>
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
            <SubcategoryContent subcategory={params.subcategory} searchParams={searchParams} />
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

export async function generateMetadata({ params }: SubcategoryPageProps) {
  const subcategoryInfo = SUBCATEGORY_INFO[params.subcategory];

  if (!subcategoryInfo) {
    return {
      title: params.subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: `Browse PFAS-free ${params.subcategory} products`,
    };
  }

  return {
    title: subcategoryInfo.name,
    description: subcategoryInfo.description,
  };
}
