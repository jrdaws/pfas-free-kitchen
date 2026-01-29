/**
 * Database Seed Script
 * Seeds the PFAS-Free Kitchen database with realistic test data
 * 
 * Usage:
 *   npx tsx scripts/seed-database.ts
 *   npm run db:seed
 */

import { v4 as uuid } from 'uuid';

// ============================================================
// MOCK DATABASE (Replace with actual Pool in production)
// ============================================================

interface QueryResult {
  rows: Array<Record<string, unknown>>;
}

// In-memory stores for development
const stores = {
  brands: new Map<string, Record<string, unknown>>(),
  retailers: new Map<string, Record<string, unknown>>(),
  categories: new Map<string, Record<string, unknown>>(),
  materials: new Map<string, Record<string, unknown>>(),
  coatings: new Map<string, Record<string, unknown>>(),
  products: new Map<string, Record<string, unknown>>(),
  components: new Map<string, Record<string, unknown>>(),
  evidence: new Map<string, Record<string, unknown>>(),
  productEvidence: new Map<string, Record<string, unknown>>(),
  verification: new Map<string, Record<string, unknown>>(),
  retailerLinks: new Map<string, Record<string, unknown>>(),
};

// Seed reference data first
function seedReferenceData() {
  // Categories
  const categories = [
    { id: uuid(), name: 'Cookware', slug: 'cookware', parentId: null },
    { id: uuid(), name: 'Skillets & Frying Pans', slug: 'skillets-frying-pans', parentId: null },
    { id: uuid(), name: 'Stock Pots & Dutch Ovens', slug: 'stock-pots-dutch-ovens', parentId: null },
    { id: uuid(), name: 'Saucepans', slug: 'saucepans', parentId: null },
    { id: uuid(), name: 'Bakeware', slug: 'bakeware', parentId: null },
    { id: uuid(), name: 'Sheet Pans & Baking Sheets', slug: 'sheet-pans-baking-sheets', parentId: null },
    { id: uuid(), name: 'Baking Dishes', slug: 'baking-dishes', parentId: null },
    { id: uuid(), name: 'Storage', slug: 'storage', parentId: null },
    { id: uuid(), name: 'Glass Containers', slug: 'glass-containers', parentId: null },
    { id: uuid(), name: 'Silicone Bags & Wraps', slug: 'silicone-bags-wraps', parentId: null },
    { id: uuid(), name: 'Utensils & Tools', slug: 'utensils-tools', parentId: null },
    { id: uuid(), name: 'Spatulas & Turners', slug: 'spatulas-turners', parentId: null },
  ];
  categories.forEach(c => stores.categories.set(c.slug, c));

  // Materials
  const materials = [
    { id: uuid(), name: 'Stainless Steel', slug: 'stainless-steel', family: 'metal' },
    { id: uuid(), name: 'Cast Iron', slug: 'cast-iron', family: 'metal' },
    { id: uuid(), name: 'Carbon Steel', slug: 'carbon-steel', family: 'metal' },
    { id: uuid(), name: 'Aluminum', slug: 'aluminum', family: 'metal' },
    { id: uuid(), name: 'Copper', slug: 'copper', family: 'metal' },
    { id: uuid(), name: 'Borosilicate Glass', slug: 'borosilicate-glass', family: 'glass' },
    { id: uuid(), name: 'Soda-Lime Glass', slug: 'soda-lime-glass', family: 'glass' },
    { id: uuid(), name: 'Silicone', slug: 'silicone', family: 'polymer' },
    { id: uuid(), name: 'Wood', slug: 'wood', family: 'natural' },
    { id: uuid(), name: 'Bamboo', slug: 'bamboo', family: 'natural' },
    { id: uuid(), name: 'Ceramic', slug: 'ceramic', family: 'ceramic' },
    { id: uuid(), name: 'Stoneware', slug: 'stoneware', family: 'ceramic' },
  ];
  materials.forEach(m => stores.materials.set(m.slug, m));

  // Coatings
  const coatings = [
    { id: uuid(), name: 'None (Uncoated)', slug: 'none', type: null },
    { id: uuid(), name: 'Enamel', slug: 'enamel', type: 'ceramic' },
    { id: uuid(), name: 'Seasoning', slug: 'seasoning', type: 'polymerized-oil' },
    { id: uuid(), name: 'Ceramic Sol-Gel', slug: 'ceramic-sol-gel', type: 'ceramic' },
    { id: uuid(), name: 'Anodized', slug: 'anodized', type: 'oxide' },
  ];
  coatings.forEach(c => stores.coatings.set(c.slug, c));
}

