/**
 * PFAS-Free Kitchen Products Database
 *
 * Real product data with affiliate links for Amazon, CJ Affiliate, and Awin networks.
 * Uses affiliate IDs from lib/affiliate.ts
 * Amazon product images: populate data/amazon-images.json via npm run fetch-amazon-images
 */

import type { Product, Brand, Category, VerificationTier } from '../lib/types';
import { generateAmazonLink } from '../lib/affiliate';
import amazonImages from './amazon-images.json';

type AmazonImagesMap = Record<string, string | null>;

// ============================================================
// BRANDS
// ============================================================

export const BRANDS: Record<string, Brand> = {
  // Cookware Brands
  caraway: { id: 'caraway', name: 'Caraway', slug: 'caraway', logoUrl: '/images/brands/caraway.png' },
  greenpan: { id: 'greenpan', name: 'GreenPan', slug: 'greenpan', logoUrl: '/images/brands/greenpan.png' },
  greenlife: { id: 'greenlife', name: 'GreenLife', slug: 'greenlife', logoUrl: undefined },
  lodge: { id: 'lodge', name: 'Lodge', slug: 'lodge', logoUrl: '/images/brands/lodge.png' },
  madein: { id: 'madein', name: 'Made In', slug: 'made-in', logoUrl: '/images/brands/made-in.png' },
  xtrema: { id: 'xtrema', name: 'Xtrema Ceramics', slug: 'xtrema', logoUrl: '/images/brands/xtrema.png' },
  ourplace: { id: 'ourplace', name: 'Our Place', slug: 'our-place', logoUrl: '/images/brands/our-place.png' },
  allclad: { id: 'allclad', name: 'All-Clad', slug: 'all-clad', logoUrl: '/images/brands/all-clad.png' },
  lecreuset: { id: 'lecreuset', name: 'Le Creuset', slug: 'le-creuset', logoUrl: '/images/brands/le-creuset.png' },
  staub: { id: 'staub', name: 'Staub', slug: 'staub', logoUrl: '/images/brands/staub.png' },
  zwilling: { id: 'zwilling', name: 'Zwilling', slug: 'zwilling', logoUrl: '/images/brands/zwilling.png' },
  debuyer: { id: 'debuyer', name: 'de Buyer', slug: 'de-buyer', logoUrl: '/images/brands/de-buyer.png' },
  matferbourgeat: { id: 'matferbourgeat', name: 'Matfer Bourgeat', slug: 'matfer-bourgeat', logoUrl: undefined },
  tramontina: { id: 'tramontina', name: 'Tramontina', slug: 'tramontina', logoUrl: undefined },
  demeyere: { id: 'demeyere', name: 'Demeyere', slug: 'demeyere', logoUrl: undefined },
  cuisinart: { id: 'cuisinart', name: 'Cuisinart', slug: 'cuisinart', logoUrl: undefined },
  calphalon: { id: 'calphalon', name: 'Calphalon', slug: 'calphalon', logoUrl: undefined },
  fieldcompany: { id: 'fieldcompany', name: 'Field Company', slug: 'field-company', logoUrl: undefined },
  finex: { id: 'finex', name: 'FINEX', slug: 'finex', logoUrl: undefined },
  smithey: { id: 'smithey', name: 'Smithey', slug: 'smithey', logoUrl: undefined },
  victoria: { id: 'victoria', name: 'Victoria', slug: 'victoria', logoUrl: undefined },
  campchef: { id: 'campchef', name: 'Camp Chef', slug: 'camp-chef', logoUrl: undefined },

  // Cutting Board Brands
  johnboos: { id: 'johnboos', name: 'John Boos', slug: 'john-boos', logoUrl: undefined },
  teakhaus: { id: 'teakhaus', name: 'Teakhaus', slug: 'teakhaus', logoUrl: undefined },
  cocoboss: { id: 'cocoboss', name: 'COCOBOSS', slug: 'cocoboss', logoUrl: undefined },
  woodiepoppins: { id: 'woodiepoppins', name: 'Woodie Poppins', slug: 'woodie-poppins', logoUrl: undefined },
  venusmiles: { id: 'venusmiles', name: 'Venusmiles', slug: 'venusmiles', logoUrl: undefined },
  magigo: { id: 'magigo', name: 'MAGIGO', slug: 'magigo', logoUrl: undefined },
  sutaig: { id: 'sutaig', name: 'Sutaig', slug: 'sutaig', logoUrl: undefined },
  tivano: { id: 'tivano', name: 'Tivano', slug: 'tivano', logoUrl: undefined },

  // Bakeware Brands
  anchorhocking: { id: 'anchorhocking', name: 'Anchor Hocking', slug: 'anchor-hocking', logoUrl: undefined },
  emilehenry: { id: 'emilehenry', name: 'Emile Henry', slug: 'emile-henry', logoUrl: undefined },
  pyrex: { id: 'pyrex', name: 'Pyrex', slug: 'pyrex', logoUrl: undefined },
  nordicware: { id: 'nordicware', name: 'Nordic Ware', slug: 'nordic-ware', logoUrl: undefined },
  usapan: { id: 'usapan', name: 'USA Pan', slug: 'usa-pan', logoUrl: undefined },
  fatdaddios: { id: 'fatdaddios', name: "Fat Daddio's", slug: 'fat-daddios', logoUrl: undefined },
  silpat: { id: 'silpat', name: 'Silpat', slug: 'silpat', logoUrl: undefined },
  ifyoucare: { id: 'ifyoucare', name: 'If You Care', slug: 'if-you-care', logoUrl: undefined },

  // Storage Brands
  stasher: { id: 'stasher', name: 'Stasher', slug: 'stasher', logoUrl: '/images/brands/stasher.png' },
  oxo: { id: 'oxo', name: 'OXO', slug: 'oxo', logoUrl: '/images/brands/oxo.png' },
  glasslock: { id: 'glasslock', name: 'Glasslock', slug: 'glasslock', logoUrl: undefined },
  rubbermaid: { id: 'rubbermaid', name: 'Rubbermaid', slug: 'rubbermaid', logoUrl: undefined },
  lunchbots: { id: 'lunchbots', name: 'LunchBots', slug: 'lunchbots', logoUrl: undefined },
  ecolunchbox: { id: 'ecolunchbox', name: 'ECOlunchbox', slug: 'ecolunchbox', logoUrl: undefined },
  kleankanteen: { id: 'kleankanteen', name: 'Klean Kanteen', slug: 'klean-kanteen', logoUrl: undefined },
  soupercubes: { id: 'soupercubes', name: 'Souper Cubes', slug: 'souper-cubes', logoUrl: undefined },
  beeswrap: { id: 'beeswrap', name: "Bee's Wrap", slug: 'bees-wrap', logoUrl: undefined },

  // Appliance Brands
  vitamix: { id: 'vitamix', name: 'Vitamix', slug: 'vitamix', logoUrl: undefined },
  blendtec: { id: 'blendtec', name: 'Blendtec', slug: 'blendtec', logoUrl: undefined },
  oster: { id: 'oster', name: 'Oster', slug: 'oster', logoUrl: undefined },
  moccamaster: { id: 'moccamaster', name: 'Moccamaster', slug: 'moccamaster', logoUrl: undefined },
  bonavita: { id: 'bonavita', name: 'Bonavita', slug: 'bonavita', logoUrl: undefined },
  baratza: { id: 'baratza', name: 'Baratza', slug: 'baratza', logoUrl: undefined },
  kavako: { id: 'kavako', name: 'Kavako', slug: 'kavako', logoUrl: undefined },
  fellow: { id: 'fellow', name: 'Fellow', slug: 'fellow', logoUrl: undefined },
  tatung: { id: 'tatung', name: 'Tatung', slug: 'tatung', logoUrl: undefined },
  breville: { id: 'breville', name: 'Breville', slug: 'breville', logoUrl: undefined },
  bincoo: { id: 'bincoo', name: 'Bincoo', slug: 'bincoo', logoUrl: undefined },
  duxtop: { id: 'duxtop', name: 'Duxtop', slug: 'duxtop', logoUrl: undefined },
  kitchenaid: { id: 'kitchenaid', name: 'KitchenAid', slug: 'kitchenaid', logoUrl: undefined },
  fritaire: { id: 'fritaire', name: 'Fritaire', slug: 'fritaire', logoUrl: undefined },
  generic: { id: 'generic', name: 'Generic', slug: 'generic', logoUrl: undefined },
};

