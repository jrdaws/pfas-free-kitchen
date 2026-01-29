/**
 * Image helper utilities for PFAS-Free Kitchen
 * Maps products and brands to appropriate placeholder images
 */

// Category ID to placeholder image mapping
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  // Cookware
  'cat_1_1': '/placeholders/products/skillet-placeholder.svg',  // Skillets & Frying Pans
  'cat_1_2': '/placeholders/products/saucepan-placeholder.svg', // Saucepans
  'cat_1_3': '/placeholders/products/dutch-oven-placeholder.svg', // Dutch Ovens
  'cat_skillets': '/placeholders/products/skillet-placeholder.svg',
  'cat_saucepans': '/placeholders/products/saucepan-placeholder.svg',
  'cat_dutch_ovens': '/placeholders/products/dutch-oven-placeholder.svg',
  'cat_stock_pots': '/placeholders/products/stock-pot-placeholder.svg',
  
  // Bakeware
  'cat_2_1': '/placeholders/products/sheet-pan-placeholder.svg', // Sheet Pans
  'cat_2_2': '/placeholders/products/baking-dish-placeholder.svg', // Baking Dishes
  'cat_sheet_pans': '/placeholders/products/sheet-pan-placeholder.svg',
  'cat_baking_dishes': '/placeholders/products/baking-dish-placeholder.svg',
  'cat_muffin_pans': '/placeholders/products/muffin-pan-placeholder.svg',
  
  // Storage
  'cat_3_1': '/placeholders/products/container-placeholder.svg', // Glass Containers
  'cat_glass_containers': '/placeholders/products/container-placeholder.svg',
  'cat_stainless_containers': '/placeholders/products/container-placeholder.svg',
  
  // Utensils & Tools
  'cat_4_1': '/placeholders/products/utensil-placeholder.svg', // Spatulas & Turners
  'cat_4_2': '/placeholders/products/utensil-placeholder.svg', // Cooking Spoons
  'cat_4_3': '/placeholders/products/utensil-placeholder.svg', // Tongs
  'cat_4_4': '/placeholders/products/utensil-placeholder.svg', // Whisks
  'cat_4_5': '/placeholders/products/cutting-board-placeholder.svg', // Cutting Boards
  'cat_4_6': '/placeholders/products/mixing-bowl-placeholder.svg', // Mixing Bowls
  'cat_4_7': '/placeholders/products/utensil-placeholder.svg', // Measuring
  'cat_spatulas': '/placeholders/products/utensil-placeholder.svg',
  'cat_cutting_boards': '/placeholders/products/cutting-board-placeholder.svg',
  'cat_mixing_bowls': '/placeholders/products/mixing-bowl-placeholder.svg',
  
  // Appliance Accessories
  'cat_5_1': '/placeholders/products/default-placeholder.svg', // Pressure Cooker
  'cat_5_2': '/placeholders/products/mixing-bowl-placeholder.svg', // Stand Mixer
  'cat_5_3': '/placeholders/products/container-placeholder.svg', // Blender
  'cat_pressure_cooker_accessories': '/placeholders/products/default-placeholder.svg',
  'cat_mixer_accessories': '/placeholders/products/mixing-bowl-placeholder.svg',
  'cat_blender_accessories': '/placeholders/products/container-placeholder.svg',
};

// Category hero images mapping
const CATEGORY_HEROES: Record<string, string> = {
  'cookware': '/categories/cookware-hero.svg',
  'bakeware': '/categories/bakeware-hero.svg',
  'storage': '/categories/storage-hero.svg',
  'utensils-tools': '/categories/utensils-hero.svg',
  'appliance-accessories': '/categories/appliances-hero.svg',
};

// Tier icon mapping
const TIER_ICONS: Record<number, string> = {
  0: '/icons/tiers/tier-0-unknown.svg',
  1: '/icons/tiers/tier-1-statement.svg',
  2: '/icons/tiers/tier-2-reviewed.svg',
  3: '/icons/tiers/tier-3-lab-tested.svg',
  4: '/icons/tiers/tier-4-monitored.svg',
};

