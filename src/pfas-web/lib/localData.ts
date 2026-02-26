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
import { TOP_PICKS_BY_CATEGORY } from '../data/top-picks';

// Map browse route slugs to product category slugs
const BROWSE_TO_PRODUCT_CATEGORY: Record<string, string[]> = {
  cookware: ['fry-pans', 'cookware-sets', 'dutch-ovens', 'sauce-pans', 'cutting-boards'],
  bakeware: ['bakeware', 'baking-dishes', 'baking-sheets', 'silicone-mats'],
  storage: ['storage', 'glass-containers', 'stainless-containers', 'silicone-bags', 'beeswax-wraps'],
  'food-storage': ['storage', 'glass-containers', 'stainless-containers', 'silicone-bags', 'beeswax-wraps'],
  utensils: [],
  'utensils-tools': [],
  appliances: ['blenders', 'coffee-makers', 'kettles', 'rice-cookers', 'slow-cookers', 'toaster-ovens', 'espresso-machines', 'induction-cooktops', 'food-processors', 'stand-mixers', 'air-fryers'],
  'appliance-accessories': [],
};

function matchesBrowseCategory(product: Product, browseSlug: string): boolean {
  const productSlugs = BROWSE_TO_PRODUCT_CATEGORY[browseSlug];
  if (!productSlugs || productSlugs.length === 0) return false;
  return productSlugs.includes(product.category.slug);
}

// Material slug mapping - maps filter values to keywords found in product data
const MATERIAL_KEYWORDS: Record<string, string[]> = {
  'stainless-steel': ['stainless steel', 'stainless', '18/10', '18/8', '304', '316', 'tri-ply', '5-ply', 'clad'],
  'cast-iron': ['cast iron', 'cast-iron'],
  'carbon-steel': ['carbon steel', 'carbon-steel'],
  'ceramic': ['ceramic', 'thermolon', 'cerastone'],
  'glass': ['glass', 'borosilicate', 'pyrex', 'tempered glass'],
  'enamel': ['enamel', 'enameled', 'porcelain enamel'],
  'titanium': ['titanium'],
  'copper': ['copper'],
  'aluminum': ['aluminum', 'aluminium', 'hard-anodized'],
  'silicone': ['silicone'],
  'wood': ['wood', 'teak', 'maple', 'acacia', 'walnut', 'bamboo', 'ebony'],
  'plastic': ['plastic', 'tritan', 'bpa-free'],
};

// Extract normalized material slugs from a product
function getProductMaterials(product: Product): string[] {
  const materials = new Set<string>();
  const searchText = [
    product.materialSummary || '',
    product.coatingSummary || '',
    ...product.components.map(c => c.material?.name || ''),
    ...product.components.map(c => c.material?.slug || ''),
  ].join(' ').toLowerCase();

  for (const [slug, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        materials.add(slug);
        break;
      }
    }
  }
  return Array.from(materials);
}

// Check if product matches material filter
function matchesMaterial(product: Product, materialFilters: string[]): boolean {
  const productMaterials = getProductMaterials(product);
  return materialFilters.some(m => productMaterials.includes(m));
}

// Check if product matches brand filter
function matchesBrand(product: Product, brandFilters: string[]): boolean {
  return brandFilters.some(b => 
    product.brand.slug === b || 
    product.brand.id === b ||
    product.brand.name.toLowerCase().replace(/\s+/g, '-') === b
  );
}

// Check if product matches feature filters
function matchesFeatures(product: Product, featureFilters: string[]): boolean {
  if (!product.features) return false;
  
  for (const feature of featureFilters) {
    switch (feature) {
      case 'induction':
        if (!product.features.inductionCompatible) return false;
        break;
      case 'dishwasher':
        if (!product.features.dishwasherSafe) return false;
        break;
      case 'oven-500':
        if (!product.features.ovenSafeTempF || product.features.ovenSafeTempF < 500) return false;
        break;
    }
  }
  return true;
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
  brand?: string[];
  features?: string[];
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

  // Filter by category
  if (params.category) {
    // Check if it's a top-level browse category (cookware, storage, appliances, etc.)
    if (BROWSE_TO_PRODUCT_CATEGORY[params.category]) {
      products = products.filter(p => matchesBrowseCategory(p, params.category!));
    } else {
      // It's a specific subcategory slug (kettles, blenders, fry-pans, etc.)
      products = products.filter(p => p.category.slug === params.category);
    }
  }

  // Filter by tier
  if (params.tier?.length) {
    const tierSet = new Set(params.tier as VerificationTier[]);
    products = products.filter(p => tierSet.has(p.verification.tier));
  }

  // Filter by material (using keyword matching)
  if (params.material?.length) {
    products = products.filter(p => matchesMaterial(p, params.material!));
  }

  // Filter by brand
  if (params.brand?.length) {
    products = products.filter(p => matchesBrand(p, params.brand!));
  }

  // Filter by features
  if (params.features?.length) {
    products = products.filter(p => matchesFeatures(p, params.features!));
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
  slugs.add('appliances');

  return Array.from(slugs).map(slug => {
    const subCats = BROWSE_TO_PRODUCT_CATEGORY[slug] || [];
    const count = getAllProducts().filter(p => matchesBrowseCategory(p, slug)).length;
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

export function getLocalTopPicks(browseCategory: string): {
  topPick: Product | null;
  topThree: Product[];
} {
  const config = TOP_PICKS_BY_CATEGORY[browseCategory];
  if (!config || !config.topPick) {
    return { topPick: null, topThree: [] };
  }

  const topPick = getLocalProduct(config.topPick);
  const topThree = config.topThree
    .map(slug => getLocalProduct(slug))
    .filter((p): p is Product => p !== null);

  return { topPick, topThree };
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
