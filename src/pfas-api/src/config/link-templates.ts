/**
 * Affiliate Link Templates
 * Retailer-specific URL templates with parameter rules
 */

export interface LinkTemplateParam {
  required: boolean;
  pattern?: RegExp;
  default?: string;
}

export interface LinkTemplate {
  retailerId: string;
  name: string;
  template: string;
  paramRules: Record<string, LinkTemplateParam>;
  active: boolean;
}

/**
 * Default retailer link templates
 * These can be overridden in the database
 */
export const RETAILER_TEMPLATES: Record<string, LinkTemplate> = {
  amazon: {
    retailerId: 'ret_amazon',
    name: 'Amazon',
    template: 'https://www.amazon.com/dp/{asin}?tag={affiliate_id}&linkCode=ll1&camp=1789&creative=9325',
    paramRules: {
      asin: { required: true, pattern: /^[A-Z0-9]{10}$/ },
      affiliate_id: { required: true },
    },
    active: true,
  },
  williams_sonoma: {
    retailerId: 'ret_williams_sonoma',
    name: 'Williams Sonoma',
    template: 'https://www.williams-sonoma.com/products/{sku}?cm_ven=afshoppromo&cm_pla=CJ&cm_ite={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  sur_la_table: {
    retailerId: 'ret_sur_la_table',
    name: 'Sur La Table',
    template: 'https://www.surlatable.com/product/{sku}?affsrc={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  target: {
    retailerId: 'ret_target',
    name: 'Target',
    template: 'https://www.target.com/p/{sku}?affsrc={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  walmart: {
    retailerId: 'ret_walmart',
    name: 'Walmart',
    template: 'https://www.walmart.com/ip/{sku}?u1={tracking_id}&oid={affiliate_id}&wmlspartner=wlpa&sourceid=imp',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  bed_bath_beyond: {
    retailerId: 'ret_bed_bath',
    name: 'Bed Bath & Beyond',
    template: 'https://www.bedbathandbeyond.com/store/product/{sku}?mcid={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: false, // Inactive - company restructured
  },
  crate_barrel: {
    retailerId: 'ret_crate_barrel',
    name: 'Crate & Barrel',
    template: 'https://www.crateandbarrel.com/p/{sku}?a={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  lodge: {
    retailerId: 'ret_lodge',
    name: 'Lodge Cast Iron (Direct)',
    template: 'https://www.lodgecastiron.com/product/{sku}?ref={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
  le_creuset: {
    retailerId: 'ret_le_creuset',
    name: 'Le Creuset (Direct)',
    template: 'https://www.lecreuset.com/product/{sku}?source={affiliate_id}',
    paramRules: {
      sku: { required: true },
      affiliate_id: { required: true },
    },
    active: true,
  },
};

/**
 * FTC Disclosure texts
 */
export const DISCLOSURE_TEXTS = {
  single: 'Affiliate link: We may earn a commission if you purchase through this link.',
  grid: 'Affiliate links may appear in results.',
  modal: 'We may earn a commission if you make a purchase through this link.',
  footer: 'Some links on this site are affiliate links. We may earn a commission when you make a purchase.',
};

/**
 * Amazon-specific compliance requirements
 * Per Amazon Associates Operating Agreement
 */
export const AMAZON_COMPLIANCE = {
  tagRequired: true,
  noPriceDisplay: true,
  noReviewDisplay: true,
  buttonTextOptions: ['Buy at Amazon', 'View on Amazon', 'Check Price at Amazon'],
  requiredParams: ['tag', 'linkCode'],
};
