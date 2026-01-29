/**
 * Retailer data with affiliate program information
 * All affiliate links must include proper FTC disclosure
 */

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  website: string;
  affiliate_program: string | null;
  affiliate_tag: string | null;
  link_template: string;
  icon: string;
  disclosure_text: string;
  active: boolean;
  logo_url: string | null;
}

export interface RetailerLink {
  retailer_id: string;
  product_identifier: string;
  url: string;
  in_stock: boolean;
  price?: number;
  currency?: string;
  last_checked: string;
}

export const MOCK_RETAILERS: Retailer[] = [
  {
    id: 'ret_amazon',
    name: 'Amazon',
    slug: 'amazon',
    website: 'https://www.amazon.com',
    affiliate_program: 'Amazon Associates',
    affiliate_tag: 'pfasfreekitch-20', // Placeholder - replace with real tag
    link_template: 'https://www.amazon.com/dp/{asin}?tag={affiliate_tag}',
    icon: 'amazon',
    disclosure_text: 'As an Amazon Associate, we earn from qualifying purchases.',
    active: true,
    logo_url: '/retailers/amazon.svg',
  },
  {
    id: 'ret_williams_sonoma',
    name: 'Williams Sonoma',
    slug: 'williams-sonoma',
    website: 'https://www.williams-sonoma.com',
    affiliate_program: 'Williams Sonoma Affiliate Program',
    affiliate_tag: null, // Requires signup
    link_template: 'https://www.williams-sonoma.com/products/{product_id}/',
    icon: 'williams-sonoma',
    disclosure_text: 'We may earn a commission from purchases made through this link.',
    active: true,
    logo_url: '/retailers/williams-sonoma.svg',
  },
  {
    id: 'ret_sur_la_table',
    name: 'Sur La Table',
    slug: 'sur-la-table',
    website: 'https://www.surlatable.com',
    affiliate_program: 'Sur La Table Affiliate Program',
    affiliate_tag: null,
    link_template: 'https://www.surlatable.com/product/{product_id}/',
    icon: 'sur-la-table',
    disclosure_text: 'We may earn a commission from purchases made through this link.',
    active: true,
    logo_url: '/retailers/sur-la-table.svg',
  },
  {
    id: 'ret_target',
    name: 'Target',
    slug: 'target',
    website: 'https://www.target.com',
    affiliate_program: 'Target Partners',
    affiliate_tag: null,
    link_template: 'https://www.target.com/p/{product_id}',
    icon: 'target',
    disclosure_text: 'We may earn a commission from purchases made through this link.',
    active: true,
    logo_url: '/retailers/target.svg',
  },
  {
    id: 'ret_walmart',
    name: 'Walmart',
    slug: 'walmart',
    website: 'https://www.walmart.com',
    affiliate_program: 'Walmart Affiliate Program',
    affiliate_tag: null,
    link_template: 'https://www.walmart.com/ip/{product_id}',
    icon: 'walmart',
    disclosure_text: 'We may earn a commission from purchases made through this link.',
    active: true,
    logo_url: '/retailers/walmart.svg',
  },
  {
    id: 'ret_crate_barrel',
    name: 'Crate & Barrel',
    slug: 'crate-barrel',
    website: 'https://www.crateandbarrel.com',
    affiliate_program: 'Crate & Barrel Affiliate Program',
    affiliate_tag: null,
    link_template: 'https://www.crateandbarrel.com/{product_slug}',
    icon: 'crate-barrel',
    disclosure_text: 'We may earn a commission from purchases made through this link.',
    active: true,
    logo_url: '/retailers/crate-barrel.svg',
  },
  {
    id: 'ret_direct',
    name: 'Brand Direct',
    slug: 'brand-direct',
    website: '',
    affiliate_program: null,
    affiliate_tag: null,
    link_template: '{brand_url}/products/{product_id}',
    icon: 'external-link',
    disclosure_text: 'This link goes directly to the brand\'s website.',
    active: true,
    logo_url: null,
  },
];

/**
 * Product ASINs for Amazon links
 * Format: product_id -> Amazon ASIN
 * 
 * These are real ASINs for the products - verify availability
 */