interface Product {
  primary_image_url?: string | null;
  category?: {
    id?: string;
  };
}

interface Brand {
  logo_url?: string | null;
  slug: string;
}

/**
 * Get the appropriate image for a product
 * Falls back to category-specific placeholder if no real image exists
 */
export function getProductImage(product: Product): string {
  // If product has a real image that's not a placeholder, use it
  if (product.primary_image_url && !product.primary_image_url.includes('placeholder')) {
    return product.primary_image_url;
  }
  
  // Otherwise, return category-appropriate placeholder
  const categoryId = product.category?.id;
  if (categoryId && CATEGORY_PLACEHOLDERS[categoryId]) {
    return CATEGORY_PLACEHOLDERS[categoryId];
  }
  
  return '/placeholders/products/default-placeholder.svg';
}

/**
 * Get product image by category slug
 */
export function getProductImageByCategory(categorySlug: string): string {
  // Map slug to category ID pattern
  const slugToPlaceholder: Record<string, string> = {
    'skillets-frying-pans': '/placeholders/products/skillet-placeholder.svg',
    'saucepans': '/placeholders/products/saucepan-placeholder.svg',
    'dutch-ovens': '/placeholders/products/dutch-oven-placeholder.svg',
    'stock-pots': '/placeholders/products/stock-pot-placeholder.svg',
    'sheet-pans': '/placeholders/products/sheet-pan-placeholder.svg',
    'baking-dishes': '/placeholders/products/baking-dish-placeholder.svg',
    'muffin-pans': '/placeholders/products/muffin-pan-placeholder.svg',
    'glass-containers': '/placeholders/products/container-placeholder.svg',
    'spatulas-turners': '/placeholders/products/utensil-placeholder.svg',
    'cooking-spoons': '/placeholders/products/utensil-placeholder.svg',
    'cutting-boards': '/placeholders/products/cutting-board-placeholder.svg',
    'mixing-bowls': '/placeholders/products/mixing-bowl-placeholder.svg',
    'measuring-cups-spoons': '/placeholders/products/utensil-placeholder.svg',
  };
  
  return slugToPlaceholder[categorySlug] || '/placeholders/products/default-placeholder.svg';
}

/**
 * Get brand logo image
 * Falls back to generated placeholder if no real logo exists
 */
export function getBrandLogo(brand: Brand): string {
  if (brand.logo_url && !brand.logo_url.includes('placeholder')) {
    return brand.logo_url;
  }
  return `/brands/${brand.slug}.svg`;
}

/**
 * Get category hero image
 */
export function getCategoryHero(categorySlug: string): string {
  return CATEGORY_HEROES[categorySlug] || '/categories/cookware-hero.svg';
}

/**
 * Get verification tier icon
 */
export function getTierIcon(tier: number): string {
  return TIER_ICONS[tier] || TIER_ICONS[0];
}

/**
 * Get appropriate empty state illustration
 */
export function getEmptyStateIllustration(type: 'search' | 'compare' | 'saved' | 'cart' | '404' | '500'): string {
  const illustrations: Record<string, string> = {
    search: '/illustrations/empty-search.svg',
    compare: '/illustrations/empty-compare.svg',
    saved: '/illustrations/empty-saved.svg',
    cart: '/illustrations/empty-cart.svg',
    '404': '/illustrations/error-404.svg',
    '500': '/illustrations/error-500.svg',
  };
  
  return illustrations[type] || illustrations.search;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [400, 800, 1200]): string {
  // For SVGs, srcset doesn't apply, return empty
  if (baseUrl.endsWith('.svg')) {
    return '';
  }
  
  // For real images, generate srcset
  return widths
    .map(w => `${baseUrl}?w=${w} ${w}w`)
    .join(', ');
}