// ============================================================
// BRANDS (10 real kitchen brands)
// ============================================================

const BRANDS = [
  { name: 'All-Clad', slug: 'all-clad', website: 'https://www.all-clad.com', country: 'US' },
  { name: 'Lodge', slug: 'lodge', website: 'https://www.lodgecastiron.com', country: 'US' },
  { name: 'Le Creuset', slug: 'le-creuset', website: 'https://www.lecreuset.com', country: 'FR' },
  { name: 'Staub', slug: 'staub', website: 'https://www.staub-usa.com', country: 'FR' },
  { name: 'GreenPan', slug: 'greenpan', website: 'https://www.greenpan.us', country: 'BE' },
  { name: 'Pyrex', slug: 'pyrex', website: 'https://www.pyrex.com', country: 'US' },
  { name: 'OXO', slug: 'oxo', website: 'https://www.oxo.com', country: 'US' },
  { name: 'Caraway', slug: 'caraway', website: 'https://www.carawayhome.com', country: 'US' },
  { name: 'Made In', slug: 'made-in', website: 'https://www.madeincookware.com', country: 'US' },
  { name: 'Stasher', slug: 'stasher', website: 'https://www.stasherbag.com', country: 'US' },
];

// ============================================================
// RETAILERS
// ============================================================

const RETAILERS = [
  { name: 'Amazon', slug: 'amazon', domain: 'amazon.com', icon: 'amazon' },
  { name: 'Williams Sonoma', slug: 'williams-sonoma', domain: 'williams-sonoma.com', icon: 'williams-sonoma' },
  { name: 'Sur La Table', slug: 'sur-la-table', domain: 'surlatable.com', icon: 'surlatable' },
  { name: 'Target', slug: 'target', domain: 'target.com', icon: 'target' },
];

// ============================================================
// PRODUCTS (50+ products across all categories)
// ============================================================

interface ProductSeed {
  name: string;
  brand: string;
  category: string;
  material: string;
  coating: string;
  tier: number;
  claimType: string;
  features: Record<string, unknown>;
  components: Array<{
    name: string;
    foodContact: boolean;
    material: string;
    coating: string | null;
  }>;
  description?: string;
}