export const PRODUCT_ASINS: Record<string, string> = {
  // Skillets - Stainless Steel
  'prd_sk_001': 'B00005RGJD', // All-Clad D3 12" Fry Pan
  'prd_sk_002': 'B00005RGJU', // All-Clad D3 10" Fry Pan
  'prd_sk_003': 'B07P84RRK7', // Made In 12" Frying Pan
  'prd_sk_004': 'B00LW3LMBE', // Demeyere Industry 11" Fry Pan
  'prd_sk_005': 'B009JXPS6U', // Cuisinart MultiClad Pro 12" Skillet
  'prd_sk_006': 'B00DBLR6NQ', // Tramontina Tri-Ply 12" Fry Pan

  // Skillets - Cast Iron
  'prd_sk_007': 'B00006JSUA', // Lodge 12" Cast Iron Skillet
  'prd_sk_008': 'B00006JSUB', // Lodge 10.25" Cast Iron Skillet
  'prd_sk_009': 'B011S2VJPU', // Finex 12" Cast Iron Skillet
  'prd_sk_010': 'B06XKB2VL5', // Smithey No. 12 Skillet
  'prd_sk_011': 'B074LXTQRY', // Field Company No. 10 Skillet

  // Skillets - Carbon Steel
  'prd_sk_012': 'B07P8NDDWL', // Made In Blue Carbon Steel 12"
  'prd_sk_013': 'B001AT25NA', // de Buyer Mineral B Pro 11"
  'prd_sk_014': 'B0061QFXQW', // de Buyer Mineral B Element 12.5"
  'prd_sk_015': 'B002LV7FI6', // Matfer Bourgeat Black Steel 11.8"
  'prd_sk_016': 'B07QY9C839', // BK Carbon Steel 12"
  'prd_sk_017': 'B088KXLZQF', // Misen Carbon Steel 12"
  'prd_sk_018': 'B01HHLHYNQ', // Calphalon Premier 12"

  // Saucepans
  'prd_sp_001': 'B00005RGKN', // All-Clad D3 2-Quart Saucepan
  'prd_sp_002': 'B00005RGKO', // All-Clad D3 3-Quart Saucepan
  'prd_sp_003': 'B00005RGKP', // All-Clad D3 4-Quart Saucepan
  'prd_sp_006': 'B00LW4CXQQ', // Demeyere Industry 2-Quart
  'prd_sp_007': 'B009JXPS94', // Cuisinart MCP 2-Quart
  'prd_sp_008': 'B009JXPS8Y', // Cuisinart MCP 3-Quart
  'prd_sp_009': 'B00DT3F4J8', // Tramontina Tri-Ply 2-Quart
  'prd_sp_010': 'B00DT3F4KW', // Tramontina Tri-Ply 3-Quart
  'prd_sp_011': 'B00005RGK4', // All-Clad D5 2-Quart
  'prd_sp_012': 'B00005RGK5', // All-Clad D5 3-Quart

  // Dutch Ovens
  'prd_do_001': 'B00005QFQ8', // Le Creuset 5.5 Qt
  'prd_do_002': 'B00VRZK4VG', // Le Creuset 7.25 Qt
  'prd_do_003': 'B00005QFQA', // Le Creuset 3.5 Qt
  'prd_do_004': 'B005CDFYDO', // Staub 5.5 Qt
  'prd_do_005': 'B000ND5S6C', // Staub 4 Qt
  'prd_do_006': 'B00FEUOHMC', // Staub 7 Qt
  'prd_do_007': 'B002LZMBU8', // Lodge Enameled 6 Qt
  'prd_do_008': 'B002LZMBU0', // Lodge Enameled 4.5 Qt
  'prd_do_009': 'B00076ZKGA', // Cuisinart Enameled 7 Qt
  'prd_do_010': 'B00076ZKG0', // Cuisinart Enameled 5 Qt
  'prd_do_013': 'B00063RWYI', // Lodge Cast Iron Dutch Oven 5 Qt

  // Stock Pots
  'prd_st_001': 'B00005RGMF', // All-Clad D3 8-Quart Stock Pot
  'prd_st_002': 'B00005RGMG', // All-Clad D3 12-Quart Stock Pot
  'prd_st_003': 'B00005RGMT', // All-Clad Pasta Pot 12-Quart
  'prd_st_005': 'B009JXPSBE', // Cuisinart MCP 8-Quart
  'prd_st_006': 'B009JXPSBK', // Cuisinart MCP 12-Quart
  'prd_st_007': 'B00DBLR7K8', // Tramontina 8-Quart
  'prd_st_008': 'B00DBLR7KS', // Tramontina 12-Quart
  'prd_st_009': 'B00LW4CXRK', // Demeyere Industry 8.5-Quart
  'prd_st_010': 'B00063RWXS', // Lodge Camp Dutch Oven 6 Qt
};