// ============================================================
// CATEGORIES
// ============================================================

export const CATEGORIES: Record<string, Category> = {
  // Cookware
  'fry-pans': {
    id: 'fry-pans', name: 'Fry Pans & Skillets', slug: 'fry-pans',
    path: [{ id: 'cookware', name: 'Cookware', slug: 'cookware' }, { id: 'fry-pans', name: 'Fry Pans & Skillets', slug: 'fry-pans' }],
  },
  'cookware-sets': {
    id: 'cookware-sets', name: 'Cookware Sets', slug: 'cookware-sets',
    path: [{ id: 'cookware', name: 'Cookware', slug: 'cookware' }, { id: 'cookware-sets', name: 'Cookware Sets', slug: 'cookware-sets' }],
  },
  'dutch-ovens': {
    id: 'dutch-ovens', name: 'Dutch Ovens', slug: 'dutch-ovens',
    path: [{ id: 'cookware', name: 'Cookware', slug: 'cookware' }, { id: 'dutch-ovens', name: 'Dutch Ovens', slug: 'dutch-ovens' }],
  },
  'sauce-pans': {
    id: 'sauce-pans', name: 'Sauce Pans', slug: 'sauce-pans',
    path: [{ id: 'cookware', name: 'Cookware', slug: 'cookware' }, { id: 'sauce-pans', name: 'Sauce Pans', slug: 'sauce-pans' }],
  },
  'cutting-boards': {
    id: 'cutting-boards', name: 'Cutting Boards', slug: 'cutting-boards',
    path: [{ id: 'cookware', name: 'Cookware', slug: 'cookware' }, { id: 'cutting-boards', name: 'Cutting Boards', slug: 'cutting-boards' }],
  },

  // Bakeware
  'bakeware': {
    id: 'bakeware', name: 'Bakeware', slug: 'bakeware',
    path: [{ id: 'bakeware', name: 'Bakeware', slug: 'bakeware' }],
  },
  'baking-dishes': {
    id: 'baking-dishes', name: 'Baking Dishes', slug: 'baking-dishes',
    path: [{ id: 'bakeware', name: 'Bakeware', slug: 'bakeware' }, { id: 'baking-dishes', name: 'Baking Dishes', slug: 'baking-dishes' }],
  },
  'baking-sheets': {
    id: 'baking-sheets', name: 'Baking Sheets', slug: 'baking-sheets',
    path: [{ id: 'bakeware', name: 'Bakeware', slug: 'bakeware' }, { id: 'baking-sheets', name: 'Baking Sheets', slug: 'baking-sheets' }],
  },

  // Food Storage
  'storage': {
    id: 'storage', name: 'Food Storage', slug: 'storage',
    path: [{ id: 'storage', name: 'Food Storage', slug: 'storage' }],
  },
  'glass-containers': {
    id: 'glass-containers', name: 'Glass Containers', slug: 'glass-containers',
    path: [{ id: 'storage', name: 'Food Storage', slug: 'storage' }, { id: 'glass-containers', name: 'Glass Containers', slug: 'glass-containers' }],
  },
  'stainless-containers': {
    id: 'stainless-containers', name: 'Stainless Steel Containers', slug: 'stainless-containers',
    path: [{ id: 'storage', name: 'Food Storage', slug: 'storage' }, { id: 'stainless-containers', name: 'Stainless Steel Containers', slug: 'stainless-containers' }],
  },
  'silicone-bags': {
    id: 'silicone-bags', name: 'Silicone Bags', slug: 'silicone-bags',
    path: [{ id: 'storage', name: 'Food Storage', slug: 'storage' }, { id: 'silicone-bags', name: 'Silicone Bags', slug: 'silicone-bags' }],
  },

  // Appliances
  'blenders': {
    id: 'blenders', name: 'Blenders', slug: 'blenders',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'blenders', name: 'Blenders', slug: 'blenders' }],
  },
  'coffee-makers': {
    id: 'coffee-makers', name: 'Coffee Makers & Grinders', slug: 'coffee-makers',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'coffee-makers', name: 'Coffee Makers & Grinders', slug: 'coffee-makers' }],
  },
  'kettles': {
    id: 'kettles', name: 'Electric Kettles', slug: 'kettles',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'kettles', name: 'Electric Kettles', slug: 'kettles' }],
  },
  'rice-cookers': {
    id: 'rice-cookers', name: 'Rice Cookers', slug: 'rice-cookers',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'rice-cookers', name: 'Rice Cookers', slug: 'rice-cookers' }],
  },
  'slow-cookers': {
    id: 'slow-cookers', name: 'Slow Cookers', slug: 'slow-cookers',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'slow-cookers', name: 'Slow Cookers', slug: 'slow-cookers' }],
  },
  'toaster-ovens': {
    id: 'toaster-ovens', name: 'Toaster Ovens', slug: 'toaster-ovens',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'toaster-ovens', name: 'Toaster Ovens', slug: 'toaster-ovens' }],
  },
  'espresso-machines': {
    id: 'espresso-machines', name: 'Espresso Machines', slug: 'espresso-machines',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'espresso-machines', name: 'Espresso Machines', slug: 'espresso-machines' }],
  },
  'induction-cooktops': {
    id: 'induction-cooktops', name: 'Induction Cooktops', slug: 'induction-cooktops',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'induction-cooktops', name: 'Induction Cooktops', slug: 'induction-cooktops' }],
  },
  'food-processors': {
    id: 'food-processors', name: 'Food Processors', slug: 'food-processors',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'food-processors', name: 'Food Processors', slug: 'food-processors' }],
  },
  'stand-mixers': {
    id: 'stand-mixers', name: 'Stand Mixers', slug: 'stand-mixers',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'stand-mixers', name: 'Stand Mixers', slug: 'stand-mixers' }],
  },
  'air-fryers': {
    id: 'air-fryers', name: 'Air Fryers', slug: 'air-fryers',
    path: [{ id: 'appliances', name: 'Appliances', slug: 'appliances' }, { id: 'air-fryers', name: 'Air Fryers', slug: 'air-fryers' }],
  },
};