const PRODUCTS: ProductSeed[] = [
  // ============================================================
  // COOKWARE - SKILLETS & FRYING PANS (15 products)
  // ============================================================
  {
    name: 'All-Clad D3 Stainless Steel 12" Skillet',
    brand: 'all-clad',
    category: 'skillets-frying-pans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
    description: 'Professional-grade tri-ply stainless steel skillet with exceptional heat distribution.',
  },
  {
    name: 'All-Clad D5 Brushed Stainless 10" Skillet',
    brand: 'all-clad',
    category: 'skillets-frying-pans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Lodge Cast Iron 12" Skillet',
    brand: 'lodge',
    category: 'skillets-frying-pans',
    material: 'cast-iron',
    coating: 'seasoning',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'cast-iron', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'cast-iron', coating: null },
    ],
    description: 'Classic American-made cast iron skillet, pre-seasoned and ready to use.',
  },
  {
    name: 'Lodge Cast Iron 10.25" Skillet',
    brand: 'lodge',
    category: 'skillets-frying-pans',
    material: 'cast-iron',
    coating: 'seasoning',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'cast-iron', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'cast-iron', coating: null },
    ],
  },
  {
    name: 'Lodge Cast Iron 8" Skillet',
    brand: 'lodge',
    category: 'skillets-frying-pans',
    material: 'cast-iron',
    coating: 'seasoning',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'cast-iron', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'cast-iron', coating: null },
    ],
  },
  {
    name: 'GreenPan Reserve 10" Skillet',
    brand: 'greenpan',
    category: 'skillets-frying-pans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 450, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
    description: 'Healthy ceramic nonstick cooking with Thermolon diamond-infused coating.',
  },
  {
    name: 'GreenPan Reserve 12" Skillet',
    brand: 'greenpan',
    category: 'skillets-frying-pans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 450, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Made In Blue Carbon Steel 12" Frying Pan',
    brand: 'made-in',
    category: 'skillets-frying-pans',
    material: 'carbon-steel',
    coating: 'seasoning',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'carbon-steel', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
    description: 'French-style carbon steel pan, naturally nonstick when seasoned.',
  },
  {
    name: 'Made In Blue Carbon Steel 10" Frying Pan',
    brand: 'made-in',
    category: 'skillets-frying-pans',
    material: 'carbon-steel',
    coating: 'seasoning',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'carbon-steel', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Caraway 10.5" Fry Pan',
    brand: 'caraway',
    category: 'skillets-frying-pans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 550, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
    description: 'Modern ceramic-coated cookware in beautiful colors.',
  },
  {
    name: 'Caraway 8" Fry Pan',
    brand: 'caraway',
    category: 'skillets-frying-pans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 550, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Made In Stainless Steel 12" Frying Pan',
    brand: 'made-in',
    category: 'skillets-frying-pans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Made In Stainless Steel 10" Frying Pan',
    brand: 'made-in',
    category: 'skillets-frying-pans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'All-Clad Copper Core 10" Skillet',
    brand: 'all-clad',
    category: 'skillets-frying-pans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Copper core', foodContact: false, material: 'copper', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Lodge Chef Collection 12" Skillet',
    brand: 'lodge',
    category: 'skillets-frying-pans',
    material: 'cast-iron',
    coating: 'seasoning',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: false },
    components: [
      { name: 'Pan body', foodContact: true, material: 'cast-iron', coating: 'seasoning' },
      { name: 'Handle', foodContact: false, material: 'cast-iron', coating: null },
    ],
  },

  // ============================================================
  // COOKWARE - DUTCH OVENS & STOCK POTS (10 products)
  // ============================================================
  {
    name: 'Le Creuset Signature 5.5 Qt Dutch Oven',
    brand: 'le-creuset',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Handles', foodContact: false, material: 'cast-iron', coating: 'enamel' },
    ],
    description: 'Iconic French enameled cast iron Dutch oven, ideal for slow cooking.',
  },
  {
    name: 'Le Creuset Signature 7.25 Qt Dutch Oven',
    brand: 'le-creuset',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Handles', foodContact: false, material: 'cast-iron', coating: 'enamel' },
    ],
  },
  {
    name: 'Staub Round Cocotte 4 Qt',
    brand: 'staub',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
    ],
    description: 'French-made enameled cast iron with self-basting lid spikes.',
  },
  {
    name: 'Staub Round Cocotte 5.5 Qt',
    brand: 'staub',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
    ],
  },
  {
    name: 'Lodge Enameled Cast Iron 6 Qt Dutch Oven',
    brand: 'lodge',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
    ],
    description: 'Affordable enameled cast iron for everyday cooking.',
  },
  {
    name: 'All-Clad D3 8 Qt Stock Pot',
    brand: 'all-clad',
    category: 'stock-pots-dutch-ovens',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handles', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'All-Clad D3 12 Qt Stock Pot',
    brand: 'all-clad',
    category: 'stock-pots-dutch-ovens',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handles', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Made In Stainless Clad 8 Qt Stock Pot',
    brand: 'made-in',
    category: 'stock-pots-dutch-ovens',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Caraway Dutch Oven 6.5 Qt',
    brand: 'caraway',
    category: 'stock-pots-dutch-ovens',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 550, dishwasher_safe: true },
    components: [
      { name: 'Pot body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Lid', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
    ],
  },
  {
    name: 'Le Creuset Signature 3.5 Qt Braiser',
    brand: 'le-creuset',
    category: 'stock-pots-dutch-ovens',
    material: 'cast-iron',
    coating: 'enamel',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'cast-iron', coating: 'enamel' },
      { name: 'Lid', foodContact: true, material: 'cast-iron', coating: 'enamel' },
    ],
  },

  // ============================================================
  // COOKWARE - SAUCEPANS (5 products)
  // ============================================================
  {
    name: 'All-Clad D3 Stainless 2 Qt Saucepan',
    brand: 'all-clad',
    category: 'saucepans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'All-Clad D3 Stainless 3 Qt Saucepan',
    brand: 'all-clad',
    category: 'saucepans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 600, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Made In Stainless Clad 2 Qt Saucepan',
    brand: 'made-in',
    category: 'saucepans',
    material: 'stainless-steel',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { induction_compatible: true, oven_safe_temp_f: 650, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'stainless-steel', coating: null },
      { name: 'Lid', foodContact: true, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Caraway Sauce Pan 1.75 Qt',
    brand: 'caraway',
    category: 'saucepans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 550, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Lid', foodContact: true, material: 'aluminum', coating: null },
    ],
  },
  {
    name: 'GreenPan Reserve 3 Qt Saucepan',
    brand: 'greenpan',
    category: 'saucepans',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { induction_compatible: true, oven_safe_temp_f: 450, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
      { name: 'Lid', foodContact: true, material: 'borosilicate-glass', coating: null },
    ],
  },

  // ============================================================
  // BAKEWARE (10 products)
  // ============================================================
  {
    name: 'All-Clad Pro-Release Half Sheet Pan',
    brand: 'all-clad',
    category: 'sheet-pans-baking-sheets',
    material: 'aluminum',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: null },
    ],
    description: 'Professional-weight sheet pan for even browning.',
  },
  {
    name: 'All-Clad Pro-Release Quarter Sheet Pan',
    brand: 'all-clad',
    category: 'sheet-pans-baking-sheets',
    material: 'aluminum',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: null },
    ],
  },
  {
    name: 'Made In Sheet Pan Half Size',
    brand: 'made-in',
    category: 'sheet-pans-baking-sheets',
    material: 'aluminum',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { oven_safe_temp_f: 500, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: null },
    ],
  },
  {
    name: 'Pyrex 9x13 Glass Baking Dish',
    brand: 'pyrex',
    category: 'baking-dishes',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { oven_safe_temp_f: 450, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'borosilicate-glass', coating: null },
    ],
    description: 'Classic glass baking dish for casseroles and roasting.',
  },
  {
    name: 'Pyrex 8x8 Glass Baking Dish',
    brand: 'pyrex',
    category: 'baking-dishes',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { oven_safe_temp_f: 450, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'borosilicate-glass', coating: null },
    ],
  },
  {
    name: 'Pyrex Deep 9x13 Glass Baking Dish',
    brand: 'pyrex',
    category: 'baking-dishes',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { oven_safe_temp_f: 450, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'borosilicate-glass', coating: null },
    ],
  },
  {
    name: 'Le Creuset Stoneware 9x13 Baking Dish',
    brand: 'le-creuset',
    category: 'baking-dishes',
    material: 'stoneware',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { oven_safe_temp_f: 500, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'stoneware', coating: null },
    ],
  },
  {
    name: 'Staub Ceramic 9x13 Baking Dish',
    brand: 'staub',
    category: 'baking-dishes',
    material: 'ceramic',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { oven_safe_temp_f: 500, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'ceramic', coating: null },
    ],
  },
  {
    name: 'Caraway Baking Sheet',
    brand: 'caraway',
    category: 'sheet-pans-baking-sheets',
    material: 'aluminum',
    coating: 'ceramic-sol-gel',
    tier: 2,
    claimType: 'A',
    features: { oven_safe_temp_f: 550, dishwasher_safe: true },
    components: [
      { name: 'Pan body', foodContact: true, material: 'aluminum', coating: 'ceramic-sol-gel' },
    ],
  },
  {
    name: 'Caraway Rectangle Baking Dish',
    brand: 'caraway',
    category: 'baking-dishes',
    material: 'ceramic',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { oven_safe_temp_f: 550, dishwasher_safe: true, microwave_safe: true },
    components: [
      { name: 'Dish body', foodContact: true, material: 'ceramic', coating: null },
    ],
  },

  // ============================================================
  // STORAGE (8 products)
  // ============================================================
  {
    name: 'Pyrex Simply Store 18-Piece Set',
    brand: 'pyrex',
    category: 'glass-containers',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Container body', foodContact: true, material: 'borosilicate-glass', coating: null },
      { name: 'Lid', foodContact: true, material: 'silicone', coating: null },
    ],
    description: 'Comprehensive glass storage set for meal prep and leftovers.',
  },
  {
    name: 'Pyrex Simply Store 10-Piece Set',
    brand: 'pyrex',
    category: 'glass-containers',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Container body', foodContact: true, material: 'borosilicate-glass', coating: null },
      { name: 'Lid', foodContact: true, material: 'silicone', coating: null },
    ],
  },
  {
    name: 'Pyrex 7 Cup Rectangle Container',
    brand: 'pyrex',
    category: 'glass-containers',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 4,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Container body', foodContact: true, material: 'borosilicate-glass', coating: null },
      { name: 'Lid', foodContact: true, material: 'silicone', coating: null },
    ],
  },
  {
    name: 'Stasher Reusable Silicone Bag Stand-Up Mega',
    brand: 'stasher',
    category: 'silicone-bags-wraps',
    material: 'silicone',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Bag body', foodContact: true, material: 'silicone', coating: null },
      { name: 'Seal', foodContact: true, material: 'silicone', coating: null },
    ],
    description: 'Reusable platinum silicone bag, perfect alternative to plastic.',
  },
  {
    name: 'Stasher Sandwich Bag',
    brand: 'stasher',
    category: 'silicone-bags-wraps',
    material: 'silicone',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Bag body', foodContact: true, material: 'silicone', coating: null },
      { name: 'Seal', foodContact: true, material: 'silicone', coating: null },
    ],
  },
  {
    name: 'Stasher Snack Bag',
    brand: 'stasher',
    category: 'silicone-bags-wraps',
    material: 'silicone',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Bag body', foodContact: true, material: 'silicone', coating: null },
      { name: 'Seal', foodContact: true, material: 'silicone', coating: null },
    ],
  },
  {
    name: 'Stasher Half Gallon Bag',
    brand: 'stasher',
    category: 'silicone-bags-wraps',
    material: 'silicone',
    coating: 'none',
    tier: 3,
    claimType: 'B',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Bag body', foodContact: true, material: 'silicone', coating: null },
      { name: 'Seal', foodContact: true, material: 'silicone', coating: null },
    ],
  },
  {
    name: 'Caraway Glass Food Storage Set',
    brand: 'caraway',
    category: 'glass-containers',
    material: 'borosilicate-glass',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { microwave_safe: true, dishwasher_safe: true, freezer_safe: true },
    components: [
      { name: 'Container body', foodContact: true, material: 'borosilicate-glass', coating: null },
      { name: 'Lid', foodContact: true, material: 'silicone', coating: null },
    ],
  },

  // ============================================================
  // UTENSILS & TOOLS (7 products)
  // ============================================================
  {
    name: 'OXO Good Grips Silicone Spatula',
    brand: 'oxo',
    category: 'spatulas-turners',
    material: 'silicone',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Head', foodContact: true, material: 'silicone', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
    description: 'Heat-resistant silicone spatula for everyday cooking.',
  },
  {
    name: 'OXO Good Grips Silicone Turner',
    brand: 'oxo',
    category: 'spatulas-turners',
    material: 'silicone',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Head', foodContact: true, material: 'silicone', coating: null },
      { name: 'Handle', foodContact: false, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'OXO Good Grips Wooden Spoon Set',
    brand: 'oxo',
    category: 'spatulas-turners',
    material: 'wood',
    coating: 'none',
    tier: 1,
    claimType: 'A',
    features: { dishwasher_safe: false },
    components: [
      { name: 'Spoon body', foodContact: true, material: 'wood', coating: null },
    ],
  },
  {
    name: 'All-Clad Stainless Steel Spatula',
    brand: 'all-clad',
    category: 'spatulas-turners',
    material: 'stainless-steel',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Spatula body', foodContact: true, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'All-Clad Stainless Steel Slotted Spoon',
    brand: 'all-clad',
    category: 'spatulas-turners',
    material: 'stainless-steel',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Spoon body', foodContact: true, material: 'stainless-steel', coating: null },
    ],
  },
  {
    name: 'Le Creuset Silicone Craft Series Spatula',
    brand: 'le-creuset',
    category: 'spatulas-turners',
    material: 'silicone',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Head', foodContact: true, material: 'silicone', coating: null },
      { name: 'Handle', foodContact: false, material: 'wood', coating: null },
    ],
  },
  {
    name: 'GreenPan Silicone Utensil Set',
    brand: 'greenpan',
    category: 'spatulas-turners',
    material: 'silicone',
    coating: 'none',
    tier: 2,
    claimType: 'A',
    features: { dishwasher_safe: true },
    components: [
      { name: 'Utensil heads', foodContact: true, material: 'silicone', coating: null },
      { name: 'Handles', foodContact: false, material: 'wood', coating: null },
    ],
  },
];

