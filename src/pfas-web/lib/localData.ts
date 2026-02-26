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
  'stainless-steel': ['stainless steel', 'stainless', '18/10', '18/8', '304', '316', 'tri-ply', '5-ply', 'clad', '3-ply', '7-ply'],
  'cast-iron': ['cast iron', 'cast-iron', 'castiron'],
  'carbon-steel': ['carbon steel', 'carbon-steel', 'blue steel'],
  'ceramic': ['ceramic', 'thermolon', 'cerastone', 'ceramic-coated', 'ceramic coated'],
  'glass': ['glass', 'borosilicate', 'pyrex', 'tempered glass'],
  'enamel': ['enamel', 'enameled', 'porcelain enamel', 'enamel coating', 'enamel interior'],
  'titanium': ['titanium', '100% titanium', 'pure titanium'],
  'copper': ['copper', 'copper core', 'copper element'],
  'aluminum': ['aluminum', 'aluminium', 'hard-anodized', 'hard anodized', 'anodized', 'aluminized'],
  'silicone': ['silicone', 'platinum silicone', 'food-grade silicone'],
  'wood': ['wood', 'teak', 'maple', 'acacia', 'walnut', 'bamboo', 'ebony', 'wooden'],
  'plastic': ['plastic', 'tritan', 'bpa-free plastic', 'copolyester'],
};