// ============================================================
// RETAILERS
// ============================================================

export const RETAILERS = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    logoUrl: '/images/retailers/amazon.png',
  },
  brand_direct: {
    id: 'brand_direct',
    name: 'Brand Direct',
    logoUrl: undefined,
  },
  williams_sonoma: {
    id: 'williams_sonoma',
    name: 'Williams Sonoma',
    logoUrl: '/images/retailers/williams-sonoma.png',
  },
  sur_la_table: {
    id: 'sur_la_table',
    name: 'Sur La Table',
    logoUrl: '/images/retailers/sur-la-table.png',
  },
} as const;

// ============================================================
// PRODUCTS DATABASE
// ============================================================

export const PRODUCTS: Product[] = [
  // ---------- CARAWAY ----------
  {
    id: 'caraway-fry-pan-10',
    name: 'Caraway 10.5" Fry Pan',
    slug: 'caraway-fry-pan-10',
    description: 'Ceramic-coated aluminum fry pan with stainless steel handle. PTFE and PFOA free. Features a non-toxic ceramic coating that releases food easily without synthetic chemicals.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Caraway 10.5" Fry Pan', isPrimary: true },
    ],
    brand: BRANDS.caraway,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Aluminum body with stainless steel base',
    coatingSummary: 'Ceramic non-stick coating',
    verification: {
      tier: 3 as VerificationTier,
      claimType: 'intentionally_pfas_free',
      scopeText: 'All cookware products',
      rationale: 'Caraway uses a ceramic-based coating verified to be free of PTFE, PFOA, and other PFAS compounds.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 3,
      decisionDate: '2026-01-15',
    },
    components: [
      {
        id: 'cooking-surface',
        role: 'cooking_surface',
        roleLabel: 'Cooking Surface',
        coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' },
        pfasStatus: 'verified_free',
      },
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'aluminum', name: 'Aluminum', slug: 'aluminum' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'caraway-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B08L3RPVFZ'),
        price: 95,
        currency: 'USD',
        inStock: true,
      },
      {
        id: 'caraway-direct',
        retailer: { id: 'caraway', name: 'Caraway', logoUrl: '/images/brands/caraway.png' },
        url: 'https://www.carawayhome.com/products/fry-pan',
        price: 95,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 550,
      dishwasherSafe: true,
    },
  },

  // ---------- CARAWAY SET ----------
  {
    id: 'caraway-cookware-set',
    name: 'Caraway Cookware Set (12-Piece)',
    slug: 'caraway-cookware-set',
    description: 'Complete ceramic-coated cookware set including fry pan, saucepan, sauté pan, and Dutch oven with matching lids and storage organizers.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [
      { url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Caraway 12-Piece Cookware Set', isPrimary: true },
    ],
    brand: BRANDS.caraway,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum body with stainless steel base',
    coatingSummary: 'Ceramic non-stick coating',
    verification: {
      tier: 3 as VerificationTier,
      claimType: 'intentionally_pfas_free',
      scopeText: 'All cookware products',
      rationale: 'Caraway uses a ceramic-based coating verified to be free of PTFE, PFOA, and other PFAS compounds.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 3,
      decisionDate: '2026-01-15',
    },
    components: [
      {
        id: 'cooking-surface',
        role: 'cooking_surface',
        roleLabel: 'Cooking Surface',
        coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'caraway-set-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B08L3N8WTR'),
        price: 395,
        currency: 'USD',
        inStock: true,
      },
      {
        id: 'caraway-set-direct',
        retailer: { id: 'caraway', name: 'Caraway', logoUrl: '/images/brands/caraway.png' },
        url: 'https://www.carawayhome.com/products/cookware-set',
        price: 395,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 550,
      dishwasherSafe: true,
    },
  },

  // ---------- GREENPAN ----------
  {
    id: 'greenpan-valencia-pro',
    name: 'GreenPan Valencia Pro 11-Piece Set',
    slug: 'greenpan-valencia-pro',
    description: 'Hard anodized aluminum cookware with Thermolon Minerals Pro ceramic coating. Magneto induction base works on all cooktops.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [
      { url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'GreenPan Valencia Pro Set', isPrimary: true },
    ],
    brand: BRANDS.greenpan,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Hard anodized aluminum',
    coatingSummary: 'Thermolon Minerals Pro ceramic',
    verification: {
      tier: 3 as VerificationTier,
      claimType: 'intentionally_pfas_free',
      scopeText: 'All Thermolon-coated products',
      rationale: 'GreenPan pioneered ceramic non-stick and their Thermolon coating is independently verified PFAS-free.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 5,
      decisionDate: '2026-01-10',
    },
    components: [
      {
        id: 'cooking-surface',
        role: 'cooking_surface',
        roleLabel: 'Cooking Surface',
        coating: { id: 'thermolon', name: 'Thermolon Ceramic', slug: 'thermolon' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'greenpan-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B07BKJZ6KS'),
        price: 299,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 600,
      dishwasherSafe: true,
    },
  },

  // ---------- LODGE CAST IRON ----------
  {
    id: 'lodge-cast-iron-skillet',
    name: 'Lodge 10.25" Cast Iron Skillet',
    slug: 'lodge-cast-iron-skillet',
    description: 'Pre-seasoned cast iron skillet made in the USA. Inherently PFAS-free with no synthetic coatings - just iron and natural oil seasoning.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Lodge Cast Iron Skillet', isPrimary: true },
    ],
    brand: BRANDS.lodge,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned (natural oil)',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All cast iron products',
      rationale: 'Cast iron cookware is inherently PFAS-free as it contains no synthetic coatings. Lodge uses only vegetable oil for seasoning.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-05',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'lodge-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B00006JSUA'),
        price: 22,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: false,
      ovenSafeTempF: 1000,
      dishwasherSafe: false,
    },
  },

  // ---------- MADE IN ----------
  {
    id: 'made-in-stainless-frying-pan',
    name: 'Made In 10" Stainless Steel Frying Pan',
    slug: 'made-in-frying-pan',
    description: '5-ply stainless steel construction with aluminum core for even heating. No coatings of any kind - inherently PFAS-free.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Made In Stainless Steel Frying Pan', isPrimary: true },
    ],
    brand: BRANDS.madein,
    category: CATEGORIES['fry-pans'],
    materialSummary: '5-ply stainless steel with aluminum core',
    coatingSummary: 'None - uncoated stainless',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All stainless steel products',
      rationale: 'Stainless steel cookware without coatings is inherently PFAS-free.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-08',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'madein-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B07YVL6TRT'),
        price: 99,
        currency: 'USD',
        inStock: true,
      },
      {
        id: 'madein-direct',
        retailer: { id: 'madein', name: 'Made In', logoUrl: '/images/brands/made-in.png' },
        url: 'https://madeincookware.com/products/stainless-steel-frying-pan',
        price: 99,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 800,
      dishwasherSafe: true,
    },
  },

  // ---------- XTREMA ----------
  {
    id: 'xtrema-ceramic-skillet',
    name: 'Xtrema 10" Pure Ceramic Skillet',
    slug: 'xtrema-skillet',
    description: '100% ceramic construction with no metals or coatings. Lab-tested and certified PFAS-free. Can withstand extreme temperatures.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Xtrema Pure Ceramic Skillet', isPrimary: true },
    ],
    brand: BRANDS.xtrema,
    category: CATEGORIES['fry-pans'],
    materialSummary: '100% pure ceramic',
    coatingSummary: 'None - solid ceramic',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All ceramic products',
      rationale: 'Xtrema cookware is 100% ceramic with no metals or synthetic coatings. Lab tested for heavy metals and PFAS.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 4,
      decisionDate: '2026-01-12',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'pure-ceramic', name: 'Pure Ceramic', slug: 'pure-ceramic' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'xtrema-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B01LZQMBPJ'),
        price: 159,
        currency: 'USD',
        inStock: true,
      },
      {
        id: 'xtrema-direct',
        retailer: { id: 'xtrema', name: 'Xtrema Ceramics', logoUrl: '/images/brands/xtrema.png' },
        url: 'https://xtrema.com/products/10-inch-ceramic-skillet',
        price: 159,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: false,
      ovenSafeTempF: 2500,
      dishwasherSafe: true,
    },
  },

  // ---------- OUR PLACE ----------
  {
    id: 'our-place-always-pan',
    name: 'Our Place Always Pan 2.0',
    slug: 'our-place-always-pan',
    description: 'Multi-functional ceramic-coated pan that replaces 8 pieces of cookware. PTFE and PFOA free with beautiful design.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Our Place Always Pan', isPrimary: true },
    ],
    brand: BRANDS.ourplace,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Aluminum body',
    coatingSummary: 'Ceramic non-stick coating',
    verification: {
      tier: 3 as VerificationTier,
      claimType: 'intentionally_pfas_free',
      scopeText: 'All cookware products',
      rationale: 'Our Place uses ceramic coatings that are free of PTFE, PFOA, and other PFAS compounds.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-14',
    },
    components: [
      {
        id: 'cooking-surface',
        role: 'cooking_surface',
        roleLabel: 'Cooking Surface',
        coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'ourplace-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B0BVMHP2JB'),
        price: 150,
        currency: 'USD',
        inStock: true,
      },
      {
        id: 'ourplace-direct',
        retailer: { id: 'ourplace', name: 'Our Place', logoUrl: '/images/brands/our-place.png' },
        url: 'https://fromourplace.com/products/always-essential-cooking-pan',
        price: 150,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 450,
      dishwasherSafe: true,
    },
  },

  // ---------- ALL-CLAD ----------
  {
    id: 'all-clad-d3-fry-pan',
    name: 'All-Clad D3 Stainless 10" Fry Pan',
    slug: 'all-clad-d3-fry-pan',
    description: '3-ply bonded stainless steel made in the USA. No coatings - inherently PFAS-free. Professional-grade construction.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'All-Clad D3 Stainless Fry Pan', isPrimary: true },
    ],
    brand: BRANDS.allclad,
    category: CATEGORIES['fry-pans'],
    materialSummary: '3-ply stainless steel with aluminum core',
    coatingSummary: 'None - uncoated stainless',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All stainless steel products',
      rationale: 'All-Clad stainless steel products have no coatings and are inherently PFAS-free.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-06',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'allclad-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B00005AL4S'),
        price: 130,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 600,
      dishwasherSafe: true,
    },
  },

  // ---------- LE CREUSET ----------
  {
    id: 'le-creuset-dutch-oven',
    name: 'Le Creuset 5.5 Qt Dutch Oven',
    slug: 'le-creuset-dutch-oven',
    description: 'Iconic enameled cast iron Dutch oven made in France. The enamel coating is inherently PFAS-free and extremely durable.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [
      { url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Le Creuset Dutch Oven', isPrimary: true },
    ],
    brand: BRANDS.lecreuset,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Enamel coating',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All enameled cast iron products',
      rationale: 'Enamel is a glass-based coating that is inherently PFAS-free. Le Creuset has never used PFAS in their products.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 3,
      decisionDate: '2026-01-04',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pot Body',
        material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' },
        coating: { id: 'enamel', name: 'Enamel', slug: 'enamel' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'lecreuset-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B00005QFQ8'),
        price: 390,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 500,
      dishwasherSafe: true,
    },
  },

  // ---------- STAUB ----------
  {
    id: 'staub-cocotte',
    name: 'Staub 5.5 Qt Round Cocotte',
    slug: 'staub-cocotte',
    description: 'Enameled cast iron cocotte with self-basting lid made in France. Black matte enamel interior is PFAS-free.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [
      { url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Staub Round Cocotte', isPrimary: true },
    ],
    brand: BRANDS.staub,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Black matte enamel interior',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All enameled cast iron products',
      rationale: 'Staub uses a proprietary black matte enamel that is glass-based and inherently PFAS-free.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 3,
      decisionDate: '2026-01-04',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pot Body',
        material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' },
        coating: { id: 'enamel', name: 'Black Matte Enamel', slug: 'enamel' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'staub-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B00CYKU6K8'),
        price: 380,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 500,
      dishwasherSafe: true,
    },
  },

  // ---------- DE BUYER ----------
  {
    id: 'de-buyer-mineral-b',
    name: 'de Buyer Mineral B 10" Fry Pan',
    slug: 'de-buyer-mineral-b',
    description: 'Carbon steel pan with beeswax finish made in France. 99% iron with no synthetic coatings - naturally PFAS-free.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'de Buyer Mineral B Fry Pan', isPrimary: true },
    ],
    brand: BRANDS.debuyer,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel (99% iron)',
    coatingSummary: 'Beeswax protective finish',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All carbon steel products',
      rationale: 'Carbon steel is inherently PFAS-free. The beeswax finish is natural and burns off during first use.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-07',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Pan Body',
        material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'debuyer-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B000NZOKDC'),
        price: 75,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,
      ovenSafeTempF: 1000,
      dishwasherSafe: false,
    },
  },

  // ---------- STASHER ----------
  {
    id: 'stasher-silicone-bags',
    name: 'Stasher Reusable Silicone Storage Bags (4-pack)',
    slug: 'stasher-bags',
    description: 'Platinum silicone storage bags that replace plastic bags. PFAS-free, dishwasher safe, and endlessly reusable.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [
      { url: '/placeholders/products/container-placeholder.svg', alt: 'Stasher Silicone Bags', isPrimary: true },
    ],
    brand: BRANDS.stasher,
    category: CATEGORIES['storage'],
    materialSummary: 'Platinum silicone',
    coatingSummary: undefined,
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'All silicone products',
      rationale: 'Platinum silicone is inherently PFAS-free. Stasher products are also BPA-free and phthalate-free.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-09',
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Bag',
        material: { id: 'platinum-silicone', name: 'Platinum Silicone', slug: 'platinum-silicone' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'stasher-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B08H1RZX9H'),
        price: 39,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: false,
      ovenSafeTempF: 400,
      dishwasherSafe: true,
    },
  },

  // ---------- OXO ----------
  {
    id: 'oxo-glass-containers',
    name: 'OXO Good Grips Smart Seal Glass Containers (8-piece)',
    slug: 'oxo-glass-containers',
    description: 'Borosilicate glass containers with silicone-sealed lids. No plastic touches food - PFAS-free storage solution.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [
      { url: '/placeholders/products/container-placeholder.svg', alt: 'OXO Glass Containers', isPrimary: true },
    ],
    brand: BRANDS.oxo,
    category: CATEGORIES['storage'],
    materialSummary: 'Borosilicate glass',
    coatingSummary: 'Silicone seal',
    verification: {
      tier: 4 as VerificationTier,
      claimType: 'inherently_pfas_free',
      scopeText: 'Glass storage products',
      rationale: 'Glass and silicone are inherently PFAS-free materials.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 1,
      decisionDate: '2026-01-11',
    },
    components: [
      {
        id: 'container',
        role: 'body',
        roleLabel: 'Container',
        material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'oxo-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B0841ZV47J'),
        price: 35,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: false,
      ovenSafeTempF: 450,
      dishwasherSafe: true,
    },
  },

  // ---------- IF YOU CARE (Bakeware) ----------
  {
    id: 'if-you-care-parchment',
    name: 'If You Care Parchment Baking Sheets',
    slug: 'if-you-care-parchment',
    description: 'Unbleached parchment paper with silicone coating. PFAS-free alternative to traditional non-stick baking liners.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [
      { url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'If You Care Parchment Paper', isPrimary: true },
    ],
    brand: BRANDS.ifyoucare,
    category: CATEGORIES['bakeware'],
    materialSummary: 'Unbleached paper',
    coatingSummary: 'Silicone coating',
    verification: {
      tier: 3 as VerificationTier,
      claimType: 'intentionally_pfas_free',
      scopeText: 'All parchment and baking products',
      rationale: 'If You Care uses silicone-coated parchment, a PFAS-free alternative to fluoropolymer liners.',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-01-13',
    },
    components: [
      {
        id: 'liner',
        role: 'body',
        roleLabel: 'Baking Liner',
        material: { id: 'paper', name: 'Unbleached Paper', slug: 'paper' },
        coating: { id: 'silicone', name: 'Silicone', slug: 'silicone' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'ifyoucare-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B001FQMPOE'),
        price: 6,
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: false,
      ovenSafeTempF: 425,
      dishwasherSafe: false,
    },
  },

  // ============================================================
  // ADDITIONAL CAST IRON (from verified research)
  // ============================================================

  {
    id: 'lodge-12-skillet',
    name: 'Lodge 12" Cast Iron Skillet with Helper Handle',
    slug: 'lodge-12-skillet',
    description: 'Pre-seasoned 12-inch cast iron skillet with helper handle. Made in the USA since 1896. Inherently PFAS-free with vegetable oil seasoning.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Lodge 12" Cast Iron Skillet', isPrimary: true }],
    brand: BRANDS.lodge,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned (vegetable oil)',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free. Lodge uses vegetable oil for seasoning, no synthetic coatings.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lodge-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00G2XGC88'), price: 35, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'lodge-7qt-dutch-oven',
    name: 'Lodge 7 Quart Cast Iron Dutch Oven',
    slug: 'lodge-7qt-dutch-oven',
    description: 'Large capacity cast iron Dutch oven, perfect for roasts and stews. Pre-seasoned and ready to use.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Lodge 7 Qt Dutch Oven', isPrimary: true }],
    brand: BRANDS.lodge,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned (vegetable oil)',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lodge-7qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0000DDTVO'), price: 75, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'staub-4qt-cocotte',
    name: 'Staub 4-Quart Round Cocotte',
    slug: 'staub-4qt-cocotte',
    description: 'French-made enameled cast iron cocotte with self-basting lid. Black matte enamel interior is PFAS-free and extremely durable.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Staub 4 Qt Cocotte', isPrimary: true }],
    brand: BRANDS.staub,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Black matte enamel',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All enameled cast iron', rationale: 'Enamel is glass-based and inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Enameled Cast Iron', slug: 'cast-iron' }, coating: { id: 'enamel', name: 'Black Matte Enamel', slug: 'enamel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'staub-4qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0028Y5Q1E'), price: 163, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'field-no8-skillet',
    name: 'Field Company No. 8 Cast Iron Skillet',
    slug: 'field-no8-skillet',
    description: 'Lightweight, smooth-finished American cast iron skillet. Handmade in Indiana with no synthetic coatings.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Field Company No. 8 Skillet', isPrimary: true }],
    brand: BRANDS.fieldcompany,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Premium cast iron with natural oil seasoning only.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'field-no8-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0C62Z1MTW'), price: 175, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  // ============================================================
  // CARBON STEEL
  // ============================================================

  {
    id: 'debuyer-mineral-b-8',
    name: 'de Buyer Mineral B Element 8" Fry Pan',
    slug: 'debuyer-mineral-b-8',
    description: 'French carbon steel pan with organic beeswax finish. 99% iron, develops natural non-stick patina with use.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'de Buyer Mineral B 8" Pan', isPrimary: true }],
    brand: BRANDS.debuyer,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel (99% iron)',
    coatingSummary: 'Beeswax protective finish',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Carbon steel is inherently PFAS-free. Beeswax finish is natural.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'debuyer-8-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00462QP0C'), price: 60, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'matfer-bourgeat-carbon-11',
    name: 'Matfer Bourgeat 11" Black Carbon Steel Fry Pan',
    slug: 'matfer-bourgeat-carbon-11',
    description: 'Professional-grade French carbon steel pan favored by chefs worldwide. Develops excellent non-stick properties.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Matfer Bourgeat 11" Pan', isPrimary: true }],
    brand: BRANDS.matferbourgeat,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel',
    coatingSummary: 'None - raw carbon steel',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Pure carbon steel with no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'matfer-11-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000KENOOU'), price: 75, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  // ============================================================
  // STAINLESS STEEL
  // ============================================================

  {
    id: 'tramontina-12pc-triply',
    name: 'Tramontina 12-Piece Tri-Ply Clad Stainless Steel Cookware Set',
    slug: 'tramontina-12pc-triply',
    description: 'Brazilian-made professional-grade stainless steel cookware. Tri-ply construction for even heating. No coatings.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Tramontina 12-Piece Set', isPrimary: true }],
    brand: BRANDS.tramontina,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Tri-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Tri-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tramontina-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08CYDF7MX'), price: 350, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'demeyere-5plus-10pc',
    name: 'Demeyere 5-Plus 10-Piece Stainless Steel Cookware Set',
    slug: 'demeyere-5plus-10pc',
    description: 'Belgian-made premium 5-ply stainless steel cookware. TriplInduc technology for perfect induction performance.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Demeyere 5-Plus Set', isPrimary: true }],
    brand: BRANDS.demeyere,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Premium uncoated stainless steel.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'demeyere-10pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0153NZX14'), price: 1000, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  // ============================================================
  // CERAMIC-COATED
  // ============================================================

  {
    id: 'greenpan-valencia-pro-12',
    name: 'GreenPan Valencia Pro 12" Ceramic Non-Stick Fry Pan',
    slug: 'greenpan-valencia-pro-12',
    description: 'Hard anodized aluminum with Thermolon Minerals Pro ceramic non-stick coating. NSF/ANSI 51 certified PFAS-free.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'GreenPan Valencia Pro 12"', isPrimary: true }],
    brand: BRANDS.greenpan,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Hard anodized aluminum',
    coatingSummary: 'Thermolon Minerals Pro ceramic',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Thermolon products', rationale: 'GreenPan Thermolon is NSF/ANSI 51 certified - the only ceramic non-stick with this certification.', unknowns: [], hasEvidence: true, evidenceCount: 5, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'thermolon', name: 'Thermolon Ceramic', slug: 'thermolon' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenpan-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07YT3X21D'), price: 70, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },

  {
    id: 'greenlife-8pc-ceramic',
    name: 'GreenLife Soft Grip 8-Piece Ceramic Non-Stick Cookware Set',
    slug: 'greenlife-8pc-ceramic',
    description: 'Affordable ceramic non-stick cookware with comfortable soft-grip handles. PFAS, PFOA, lead, and cadmium free.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'GreenLife 8-Piece Set', isPrimary: true }],
    brand: BRANDS.greenlife,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All GreenLife products', rationale: 'GreenLife ceramic coating verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenlife-8pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D4MMZ959'), price: 71, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 350, dishwasherSafe: true },
  },

  // ============================================================
  // CUTTING BOARDS
  // ============================================================

  {
    id: 'johnboos-maple-24x18',
    name: 'John Boos R-Board Maple Cutting Board 24" x 18" x 1.5"',
    slug: 'johnboos-maple-24x18',
    description: 'Professional-grade North American maple cutting board. Made in USA. Reversible edge grain construction.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'John Boos Maple Board', isPrimary: true }],
    brand: BRANDS.johnboos,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'North American hard maple',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Solid wood is inherently PFAS-free with no synthetic coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'maple', name: 'Hard Maple', slug: 'maple' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'johnboos-maple-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00063QBK4'), price: 155, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'teakhaus-xl-edge',
    name: 'Teakhaus Extra Large Teak Edge Grain Cutting Board with Handles',
    slug: 'teakhaus-xl-edge',
    description: 'FSC-certified teak wood cutting board. Knife-friendly edge grain construction. Naturally antimicrobial.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Teakhaus XL Teak Board', isPrimary: true }],
    brand: BRANDS.teakhaus,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'FSC-certified teak wood',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural teak wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'teak', name: 'Teak Wood', slug: 'teak' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'teakhaus-xl-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B001CMRQUW'), price: 101, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'sutaig-titanium-large',
    name: 'Sutaig Taima 100% Pure Titanium Cutting Board - Large',
    slug: 'sutaig-titanium-large',
    description: '100% pure titanium cutting board. Hygienic, dishwasher safe, and knife-friendly. Ideal for raw meat preparation.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Sutaig Titanium Board', isPrimary: true }],
    brand: BRANDS.sutaig,
    category: CATEGORIES['cutting-boards'],
    materialSummary: '100% titanium',
    coatingSummary: 'None - solid titanium',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All titanium products', rationale: 'Pure titanium is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'titanium', name: 'Titanium', slug: 'titanium' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'sutaig-titanium-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D7LXGGJ6'), price: 50, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // BAKEWARE
  // ============================================================

  {
    id: 'anchor-hocking-4pc',
    name: 'Anchor Hocking 4-Piece Glass Bakeware Set',
    slug: 'anchor-hocking-4pc',
    description: 'Tempered glass baking dishes made in USA. Oven, microwave, freezer, and dishwasher safe. No coatings.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Anchor Hocking Bakeware Set', isPrimary: true }],
    brand: BRANDS.anchorhocking,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None - pure glass',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Dish', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'anchor-4pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0041ED1HK'), price: 35, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'usapan-half-sheet',
    name: 'USA Pan Nonstick Half Sheet Baking Pan',
    slug: 'usapan-half-sheet',
    description: 'American-made aluminized steel with Americoat silicone-based non-stick coating. PFAS, PTFE, and BPA free.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'USA Pan Half Sheet', isPrimary: true }],
    brand: BRANDS.usapan,
    category: CATEGORIES['baking-sheets'],
    materialSummary: 'Aluminized steel',
    coatingSummary: 'Americoat silicone coating',
    verification: { tier: 4 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All USA Pan products', rationale: 'USA Pan Americoat is silicone-based and certified PFAS, PTFE, PFOA, PFOS free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'aluminized-steel', name: 'Aluminized Steel', slug: 'aluminized-steel' }, coating: { id: 'americoat', name: 'Americoat Silicone', slug: 'americoat' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'usapan-sheet-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01N693H66'), price: 22, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  // ============================================================
  // FOOD STORAGE - GLASS
  // ============================================================

  {
    id: 'glasslock-18pc',
    name: 'Glasslock 18-Piece Glass Food Storage Container Set',
    slug: 'glasslock-18pc',
    description: 'Tempered glass containers with airtight snap-lock lids. Oven, microwave, freezer safe. BPA-free lids.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Glasslock 18-Piece Set', isPrimary: true }],
    brand: BRANDS.glasslock,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass containers are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'glasslock-18-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01B8NE9D6'), price: 50, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  // ============================================================
  // FOOD STORAGE - STAINLESS STEEL
  // ============================================================

  {
    id: 'lunchbots-quad',
    name: 'LunchBots Medium Quad Stainless Steel Snack Container',
    slug: 'lunchbots-quad',
    description: 'Food-grade 18/8 stainless steel container with 4 compartments. Perfect for snacks and bento-style lunches.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'LunchBots Quad Container', isPrimary: true }],
    brand: BRANDS.lunchbots,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lunchbots-quad-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07982Y9TZ'), price: 27, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'kleankanteen-rise-55oz',
    name: 'Klean Kanteen Rise Food Box 55oz',
    slug: 'kleankanteen-rise-55oz',
    description: 'Large stainless steel food container with leak-proof silicone lid. Perfect for meal prep.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Klean Kanteen Rise Food Box', isPrimary: true }],
    brand: BRANDS.kleankanteen,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel and silicone are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kleankanteen-rise-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CQRTY34R'), price: 50, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // APPLIANCES - BLENDERS
  // ============================================================

  {
    id: 'vitamix-explorian-e310',
    name: 'Vitamix Explorian E310 64oz Blender',
    slug: 'vitamix-explorian-e310',
    description: 'Professional-grade blender with 2.2 HP motor. Eastman Tritan copolyester container (BPA-free, PFAS-free). Self-cleaning.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Vitamix Explorian E310', isPrimary: true }],
    brand: BRANDS.vitamix,
    category: CATEGORIES['blenders'],
    materialSummary: 'Tritan copolyester container, stainless steel blades',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Vitamix blenders', rationale: 'Tritan plastic and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'tritan', name: 'Eastman Tritan', slug: 'tritan' }, pfasStatus: 'verified_free' }, { id: 'blades', role: 'other', roleLabel: 'Blades', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'vitamix-e310-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B073DWV2BH'), price: 350, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'blendtec-total-classic',
    name: 'Blendtec Total Blender Classic',
    slug: 'blendtec-total-classic',
    description: 'Commercial-grade blender with patented blade design. BPA-free WildSide jar. Made in USA.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Blendtec Total Classic', isPrimary: true }],
    brand: BRANDS.blendtec,
    category: CATEGORIES['blenders'],
    materialSummary: 'BPA-free plastic jar, stainless steel blades',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Blendtec blenders', rationale: 'BPA-free plastics and stainless steel are PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'jar', role: 'body', roleLabel: 'Jar', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'blendtec-classic-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000GIGZXM'), price: 350, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // APPLIANCES - COFFEE
  // ============================================================

  {
    id: 'moccamaster-kbgv-select',
    name: 'Moccamaster KBGV Select 10-Cup Coffee Brewer',
    slug: 'moccamaster-kbgv-select',
    description: 'Dutch-made SCA-certified coffee brewer. Copper boiling element, stainless steel carafe. Handmade with 5-year warranty.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Moccamaster KBGV Select', isPrimary: true }],
    brand: BRANDS.moccamaster,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel, glass carafe',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Moccamaster products', rationale: 'Stainless steel and glass are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'glass', name: 'Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'moccamaster-kbgv-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B093DXS54M'), price: 359, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'baratza-encore-grinder',
    name: 'Baratza Encore Conical Burr Coffee Grinder',
    slug: 'baratza-encore-grinder',
    description: 'Entry-level professional grinder with 40 grind settings. Stainless steel conical burrs. User-serviceable design.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Baratza Encore Grinder', isPrimary: true }],
    brand: BRANDS.baratza,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel burrs',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Baratza grinders', rationale: 'Stainless steel burrs are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'burrs', role: 'other', roleLabel: 'Burrs', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'baratza-encore-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B007F183LK'), price: 170, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'kavako-pourover-37oz',
    name: 'Kavako Pour Over Coffee Maker Set 37oz',
    slug: 'kavako-pourover-37oz',
    description: 'Borosilicate glass carafe with double-layer stainless steel mesh filter. Cork lid and leather collar.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Kavako Pour Over Set', isPrimary: true }],
    brand: BRANDS.kavako,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Borosilicate glass, stainless steel filter',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass and stainless steel products', rationale: 'Glass and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kavako-pourover-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07RKZ4L71'), price: 41, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // APPLIANCES - KETTLES
  // ============================================================

  {
    id: 'fellow-stagg-ekg-pro',
    name: 'Fellow Stagg EKG Pro Electric Gooseneck Kettle',
    slug: 'fellow-stagg-ekg-pro',
    description: 'Precision pour-over kettle with variable temperature control. All stainless steel interior. Bluetooth-enabled.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Fellow Stagg EKG Pro', isPrimary: true }],
    brand: BRANDS.fellow,
    category: CATEGORIES['kettles'],
    materialSummary: '304 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel kettles', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle', material: { id: 'stainless-steel', name: '304 Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fellow-stagg-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0BF7HJ8MX'), price: 169, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // APPLIANCES - RICE COOKERS
  // ============================================================

  {
    id: 'tatung-tac06kn',
    name: 'Tatung TAC-06KN 6-Cup Stainless Steel Multi-Cooker',
    slug: 'tatung-tac06kn',
    description: 'Taiwanese classic with all-stainless steel cooking pot and steamer. Simple, durable design with no non-stick coatings.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Tatung TAC-06KN', isPrimary: true }],
    brand: BRANDS.tatung,
    category: CATEGORIES['rice-cookers'],
    materialSummary: 'Stainless steel pot and steamer',
    coatingSummary: 'None - uncoated stainless',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel models', rationale: 'Stainless steel pot has no coatings - inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'pot', role: 'body', roleLabel: 'Inner Pot', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tatung-6cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B004FTMQMC'), price: 130, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // APPLIANCES - AIR FRYERS
  // ============================================================

  {
    id: 'fritaire-glass-5qt',
    name: 'Fritaire Non-Toxic Glass Air Fryer 5 Qt',
    slug: 'fritaire-glass-5qt',
    description: 'The only air fryer with a glass bowl instead of non-stick basket. Stainless steel accessories. Mamavation recommended.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Fritaire Glass Air Fryer', isPrimary: true }],
    brand: BRANDS.fritaire,
    category: CATEGORIES['air-fryers'],
    materialSummary: 'Borosilicate glass bowl, stainless steel accessories',
    coatingSummary: 'None - glass and metal only',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Fritaire products', rationale: 'Glass bowl and stainless steel accessories - no non-stick coatings.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'bowl', role: 'body', roleLabel: 'Bowl', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fritaire-glass-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DKQQ2C7Y'), price: 200, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // APPLIANCES - ESPRESSO
  // ============================================================

  {
    id: 'breville-barista-express',
    name: 'Breville Barista Express Espresso Machine',
    slug: 'breville-barista-express',
    description: 'Semi-automatic espresso machine with integrated grinder. Stainless steel portafilter and boiler. No non-stick coatings.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Breville Barista Express', isPrimary: true }],
    brand: BRANDS.breville,
    category: CATEGORIES['espresso-machines'],
    materialSummary: 'Stainless steel boiler and portafilter',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All espresso machines', rationale: 'Stainless steel components with no non-stick coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'boiler', role: 'body', roleLabel: 'Boiler', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'breville-express-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00DS4767K'), price: 600, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'bincoo-manual-espresso',
    name: 'Bincoo Manual Espresso Maker Set',
    slug: 'bincoo-manual-espresso',
    description: 'Manual lever espresso maker with stainless steel construction. No electronics, no non-stick coatings.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Bincoo Manual Espresso Maker', isPrimary: true }],
    brand: BRANDS.bincoo,
    category: CATEGORIES['espresso-machines'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Manual espresso makers', rationale: 'Stainless steel construction with no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Body', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'bincoo-manual-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0F99GLKYP'), price: 150, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // APPLIANCES - INDUCTION
  // ============================================================

  {
    id: 'duxtop-professional-induction',
    name: 'Duxtop Professional Induction Cooktop',
    slug: 'duxtop-professional-induction',
    description: 'Portable induction cooktop with 1800W power. Digital sensor touch controls. Works with all induction-ready cookware.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Duxtop Professional Induction', isPrimary: true }],
    brand: BRANDS.duxtop,
    category: CATEGORIES['induction-cooktops'],
    materialSummary: 'Glass ceramic surface',
    coatingSummary: 'None - glass ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All induction cooktops', rationale: 'Glass ceramic surfaces are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', material: { id: 'glass-ceramic', name: 'Glass Ceramic', slug: 'glass-ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'duxtop-pro-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07G9YKPQC'), price: 180, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },
];

