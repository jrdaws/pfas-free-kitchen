/**
 * Local product data source
 * Used when API is unavailable (no backend deployed)
 */

import type { Product, SearchFacets, Pagination, VerificationTier } from './types';
import {
  getAllProducts,
  getProductBySlug,
  getProductById,
  searchProducts,
} from '../data/products';

// Map browse route slugs to product category slugs
const BROWSE_TO_PRODUCT_CATEGORY: Record<string, string[]> = {
  cookware: ['fry-pans', 'cookware-sets', 'dutch-ovens'],
  bakeware: ['bakeware'],
  storage: ['storage'],
  'food-storage': ['storage'],
  utensils: [],
  'utensils-tools': [],
  appliances: [],
  'appliance-accessories': [],
};

function matchesBrowseCategory(product: Product, browseSlug: string): boolean {
  const productSlugs = BROWSE_TO_PRODUCT_CATEGORY[browseSlug];
  if (!productSlugs || productSlugs.length === 0) return false;
  return productSlugs.includes(product.category.slug);
}

function buildEmptyFacets(): SearchFacets {
  return {
    tiers: [],
    materials: [],
    coatingTypes: [],
    retailers: [],
    categories: [],
    induction: [],
    ovenTempRanges: [],
  };
}

function buildFacetsFromProducts(products: Product[]): SearchFacets {
  const tierCounts: Record<number, number> = {};
  const materialKeys = new Set<string>();
  const categoryKeys = new Set<string>();

  for (const p of products) {
    tierCounts[p.verification.tier] = (tierCounts[p.verification.tier] || 0) + 1;
    if (p.materialSummary) materialKeys.add(p.materialSummary);
    categoryKeys.add(p.category.slug);
  }

  return {
    tiers: Object.entries(tierCounts).map(([key, count]) => ({
      key,
      count,
      label: `Tier ${key}`,
    })),
    materials: Array.from(materialKeys).map(m => ({ key: m, count: 1, label: m })),
    coatingTypes: [],
    retailers: [],
    categories: Array.from(categoryKeys).map(c => ({ key: c, count: 1, label: c })),
    induction: [],
    ovenTempRanges: [],
  };
}

export interface ProductListParams {
  category?: string;
  tier?: number[];
  material?: string[];
  coating?: string[];
  page?: number;
  limit?: number;
  sort?: string;
}

export function getLocalProducts(params: ProductListParams): {
  data: Product[];
  pagination: Pagination;
  facets: SearchFacets;
} {
  let products = getAllProducts();

  // Filter by browse category (cookware, storage, bakeware, etc.)
  if (params.category) {
    products = products.filter(p => matchesBrowseCategory(p, params.category!));
  }

  // Filter by tier
  if (params.tier?.length) {
    const tierSet = new Set(params.tier as VerificationTier[]);
    products = products.filter(p => tierSet.has(p.verification.tier));
  }

  // Filter by material
  if (params.material?.length) {
    const matSet = new Set(params.material);
    products = products.filter(p => p.materialSummary && matSet.has(p.materialSummary));
  }

  // Sort
  const sort = params.sort || 'tier_desc';
  products = [...products].sort((a, b) => {
    if (sort === 'tier_desc') return b.verification.tier - a.verification.tier;
    if (sort === 'tier_asc') return a.verification.tier - b.verification.tier;
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    if (sort === 'name_desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const totalCount = products.length;
  const limit = params.limit || 24;
  const page = params.page || 1;
  const offset = (page - 1) * limit;
  const paginated = products.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
    facets: buildFacetsFromProducts(products),
  };
}

export function getLocalProduct(slugOrId: string): Product | null {
  const bySlug = getProductBySlug(slugOrId);
  if (bySlug) return bySlug;
  const byId = getProductById(slugOrId);
  return byId || null;
}

export function getLocalCategories() {
  const slugs = new Set<string>();
  for (const p of getAllProducts()) {
    const topLevel = p.category.path?.[0]?.slug || p.category.slug;
    if (topLevel) slugs.add(topLevel);
  }
  slugs.add('cookware');
  slugs.add('bakeware');
  slugs.add('storage');

  return Array.from(slugs).map(slug => {
    const subCats = BROWSE_TO_PRODUCT_CATEGORY[slug] || [];
    const count = slug === 'cookware' 
      ? getAllProducts().filter(p => matchesBrowseCategory(p, 'cookware')).length
      : slug === 'storage'
        ? getAllProducts().filter(p => matchesBrowseCategory(p, 'storage')).length
        : slug === 'bakeware'
          ? getAllProducts().filter(p => matchesBrowseCategory(p, 'bakeware')).length
          : 0;
    return {
      id: slug,
      name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug,
      path: [{ id: slug, name: slug, slug }],
      children: [],
      productCount: count,
    };
  });
}

export function getLocalRelatedProducts(
  categoryId: string,
  excludeProductId?: string,
  limit = 8
): Product[] {
  const topLevel = ['cookware', 'storage', 'bakeware'];
  const isTopLevel = topLevel.includes(categoryId);

  return getAllProducts()
    .filter(p => {
      if (p.id === excludeProductId) return false;
      if (p.category.id === categoryId) return true;
      if (p.category.path?.[0]?.id === categoryId) return true;
      if (isTopLevel && p.category.path?.[0]?.slug === categoryId) return true;
      return false;
    })
    .sort((a, b) => b.verification.tier - a.verification.tier)
    .slice(0, limit);
}

export function getLocalSearchResults(
  query: string,
  filters?: { categoryId?: string; tier?: number[]; page?: number; limit?: number }
) {
  let results = searchProducts(query);
  if (filters?.categoryId) {
    results = results.filter(p => 
      p.category.id === filters.categoryId || 
      p.category.path?.[0]?.id === filters.categoryId
    );
  }
  if (filters?.tier?.length) {
    const tierSet = new Set(filters.tier);
    results = results.filter(p => tierSet.has(p.verification.tier));
  }
  const page = filters?.page || 1;
  const limit = filters?.limit || 24;
  const offset = (page - 1) * limit;
  const paginated = results.slice(offset, offset + limit);

  return {
    query,
    totalCount: results.length,
    results: paginated.map(p => ({
      id: p.id,
      name: p.name,
      brandName: p.brand.name,
      score: 1,
      highlights: { name: [p.name], description: p.description ? [p.description] : [] },
      verificationTier: p.verification.tier,
      imageUrl: p.imageUrl || p.images?.[0]?.url,
      slug: p.slug,
    })),
    facets: buildFacetsFromProducts(results),
  };
}