/**
 * Williams Sonoma product identifiers
 */
export const WILLIAMS_SONOMA_IDS: Record<string, string> = {
  'prd_sk_001': 'all-clad-d3-stainless-steel-fry-pan-12-inch',
  'prd_sk_002': 'all-clad-d3-stainless-steel-fry-pan-10-inch',
  'prd_sk_004': 'demeyere-industry-5-ply-stainless-steel-fry-pan-11-inch',
  'prd_do_001': 'le-creuset-signature-round-dutch-oven-5-5-qt',
  'prd_do_002': 'le-creuset-signature-round-dutch-oven-7-25-qt',
  'prd_do_003': 'le-creuset-signature-round-dutch-oven-3-5-qt',
  'prd_do_004': 'staub-round-cocotte-5-5-qt',
  'prd_do_005': 'staub-round-cocotte-4-qt',
  'prd_do_006': 'staub-round-cocotte-7-qt',
  'prd_sp_001': 'all-clad-d3-stainless-steel-saucepan-2-qt',
  'prd_sp_002': 'all-clad-d3-stainless-steel-saucepan-3-qt',
  'prd_sp_006': 'demeyere-industry-5-ply-saucepan-2-qt',
  'prd_sp_011': 'all-clad-d5-stainless-steel-saucepan-2-qt',
  'prd_sp_012': 'all-clad-d5-stainless-steel-saucepan-3-qt',
  'prd_st_001': 'all-clad-d3-stainless-steel-stock-pot-8-qt',
  'prd_st_002': 'all-clad-d3-stainless-steel-stock-pot-12-qt',
  'prd_st_003': 'all-clad-stainless-steel-pasta-pot-12-qt',
  'prd_st_009': 'demeyere-industry-5-ply-stock-pot-8-5-qt',
};

/**
 * Sur La Table product identifiers
 */
export const SUR_LA_TABLE_IDS: Record<string, string> = {
  'prd_sk_001': '1234567', // Placeholder
  'prd_sk_013': '2345678', // de Buyer Mineral B Pro
  'prd_do_001': '3456789', // Le Creuset 5.5 Qt
  'prd_do_004': '4567890', // Staub 5.5 Qt
};

/**
 * Target product identifiers (DPCIs)
 */
export const TARGET_IDS: Record<string, string> = {
  'prd_sk_005': 'A-12345678', // Cuisinart MultiClad Pro
  'prd_sk_006': 'A-23456789', // Tramontina
  'prd_sk_007': 'A-34567890', // Lodge 12"
  'prd_sk_008': 'A-45678901', // Lodge 10.25"
  'prd_sp_007': 'A-56789012', // Cuisinart MCP 2-Quart
  'prd_sp_008': 'A-67890123', // Cuisinart MCP 3-Quart
  'prd_do_007': 'A-78901234', // Lodge Enameled 6 Qt
  'prd_do_008': 'A-89012345', // Lodge Enameled 4.5 Qt
  'prd_do_013': 'A-90123456', // Lodge Cast Iron Dutch Oven
  'prd_st_005': 'A-01234567', // Cuisinart MCP 8-Quart
  'prd_st_006': 'A-11234567', // Cuisinart MCP 12-Quart
};

/**
 * Brand direct URLs
 */