// ============================================================
// AMAZON IMAGE ENRICHMENT
// ============================================================

function extractAsinFromUrl(url: string): string | null {
  const match = url.match(/amazon\.(?:com|co\.uk|de|fr|it|es|ca)\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

function getAmazonImageForProduct(product: Product): string | null {
  const amazonRetailer = product.retailers?.find(r =>
    r.retailer.id === 'amazon' || r.url?.includes('amazon.')
  );
  if (!amazonRetailer?.url) return null;
  const asin = extractAsinFromUrl(amazonRetailer.url);
  if (!asin) return null;
  const imageUrl = (amazonImages as AmazonImagesMap)[asin];
  return imageUrl && typeof imageUrl === 'string' ? imageUrl : null;
}

function enrichWithAmazonImage(product: Product): Product {
  const amazonImageUrl = getAmazonImageForProduct(product);
  if (!amazonImageUrl) return product;

  return {
    ...product,
    imageUrl: amazonImageUrl,
    images: [
      { url: amazonImageUrl, alt: product.name, isPrimary: true },
      ...product.images.filter(img => img.url !== product.imageUrl).slice(0, 4),
    ],
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all products (with Amazon images when available)
 */
export function getAllProducts(): Product[] {
  return PRODUCTS.map(enrichWithAmazonImage);
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  const product = PRODUCTS.find(p => p.id === id);
  return product ? enrichWithAmazonImage(product) : undefined;
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  const product = PRODUCTS.find(p => p.slug === slug);
  return product ? enrichWithAmazonImage(product) : undefined;
}

/**
 * Get products by category
 */
export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter(p => p.category.slug === categorySlug);
}

/**
 * Get products by brand
 */
export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter(p => p.brand.slug === brandSlug);
}

/**
 * Get products by verification tier
 */
export function getProductsByTier(tier: VerificationTier): Product[] {
  return PRODUCTS.filter(p => p.verification.tier === tier);
}

/**
 * Get featured products (tier 4 or top-rated)
 */
export function getFeaturedProducts(limit = 6): Product[] {
  return PRODUCTS
    .filter(p => p.verification.tier >= 3)
    .sort((a, b) => b.verification.tier - a.verification.tier)
    .slice(0, limit);
}

/**
 * Search products by name or description
 */
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery) ||
    p.brand.name.toLowerCase().includes(lowerQuery)
  );
}
