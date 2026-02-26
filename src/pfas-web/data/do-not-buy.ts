/**
 * Products Known to Contain PFAS - Do Not Buy List
 * 
 * Based on California AB1200 disclosures, Mamavation independent testing,
 * and manufacturer statements. These products have been confirmed to contain
 * PFAS compounds (PTFE, PFOA, PFA, FEP, etc.)
 */

export interface DoNotBuyProduct {
  id: string;
  brand: string;
  productLine: string;
  category: 'cookware' | 'air-fryer' | 'appliance' | 'bakeware';
  pfasType: string[];
  source: string;
  sourceUrl?: string;
  notes?: string;
}

export interface DoNotBuyBrand {
  id: string;
  name: string;
  logo?: string;
  products: DoNotBuyProduct[];
}

export const DO_NOT_BUY_BRANDS: DoNotBuyBrand[] = [
  // COOKWARE BRANDS WITH PFAS
  {
    id: 'le-creuset-nonstick',
    name: 'Le Creuset',
    products: [
      {
        id: 'le-creuset-tns',
        brand: 'Le Creuset',
        productLine: 'Toughened Nonstick (TNS) Line',
        category: 'cookware',
        pfasType: ['PTFE', 'FEP', 'PFA'],
        source: 'California AB1200 Chemical Disclosure',
        sourceUrl: 'https://www.lecreuset.com/ab1200',
        notes: 'Enameled cast iron is PFAS-free; only nonstick lines contain PFAS',
      },
    ],
  },
  {
    id: 'all-clad-nonstick',
    name: 'All-Clad',
    products: [
      {
        id: 'all-clad-ns',
        brand: 'All-Clad',
        productLine: 'HA1 Nonstick & NS1 Nonstick Lines',
        category: 'cookware',
        pfasType: ['PTFE'],
        source: 'California AB1200 Chemical Disclosure',
        sourceUrl: 'https://www.all-clad.com/ab1200',
        notes: 'Stainless steel lines (D3, D5) are PFAS-free; only nonstick contains PFAS',
      },
    ],
  },
  {
    id: 'calphalon-nonstick',
    name: 'Calphalon',
    products: [
      {
        id: 'calphalon-ns',
        brand: 'Calphalon',
        productLine: 'All Nonstick Lines',
        category: 'cookware',
        pfasType: ['PTFE', 'PFOA'],
        source: 'California AB1200 Chemical Disclosure',
        notes: 'Stainless steel lines are PFAS-free',
      },
    ],
  },
  {
    id: 'cuisinart-nonstick',
    name: 'Cuisinart',
    products: [
      {
        id: 'cuisinart-ns-cookware',
        brand: 'Cuisinart',
        productLine: 'Nonstick Cookware Lines',
        category: 'cookware',
        pfasType: ['PTFE'],
        source: 'California AB1200 Chemical Disclosure',
        notes: 'Stainless steel lines are PFAS-free',
      },
    ],
  },
  {
    id: 't-fal',
    name: 'T-fal',
    products: [
      {
        id: 't-fal-ns',
        brand: 'T-fal',
        productLine: 'All Nonstick Cookware',
        category: 'cookware',
        pfasType: ['PTFE'],
        source: 'Manufacturer Disclosure',
        notes: 'T-fal uses Teflon (PTFE) coating on all nonstick products',
      },
    ],
  },
  {
    id: 'instant-pot',
    name: 'Instant Pot',
    products: [
      {
        id: 'instant-pot-inner',
        brand: 'Instant Pot',
        productLine: 'Inner Cooking Pot (Nonstick Models)',
        category: 'appliance',
        pfasType: ['PTFE', 'PFA', 'FEP'],
        source: 'California AB1200 Chemical Disclosure',
        notes: 'Stainless steel inner pots are available as PFAS-free alternatives',
      },
    ],
  },

  // AIR FRYERS WITH PFAS (Based on Mamavation Testing)
  {
    id: 'cosori',
    name: 'COSORI',
    products: [
      {
        id: 'cosori-air-fryers',
        brand: 'COSORI',
        productLine: 'All Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE', 'PFAS coatings'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
        notes: 'Tested positive for PFAS in cooking basket coatings',
      },
    ],
  },
  {
    id: 'ninja-air-fryers',
    name: 'Ninja',
    products: [
      {
        id: 'ninja-af',
        brand: 'Ninja',
        productLine: 'Most Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE', 'PFAS coatings'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
        notes: 'Most models tested positive; check specific model disclosures',
      },
    ],
  },
  {
    id: 'cuisinart-air-fryers',
    name: 'Cuisinart',
    products: [
      {
        id: 'cuisinart-af',
        brand: 'Cuisinart',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'hamilton-beach-af',
    name: 'Hamilton Beach',
    products: [
      {
        id: 'hamilton-beach-air-fryers',
        brand: 'Hamilton Beach',
        productLine: 'Air Fryers (except PFAS-Free Model)',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
        notes: 'Hamilton Beach does offer one PFAS-free model - verify before purchase',
      },
    ],
  },
  {
    id: 'bella',
    name: 'Bella / Beautiful',
    products: [
      {
        id: 'bella-af',
        brand: 'Bella / Beautiful',
        productLine: 'All Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE', 'PFAS coatings'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'dash',
    name: 'Dash',
    products: [
      {
        id: 'dash-af',
        brand: 'Dash',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'instant-vortex',
    name: 'Instant Vortex',
    products: [
      {
        id: 'instant-vortex-af',
        brand: 'Instant Vortex',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE', 'PFA'],
        source: 'California AB1200 / Mamavation Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'gourmia',
    name: 'Gourmia',
    products: [
      {
        id: 'gourmia-af',
        brand: 'Gourmia',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'powerxl',
    name: 'PowerXL',
    products: [
      {
        id: 'powerxl-af',
        brand: 'PowerXL',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
  {
    id: 'chefman',
    name: 'Chefman',
    products: [
      {
        id: 'chefman-af',
        brand: 'Chefman',
        productLine: 'Air Fryer Models',
        category: 'air-fryer',
        pfasType: ['PTFE'],
        source: 'Mamavation Independent Testing',
        sourceUrl: 'https://mamavation.com/food/safest-air-fryers-sans-toxic-pfas-coatings.html',
      },
    ],
  },
];

/**
 * Get all products to avoid
 */
export function getAllDoNotBuyProducts(): DoNotBuyProduct[] {
  return DO_NOT_BUY_BRANDS.flatMap(brand => brand.products);
}

/**
 * Get products by category
 */
export function getDoNotBuyByCategory(category: DoNotBuyProduct['category']): DoNotBuyProduct[] {
  return getAllDoNotBuyProducts().filter(p => p.category === category);
}

/**
 * Get cookware to avoid
 */
export function getCookwareToAvoid(): DoNotBuyProduct[] {
  return getDoNotBuyByCategory('cookware');
}

/**
 * Get air fryers to avoid
 */
export function getAirFryersToAvoid(): DoNotBuyProduct[] {
  return getDoNotBuyByCategory('air-fryer');
}

/**
 * Get appliances to avoid
 */
export function getAppliancesToAvoid(): DoNotBuyProduct[] {
  return getDoNotBuyByCategory('appliance');
}
