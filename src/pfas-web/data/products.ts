/**
 * PFAS-Free Kitchen Products Database
 *
 * Real product data with affiliate links for Amazon, CJ Affiliate, and Awin networks.
 * Uses affiliate IDs from lib/affiliate.ts
 */

import type { Product, Brand, Category, VerificationTier } from '../lib/types';
import { generateAmazonLink } from '../lib/affiliate';

// ============================================================
// BRANDS
// ============================================================

export const BRANDS: Record<string, Brand> = {
  caraway: {
    id: 'caraway',
    name: 'Caraway',
    slug: 'caraway',
    logoUrl: '/images/brands/caraway.png',
  },
  greenpan: {
    id: 'greenpan',
    name: 'GreenPan',
    slug: 'greenpan',
    logoUrl: '/images/brands/greenpan.png',
  },
  lodge: {
    id: 'lodge',
    name: 'Lodge',
    slug: 'lodge',
    logoUrl: '/images/brands/lodge.png',
  },
  madein: {
    id: 'madein',
    name: 'Made In',
    slug: 'made-in',
    logoUrl: '/images/brands/made-in.png',
  },
  xtrema: {
    id: 'xtrema',
    name: 'Xtrema Ceramics',
    slug: 'xtrema',
    logoUrl: '/images/brands/xtrema.png',
  },
  ourplace: {
    id: 'ourplace',
    name: 'Our Place',
    slug: 'our-place',
    logoUrl: '/images/brands/our-place.png',
  },
  allclad: {
    id: 'allclad',
    name: 'All-Clad',
    slug: 'all-clad',
    logoUrl: '/images/brands/all-clad.png',
  },
  lecreuset: {
    id: 'lecreuset',
    name: 'Le Creuset',
    slug: 'le-creuset',
    logoUrl: '/images/brands/le-creuset.png',
  },
  staub: {
    id: 'staub',
    name: 'Staub',
    slug: 'staub',
    logoUrl: '/images/brands/staub.png',
  },
  zwilling: {
    id: 'zwilling',
    name: 'Zwilling',
    slug: 'zwilling',
    logoUrl: '/images/brands/zwilling.png',
  },
  debuyer: {
    id: 'debuyer',
    name: 'de Buyer',
    slug: 'de-buyer',
    logoUrl: '/images/brands/de-buyer.png',
  },
  stasher: {
    id: 'stasher',
    name: 'Stasher',
    slug: 'stasher',
    logoUrl: '/images/brands/stasher.png',
  },
  oxo: {
    id: 'oxo',
    name: 'OXO',
    slug: 'oxo',
    logoUrl: '/images/brands/oxo.png',
  },
};

// ============================================================
// CATEGORIES
// ============================================================

export const CATEGORIES: Record<string, Category> = {
  'fry-pans': {
    id: 'fry-pans',
    name: 'Fry Pans & Skillets',
    slug: 'fry-pans',
    path: [
      { id: 'cookware', name: 'Cookware', slug: 'cookware' },
      { id: 'fry-pans', name: 'Fry Pans & Skillets', slug: 'fry-pans' },
    ],
  },
  'cookware-sets': {
    id: 'cookware-sets',
    name: 'Cookware Sets',
    slug: 'cookware-sets',
    path: [
      { id: 'cookware', name: 'Cookware', slug: 'cookware' },
      { id: 'cookware-sets', name: 'Cookware Sets', slug: 'cookware-sets' },
    ],
  },
  'dutch-ovens': {
    id: 'dutch-ovens',
    name: 'Dutch Ovens',
    slug: 'dutch-ovens',
    path: [
      { id: 'cookware', name: 'Cookware', slug: 'cookware' },
      { id: 'dutch-ovens', name: 'Dutch Ovens', slug: 'dutch-ovens' },
    ],
  },
  'storage': {
    id: 'storage',
    name: 'Food Storage',
    slug: 'storage',
    path: [
      { id: 'storage', name: 'Food Storage', slug: 'storage' },
    ],
  },
  'bakeware': {
    id: 'bakeware',
    name: 'Bakeware',
    slug: 'bakeware',
    path: [
      { id: 'bakeware', name: 'Bakeware', slug: 'bakeware' },
    ],
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
    imageUrl: '/images/products/caraway-fry-pan.jpg',
    images: [
      { url: '/images/products/caraway-fry-pan.jpg', alt: 'Caraway 10.5" Fry Pan', isPrimary: true },
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
    imageUrl: '/images/products/caraway-set.jpg',
    images: [
      { url: '/images/products/caraway-set.jpg', alt: 'Caraway 12-Piece Cookware Set', isPrimary: true },
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
    imageUrl: '/images/products/greenpan-valencia.jpg',
    images: [
      { url: '/images/products/greenpan-valencia.jpg', alt: 'GreenPan Valencia Pro Set', isPrimary: true },
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
    imageUrl: '/images/products/lodge-skillet.jpg',
    images: [
      { url: '/images/products/lodge-skillet.jpg', alt: 'Lodge Cast Iron Skillet', isPrimary: true },
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
    imageUrl: '/images/products/made-in-pan.jpg',
    images: [
      { url: '/images/products/made-in-pan.jpg', alt: 'Made In Stainless Steel Frying Pan', isPrimary: true },
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
    imageUrl: '/images/products/xtrema-skillet.jpg',
    images: [
      { url: '/images/products/xtrema-skillet.jpg', alt: 'Xtrema Pure Ceramic Skillet', isPrimary: true },
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
    imageUrl: '/images/products/always-pan.jpg',
    images: [
      { url: '/images/products/always-pan.jpg', alt: 'Our Place Always Pan', isPrimary: true },
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
    imageUrl: '/images/products/all-clad-d3.jpg',
    images: [
      { url: '/images/products/all-clad-d3.jpg', alt: 'All-Clad D3 Stainless Fry Pan', isPrimary: true },
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
    imageUrl: '/images/products/le-creuset-dutch.jpg',
    images: [
      { url: '/images/products/le-creuset-dutch.jpg', alt: 'Le Creuset Dutch Oven', isPrimary: true },
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
    imageUrl: '/images/products/staub-cocotte.jpg',
    images: [
      { url: '/images/products/staub-cocotte.jpg', alt: 'Staub Round Cocotte', isPrimary: true },
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
    imageUrl: '/images/products/de-buyer-mineral.jpg',
    images: [
      { url: '/images/products/de-buyer-mineral.jpg', alt: 'de Buyer Mineral B Fry Pan', isPrimary: true },
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
    imageUrl: '/images/products/stasher-bags.jpg',
    images: [
      { url: '/images/products/stasher-bags.jpg', alt: 'Stasher Silicone Bags', isPrimary: true },
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
    imageUrl: '/images/products/oxo-glass.jpg',
    images: [
      { url: '/images/products/oxo-glass.jpg', alt: 'OXO Glass Containers', isPrimary: true },
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
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
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
