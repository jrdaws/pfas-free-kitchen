'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCompare } from '@/contexts/CompareContext';
import { AffiliateDisclosure } from '@/components/layout';
import { 
  SearchBar, 
  EducationBanner, 
  FilterSidebar, 
  SearchHeader, 
  ActiveFilters, 
  MobileFilterButton,
  EmptyResults,
  type ViewMode 
} from '@/components/search';
import { ProductCard, ProductCardList, ProductGridSkeleton } from '@/components/product';
import { Pagination } from '@/components/ui';
import type { Product } from '@/lib/types';
import styles from './search.module.css';

// Mock search results - replace with API call
const MOCK_RESULTS: Product[] = [
  {
    id: '1',
    name: 'Lodge Cast Iron Skillet 10.25"',
    slug: 'lodge-cast-iron-skillet-10',
    description: 'This pre-seasoned cast iron skillet is ready to use right out of the box. Perfect for searing, sautéing, baking, broiling, braising, and frying.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b1', name: 'Lodge', slug: 'lodge' },
    category: { id: 'c1', name: 'Skillets', slug: 'skillets', path: [] },
    materialSummary: 'Cast iron with vegetable oil seasoning',
    coatingSummary: 'Pre-seasoned',
    verification: { tier: 3, unknowns: [], hasEvidence: true, evidenceCount: 2 },
    components: [],
    retailers: [{ id: 'r1', retailer: { id: 'ret1', name: 'Amazon' }, url: '#' }],
  },
  {
    id: '2',
    name: 'All-Clad D3 Stainless Steel Fry Pan 10"',
    slug: 'all-clad-d3-stainless-fry-pan',
    description: 'Tri-ply bonded construction with a responsive aluminum core between stainless steel layers.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b2', name: 'All-Clad', slug: 'all-clad' },
    category: { id: 'c1', name: 'Skillets', slug: 'skillets', path: [] },
    materialSummary: 'Stainless steel, aluminum core',
    coatingSummary: null,
    verification: { tier: 4, unknowns: [], hasEvidence: true, evidenceCount: 3 },
    components: [],
    retailers: [
      { id: 'r2', retailer: { id: 'ret1', name: 'Amazon' }, url: '#' },
      { id: 'r3', retailer: { id: 'ret2', name: 'Williams Sonoma' }, url: '#' },
    ],
  },
  {
    id: '3',
    name: 'Le Creuset Signature Dutch Oven 5.5 Qt',
    slug: 'le-creuset-signature-dutch-oven',
    description: 'Enameled cast iron with superior heat retention and distribution.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b3', name: 'Le Creuset', slug: 'le-creuset' },
    category: { id: 'c2', name: 'Dutch Ovens', slug: 'dutch-ovens', path: [] },
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Porcelain enamel',
    verification: { tier: 4, unknowns: [], hasEvidence: true, evidenceCount: 4 },
    components: [],
    retailers: [{ id: 'r4', retailer: { id: 'ret1', name: 'Amazon' }, url: '#' }],
  },
  {
    id: '4',
    name: 'Made In Carbon Steel Frying Pan 10"',
    slug: 'made-in-carbon-steel-frying-pan',
    description: 'Professional-grade carbon steel pan made in France.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b4', name: 'Made In', slug: 'made-in' },
    category: { id: 'c1', name: 'Skillets', slug: 'skillets', path: [] },
    materialSummary: 'Carbon steel',
    coatingSummary: 'Beeswax coating (initial)',
    verification: { tier: 3, unknowns: [], hasEvidence: true, evidenceCount: 2 },
    components: [],
    retailers: [{ id: 'r5', retailer: { id: 'ret3', name: 'Made In' }, url: '#' }],
  },
  {
    id: '5',
    name: 'Demeyere Industry5 Stainless Saucepan 2 Qt',
    slug: 'demeyere-industry5-saucepan',
    description: 'Belgian-made 5-ply stainless steel saucepan with Silvinox treatment.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b5', name: 'Demeyere', slug: 'demeyere' },
    category: { id: 'c3', name: 'Saucepans', slug: 'saucepans', path: [] },
    materialSummary: 'Stainless steel, 5-ply',
    coatingSummary: null,
    verification: { tier: 4, unknowns: [], hasEvidence: true, evidenceCount: 3 },
    components: [],
    retailers: [{ id: 'r6', retailer: { id: 'ret1', name: 'Amazon' }, url: '#' }],
  },
  {
    id: '6',
    name: 'Staub Cast Iron Cocotte 4 Qt',
    slug: 'staub-cast-iron-cocotte',
    description: 'French-made enameled cast iron cocotte with self-basting lid.',
    imageUrl: '/placeholder-product.svg',
    images: [{ url: '/placeholder-product.svg', isPrimary: true }],
    brand: { id: 'b6', name: 'Staub', slug: 'staub' },
    category: { id: 'c2', name: 'Dutch Ovens', slug: 'dutch-ovens', path: [] },
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Black matte enamel',
    verification: { tier: 3, unknowns: ['Manufacturing audit pending'], hasEvidence: true, evidenceCount: 2 },
    components: [],
    retailers: [{ id: 'r7', retailer: { id: 'ret2', name: 'Williams Sonoma' }, url: '#' }],
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toggleItem, isInCompare, canAdd } = useCompare();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  // Mock search logic - in production, use API
  const results = query 
    ? MOCK_RESULTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.name.toLowerCase().includes(query.toLowerCase()) ||
        p.materialSummary?.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_RESULTS;

  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / limit);

  // Check for education banner triggers
  const educationBanner = getEducationBanner(query);

  const handleCompareToggle = (productId: string) => {
    // Only allow adding if we have room (or if the item is already in compare)
    if (canAdd || isInCompare(productId)) {
      toggleItem(productId);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchLayout}>
        {/* Mobile filter toggle */}
        <div className={styles.mobileHeader}>
          <MobileFilterButton />
        </div>
        
        {/* Filter sidebar (desktop) */}
        <aside className={styles.filterSidebar}>
          <FilterSidebar />
        </aside>
        
        {/* Main content */}
        <main className={styles.searchMain}>
          {/* Search header */}
          <header className={styles.searchHeader}>
            <div className={styles.searchWrapper}>
              <SearchBar defaultValue={query} />
            </div>
          </header>

          {/* Education Banner */}
          {educationBanner && <EducationBanner banner={educationBanner} />}

          {/* Affiliate Disclosure */}
          {results.length > 0 && <AffiliateDisclosure />}

          {/* Active filter pills */}
          <ActiveFilters />

          {/* Search results header */}
          {results.length > 0 && (
            <SearchHeader
              resultCount={totalCount}
              query={query || undefined}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}

          {/* Results */}
          {!query && results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Search for PFAS-free products</p>
              <p className={styles.emptyText}>
                Try searching for a product type (like "skillet"), brand, or material.
              </p>
            </div>
          ) : results.length === 0 ? (
            <EmptyResults query={query} />
          ) : (
            <>
              <div className={viewMode === 'grid' ? styles.productGrid : styles.productList}>
                {results.map(product => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCompareToggle={handleCompareToggle}
                      isComparing={isInCompare(product.id)}
                    />
                  ) : (
                    <ProductCardList
                      key={product.id}
                      product={product}
                      onCompareToggle={handleCompareToggle}
                      isComparing={isInCompare(product.id)}
                    />
                  )
                ))}
              </div>
              
              <Pagination
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={limit}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingState />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchLoadingState() {
  return (
    <div className={styles.page}>
      <div className={styles.searchLayout}>
        <aside className={styles.filterSidebar}>
          <div className={styles.skeletonSidebar} />
        </aside>
        <main className={styles.searchMain}>
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
          <ProductGridSkeleton count={8} />
        </main>
      </div>
    </div>
  );
}

function getEducationBanner(query: string) {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();

  if (/pfoa.?free/i.test(lowerQuery)) {
    return {
      type: 'pfoa_clarification' as const,
      title: 'PFOA-free ≠ PFAS-free',
      message:
        "PFOA is one of thousands of PFAS chemicals. A product labeled 'PFOA-free' may still contain other PFAS.",
      link: '/education/pfoa-vs-pfas',
      linkText: 'Learn more about PFAS →',
    };
  }

  if (/\bteflon\b/i.test(lowerQuery) || /\bptfe\b/i.test(lowerQuery)) {
    return {
      type: 'pfas_education' as const,
      title: 'About Teflon® (PTFE)',
      message:
        'Teflon is a brand name for PTFE, a type of PFAS. Our catalog focuses on PFAS-free alternatives.',
      link: '/education/what-is-ptfe',
      linkText: 'Explore PFAS-free options →',
    };
  }

  return null;
}