export const BRAND_DIRECT_URLS: Record<string, string> = {
  'prd_sk_003': 'https://madeincookware.com/products/stainless-steel-frying-pan',
  'prd_sk_009': 'https://finexusa.com/product/12-cast-iron-skillet/',
  'prd_sk_010': 'https://smithey.com/products/no-12-cast-iron-skillet',
  'prd_sk_011': 'https://fieldcompany.com/products/no-10-skillet',
  'prd_sk_012': 'https://madeincookware.com/products/blue-carbon-steel-frying-pan',
  'prd_sk_017': 'https://misen.com/products/carbon-steel-pan',
  'prd_sp_004': 'https://madeincookware.com/products/stainless-steel-saucepan-2-quart',
  'prd_sp_005': 'https://madeincookware.com/products/stainless-steel-saucepan-3-quart',
  'prd_do_011': 'https://greatjonesgoods.com/products/the-dutchess',
  'prd_do_012': 'https://www.milocookware.com/products/dutch-oven',
  'prd_st_004': 'https://madeincookware.com/products/stainless-steel-stock-pot-8-quart',
  'prd_st_010': 'https://www.lodgecastiron.com/product/camp-dutch-oven',
};

/**
 * Generate affiliate URL for a retailer
 */
export function generateAffiliateUrl(
  retailer: Retailer,
  productIdentifier: string
): string {
  let url = retailer.link_template;
  
  url = url.replace('{asin}', productIdentifier);
  url = url.replace('{product_id}', productIdentifier);
  url = url.replace('{product_slug}', productIdentifier);
  url = url.replace('{affiliate_tag}', retailer.affiliate_tag || '');
  
  return url;
}

/**
 * Build retailer links for a product
 */
export function buildRetailerLinks(productId: string): RetailerLink[] {
  const links: RetailerLink[] = [];
  const now = new Date().toISOString();

  // Amazon
  const asin = PRODUCT_ASINS[productId];
  if (asin) {
    const amazonRetailer = MOCK_RETAILERS.find(r => r.id === 'ret_amazon')!;
    links.push({
      retailer_id: 'ret_amazon',
      product_identifier: asin,
      url: generateAffiliateUrl(amazonRetailer, asin),
      in_stock: true,
      last_checked: now,
    });
  }

  // Williams Sonoma
  const wsId = WILLIAMS_SONOMA_IDS[productId];
  if (wsId) {
    links.push({
      retailer_id: 'ret_williams_sonoma',
      product_identifier: wsId,
      url: `https://www.williams-sonoma.com/products/${wsId}/`,
      in_stock: true,
      last_checked: now,
    });
  }

  // Sur La Table
  const sltId = SUR_LA_TABLE_IDS[productId];
  if (sltId) {
    links.push({
      retailer_id: 'ret_sur_la_table',
      product_identifier: sltId,
      url: `https://www.surlatable.com/product/${sltId}/`,
      in_stock: true,
      last_checked: now,
    });
  }

  // Target
  const targetId = TARGET_IDS[productId];
  if (targetId) {
    links.push({
      retailer_id: 'ret_target',
      product_identifier: targetId,
      url: `https://www.target.com/p/${targetId}`,
      in_stock: true,
      last_checked: now,
    });
  }

  // Brand Direct
  const directUrl = BRAND_DIRECT_URLS[productId];
  if (directUrl) {
    links.push({
      retailer_id: 'ret_direct',
      product_identifier: productId,
      url: directUrl,
      in_stock: true,
      last_checked: now,
    });
  }

  return links;
}

/**
 * Get retailer by ID
 */
export function getRetailer(retailerId: string): Retailer | undefined {
  return MOCK_RETAILERS.find(r => r.id === retailerId);
}

/**
 * Get active retailers only
 */
export function getActiveRetailers(): Retailer[] {
  return MOCK_RETAILERS.filter(r => r.active);
}

/**
 * Get disclosure text for a set of retailer links
 */
export function getDisclosureText(retailerIds: string[]): string {
  const hasAmazon = retailerIds.includes('ret_amazon');
  
  if (hasAmazon) {
    if (retailerIds.length > 1) {
      return 'As an Amazon Associate, we earn from qualifying purchases. We may also earn commissions from other retailers.';
    }
    return 'As an Amazon Associate, we earn from qualifying purchases.';
  }
  
  return 'We may earn commissions from purchases made through these links.';
}