// Extract normalized material slugs from a product
function getProductMaterials(product: Product): string[] {
  const materials = new Set<string>();
  const searchText = [
    product.materialSummary || '',
    product.coatingSummary || '',
    product.description || '',
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
  for (const feature of featureFilters) {
    switch (feature) {
      case 'induction':
        if (!product.features?.inductionCompatible) return false;
        break;
      case 'dishwasher':
        if (!product.features?.dishwasherSafe) return false;
        break;
      case 'oven-500':
        if (!product.features?.ovenSafeTempF || product.features.ovenSafeTempF < 500) return false;
        break;
      case 'plastic-free':
        if (!isPlasticFree(product)) return false;
        break;
      case 'lid-included':
        if (!hasLidIncluded(product)) return false;
        break;
    }
  }
  return true;
}

// Check if product has no plastic food contact
function isPlasticFree(product: Product): boolean {
  const plasticKeywords = ['plastic', 'tritan', 'bpa-free plastic', 'copolyester'];
  const searchText = [
    product.materialSummary || '',
    ...product.components.map(c => c.material?.name || ''),
  ].join(' ').toLowerCase();
  
  return !plasticKeywords.some(keyword => searchText.includes(keyword));
}

// Check if product includes a lid
function hasLidIncluded(product: Product): boolean {
  const lidKeywords = ['with lid', 'lid included', 'includes lid', 'w/ lid'];
  const searchText = [
    product.name,
    product.description || '',
  ].join(' ').toLowerCase();
  
  return lidKeywords.some(keyword => searchText.includes(keyword));
}

// Check if product matches price range
function matchesPrice(product: Product, priceFilters: string[]): boolean {
  const price = product.retailers?.[0]?.price;
  if (!price) return false;
  
  for (const range of priceFilters) {
    switch (range) {
      case 'under-50':
        if (price < 50) return true;
        break;
      case '50-100':
        if (price >= 50 && price <= 100) return true;
        break;
      case '100-200':
        if (price > 100 && price <= 200) return true;
        break;
      case '200-plus':
        if (price > 200) return true;
        break;
    }
  }
  return false;
}

// Country/origin keywords mapping
const ORIGIN_KEYWORDS: Record<string, string[]> = {
  'usa': ['made in usa', 'made in the usa', 'made in america', 'american made', 'usa made', 'american-made', 'made in indiana', 'made in tennessee', 'since 1896'],
  'france': ['made in france', 'french made', 'french-made', 'france', 'french carbon steel', 'french ceramic', 'since 1925'],
  'germany': ['made in germany', 'german made', 'german-made', 'germany', 'german-engineered', 'german engineering'],
  'japan': ['made in japan', 'japanese made', 'japanese-made', 'japan', 'japanese'],
  'italy': ['made in italy', 'italian made', 'italian-made', 'italy', 'italian'],
  'belgium': ['made in belgium', 'belgian made', 'belgian-made', 'belgium', 'belgian'],
  'china': ['made in china', 'chinese made', 'chinese-made', 'china'],
};

// Brand to country mapping (known brand origins)
const BRAND_ORIGINS: Record<string, string> = {
  'le-creuset': 'france',
  'lecreuset': 'france',
  'staub': 'france',
  'de-buyer': 'france',
  'debuyer': 'france',
  'matfer-bourgeat': 'france',
  'matferbourgeat': 'france',
  'emile-henry': 'france',
  'emilehenry': 'france',
  'silpat': 'france',
  'demeyere': 'belgium',
  'zwilling': 'germany',
  'lodge': 'usa',
  'field-company': 'usa',
  'fieldcompany': 'usa',
  'finex': 'usa',
  'smithey': 'usa',
  'usa-pan': 'usa',
  'usapan': 'usa',
  'pyrex': 'usa',
  'anchor-hocking': 'usa',
  'anchorhocking': 'usa',
  'vitamix': 'usa',
  'blendtec': 'usa',
  'kitchenaid': 'usa',
  'cuisinart': 'usa',
  'all-clad': 'usa',
  'allclad': 'usa',
  'made-in': 'usa',
  'madein': 'usa',
  'john-boos': 'usa',
  'johnboos': 'usa',
  'nordic-ware': 'usa',
  'nordicware': 'usa',
  'zojirushi': 'japan',
  'tatung': 'japan',
};

// Check if product matches origin
function matchesOrigin(product: Product, originFilters: string[]): boolean {
  const searchText = [
    product.name,
    product.description || '',
    product.brand.name,
  ].join(' ').toLowerCase();
  
  for (const origin of originFilters) {
    // Check brand origin mapping first
    const brandSlug = product.brand.slug || product.brand.id;
    if (BRAND_ORIGINS[brandSlug] === origin) {
      return true;
    }
    
    // Then check keywords in product text
    const keywords = ORIGIN_KEYWORDS[origin] || [];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }
  return false;
}

// Size keywords mapping
const SIZE_KEYWORDS: Record<string, string[]> = {
  '8-inch': ['8 inch', '8"', '8-inch', '20cm', '20 cm'],
  '10-inch': ['10 inch', '10"', '10-inch', '10.25"', '10.5"', '25cm', '26cm'],
  '12-inch': ['12 inch', '12"', '12-inch', '30cm', '30 cm'],
  '14-inch': ['14 inch', '14"', '14-inch', '35cm', '36cm'],
};

// Check if product matches size
function matchesSize(product: Product, sizeFilters: string[]): boolean {
  const searchText = [
    product.name,
    product.description || '',
  ].join(' ').toLowerCase();
  
  for (const size of sizeFilters) {
    const keywords = SIZE_KEYWORDS[size] || [];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }
  return false;
}

// Coating keywords mapping
const COATING_KEYWORDS: Record<string, string[]> = {
  'ceramic': ['ceramic', 'thermolon', 'cerastone', 'ceramic coated', 'ceramic-coated'],
  'enameled': ['enamel', 'enameled', 'porcelain enamel', 'enamel coating', 'enamel interior', 'matte enamel'],
  'seasoned': ['seasoned', 'pre-seasoned', 'preseasoned', 'vegetable oil seasoning', 'oil seasoning'],
  'none': ['bare', 'uncoated', 'raw', 'no coating', 'no synthetic', 'none'],
};

// Check if product matches coating type
function matchesCoating(product: Product, coatingFilters: string[]): boolean {
  const searchText = [
    product.coatingSummary || '',
    product.materialSummary || '',
    product.description || '',
    ...product.components.map(c => c.coating?.name || ''),
  ].join(' ').toLowerCase();
  
  for (const coating of coatingFilters) {
    if (coating === 'none') {
      // Check for no coating / bare metal / glass / stainless steel / cast iron without enamel
      const coatingSummary = (product.coatingSummary || '').toLowerCase();
      const isNoCoating = 
        !coatingSummary || 
        coatingSummary === 'none' || 
        coatingSummary.includes('no coating') ||
        coatingSummary.includes('none -') ||
        coatingSummary.includes('uncoated') ||
        coatingSummary.includes('natural');
      
      // Also check for bare materials like stainless steel, glass, titanium
      const bareMaterials = ['stainless steel', 'glass', 'titanium', 'aluminum', 'copper'];
      const isBare = bareMaterials.some(m => 
        product.materialSummary?.toLowerCase().includes(m) && 
        !searchText.includes('coated') && 
        !searchText.includes('enamel') &&
        !searchText.includes('ceramic')
      );
      
      if (isNoCoating || isBare) return true;
    } else {
      const keywords = COATING_KEYWORDS[coating] || [];
      if (keywords.some(keyword => searchText.includes(keyword))) {
        return true;
      }
    }
  }
  return false;
}

// Check if product is a set or single piece
function matchesProductType(product: Product, typeFilters: string[]): boolean {
  const searchText = [
    product.name,
    product.description || '',
  ].join(' ').toLowerCase();
  
  for (const type of typeFilters) {
    if (type === 'set') {
      const setKeywords = ['set', 'piece set', '-piece', 'kit', 'collection'];
      if (setKeywords.some(keyword => searchText.includes(keyword))) {
        return true;
      }
    } else if (type === 'single') {
      const setKeywords = ['set', 'piece set', '-piece', 'kit', 'collection'];
      if (!setKeywords.some(keyword => searchText.includes(keyword))) {
        return true;
      }
    }
  }
  return false;
}

// Handle type keywords mapping
const HANDLE_KEYWORDS: Record<string, string[]> = {
  'stay-cool': ['stay-cool', 'stay cool', 'cool-grip', 'cool grip', 'heat-resistant handle', 'cool touch'],
  'metal': ['stainless steel handle', 'metal handle', 'steel handle', 'iron handle'],
  'removable': ['removable handle', 'detachable handle'],
  'silicone': ['silicone handle', 'silicone grip', 'silicone-wrapped'],
};

// Check if product matches handle type
function matchesHandle(product: Product, handleFilters: string[]): boolean {
  const searchText = [
    product.name,
    product.description || '',
    product.materialSummary || '',
  ].join(' ').toLowerCase();
  
  for (const handle of handleFilters) {
    const keywords = HANDLE_KEYWORDS[handle] || [];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }
  return false;
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
  price?: string[];
  size?: string[];
  productType?: string[];
  handle?: string[];
  origin?: string[];
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

  // Filter by price range
  if (params.price?.length) {
    products = products.filter(p => matchesPrice(p, params.price!));
  }

  // Filter by coating type
  if (params.coating?.length) {
    products = products.filter(p => matchesCoating(p, params.coating!));
  }

  // Filter by size
  if (params.size?.length) {
    products = products.filter(p => matchesSize(p, params.size!));
  }

  // Filter by product type (set vs single)
  if (params.productType?.length) {
    products = products.filter(p => matchesProductType(p, params.productType!));
  }

  // Filter by handle type
  if (params.handle?.length) {
    products = products.filter(p => matchesHandle(p, params.handle!));
  }

  // Filter by country of origin
  if (params.origin?.length) {
    products = products.filter(p => matchesOrigin(p, params.origin!));
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
