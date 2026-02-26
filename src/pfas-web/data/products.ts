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
  tribest: { id: 'tribest', name: 'Tribest', slug: 'tribest', logoUrl: undefined },
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
  'beeswax-wraps': {
    id: 'beeswax-wraps', name: 'Beeswax Wraps', slug: 'beeswax-wraps',
    path: [{ id: 'storage', name: 'Food Storage', slug: 'storage' }, { id: 'beeswax-wraps', name: 'Beeswax Wraps', slug: 'beeswax-wraps' }],
  },
  'silicone-mats': {
    id: 'silicone-mats', name: 'Silicone Baking Mats', slug: 'silicone-mats',
    path: [{ id: 'bakeware', name: 'Bakeware', slug: 'bakeware' }, { id: 'silicone-mats', name: 'Silicone Baking Mats', slug: 'silicone-mats' }],
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
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Vitamix blenders', rationale: 'Tritan plastic is BPA-free and PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic container contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
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
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Blendtec blenders', rationale: 'BPA-free plastic is PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic jar contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
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

  // ============================================================
  // ADDITIONAL CAST IRON (from verified research)
  // ============================================================

  {
    id: 'lodge-3qt-deep-skillet',
    name: 'Lodge 3 Quart Deep Skillet',
    slug: 'lodge-3qt-deep-skillet',
    description: 'Pre-seasoned 3-quart deep cast iron skillet. Perfect for frying, searing, and one-pan meals. Made in USA.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Lodge 3 Qt Deep Skillet', isPrimary: true }],
    brand: BRANDS.lodge,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned (vegetable oil)',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lodge-3qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00063RWWA'), price: 42, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'lodge-5qt-dutch-oven',
    name: 'Lodge 5 Quart Cast Iron Dutch Oven',
    slug: 'lodge-5qt-dutch-oven',
    description: 'Classic cast iron Dutch oven for soups, stews, and roasts. Pre-seasoned and ready to use.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Lodge 5 Qt Dutch Oven', isPrimary: true }],
    brand: BRANDS.lodge,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned (vegetable oil)',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lodge-5qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00004S9HE'), price: 55, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'staub-5qt-tall-cocotte',
    name: 'Staub 5-Qt Tall Cocotte Matte Black',
    slug: 'staub-5qt-tall-cocotte',
    description: 'Tall Dutch oven with extra capacity for soups and pasta. Black matte enamel interior is PFAS-free.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Staub 5 Qt Tall Cocotte', isPrimary: true }],
    brand: BRANDS.staub,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Black matte enamel',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All enameled cast iron', rationale: 'Enamel is glass-based and inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Enameled Cast Iron', slug: 'cast-iron' }, coating: { id: 'enamel', name: 'Black Matte Enamel', slug: 'enamel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'staub-5qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08ZJWBBD2'), price: 250, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'lecreuset-7qt-round',
    name: 'Le Creuset 7.25 Qt Round Dutch Oven',
    slug: 'lecreuset-7qt-round',
    description: 'Iconic French-made enameled cast iron Dutch oven. Perfect for large batches and entertaining.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Le Creuset 7.25 Qt Dutch Oven', isPrimary: true }],
    brand: BRANDS.lecreuset,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Enamel coating',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All enameled cast iron', rationale: 'Enamel is glass-based and inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Enameled Cast Iron', slug: 'cast-iron' }, coating: { id: 'enamel', name: 'Enamel', slug: 'enamel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lecreuset-7qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00VWMFM6M'), price: 480, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'lecreuset-signature',
    name: 'Le Creuset Signature Enameled Dutch Oven',
    slug: 'lecreuset-signature',
    description: 'The classic Le Creuset Dutch oven with signature colorful enamel. Made in France since 1925.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Le Creuset Signature Dutch Oven', isPrimary: true }],
    brand: BRANDS.lecreuset,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Enamel coating',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All enameled cast iron', rationale: 'Enamel is glass-based and inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Enameled Cast Iron', slug: 'cast-iron' }, coating: { id: 'enamel', name: 'Enamel', slug: 'enamel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lecreuset-sig-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0076NOE8S'), price: 350, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'lecreuset-8qt-oval',
    name: 'Le Creuset 8 Qt Oval Dutch Oven',
    slug: 'lecreuset-8qt-oval',
    description: 'Large oval Dutch oven ideal for roasts, whole chickens, and large cuts of meat.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Le Creuset 8 Qt Oval Dutch Oven', isPrimary: true }],
    brand: BRANDS.lecreuset,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Enamel coating',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All enameled cast iron', rationale: 'Enamel is glass-based and inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Enameled Cast Iron', slug: 'cast-iron' }, coating: { id: 'enamel', name: 'Enamel', slug: 'enamel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lecreuset-8qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DQVGVBBW'), price: 400, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'field-no12-xl-skillet',
    name: 'Field Company No. 12 Extra Large Skillet',
    slug: 'field-no12-xl-skillet',
    description: 'Extra-large 13" smooth-finished cast iron skillet. Handmade in Indiana. Perfect for family-sized meals.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Field Company No. 12 Skillet', isPrimary: true }],
    brand: BRANDS.fieldcompany,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Premium cast iron with natural oil seasoning only.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'field-no12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CGW56NGN'), price: 265, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'field-no4-xs-skillet',
    name: 'Field Company No. 4 Extra Small Skillet',
    slug: 'field-no4-xs-skillet',
    description: 'Compact 7" cast iron skillet perfect for single servings, eggs, or sides. Smooth cooking surface.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Field Company No. 4 Skillet', isPrimary: true }],
    brand: BRANDS.fieldcompany,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Premium cast iron with natural oil seasoning only.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'field-no4-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CGW2TFSV'), price: 100, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'finex-10-skillet-lid',
    name: 'FINEX 10" Cast Iron Skillet with Lid',
    slug: 'finex-10-skillet-lid',
    description: 'Premium American-made cast iron with stainless steel springs for cool grip. Includes lid.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'FINEX 10" Skillet with Lid', isPrimary: true }],
    brand: BRANDS.finex,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'finex-10-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01DWXAI2G'), price: 250, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'finex-12-skillet-lid',
    name: 'FINEX 12" Cast Iron Skillet with Lid',
    slug: 'finex-12-skillet-lid',
    description: 'Large premium cast iron skillet. Octagonal design with stainless steel coil handles. Made in USA.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'FINEX 12" Skillet with Lid', isPrimary: true }],
    brand: BRANDS.finex,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'finex-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0145FCVDE'), price: 300, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'smithey-chefs-skillet',
    name: 'Smithey Chef Skillet',
    slug: 'smithey-chefs-skillet',
    description: 'Beautifully machined cast iron with polished cooking surface. Hand-finished in South Carolina.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Smithey Chef Skillet', isPrimary: true }],
    brand: BRANDS.smithey,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Natural oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'smithey-chef-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07J6TTPLJ'), price: 200, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'victoria-12-skillet-set',
    name: 'Victoria 12" Cast Iron Skillet Set with Lid',
    slug: 'victoria-12-skillet-set',
    description: 'Colombian-made cast iron skillet set with helper handle. Pre-seasoned with 100% non-GMO flaxseed oil.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Victoria 12" Skillet Set', isPrimary: true }],
    brand: BRANDS.victoria,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Flaxseed oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'victoria-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DL6GPDZL'), price: 55, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'victoria-day-dead-skillet',
    name: 'Victoria 12" Day of Dead Cast Iron Skillet',
    slug: 'victoria-day-dead-skillet',
    description: 'Unique Day of the Dead design cast iron skillet. Pre-seasoned and made in Colombia.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Victoria Day of Dead Skillet', isPrimary: true }],
    brand: BRANDS.victoria,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Flaxseed oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'victoria-dod-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DF8VSBDC'), price: 50, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'victoria-cast-iron-skillet',
    name: 'Victoria Cast Iron Skillet',
    slug: 'victoria-cast-iron-skillet',
    description: 'Classic Colombian cast iron skillet. Affordable quality with excellent heat retention.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Victoria Cast Iron Skillet', isPrimary: true }],
    brand: BRANDS.victoria,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Flaxseed oil seasoning',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'victoria-skillet-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01726HAZC'), price: 30, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'campchef-14qt-dutch-oven',
    name: 'Camp Chef 14 Qt Dutch Oven',
    slug: 'campchef-14qt-dutch-oven',
    description: 'Large capacity camp Dutch oven with legs for outdoor cooking. Pre-seasoned cast iron.',
    imageUrl: '/placeholders/products/dutch-oven-placeholder.svg',
    images: [{ url: '/placeholders/products/dutch-oven-placeholder.svg', alt: 'Camp Chef 14 Qt Dutch Oven', isPrimary: true }],
    brand: BRANDS.campchef,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Cast iron',
    coatingSummary: 'Pre-seasoned',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All cast iron products', rationale: 'Cast iron is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'cast-iron', name: 'Cast Iron', slug: 'cast-iron' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'campchef-14qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000H84OXY'), price: 90, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL CARBON STEEL
  // ============================================================

  {
    id: 'debuyer-11-blue-carbon',
    name: 'de Buyer 11" Blue Carbon Steel Pan',
    slug: 'debuyer-11-blue-carbon',
    description: 'French carbon steel with blue steel finish. Professional-grade durability and heat distribution.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'de Buyer 11" Blue Carbon Steel', isPrimary: true }],
    brand: BRANDS.debuyer,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Blue carbon steel',
    coatingSummary: 'None - raw carbon steel',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Carbon steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'debuyer-11-blue-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D9R45NX5'), price: 70, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'debuyer-11-carbon-plus',
    name: 'de Buyer 11" Carbon Plus Fry Pan',
    slug: 'debuyer-11-carbon-plus',
    description: 'Professional French carbon steel pan. 99% iron construction with organic beeswax finish.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'de Buyer Carbon Plus 11"', isPrimary: true }],
    brand: BRANDS.debuyer,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel (99% iron)',
    coatingSummary: 'Beeswax protective finish',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Carbon steel is inherently PFAS-free. Beeswax is natural.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'debuyer-cp-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000FCOVAS'), price: 85, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'matfer-bourgeat-8-carbon',
    name: 'Matfer Bourgeat 8" Carbon Steel Fry Pan',
    slug: 'matfer-bourgeat-8-carbon',
    description: 'Compact French carbon steel pan for eggs and small portions. Professional quality.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Matfer Bourgeat 8" Carbon Steel', isPrimary: true }],
    brand: BRANDS.matferbourgeat,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel',
    coatingSummary: 'None - raw carbon steel',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Pure carbon steel with no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'matfer-8-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000KENOTK'), price: 50, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'madein-12-pizza-steel',
    name: 'Made In 12" Carbon Pizza Steel',
    slug: 'madein-12-pizza-steel',
    description: 'Heavy carbon steel pizza steel for crispy crusts. Superior heat transfer to professional ovens.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Made In Pizza Steel', isPrimary: true }],
    brand: BRANDS.madein,
    category: CATEGORIES['baking-sheets'],
    materialSummary: 'Carbon steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Carbon steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Steel', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'madein-pizza-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D8CNQVPR'), price: 89, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  {
    id: 'madein-carbon-frying-pan',
    name: 'Made In Carbon Steel Frying Pan',
    slug: 'madein-carbon-frying-pan',
    description: 'American-designed carbon steel pan. Develops natural non-stick patina with seasoning.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Made In Carbon Steel Pan', isPrimary: true }],
    brand: BRANDS.madein,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Carbon steel',
    coatingSummary: 'None - seasons with use',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All carbon steel products', rationale: 'Carbon steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'carbon-steel', name: 'Carbon Steel', slug: 'carbon-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'madein-carbon-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09S16223C'), price: 79, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 1000, dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL STAINLESS STEEL
  // ============================================================

  {
    id: 'allclad-d5-3qt-saute',
    name: 'All-Clad D5 Brushed 3-Qt Saute Pan',
    slug: 'allclad-d5-3qt-saute',
    description: '5-ply bonded stainless steel saute pan. Made in USA with no coatings.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'All-Clad D5 Saute Pan', isPrimary: true }],
    brand: BRANDS.allclad,
    category: CATEGORIES['fry-pans'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'allclad-d5-3qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0051OES8K'), price: 200, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },

  {
    id: 'allclad-d5-brushed-saute',
    name: 'All-Clad D5 Brushed Stainless Saute',
    slug: 'allclad-d5-brushed-saute',
    description: 'Premium 5-ply construction with brushed exterior. Lifetime warranty.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'All-Clad D5 Brushed Saute', isPrimary: true }],
    brand: BRANDS.allclad,
    category: CATEGORIES['fry-pans'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'allclad-d5-brushed-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DBN6G6SR'), price: 220, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },

  {
    id: 'tramontina-10pc-triply',
    name: 'Tramontina 10-Piece Tri-Ply Clad Set',
    slug: 'tramontina-10pc-triply',
    description: 'Brazilian-made tri-ply stainless steel cookware set. Excellent value for professional quality.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Tramontina 10-Piece Set', isPrimary: true }],
    brand: BRANDS.tramontina,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Tri-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Tri-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tramontina-10-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B096N2RCKC'), price: 280, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'tramontina-14pc-triply',
    name: 'Tramontina 14-Piece Tri-Ply Clad Set',
    slug: 'tramontina-14pc-triply',
    description: 'Complete stainless steel cookware set. NSF certified for restaurant use.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Tramontina 14-Piece Set', isPrimary: true }],
    brand: BRANDS.tramontina,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Tri-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Tri-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tramontina-14-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08RLKXD1N'), price: 400, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'demeyere-5plus-95-frypan',
    name: 'Demeyere 5-Plus 9.5" Fry Pan',
    slug: 'demeyere-5plus-95-frypan',
    description: 'Belgian-made 5-ply stainless steel fry pan. TriplInduc technology for perfect induction.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Demeyere 5-Plus 9.5" Fry Pan', isPrimary: true }],
    brand: BRANDS.demeyere,
    category: CATEGORIES['fry-pans'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Premium uncoated stainless steel.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'demeyere-95-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0153NZSFU'), price: 130, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'demeyere-atlantis-10pc',
    name: 'Demeyere Atlantis 10-Piece Cookware Set',
    slug: 'demeyere-atlantis-10pc',
    description: 'Ultra-premium Belgian stainless steel. 7-ply construction with Silvinox surface treatment.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Demeyere Atlantis Set', isPrimary: true }],
    brand: BRANDS.demeyere,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '7-ply stainless steel',
    coatingSummary: 'Silvinox surface treatment',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Premium uncoated stainless steel.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: '7-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'demeyere-atlantis-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B084D6K6CB'), price: 1200, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'demeyere-industry-5ply',
    name: 'Demeyere Industry 5-Ply Cookware',
    slug: 'demeyere-industry-5ply',
    description: 'Professional-grade Belgian stainless steel. Welded handles for durability.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Demeyere Industry 5-Ply', isPrimary: true }],
    brand: BRANDS.demeyere,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Premium uncoated stainless steel.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'demeyere-industry-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B076KWBTKX'), price: 250, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'demeyere-5plus-11-frypan',
    name: 'Demeyere 5-Plus 11" Fry Pan',
    slug: 'demeyere-5plus-11-frypan',
    description: 'Large Belgian 5-ply stainless steel fry pan. Perfect for searing and sautéing.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Demeyere 5-Plus 11" Fry Pan', isPrimary: true }],
    brand: BRANDS.demeyere,
    category: CATEGORIES['fry-pans'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Premium uncoated stainless steel.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'demeyere-11-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DX2JZFMF'), price: 150, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'zwilling-essence-5pc',
    name: 'Zwilling Essence 5-Piece Stainless Steel Set',
    slug: 'zwilling-essence-5pc',
    description: 'German-engineered stainless steel cookware. 3-ply construction with aluminum core.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Zwilling Essence 5-Piece Set', isPrimary: true }],
    brand: BRANDS.zwilling,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '3-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: '3-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'zwilling-essence-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B012SG8AQE'), price: 250, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'zwilling-pro-11-frypan',
    name: 'Zwilling Pro SS 11" Fry Pan',
    slug: 'zwilling-pro-11-frypan',
    description: 'Professional stainless steel fry pan with Sigma Clad 3-ply construction.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Zwilling Pro 11" Fry Pan', isPrimary: true }],
    brand: BRANDS.zwilling,
    category: CATEGORIES['fry-pans'],
    materialSummary: '3-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: '3-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'zwilling-pro-11-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B091J14YRQ'), price: 120, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'zwilling-twin-choice-24cm',
    name: 'Zwilling TWIN Choice 24cm Pan',
    slug: 'zwilling-twin-choice-24cm',
    description: 'Versatile 9.5" stainless steel fry pan. German engineering at accessible price.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Zwilling TWIN Choice Pan', isPrimary: true }],
    brand: BRANDS.zwilling,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'zwilling-twin-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B002DGTH4Y'), price: 80, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'cuisinart-17pc-classic',
    name: 'Cuisinart 17-Piece Classic Stainless Steel Set',
    slug: 'cuisinart-17pc-classic',
    description: 'Complete stainless steel cookware set. Mirror finish with cool grip handles.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Cuisinart 17-Piece Classic Set', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-17pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01LHG4EES'), price: 300, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'cuisinart-multiclad-13pc',
    name: 'Cuisinart MultiClad 13-Piece Stainless Set',
    slug: 'cuisinart-multiclad-13pc',
    description: 'Professional multi-ply stainless steel cookware. Aluminum core for even heating.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Cuisinart MultiClad 13-Piece', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Multi-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Multi-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-multiclad-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08L8F9262'), price: 350, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'cuisinart-multiclad-pro-12pc',
    name: 'Cuisinart Multiclad Pro 12-Piece Set',
    slug: 'cuisinart-multiclad-pro-12pc',
    description: 'Professional tri-ply stainless steel. Heat surround technology.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Cuisinart Multiclad Pro 12-Piece', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Tri-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: 'Tri-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-pro-12-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0007KQZWU'), price: 400, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'cuisinart-custom-clad-10pc',
    name: 'Cuisinart Custom-Clad 5-Ply 10-Piece Set',
    slug: 'cuisinart-custom-clad-10pc',
    description: 'Premium 5-ply bonded construction for superior heat distribution.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Cuisinart Custom-Clad Set', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '5-ply stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'stainless-steel', name: '5-Ply Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-custom-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DRWB6QCS'), price: 430, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'calphalon-classic-25qt-saucepan',
    name: 'Calphalon Classic 2.5 Qt Sauce Pan',
    slug: 'calphalon-classic-25qt-saucepan',
    description: 'Durable stainless steel sauce pan with measured fill lines.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Calphalon Classic Sauce Pan', isPrimary: true }],
    brand: BRANDS.calphalon,
    category: CATEGORIES['sauce-pans'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'calphalon-25qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00JK961TQ'), price: 60, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'calphalon-classic-6qt-stockpot',
    name: 'Calphalon Classic 6 Qt Stock Pot',
    slug: 'calphalon-classic-6qt-stockpot',
    description: 'Large stainless steel stock pot for soups, stocks, and pasta.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Calphalon Classic Stock Pot', isPrimary: true }],
    brand: BRANDS.calphalon,
    category: CATEGORIES['dutch-ovens'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None - uncoated',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Uncoated stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pot Body', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'calphalon-6qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00JK964TS'), price: 100, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 450, dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL CERAMIC-COATED
  // ============================================================

  {
    id: 'caraway-12pc-nonstick',
    name: 'Caraway 12-Piece Nonstick Cookware Set',
    slug: 'caraway-12pc-nonstick',
    description: 'Complete ceramic-coated set with magnetic pan racks and canvas lid holders.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Caraway 12-Piece Nonstick Set', isPrimary: true }],
    brand: BRANDS.caraway,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum with ceramic coating',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Caraway products', rationale: 'Caraway ceramic coating is verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'caraway-12pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08XLDWJYV'), price: 395, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 550, dishwasherSafe: true },
  },

  {
    id: 'greenpan-valencia-pro-cookware',
    name: 'GreenPan Valencia Pro Ceramic Cookware',
    slug: 'greenpan-valencia-pro-cookware',
    description: 'Hard anodized with Thermolon Minerals Pro coating. Scratch resistant.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'GreenPan Valencia Pro Cookware', isPrimary: true }],
    brand: BRANDS.greenpan,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Hard anodized aluminum',
    coatingSummary: 'Thermolon Minerals Pro',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Thermolon products', rationale: 'GreenPan Thermolon is NSF certified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 5, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'thermolon', name: 'Thermolon Ceramic', slug: 'thermolon' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenpan-valencia-cookware-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09TQ3JG5J'), price: 150, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },

  {
    id: 'greenlife-softgrip-8-frypan',
    name: 'GreenLife Soft Grip 8" Fry Pan',
    slug: 'greenlife-softgrip-8-frypan',
    description: 'Compact ceramic non-stick pan with soft-grip Bakelite handle. Perfect for eggs.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'GreenLife 8" Fry Pan', isPrimary: true }],
    brand: BRANDS.greenlife,
    category: CATEGORIES['fry-pans'],
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All GreenLife products', rationale: 'GreenLife ceramic coating verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenlife-8-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09GWBVHHW'), price: 17, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 350, dishwasherSafe: true },
  },

  {
    id: 'greenlife-artisan-healthy',
    name: 'GreenLife Artisan Healthy Ceramic Nonstick',
    slug: 'greenlife-artisan-healthy',
    description: 'Stylish ceramic nonstick cookware with wood-look handles.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'GreenLife Artisan Set', isPrimary: true }],
    brand: BRANDS.greenlife,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All GreenLife products', rationale: 'GreenLife ceramic coating verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenlife-artisan-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B098FKC4F6'), price: 130, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 350, dishwasherSafe: true },
  },

  {
    id: 'greenlife-healthy-ceramic',
    name: 'GreenLife Healthy Ceramic Nonstick Cookware',
    slug: 'greenlife-healthy-ceramic',
    description: 'Budget-friendly ceramic nonstick cookware. PFAS, PFOA, lead, and cadmium free.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'GreenLife Healthy Ceramic', isPrimary: true }],
    brand: BRANDS.greenlife,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All GreenLife products', rationale: 'GreenLife ceramic coating verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenlife-healthy-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09ZQ2XBMS'), price: 80, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 350, dishwasherSafe: true },
  },

  {
    id: 'ourplace-always-pan-mini-bundle',
    name: 'Our Place Always Pan & Mini Bundle',
    slug: 'ourplace-always-pan-mini-bundle',
    description: 'The iconic Always Pan with Mini Always Pan. Perfect pair for any cooking task.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Our Place Pan Bundle', isPrimary: true }],
    brand: BRANDS.ourplace,
    category: CATEGORIES['cookware-sets'],
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic non-stick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Our Place products', rationale: 'Our Place ceramic coating is PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'cooking-surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', coating: { id: 'ceramic', name: 'Ceramic Non-Stick', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'ourplace-bundle-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D914VQBR'), price: 200, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, ovenSafeTempF: 450, dishwasherSafe: true },
  },

  // ============================================================
  // PURE CERAMIC
  // ============================================================

  {
    id: 'xtrema-pure-ceramic-set',
    name: 'Xtrema Pure Ceramic Cookware Set',
    slug: 'xtrema-pure-ceramic-set',
    description: '100% ceramic construction with no metals. Lab-tested and certified PFAS-free.',
    imageUrl: '/placeholders/products/stock-pot-placeholder.svg',
    images: [{ url: '/placeholders/products/stock-pot-placeholder.svg', alt: 'Xtrema Ceramic Set', isPrimary: true }],
    brand: BRANDS.xtrema,
    category: CATEGORIES['cookware-sets'],
    materialSummary: '100% pure ceramic',
    coatingSummary: 'None - solid ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Xtrema products', rationale: 'Pure ceramic with no metals or coatings.', unknowns: [], hasEvidence: true, evidenceCount: 4, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Cookware Body', material: { id: 'pure-ceramic', name: 'Pure Ceramic', slug: 'pure-ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'xtrema-set-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09ZQ2H6HL'), price: 300, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 2500, dishwasherSafe: true },
  },

  {
    id: 'xtrema-pure-ceramic-skillet-set',
    name: 'Xtrema Pure Ceramic Skillet',
    slug: 'xtrema-pure-ceramic-skillet-set',
    description: '100% ceramic skillet. Extremely durable and can withstand high temperatures.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Xtrema Ceramic Skillet', isPrimary: true }],
    brand: BRANDS.xtrema,
    category: CATEGORIES['fry-pans'],
    materialSummary: '100% pure ceramic',
    coatingSummary: 'None - solid ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Xtrema products', rationale: 'Pure ceramic with no metals or coatings.', unknowns: [], hasEvidence: true, evidenceCount: 4, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan Body', material: { id: 'pure-ceramic', name: 'Pure Ceramic', slug: 'pure-ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'xtrema-skillet-set-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09ZQ2MS5D'), price: 150, currency: 'USD', inStock: true }],
    features: { inductionCompatible: false, ovenSafeTempF: 2500, dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL CUTTING BOARDS - WOOD
  // ============================================================

  {
    id: 'teakhaus-large-carving',
    name: 'Teakhaus Large Teak Carving Board',
    slug: 'teakhaus-large-carving',
    description: 'FSC-certified teak with juice groove and hand grips. Perfect for roasts.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Teakhaus Large Carving Board', isPrimary: true }],
    brand: BRANDS.teakhaus,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'FSC-certified teak',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural teak wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'teak', name: 'Teak Wood', slug: 'teak' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'teakhaus-carving-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B06VT56XFQ'), price: 80, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'teakhaus-marine-teak',
    name: 'Teakhaus Marine Teak Board with Juice Groove',
    slug: 'teakhaus-marine-teak',
    description: 'Marine-grade teak cutting board. Naturally antimicrobial and knife-friendly.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Teakhaus Marine Teak Board', isPrimary: true }],
    brand: BRANDS.teakhaus,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Marine teak',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural teak wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'teak', name: 'Teak Wood', slug: 'teak' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'teakhaus-marine-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B001TV08EW'), price: 45, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'cocoboss-premium-acacia',
    name: 'COCOBOSS Premium Acacia Cutting Board 16.5" x 11.8"',
    slug: 'cocoboss-premium-acacia',
    description: 'Beautiful acacia wood cutting board with juice groove. Sustainably sourced.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'COCOBOSS Acacia Board', isPrimary: true }],
    brand: BRANDS.cocoboss,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Acacia wood',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural acacia wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'acacia', name: 'Acacia Wood', slug: 'acacia' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cocoboss-acacia-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DBF6GJ22'), price: 53, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'woodiepoppins-premium-walnut',
    name: 'Woodie Poppins Premium Walnut Board 17.7" x 10.6"',
    slug: 'woodiepoppins-premium-walnut',
    description: 'American black walnut cutting board. Rich color and excellent durability.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Woodie Poppins Walnut Board', isPrimary: true }],
    brand: BRANDS.woodiepoppins,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Black walnut',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural walnut wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'walnut', name: 'Black Walnut', slug: 'walnut' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'woodiepoppins-walnut-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DBYFV74R'), price: 35, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'venusmiles-black-walnut',
    name: 'Venusmiles Black Walnut Board 24" x 18" x 1"',
    slug: 'venusmiles-black-walnut',
    description: 'Extra-large black walnut cutting board. Professional chef size.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Venusmiles Walnut Board', isPrimary: true }],
    brand: BRANDS.venusmiles,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Black walnut',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural walnut wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'walnut', name: 'Black Walnut', slug: 'walnut' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'venusmiles-walnut-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DZHM4DRG'), price: 110, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'magigo-square-walnut',
    name: 'MAGIGO Square Walnut Butcher Block',
    slug: 'magigo-square-walnut',
    description: 'Square walnut end grain butcher block. Self-healing cutting surface.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'MAGIGO Walnut Block', isPrimary: true }],
    brand: BRANDS.magigo,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Walnut end grain',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural walnut wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'walnut', name: 'Walnut', slug: 'walnut' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'magigo-walnut-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D7P4TCRQ'), price: 40, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL CUTTING BOARDS - METAL
  // ============================================================

  {
    id: 'generic-xl-titanium-stainless',
    name: 'XL Titanium/Stainless Steel Cutting Board 17.7" x 11.6"',
    slug: 'generic-xl-titanium-stainless',
    description: 'Large titanium-stainless hybrid cutting board. Hygienic and dishwasher safe.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'XL Titanium Cutting Board', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Titanium/stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All metal products', rationale: 'Titanium and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'titanium', name: 'Titanium', slug: 'titanium' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'generic-xl-titanium-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DGXNCP1Q'), price: 60, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'generic-titanium-18x12',
    name: '100% Titanium Cutting Board 18" x 12"',
    slug: 'generic-titanium-18x12',
    description: 'Pure titanium cutting board. Lightweight, hygienic, and extremely durable.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Titanium 18x12 Board', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['cutting-boards'],
    materialSummary: '100% titanium',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All titanium products', rationale: 'Pure titanium is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'titanium', name: 'Titanium', slug: 'titanium' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'generic-titanium-18-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D9HVYV6X'), price: 38, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'tivano-titanium-stainless',
    name: 'Tivano Titanium Stainless Board 15.35" x 11"',
    slug: 'tivano-titanium-stainless',
    description: 'Titanium-stainless steel hybrid for optimal durability and hygiene.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Tivano Titanium Board', isPrimary: true }],
    brand: BRANDS.tivano,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Titanium/stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All metal products', rationale: 'Titanium and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'titanium', name: 'Titanium', slug: 'titanium' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tivano-titanium-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0F2M7GZX3'), price: 45, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // User-requested cutting boards
  {
    id: 'xl-titanium-ebony-cutting-board',
    name: 'XL Double Sided Titanium Stainless Steel & Ebony Wood Cutting Board 17.7" x 11.6"',
    slug: 'xl-titanium-ebony-cutting-board',
    description: 'Premium double-sided cutting board with titanium stainless steel on one side and ebony wood on the other. Features juice groove, non-toxic, and dishwasher safe.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'XL Titanium Ebony Cutting Board', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'Titanium stainless steel / Ebony wood',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All metal and wood products', rationale: 'Titanium stainless steel and natural wood are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'metal-side', role: 'body', roleLabel: 'Metal Side', material: { id: 'titanium-stainless', name: 'Titanium Stainless Steel', slug: 'titanium-stainless' }, pfasStatus: 'verified_free' }, { id: 'wood-side', role: 'body', roleLabel: 'Wood Side', material: { id: 'ebony-wood', name: 'Ebony Wood', slug: 'ebony-wood' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'xl-titanium-ebony-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D7M64ZHQ'), price: 60, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'teakhaus-edge-grain-handles',
    name: 'Teakhaus Edge Grain Teak Cutting Board with Handles',
    slug: 'teakhaus-edge-grain-handles',
    description: 'FSC-certified teak edge grain cutting board with built-in handles. Naturally antimicrobial and knife-friendly.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [{ url: '/placeholders/products/skillet-placeholder.svg', alt: 'Teakhaus Cutting Board', isPrimary: true }],
    brand: BRANDS.teakhaus,
    category: CATEGORIES['cutting-boards'],
    materialSummary: 'FSC-certified teak wood',
    coatingSummary: 'None - natural wood',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All wood products', rationale: 'Natural teak wood is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Board', material: { id: 'teak-wood', name: 'Teak Wood', slug: 'teak-wood' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'teakhaus-edge-handles-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0725F78LB'), price: 55, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL BAKEWARE
  // ============================================================

  {
    id: 'anchor-hocking-3qt-truelock',
    name: 'Anchor Hocking 3 Qt TrueLock Bake Dish',
    slug: 'anchor-hocking-3qt-truelock',
    description: 'Tempered glass baking dish with TrueLock lid. Made in USA.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Anchor Hocking TrueLock', isPrimary: true }],
    brand: BRANDS.anchorhocking,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Dish', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'anchor-truelock-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0B9Q3ZWYQ'), price: 16, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'anchor-hocking-2pc-basics',
    name: 'Anchor Hocking 2-Piece Basics Baking Set',
    slug: 'anchor-hocking-2pc-basics',
    description: 'Essential glass baking set. Perfect starter set for baking.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Anchor Hocking Basics Set', isPrimary: true }],
    brand: BRANDS.anchorhocking,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Dish', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'anchor-basics-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000I1CBYY'), price: 20, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'anchor-hocking-15pc-glass',
    name: 'Anchor Hocking 15-Piece Glass Bakeware Set',
    slug: 'anchor-hocking-15pc-glass',
    description: 'Complete glass bakeware collection with lids. Made in USA.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Anchor Hocking 15-Piece Set', isPrimary: true }],
    brand: BRANDS.anchorhocking,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Set', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'anchor-15pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B000J6BZDQ'), price: 50, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'emilehenry-13x9-rectangle',
    name: 'Emile Henry 13" x 9" Rectangle Baker',
    slug: 'emilehenry-13x9-rectangle',
    description: 'French ceramic baker. Goes from freezer to oven to table.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Emile Henry Rectangle Baker', isPrimary: true }],
    brand: BRANDS.emilehenry,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Burgundy clay ceramic',
    coatingSummary: 'Glazed ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All ceramic products', rationale: 'Ceramic is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Baker', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'emilehenry-13x9-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D57QRYYX'), price: 75, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 520, dishwasherSafe: true },
  },

  {
    id: 'emilehenry-oval-baker',
    name: 'Emile Henry HR Ceramic Oval Baker',
    slug: 'emilehenry-oval-baker',
    description: 'Elegant oval ceramic baker. Made in France with HR (High Resistance) ceramic.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Emile Henry Oval Baker', isPrimary: true }],
    brand: BRANDS.emilehenry,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'HR ceramic',
    coatingSummary: 'Glazed ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All ceramic products', rationale: 'Ceramic is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Baker', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'emilehenry-oval-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B071RZX453'), price: 35, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 520, dishwasherSafe: true },
  },

  {
    id: 'emilehenry-8x5-rectangle',
    name: 'Emile Henry 8" x 5.5" Rectangle Dish',
    slug: 'emilehenry-8x5-rectangle',
    description: 'Compact French ceramic baking dish. Perfect for individual portions.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Emile Henry Small Rectangle', isPrimary: true }],
    brand: BRANDS.emilehenry,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Burgundy clay ceramic',
    coatingSummary: 'Glazed ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All ceramic products', rationale: 'Ceramic is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Dish', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'emilehenry-8x5-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0719BSWXH'), price: 28, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 520, dishwasherSafe: true },
  },

  {
    id: 'emilehenry-large-rectangle',
    name: 'Emile Henry Large Rectangle Baker',
    slug: 'emilehenry-large-rectangle',
    description: 'Large French ceramic baker for casseroles and lasagna.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Emile Henry Large Baker', isPrimary: true }],
    brand: BRANDS.emilehenry,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Burgundy clay ceramic',
    coatingSummary: 'Glazed ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All ceramic products', rationale: 'Ceramic is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Baker', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'emilehenry-large-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DFRXL1K1'), price: 70, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 520, dishwasherSafe: true },
  },

  {
    id: 'pyrex-simplystore-6cup',
    name: 'Pyrex Simply Store 6-Cup Container',
    slug: 'pyrex-simplystore-6cup',
    description: 'Classic borosilicate glass storage container. Oven and microwave safe.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Pyrex Simply Store', isPrimary: true }],
    brand: BRANDS.pyrex,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Borosilicate glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Borosilicate Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'pyrex-6cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0BSK7CGDB'), price: 9, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'pyrex-7210-rectangle-2pk',
    name: 'Pyrex 7210 Rectangle Dish 2-Pack',
    slug: 'pyrex-7210-rectangle-2pk',
    description: 'Classic Pyrex rectangle baking dishes. Essential bakeware.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Pyrex Rectangle 2-Pack', isPrimary: true }],
    brand: BRANDS.pyrex,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Dish', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'pyrex-7210-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B089QV8LJL'), price: 15, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'pyrex-glass-food-storage',
    name: 'Pyrex Glass Food Storage',
    slug: 'pyrex-glass-food-storage',
    description: 'Durable Pyrex glass containers with lids. Meal prep essential.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Pyrex Food Storage', isPrimary: true }],
    brand: BRANDS.pyrex,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'pyrex-storage-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0BSJZ1QYZ'), price: 12, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'nordicware-brilliant-3pc',
    name: 'Nordic Ware Brilliant 3-Piece Baking Set',
    slug: 'nordicware-brilliant-3pc',
    description: 'American-made aluminum bakeware with proprietary PFAS-free nonstick coating.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Nordic Ware Brilliant Set', isPrimary: true }],
    brand: BRANDS.nordicware,
    category: CATEGORIES['baking-sheets'],
    materialSummary: 'Aluminum',
    coatingSummary: 'PFAS-free nonstick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'Naturals line', rationale: 'Nordic Ware Naturals uses PFAS-free coating.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'aluminum', name: 'Aluminum', slug: 'aluminum' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'nordicware-3pc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0FCZYR66J'), price: 47, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'nordicware-naturals-nonstick',
    name: 'Nordic Ware Naturals Oven-Safe Nonstick',
    slug: 'nordicware-naturals-nonstick',
    description: 'Natural aluminum bakeware. Made in USA with PFAS-free coating.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Nordic Ware Naturals', isPrimary: true }],
    brand: BRANDS.nordicware,
    category: CATEGORIES['baking-sheets'],
    materialSummary: 'Natural aluminum',
    coatingSummary: 'PFAS-free nonstick',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'Naturals line', rationale: 'Nordic Ware Naturals uses PFAS-free coating.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'aluminum', name: 'Aluminum', slug: 'aluminum' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'nordicware-naturals-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0BXTDSKNH'), price: 30, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'usapan-halfsheet-rack-2pk',
    name: 'USA Pan Half Sheet Rack 2-Pack',
    slug: 'usapan-halfsheet-rack-2pk',
    description: 'Commercial-grade half sheet pan with cooling rack. Americoat PFAS-free coating.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'USA Pan Half Sheet Rack', isPrimary: true }],
    brand: BRANDS.usapan,
    category: CATEGORIES['baking-sheets'],
    materialSummary: 'Aluminized steel',
    coatingSummary: 'Americoat silicone',
    verification: { tier: 4 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All USA Pan products', rationale: 'USA Pan Americoat is certified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'aluminized-steel', name: 'Aluminized Steel', slug: 'aluminized-steel' }, coating: { id: 'americoat', name: 'Americoat', slug: 'americoat' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'usapan-rack-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07ZZKRZ8F'), price: 35, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'fatdaddios-round-cake-2pk',
    name: "Fat Daddio's Round Cake Pan 2-Pack",
    slug: 'fatdaddios-round-cake-2pk',
    description: 'Professional anodized aluminum cake pans. No coatings needed.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: "Fat Daddio's Cake Pan 2-Pack", isPrimary: true }],
    brand: BRANDS.fatdaddios,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Anodized aluminum',
    coatingSummary: 'None - anodized',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All anodized products', rationale: 'Anodized aluminum is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'anodized-aluminum', name: 'Anodized Aluminum', slug: 'anodized-aluminum' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fatdaddios-2pk-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0713TP8FG'), price: 20, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'fatdaddios-round-cake',
    name: "Fat Daddio's Round Cake Pan",
    slug: 'fatdaddios-round-cake',
    description: 'Single professional cake pan. Anodized aluminum for even baking.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: "Fat Daddio's Cake Pan", isPrimary: true }],
    brand: BRANDS.fatdaddios,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Anodized aluminum',
    coatingSummary: 'None - anodized',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All anodized products', rationale: 'Anodized aluminum is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'anodized-aluminum', name: 'Anodized Aluminum', slug: 'anodized-aluminum' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fatdaddios-single-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01HDK4RWQ'), price: 12, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'fatdaddios-anodized-bakeware',
    name: "Fat Daddio's Anodized Bakeware",
    slug: 'fatdaddios-anodized-bakeware',
    description: 'Professional anodized aluminum bakeware. Commercial bakery quality.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: "Fat Daddio's Anodized", isPrimary: true }],
    brand: BRANDS.fatdaddios,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Anodized aluminum',
    coatingSummary: 'None - anodized',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All anodized products', rationale: 'Anodized aluminum is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Pan', material: { id: 'anodized-aluminum', name: 'Anodized Aluminum', slug: 'anodized-aluminum' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fatdaddios-anodized-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0BV198RXQ'), price: 18, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 500, dishwasherSafe: true },
  },

  {
    id: 'caraway-11pc-ceramic-bakeware',
    name: 'Caraway 11-Piece Ceramic Bakeware Set',
    slug: 'caraway-11pc-ceramic-bakeware',
    description: 'Complete ceramic-coated bakeware with storage organizers.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Caraway Ceramic Bakeware', isPrimary: true }],
    brand: BRANDS.caraway,
    category: CATEGORIES['baking-dishes'],
    materialSummary: 'Aluminized steel',
    coatingSummary: 'Ceramic coating',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Caraway products', rationale: 'Caraway ceramic coating is verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'surface', role: 'cooking_surface', roleLabel: 'Surface', coating: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'caraway-bakeware-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09YTND3F2'), price: 395, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 550, dishwasherSafe: true },
  },

  {
    id: 'silpat-premium-mat',
    name: 'Silpat Premium Silicone Baking Mat',
    slug: 'silpat-premium-mat',
    description: 'Original French silicone baking mat. Reusable non-stick surface.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Silpat Premium Mat', isPrimary: true }],
    brand: BRANDS.silpat,
    category: CATEGORIES['silicone-mats'],
    materialSummary: 'Fiberglass mesh with silicone',
    coatingSummary: 'Silicone',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Silpat products', rationale: 'Silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Mat', material: { id: 'silicone', name: 'Silicone', slug: 'silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'silpat-premium-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00008T960'), price: 19, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 480, dishwasherSafe: true },
  },

  {
    id: 'silpat-nonstick-mat',
    name: 'Silpat Non-Stick Silicone Mat',
    slug: 'silpat-nonstick-mat',
    description: 'Classic Silpat silicone mat. Perfect for baking and candy-making.',
    imageUrl: '/placeholders/products/baking-dish-placeholder.svg',
    images: [{ url: '/placeholders/products/baking-dish-placeholder.svg', alt: 'Silpat Non-Stick Mat', isPrimary: true }],
    brand: BRANDS.silpat,
    category: CATEGORIES['silicone-mats'],
    materialSummary: 'Fiberglass mesh with silicone',
    coatingSummary: 'Silicone',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All Silpat products', rationale: 'Silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Mat', material: { id: 'silicone', name: 'Silicone', slug: 'silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'silpat-nonstick-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00HZ3WTFO'), price: 22, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 480, dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL FOOD STORAGE - GLASS
  // ============================================================

  {
    id: 'glasslock-64oz-rectangle',
    name: 'Glasslock 64oz Rectangle Container',
    slug: 'glasslock-64oz-rectangle',
    description: 'Extra-large tempered glass container. Perfect for meal prep.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Glasslock 64oz Container', isPrimary: true }],
    brand: BRANDS.glasslock,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'glasslock-64oz-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01D0P5L8M'), price: 18, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'glasslock-taper-3pk',
    name: 'Glasslock Taper Rectangle 3-Pack',
    slug: 'glasslock-taper-3pk',
    description: 'Stackable tempered glass containers with snap-lock lids.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Glasslock Taper 3-Pack', isPrimary: true }],
    brand: BRANDS.glasslock,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'glasslock-taper-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08WTKW4MS'), price: 35, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'rubbermaid-32cup-glass-4pk',
    name: 'Rubbermaid 3.2 Cup Glass 4-Pack',
    slug: 'rubbermaid-32cup-glass-4pk',
    description: 'Durable glass containers with Tritan lids. BPA-free.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Rubbermaid Glass 4-Pack', isPrimary: true }],
    brand: BRANDS.rubbermaid,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'rubbermaid-32-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08B7GLYZC'), price: 38, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'rubbermaid-glass-storage-4pk',
    name: 'Rubbermaid Glass Storage 4-Pack',
    slug: 'rubbermaid-glass-storage-4pk',
    description: 'Versatile glass food storage set. Microwave, oven, and freezer safe.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Rubbermaid Glass Storage', isPrimary: true }],
    brand: BRANDS.rubbermaid,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'rubbermaid-storage-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08B7MYPKS'), price: 34, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  {
    id: 'rubbermaid-47cup-glass',
    name: 'Rubbermaid 4.7-Cup Glass Container',
    slug: 'rubbermaid-47cup-glass',
    description: 'Large single glass container. Perfect for leftovers.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Rubbermaid 4.7 Cup', isPrimary: true }],
    brand: BRANDS.rubbermaid,
    category: CATEGORIES['glass-containers'],
    materialSummary: 'Tempered glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All glass products', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'glass', name: 'Tempered Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'rubbermaid-47-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08B7DT91L'), price: 25, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL FOOD STORAGE - STAINLESS
  // ============================================================

  {
    id: 'lunchbots-medium-trio',
    name: 'LunchBots Medium Trio II Snack Container',
    slug: 'lunchbots-medium-trio',
    description: 'Three-compartment stainless steel snack container.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'LunchBots Trio Container', isPrimary: true }],
    brand: BRANDS.lunchbots,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lunchbots-trio-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D84DVHDW'), price: 25, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'lunchbots-large-cinco',
    name: 'LunchBots Large Cinco Lunch Container',
    slug: 'lunchbots-large-cinco',
    description: 'Five-compartment stainless steel bento box. Perfect for complete meals.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'LunchBots Cinco Container', isPrimary: true }],
    brand: BRANDS.lunchbots,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'lunchbots-cinco-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07RR27R95'), price: 42, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'ecolunchbox-splash-bento',
    name: 'ECOlunchbox Splash Box Bento',
    slug: 'ecolunchbox-splash-bento',
    description: 'Leak-proof stainless steel bento box. Perfect for soups and sauces.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'ECOlunchbox Splash Box', isPrimary: true }],
    brand: BRANDS.ecolunchbox,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'ecolunchbox-splash-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00JLP145A'), price: 26, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'ecolunchbox-storage-container',
    name: 'ECOlunchbox Storage Container',
    slug: 'ecolunchbox-storage-container',
    description: 'Simple stainless steel food container. Sustainable and durable.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'ECOlunchbox Container', isPrimary: true }],
    brand: BRANDS.ecolunchbox,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'ecolunchbox-storage-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B007MF0YA2'), price: 22, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'ecolunchbox-three-canister',
    name: 'ECOlunchbox Three-Canister Lunch Set',
    slug: 'ecolunchbox-three-canister',
    description: 'Set of three nesting stainless steel canisters. Zero-waste lunch solution.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'ECOlunchbox Three-Canister', isPrimary: true }],
    brand: BRANDS.ecolunchbox,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'ecolunchbox-3can-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00YO2SN36'), price: 35, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'ecolunchbox-leakproof-xl',
    name: 'ECOlunchbox Leak-Proof X-Large',
    slug: 'ecolunchbox-leakproof-xl',
    description: 'Extra-large leak-proof stainless steel container. Great for salads.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'ECOlunchbox XL', isPrimary: true }],
    brand: BRANDS.ecolunchbox,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'ecolunchbox-xl-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08RLB9YQ7'), price: 30, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'kleankanteen-tk-canister-32oz',
    name: 'Klean Kanteen TK Canister 32oz',
    slug: 'kleankanteen-tk-canister-32oz',
    description: 'Insulated stainless steel food canister. Keeps food hot or cold.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Klean Kanteen TK Canister', isPrimary: true }],
    brand: BRANDS.kleankanteen,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kleankanteen-32oz-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08DRNY7Q8'), price: 35, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'kleankanteen-stainless-canister',
    name: 'Klean Kanteen Stainless Steel Canister',
    slug: 'kleankanteen-stainless-canister',
    description: 'Classic stainless steel food canister. Durable and sustainable.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Klean Kanteen Canister', isPrimary: true }],
    brand: BRANDS.kleankanteen,
    category: CATEGORIES['stainless-containers'],
    materialSummary: '18/8 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kleankanteen-canister-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00D418IDI'), price: 30, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL FOOD STORAGE - SILICONE & BEESWAX
  // ============================================================

  {
    id: 'stasher-premium-4pk',
    name: 'Stasher Premium Silicone Bags 4-Pack',
    slug: 'stasher-premium-4pk',
    description: 'Reusable platinum silicone storage bags. Dishwasher and microwave safe.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Stasher 4-Pack', isPrimary: true }],
    brand: BRANDS.stasher,
    category: CATEGORIES['silicone-bags'],
    materialSummary: 'Platinum silicone',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All silicone products', rationale: 'Platinum silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bag', role: 'body', roleLabel: 'Bag', material: { id: 'platinum-silicone', name: 'Platinum Silicone', slug: 'platinum-silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'stasher-4pk-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CZ5BC3TX'), price: 40, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 400, dishwasherSafe: true },
  },

  {
    id: 'stasher-6pk-starter',
    name: 'Stasher 6-Pack Starter Kit',
    slug: 'stasher-6pk-starter',
    description: 'Complete silicone bag starter set. Various sizes for all needs.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Stasher Starter Kit', isPrimary: true }],
    brand: BRANDS.stasher,
    category: CATEGORIES['silicone-bags'],
    materialSummary: 'Platinum silicone',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All silicone products', rationale: 'Platinum silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bag', role: 'body', roleLabel: 'Bag', material: { id: 'platinum-silicone', name: 'Platinum Silicone', slug: 'platinum-silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'stasher-6pk-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CZ5D8M8S'), price: 60, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 400, dishwasherSafe: true },
  },

  {
    id: 'stasher-silicone-bundle',
    name: 'Stasher Silicone Bundle',
    slug: 'stasher-silicone-bundle',
    description: 'Value bundle of Stasher silicone bags. Perfect gift set.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Stasher Bundle', isPrimary: true }],
    brand: BRANDS.stasher,
    category: CATEGORIES['silicone-bags'],
    materialSummary: 'Platinum silicone',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All silicone products', rationale: 'Platinum silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bag', role: 'body', roleLabel: 'Bag', material: { id: 'platinum-silicone', name: 'Platinum Silicone', slug: 'platinum-silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'stasher-bundle-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DQ6499CY'), price: 50, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 400, dishwasherSafe: true },
  },

  {
    id: 'soupercubes-2cup-tray',
    name: 'Souper Cubes 2 Cup Freezer Tray',
    slug: 'soupercubes-2cup-tray',
    description: 'Silicone freezer tray for soups and sauces. Perfect portions.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Souper Cubes 2 Cup', isPrimary: true }],
    brand: BRANDS.soupercubes,
    category: CATEGORIES['silicone-bags'],
    materialSummary: 'Food-grade silicone',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All silicone products', rationale: 'Silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'tray', role: 'body', roleLabel: 'Tray', material: { id: 'silicone', name: 'Silicone', slug: 'silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'soupercubes-2cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D15K5TRF'), price: 20, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 415, dishwasherSafe: true },
  },

  {
    id: 'soupercubes-1cup-2pk',
    name: 'Souper Cubes 1 Cup Freezer Molds 2-Pack',
    slug: 'soupercubes-1cup-2pk',
    description: 'Smaller portion freezer molds. Great for sauces and baby food.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Souper Cubes 1 Cup 2-Pack', isPrimary: true }],
    brand: BRANDS.soupercubes,
    category: CATEGORIES['silicone-bags'],
    materialSummary: 'Food-grade silicone',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All silicone products', rationale: 'Silicone is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'tray', role: 'body', roleLabel: 'Mold', material: { id: 'silicone', name: 'Silicone', slug: 'silicone' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'soupercubes-1cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07GSSR5V2'), price: 25, currency: 'USD', inStock: true }],
    features: { ovenSafeTempF: 415, dishwasherSafe: true },
  },

  {
    id: 'beeswrap-xl-bread',
    name: "Bee's Wrap XL Bread Wrap",
    slug: 'beeswrap-xl-bread',
    description: 'Extra-large beeswax wrap for bread and larger items. Sustainable alternative to plastic.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: "Bee's Wrap XL", isPrimary: true }],
    brand: BRANDS.beeswrap,
    category: CATEGORIES['beeswax-wraps'],
    materialSummary: 'Organic cotton, beeswax, jojoba oil',
    coatingSummary: 'Beeswax',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All beeswax products', rationale: 'Natural beeswax is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'wrap', role: 'body', roleLabel: 'Wrap', material: { id: 'beeswax', name: 'Beeswax', slug: 'beeswax' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'beeswrap-xl-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00GK3QTCE'), price: 15, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'beeswrap-3pk-assorted',
    name: "Bee's Wrap 3-Pack Assorted Set",
    slug: 'beeswrap-3pk-assorted',
    description: 'Small, medium, and large beeswax wraps. Perfect starter set.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: "Bee's Wrap 3-Pack", isPrimary: true }],
    brand: BRANDS.beeswrap,
    category: CATEGORIES['beeswax-wraps'],
    materialSummary: 'Organic cotton, beeswax, jojoba oil',
    coatingSummary: 'Beeswax',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All beeswax products', rationale: 'Natural beeswax is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'wrap', role: 'body', roleLabel: 'Wrap', material: { id: 'beeswax', name: 'Beeswax', slug: 'beeswax' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'beeswrap-3pk-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0126LMDFK'), price: 18, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'beeswrap-beeswax-wraps',
    name: "Bee's Wrap Beeswax Wraps",
    slug: 'beeswrap-beeswax-wraps',
    description: 'Classic beeswax food wraps. Replace plastic wrap sustainably.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: "Bee's Wrap Beeswax", isPrimary: true }],
    brand: BRANDS.beeswrap,
    category: CATEGORIES['beeswax-wraps'],
    materialSummary: 'Organic cotton, beeswax, jojoba oil',
    coatingSummary: 'Beeswax',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All beeswax products', rationale: 'Natural beeswax is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'wrap', role: 'body', roleLabel: 'Wrap', material: { id: 'beeswax', name: 'Beeswax', slug: 'beeswax' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'beeswrap-wraps-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0F3PXCKT3'), price: 16, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - BLENDERS
  // ============================================================

  {
    id: 'vitamix-500-professional',
    name: 'Vitamix 500 Professional 64oz Blender',
    slug: 'vitamix-500-professional',
    description: 'Commercial-grade blender with Tritan container. 10-year warranty.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Vitamix 500 Professional', isPrimary: true }],
    brand: BRANDS.vitamix,
    category: CATEGORIES['blenders'],
    materialSummary: 'Tritan copolyester container, stainless blades',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Vitamix blenders', rationale: 'Tritan plastic is BPA-free and PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic container contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'tritan', name: 'Eastman Tritan', slug: 'tritan' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'vitamix-500-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B002KAPEPO'), price: 350, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'vitamix-advance-series',
    name: 'Vitamix Advance Series Tritan Blender',
    slug: 'vitamix-advance-series',
    description: 'Entry-level professional Vitamix with BPA-free Tritan container.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Vitamix Advance Series', isPrimary: true }],
    brand: BRANDS.vitamix,
    category: CATEGORIES['blenders'],
    materialSummary: 'Tritan copolyester container',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Vitamix blenders', rationale: 'Tritan plastic is BPA-free and PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic container contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'tritan', name: 'Eastman Tritan', slug: 'tritan' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'vitamix-advance-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0150AJMM6'), price: 150, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // Tribest Glass Blender - ZERO PLASTIC FOOD CONTACT
  {
    id: 'tribest-glass-personal-blender',
    name: 'Tribest Glass Personal Blender PBG-5050',
    slug: 'tribest-glass-personal-blender',
    description: 'Personal blender with tempered glass containers and stainless steel blades. Zero plastic food contact - glass and stainless steel only.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Tribest Glass Personal Blender', isPrimary: true }],
    brand: BRANDS.tribest,
    category: CATEGORIES['blenders'],
    materialSummary: 'Tempered glass container, stainless steel blades',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass blenders', rationale: 'Zero plastic food contact - tempered glass container and stainless steel blades are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'container', role: 'body', roleLabel: 'Container', material: { id: 'tempered-glass', name: 'Tempered Glass', slug: 'tempered-glass' }, pfasStatus: 'verified_free' }, { id: 'blades', role: 'other', roleLabel: 'Blades', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tribest-glass-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00GGFHPGY'), price: 179, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'blendtec-wildside-professional',
    name: 'Blendtec WildSide Professional Blender',
    slug: 'blendtec-wildside-professional',
    description: 'Commercial blender with patented WildSide jar. Made in USA.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Blendtec WildSide', isPrimary: true }],
    brand: BRANDS.blendtec,
    category: CATEGORIES['blenders'],
    materialSummary: 'BPA-free plastic jar, stainless blades',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Blendtec blenders', rationale: 'BPA-free plastic is PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic jar contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'jar', role: 'body', roleLabel: 'Jar', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'blendtec-wildside-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B086Y8KD1K'), price: 400, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'blendtec-twister-jar',
    name: 'Blendtec 37oz Twister Jar',
    slug: 'blendtec-twister-jar',
    description: 'Specialty jar for thick blends like nut butters and hummus.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Blendtec Twister Jar', isPrimary: true }],
    brand: BRANDS.blendtec,
    category: CATEGORIES['blenders'],
    materialSummary: 'BPA-free plastic',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Blendtec products', rationale: 'BPA-free plastic is PFAS-free, but plastic food contact surfaces are less preferred than glass or stainless steel alternatives.', unknowns: ['Plastic jar contacts food during blending'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'jar', role: 'body', roleLabel: 'Jar', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'blendtec-twister-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0087Q1T1S'), price: 80, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'oster-40oz-glass-blender',
    name: 'Oster 40oz Glass Jar Blender',
    slug: 'oster-40oz-glass-blender',
    description: 'Classic glass jar blender. Borosilicate glass is heat resistant and PFAS-free.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Oster Glass Blender', isPrimary: true }],
    brand: BRANDS.oster,
    category: CATEGORIES['blenders'],
    materialSummary: 'Borosilicate glass jar',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass jar blenders', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'jar', role: 'body', roleLabel: 'Jar', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'oster-glass-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0019MLLCO'), price: 40, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'oster-5cup-glass-replacement',
    name: 'Oster 5-Cup Glass Replacement Jar',
    slug: 'oster-5cup-glass-replacement',
    description: 'Replacement glass jar for Oster blenders. Heat-resistant borosilicate.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Oster Glass Replacement', isPrimary: true }],
    brand: BRANDS.oster,
    category: CATEGORIES['blenders'],
    materialSummary: 'Borosilicate glass',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass jars', rationale: 'Glass is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'jar', role: 'body', roleLabel: 'Jar', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'oster-replacement-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09JCJWVSS'), price: 27, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - COFFEE MAKERS
  // ============================================================

  {
    id: 'bonavita-5cup-thermal',
    name: 'Bonavita 5-Cup Drip Thermal Coffee Maker',
    slug: 'bonavita-5cup-thermal',
    description: 'SCA-certified coffee brewer with stainless steel thermal carafe.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Bonavita 5-Cup Thermal', isPrimary: true }],
    brand: BRANDS.bonavita,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel carafe',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel coffee makers', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'bonavita-5cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DK5B7L6V'), price: 150, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'bonavita-thermal-carafe',
    name: 'Bonavita Thermal Carafe Coffee Maker',
    slug: 'bonavita-thermal-carafe',
    description: 'Premium drip coffee maker with double-wall stainless steel carafe.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Bonavita Thermal Carafe', isPrimary: true }],
    brand: BRANDS.bonavita,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel carafe',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'bonavita-thermal-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B071VK1XZ5'), price: 130, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'bonavita-enthusiast',
    name: 'Bonavita Enthusiast Coffee Maker',
    slug: 'bonavita-enthusiast',
    description: 'SCA-certified specialty coffee brewer. Optimal brew temperature.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Bonavita Enthusiast', isPrimary: true }],
    brand: BRANDS.bonavita,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel, glass carafe',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Bonavita products', rationale: 'Stainless steel and glass are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'glass', name: 'Glass', slug: 'glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'bonavita-enthusiast-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DJGF3RHJ'), price: 160, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'baratza-vario-steel',
    name: 'Baratza Vario with Steel Burrs',
    slug: 'baratza-vario-steel',
    description: 'Professional grinder with stainless steel burrs for espresso.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Baratza Vario Steel', isPrimary: true }],
    brand: BRANDS.baratza,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel burrs',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Baratza grinders', rationale: 'Stainless steel burrs are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'burrs', role: 'other', roleLabel: 'Burrs', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'baratza-vario-steel-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09JBC6V6F'), price: 500, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'baratza-vario-flat',
    name: 'Baratza Vario Flat Burr Grinder',
    slug: 'baratza-vario-flat',
    description: 'Versatile grinder with ceramic flat burrs. 230 micro-adjustments.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Baratza Vario Flat', isPrimary: true }],
    brand: BRANDS.baratza,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Ceramic burrs',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Baratza grinders', rationale: 'Ceramic burrs are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'burrs', role: 'other', roleLabel: 'Burrs', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'baratza-vario-flat-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00LWFJ8V4'), price: 400, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'baratza-virtuoso',
    name: 'Baratza Virtuoso Conical Burr Grinder',
    slug: 'baratza-virtuoso',
    description: 'Step up from Encore with commercial-grade burrs. 40 grind settings.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Baratza Virtuoso', isPrimary: true }],
    brand: BRANDS.baratza,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Stainless steel conical burrs',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All Baratza grinders', rationale: 'Stainless steel burrs are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'burrs', role: 'other', roleLabel: 'Burrs', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'baratza-virtuoso-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B006MLQHRG'), price: 250, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'generic-glass-pourover-20oz',
    name: 'Glass Pour Over Coffee Dripper 20oz',
    slug: 'generic-glass-pourover-20oz',
    description: 'Borosilicate glass pour-over dripper with stainless steel filter.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Glass Pour Over 20oz', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Borosilicate glass, stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass and stainless steel', rationale: 'Glass and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'generic-pourover-20-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01LQ2PZDW'), price: 25, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'generic-glass-pourover-17oz',
    name: 'Glass Pour Over Coffee Dripper 17oz',
    slug: 'generic-glass-pourover-17oz',
    description: 'Compact borosilicate glass pour-over for single servings.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Glass Pour Over 17oz', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Borosilicate glass, stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass and stainless steel', rationale: 'Glass and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'generic-pourover-17-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B07KQVW6RR'), price: 20, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'cosori-pourover-glass',
    name: 'COSORI Pour Over Glass Coffee Maker',
    slug: 'cosori-pourover-glass',
    description: 'Heat-resistant borosilicate glass with stainless mesh filter.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'COSORI Pour Over', isPrimary: true }],
    brand: BRANDS.generic,
    category: CATEGORIES['coffee-makers'],
    materialSummary: 'Borosilicate glass, stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass and stainless steel', rationale: 'Glass and stainless steel are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'carafe', role: 'body', roleLabel: 'Carafe', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cosori-pourover-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0821DTMGT'), price: 30, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - KETTLES
  // ============================================================

  {
    id: 'fellow-stagg-matte-black',
    name: 'Fellow Stagg EKG Matte Black Kettle',
    slug: 'fellow-stagg-matte-black',
    description: 'Designer electric gooseneck kettle with variable temperature.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Fellow Stagg Matte Black', isPrimary: true }],
    brand: BRANDS.fellow,
    category: CATEGORIES['kettles'],
    materialSummary: '304 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel kettles', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle', material: { id: 'stainless-steel', name: '304 Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fellow-matte-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0DS48J4XB'), price: 150, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'fellow-stagg-stovetop',
    name: 'Fellow Stagg Stovetop Pour-Over Kettle',
    slug: 'fellow-stagg-stovetop',
    description: 'Non-electric gooseneck kettle for precision pour-over brewing.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Fellow Stagg Stovetop', isPrimary: true }],
    brand: BRANDS.fellow,
    category: CATEGORIES['kettles'],
    materialSummary: '304 stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel kettles', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle', material: { id: 'stainless-steel', name: '304 Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'fellow-stovetop-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B014UN7B7C'), price: 90, currency: 'USD', inStock: true }],
    features: { inductionCompatible: true, dishwasherSafe: false },
  },

  {
    id: 'oxo-brew-cordless-glass',
    name: 'OXO Brew Cordless Glass Electric Kettle 1.75L',
    slug: 'oxo-brew-cordless-glass',
    description: 'Large glass kettle with BPA-free plastic lid and components. LED-illuminated water window.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'OXO Brew Glass Kettle', isPrimary: true }],
    brand: BRANDS.oxo,
    category: CATEGORIES['kettles'],
    materialSummary: 'Borosilicate glass body, BPA-free plastic lid',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Glass kettles', rationale: 'Glass body is PFAS-free, but BPA-free plastic lid and components contact water. All-metal alternatives are preferred.', unknowns: ['Plastic lid contacts water'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle Body', material: { id: 'borosilicate-glass', name: 'Borosilicate Glass', slug: 'borosilicate-glass' }, pfasStatus: 'verified_free' }, { id: 'lid', role: 'lid', roleLabel: 'Lid', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'oxo-glass-kettle-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00YEYKRX8'), price: 84, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'oxo-cordless-adjustable-temp',
    name: 'OXO Cordless Adjustable Temperature Kettle',
    slug: 'oxo-cordless-adjustable-temp',
    description: 'Variable temperature electric kettle with countdown timer.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'OXO Adjustable Kettle', isPrimary: true }],
    brand: BRANDS.oxo,
    category: CATEGORIES['kettles'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel kettles', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'oxo-adjustable-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01KTRDKNW'), price: 100, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'oxo-adjustable-temp-stainless',
    name: 'OXO Adjustable Temperature Stainless Kettle',
    slug: 'oxo-adjustable-temp-stainless',
    description: 'Premium stainless steel kettle with precise temperature control.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'OXO Stainless Kettle', isPrimary: true }],
    brand: BRANDS.oxo,
    category: CATEGORIES['kettles'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel kettles', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'body', role: 'body', roleLabel: 'Kettle', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'oxo-temp-stainless-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0C4D69KL5'), price: 110, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - RICE COOKERS
  // ============================================================

  {
    id: 'tatung-tac06in-vanilla',
    name: 'Tatung TAC-06IN 6-Cup Rice Cooker Vanilla',
    slug: 'tatung-tac06in-vanilla',
    description: 'Classic Taiwanese rice cooker with stainless steel inner pot. Vanilla color.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Tatung TAC-06IN Vanilla', isPrimary: true }],
    brand: BRANDS.tatung,
    category: CATEGORIES['rice-cookers'],
    materialSummary: 'Stainless steel inner pot',
    coatingSummary: 'None - uncoated stainless',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel models', rationale: 'Stainless steel pot has no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'pot', role: 'body', roleLabel: 'Inner Pot', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tatung-vanilla-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CRCDN69B'), price: 140, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'tatung-tac11kn-11cup',
    name: 'Tatung TAC-11KN 11-Cup Rice Cooker',
    slug: 'tatung-tac11kn-11cup',
    description: 'Large capacity Taiwanese rice cooker. Stainless steel pot for family meals.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Tatung TAC-11KN 11-Cup', isPrimary: true }],
    brand: BRANDS.tatung,
    category: CATEGORIES['rice-cookers'],
    materialSummary: 'Stainless steel inner pot',
    coatingSummary: 'None - uncoated stainless',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All stainless steel models', rationale: 'Stainless steel pot has no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'pot', role: 'body', roleLabel: 'Inner Pot', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'tatung-11cup-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B004FWL3UA'), price: 180, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - SLOW COOKERS
  // ============================================================

  {
    id: 'greenlife-6qt-ceramic-slowcooker',
    name: 'GreenLife 6 Qt Ceramic PFAS-Free Slow Cooker',
    slug: 'greenlife-6qt-ceramic-slowcooker',
    description: 'Ceramic slow cooker pot with PFAS-free coating. Programmable timer.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'GreenLife Slow Cooker', isPrimary: true }],
    brand: BRANDS.greenlife,
    category: CATEGORIES['slow-cookers'],
    materialSummary: 'Ceramic pot',
    coatingSummary: 'Ceramic coating',
    verification: { tier: 3 as VerificationTier, claimType: 'intentionally_pfas_free', scopeText: 'All GreenLife products', rationale: 'GreenLife ceramic coating verified PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 3, decisionDate: '2026-02-16' },
    components: [{ id: 'pot', role: 'body', roleLabel: 'Pot', material: { id: 'ceramic', name: 'Ceramic', slug: 'ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'greenlife-slowcooker-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B098KHCKXP'), price: 70, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - TOASTER OVENS
  // ============================================================

  {
    id: 'breville-smart-oven-pro',
    name: 'Breville Smart Oven Pro',
    slug: 'breville-smart-oven-pro',
    description: 'Countertop convection oven with Element IQ. Stainless steel interior.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Breville Smart Oven Pro', isPrimary: true }],
    brand: BRANDS.breville,
    category: CATEGORIES['toaster-ovens'],
    materialSummary: 'Stainless steel interior',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel ovens', rationale: 'Stainless steel interior has no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'interior', role: 'body', roleLabel: 'Interior', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'breville-smart-oven-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00XBOXVIA'), price: 270, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'breville-compact-convection',
    name: 'Breville Compact Smart Oven Convection',
    slug: 'breville-compact-convection',
    description: 'Space-saving countertop oven. 8 cooking functions.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Breville Compact Oven', isPrimary: true }],
    brand: BRANDS.breville,
    category: CATEGORIES['toaster-ovens'],
    materialSummary: 'Stainless steel interior',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel ovens', rationale: 'Stainless steel interior has no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'interior', role: 'body', roleLabel: 'Interior', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'breville-compact-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B08DDJ9GG4'), price: 180, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - ESPRESSO
  // ============================================================

  {
    id: 'breville-barista-express-impress',
    name: 'Breville Barista Express Impress',
    slug: 'breville-barista-express-impress',
    description: 'Advanced semi-automatic with assisted tamping. Integrated grinder.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Breville Barista Express Impress', isPrimary: true }],
    brand: BRANDS.breville,
    category: CATEGORIES['espresso-machines'],
    materialSummary: 'Stainless steel boiler and portafilter',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All espresso machines', rationale: 'Stainless steel components with no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'boiler', role: 'body', roleLabel: 'Boiler', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'breville-impress-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CGKDZGC7'), price: 750, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'breville-bambino-plus',
    name: 'Breville Bambino Plus Espresso Machine',
    slug: 'breville-bambino-plus',
    description: 'Compact automatic espresso with 3-second heat-up. Auto milk texturing.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Breville Bambino Plus', isPrimary: true }],
    brand: BRANDS.breville,
    category: CATEGORIES['espresso-machines'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All espresso machines', rationale: 'Stainless steel components with no coatings.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'boiler', role: 'body', roleLabel: 'Boiler', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'breville-bambino-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B09WVSKNJJ'), price: 400, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - INDUCTION
  // ============================================================

  {
    id: 'duxtop-8100mc-portable',
    name: 'Duxtop 8100MC Portable Induction Cooktop',
    slug: 'duxtop-8100mc-portable',
    description: 'Compact 1800W portable induction. Easy touch controls.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Duxtop 8100MC', isPrimary: true }],
    brand: BRANDS.duxtop,
    category: CATEGORIES['induction-cooktops'],
    materialSummary: 'Glass ceramic surface',
    coatingSummary: 'None - glass ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All induction cooktops', rationale: 'Glass ceramic surfaces are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', material: { id: 'glass-ceramic', name: 'Glass Ceramic', slug: 'glass-ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'duxtop-8100mc-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0045QEPYM'), price: 80, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  {
    id: 'duxtop-9600ls-1800w',
    name: 'Duxtop 9600LS 1800W Induction Cooktop',
    slug: 'duxtop-9600ls-1800w',
    description: 'Professional induction with sensor touch. 20 power levels.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Duxtop 9600LS', isPrimary: true }],
    brand: BRANDS.duxtop,
    category: CATEGORIES['induction-cooktops'],
    materialSummary: 'Glass ceramic surface',
    coatingSummary: 'None - glass ceramic',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'All induction cooktops', rationale: 'Glass ceramic surfaces are inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'surface', role: 'cooking_surface', roleLabel: 'Cooking Surface', material: { id: 'glass-ceramic', name: 'Glass Ceramic', slug: 'glass-ceramic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'duxtop-9600ls-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01FLR0ET8'), price: 100, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: false },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - FOOD PROCESSORS
  // ============================================================

  {
    id: 'cuisinart-fp8gm-elemental',
    name: 'Cuisinart FP-8GM Elemental 8-Cup Food Processor',
    slug: 'cuisinart-fp8gm-elemental',
    description: 'Compact food processor with BPA-free work bowl. Stainless steel blades.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Cuisinart FP-8GM', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['food-processors'],
    materialSummary: 'BPA-free plastic bowl, stainless blades',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Food processors', rationale: 'BPA-free plastic is PFAS-free, but plastic work bowl contacts food during processing. Glass or stainless steel alternatives are preferred.', unknowns: ['Plastic work bowl contacts food during processing'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'blades', role: 'other', roleLabel: 'Blades', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }, { id: 'bowl', role: 'body', roleLabel: 'Work Bowl', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-fp8-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00MVWGFP4'), price: 100, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'cuisinart-dfp14bcny-brushed',
    name: 'Cuisinart DFP-14BCNY Brushed Stainless Food Processor',
    slug: 'cuisinart-dfp14bcny-brushed',
    description: '14-cup capacity food processor. Brushed stainless steel finish.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Cuisinart DFP-14BCNY', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['food-processors'],
    materialSummary: 'BPA-free plastic bowl, stainless blades',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Food processors', rationale: 'BPA-free plastic is PFAS-free, but plastic work bowl contacts food during processing. Glass or stainless steel alternatives are preferred.', unknowns: ['Plastic work bowl contacts food during processing'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'blades', role: 'other', roleLabel: 'Blades', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }, { id: 'bowl', role: 'body', roleLabel: 'Work Bowl', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-dfp14-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01AXM4WV2'), price: 200, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'cuisinart-dfp14nwbct-workbowl',
    name: 'Cuisinart DFP-14NWBCT 14-Cup Work Bowl',
    slug: 'cuisinart-dfp14nwbct-workbowl',
    description: 'Replacement work bowl for 14-cup food processors. BPA-free.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'Cuisinart Work Bowl', isPrimary: true }],
    brand: BRANDS.cuisinart,
    category: CATEGORIES['food-processors'],
    materialSummary: 'BPA-free plastic',
    coatingSummary: 'None',
    verification: { tier: 3 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Food processor accessories', rationale: 'BPA-free plastic is PFAS-free, but plastic bowl directly contacts food. Glass or stainless steel alternatives are preferred.', unknowns: ['Plastic bowl contacts food during processing'], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bowl', role: 'body', roleLabel: 'Bowl', material: { id: 'bpa-free-plastic', name: 'BPA-Free Plastic', slug: 'bpa-free-plastic' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'cuisinart-workbowl-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B01MY98RZS'), price: 50, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  // ============================================================
  // ADDITIONAL APPLIANCES - STAND MIXERS
  // ============================================================

  {
    id: 'kitchenaid-ka7qbowl-7qt',
    name: 'KitchenAid KA7QBOWL 7-Qt Stainless Steel Bowl',
    slug: 'kitchenaid-ka7qbowl-7qt',
    description: 'Replacement stainless steel bowl for 7-quart stand mixers.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'KitchenAid 7-Qt Bowl', isPrimary: true }],
    brand: BRANDS.kitchenaid,
    category: CATEGORIES['stand-mixers'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel accessories', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bowl', role: 'body', roleLabel: 'Bowl', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kitchenaid-7qt-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B00IO2OGLK'), price: 80, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'kitchenaid-7qt-bowl-lid',
    name: 'KitchenAid 7-Qt Bowl with Lid',
    slug: 'kitchenaid-7qt-bowl-lid',
    description: 'Stainless steel mixing bowl with lid for storage.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'KitchenAid Bowl with Lid', isPrimary: true }],
    brand: BRANDS.kitchenaid,
    category: CATEGORIES['stand-mixers'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel accessories', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bowl', role: 'body', roleLabel: 'Bowl', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kitchenaid-lid-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0D475VTZJ'), price: 60, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
  },

  {
    id: 'kitchenaid-stainless-mixing-bowls',
    name: 'KitchenAid Stainless Steel Mixing Bowls Set',
    slug: 'kitchenaid-stainless-mixing-bowls',
    description: 'Set of stainless steel mixing bowls. Nested for compact storage.',
    imageUrl: '/placeholders/products/container-placeholder.svg',
    images: [{ url: '/placeholders/products/container-placeholder.svg', alt: 'KitchenAid Mixing Bowls', isPrimary: true }],
    brand: BRANDS.kitchenaid,
    category: CATEGORIES['stand-mixers'],
    materialSummary: 'Stainless steel',
    coatingSummary: 'None',
    verification: { tier: 4 as VerificationTier, claimType: 'inherently_pfas_free', scopeText: 'Stainless steel products', rationale: 'Stainless steel is inherently PFAS-free.', unknowns: [], hasEvidence: true, evidenceCount: 2, decisionDate: '2026-02-16' },
    components: [{ id: 'bowl', role: 'body', roleLabel: 'Bowls', material: { id: 'stainless-steel', name: 'Stainless Steel', slug: 'stainless-steel' }, pfasStatus: 'verified_free' }],
    retailers: [{ id: 'kitchenaid-mixing-amazon', retailer: RETAILERS.amazon, url: generateAmazonLink('B0CZ129K8L'), price: 70, currency: 'USD', inStock: true }],
    features: { dishwasherSafe: true },
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