// ============================================================
// EVIDENCE HELPERS
// ============================================================

function createBrandStatement(brandName: string, date: Date): Record<string, unknown> {
  return {
    type: 'brand_statement',
    source: 'brand_submission',
    metadata: {
      statement_text: `${brandName} confirms that no PFAS compounds are intentionally added to any component of this product. This includes PTFE, PFOA, PFOS, and related fluorinated compounds.`,
      statement_date: date.toISOString(),
      signatory: 'Quality Assurance Director',
      company: brandName,
    },
  };
}

function createLabReport(labName: string, date: Date): Record<string, unknown> {
  return {
    type: 'lab_report',
    source: 'brand_submission',
    metadata: {
      lab_name: labName,
      accreditation: 'ISO 17025',
      method: 'LC-MS/MS after methanol extraction',
      method_reference: 'EPA 533 Modified',
      analyte_list_ref: 'panel_v1_40pfas',
      analyte_count: 40,
      lod_ng_g: 1.0,
      loq_ng_g: 3.0,
      sample_scope: { units: 3, lots: 1 },
      collection_date: new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      report_date: date.toISOString(),
      result_summary: 'All 40 targeted PFAS analytes were below the method detection limit (MDL) of 1.0 ng/g.',
    },
  };
}

const LAB_NAMES = [
  'Eurofins Scientific',
  'SGS North America',
  'Bureau Veritas',
  'Intertek',
  'TÜV SÜD',
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function seedDatabase(): Promise<void> {
  console.log('\n🌱 Starting database seed...\n');

  // Seed reference data first
  seedReferenceData();
  console.log('✅ Reference data seeded (categories, materials, coatings)');

  // 1. Insert brands
  console.log('📦 Seeding brands...');
  const brandIds: Record<string, string> = {};
  for (const brand of BRANDS) {
    const id = uuid();
    stores.brands.set(brand.slug, { id, ...brand });
    brandIds[brand.slug] = id;
  }
  console.log(`   ✅ ${BRANDS.length} brands created`);

  // 2. Insert retailers
  console.log('🏪 Seeding retailers...');
  const retailerIds: Record<string, string> = {};
  for (const retailer of RETAILERS) {
    const id = uuid();
    stores.retailers.set(retailer.slug, { id, ...retailer });
    retailerIds[retailer.slug] = id;
  }
  console.log(`   ✅ ${RETAILERS.length} retailers created`);

  // 3. Insert products
  console.log('🍳 Seeding products...');
  let productCount = 0;
  let componentCount = 0;
  let evidenceCount = 0;

  for (const product of PRODUCTS) {
    const productId = uuid();
    const categoryData = stores.categories.get(product.category);
    const brandId = brandIds[product.brand];

    if (!categoryData || !brandId) {
      console.warn(`   ⚠️ Skipping ${product.name}: missing category or brand`);
      continue;
    }

    // Create product
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    stores.products.set(productId, {
      id: productId,
      brandId,
      categoryId: categoryData.id,
      name: product.name,
      slug,
      description: product.description || null,
      materialSummary: product.material.replace(/-/g, ' '),
      coatingSummary: product.coating === 'none' ? 'None (uncoated)' : product.coating.replace(/-/g, ' '),
      features: product.features,
      status: 'published',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productCount++;

    // Create components
    for (const comp of product.components) {
      const compId = uuid();
      const materialData = stores.materials.get(comp.material);
      const coatingData = comp.coating ? stores.coatings.get(comp.coating) : null;

      stores.components.set(compId, {
        id: compId,
        productId,
        name: comp.name,
        foodContact: comp.foodContact,
        materialId: materialData?.id || null,
        coatingId: coatingData?.id || null,
      });
      componentCount++;
    }

    // Create evidence based on tier
    const evidenceId = uuid();
    const brandData = stores.brands.get(product.brand);
    const evidenceDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Random date in last 6 months
    
    const evidenceData = product.tier >= 3
      ? createLabReport(LAB_NAMES[Math.floor(Math.random() * LAB_NAMES.length)], evidenceDate)
      : createBrandStatement(brandData?.name || product.brand, evidenceDate);

    stores.evidence.set(evidenceId, {
      id: evidenceId,
      type: evidenceData.type,
      source: evidenceData.source,
      storageUri: `s3://pfas-evidence-bucket/${evidenceId}.pdf`,
      sha256Hash: uuid().replace(/-/g, '') + uuid().replace(/-/g, '').slice(0, 32),
      fileSizeBytes: 50000 + Math.floor(Math.random() * 200000),
      mimeType: 'application/pdf',
      metadata: evidenceData.metadata,
      receivedAt: evidenceDate,
      expiresAt: new Date(evidenceDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000), // 24 months
    });
    evidenceCount++;

    // Link evidence to product
    stores.productEvidence.set(`${productId}-${evidenceId}`, {
      productId,
      evidenceId,
      addedAt: new Date(),
    });

    // Create verification status
    stores.verification.set(productId, {
      id: uuid(),
      productId,
      tier: product.tier,
      claimType: product.claimType,
      scopeText: 'Food-contact surfaces',
      confidenceScore: 0.75 + Math.random() * 0.2, // 0.75-0.95
      decisionDate: evidenceDate,
      evidenceIds: [evidenceId],
      unknowns: product.tier < 4 ? ['Manufacturing process additives', 'Supply chain verification'] : [],
    });

    // Link to retailers (randomly assign 2-3 retailers per product)
    const numRetailers = 2 + Math.floor(Math.random() * 2);
    const retailerSlugs = Object.keys(retailerIds).sort(() => Math.random() - 0.5).slice(0, numRetailers);
    
    for (const retailerSlug of retailerSlugs) {
      const linkId = uuid();
      stores.retailerLinks.set(linkId, {
        id: linkId,
        productId,
        retailerId: retailerIds[retailerSlug],
        externalId: retailerSlug === 'amazon' 
          ? `B0${uuid().slice(0, 8).toUpperCase()}`
          : `SKU-${uuid().slice(0, 10).toUpperCase()}`,
        active: true,
      });
    }
  }

  console.log(`   ✅ ${productCount} products created`);
  console.log(`   ✅ ${componentCount} components created`);
  console.log(`   ✅ ${evidenceCount} evidence objects created`);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Brands:          ${stores.brands.size}`);
  console.log(`   Retailers:       ${stores.retailers.size}`);
  console.log(`   Categories:      ${stores.categories.size}`);
  console.log(`   Materials:       ${stores.materials.size}`);
  console.log(`   Coatings:        ${stores.coatings.size}`);
  console.log(`   Products:        ${stores.products.size}`);
  console.log(`   Components:      ${stores.components.size}`);
  console.log(`   Evidence:        ${stores.evidence.size}`);
  console.log(`   Verifications:   ${stores.verification.size}`);
  console.log(`   Retailer Links:  ${stores.retailerLinks.size}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Tier distribution
  const tierCounts = new Map<number, number>();
  for (const [, v] of stores.verification) {
    const tier = v.tier as number;
    tierCounts.set(tier, (tierCounts.get(tier) || 0) + 1);
  }
  
  console.log('📊 Tier Distribution:');
  for (let tier = 4; tier >= 0; tier--) {
    const count = tierCounts.get(tier) || 0;
    const pct = ((count / stores.verification.size) * 100).toFixed(1);
    console.log(`   Tier ${tier}: ${count} products (${pct}%)`);
  }
  console.log('');
}

// Export stores for use in other scripts
export { stores, seedDatabase };

// Run if called directly
seedDatabase()
  .then(() => {
    console.log('✅ Database seeded successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
