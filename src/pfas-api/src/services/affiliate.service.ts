/**
 * Affiliate Service for PFAS-Free Kitchen Platform
 * Handles affiliate link generation with FTC-compliant disclosures
 */

import { createHash } from 'crypto';
import { logger } from '../config/logger.js';
import { RETAILER_TEMPLATES, DISCLOSURE_TEXTS } from '../config/link-templates.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { RetailerLinkRepository } from '../repositories/retailer-link.repository.js';
import type {
  AffiliateLinksResponse,
  AffiliateLink,
} from '../types/api.types.js';
import type {
  LinkGenerationParams,
  GeneratedLink,
  Retailer,
  RetailerLink,
} from '../types/affiliate.types.js';
import { NotFoundError } from '../errors/AppError.js';

// Mock affiliate program data (replace with database in production)
const AFFILIATE_PROGRAMS: Record<string, { affiliateId: string }> = {
  ret_amazon: { affiliateId: 'pfasfreekitchen-20' },
  ret_williams_sonoma: { affiliateId: 'pfk-cj-001' },
  ret_sur_la_table: { affiliateId: 'pfk-slt-001' },
  ret_target: { affiliateId: 'pfk-tgt-001' },
  ret_walmart: { affiliateId: 'pfk-wmt-001' },
  ret_crate_barrel: { affiliateId: 'pfk-cb-001' },
  ret_lodge: { affiliateId: 'pfk-lodge-001' },
  ret_le_creuset: { affiliateId: 'pfk-lc-001' },
};

// Mock retailer data
const RETAILERS: Record<string, Retailer> = {
  ret_amazon: {
    id: 'ret_amazon',
    name: 'Amazon',
    slug: 'amazon',
    website: 'https://www.amazon.com',
    iconName: 'amazon',
    affiliateProgramId: 'ap_amazon',
    active: true,
  },
  ret_williams_sonoma: {
    id: 'ret_williams_sonoma',
    name: 'Williams Sonoma',
    slug: 'williams-sonoma',
    website: 'https://www.williams-sonoma.com',
    iconName: 'williams-sonoma',
    affiliateProgramId: 'ap_cj',
    active: true,
  },
  ret_sur_la_table: {
    id: 'ret_sur_la_table',
    name: 'Sur La Table',
    slug: 'sur-la-table',
    website: 'https://www.surlatable.com',
    iconName: 'sur-la-table',
    active: true,
  },
  ret_target: {
    id: 'ret_target',
    name: 'Target',
    slug: 'target',
    website: 'https://www.target.com',
    iconName: 'target',
    active: true,
  },
};

export class AffiliateService {
  /**
   * Get affiliate links for a product
   */
  static async getLinks(productId: string): Promise<AffiliateLinksResponse> {
    logger.debug({ productId }, 'Generating affiliate links');

    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const retailerLinks = await RetailerLinkRepository.findByProductId(productId);
    
    const links: AffiliateLink[] = [];

    for (const link of retailerLinks) {
      const generated = await this.generateLink(product, link);
      if (generated) {
        links.push({
          retailerId: generated.retailerId,
          retailerName: generated.retailerName,
          retailerIcon: generated.retailerIcon,
          affiliateUrl: generated.affiliateUrl,
          disclosureRequired: generated.disclosureRequired,
          disclosureText: generated.disclosureText,
        });
      }
    }

    logger.info({ productId, linkCount: links.length }, 'Affiliate links generated');

    return {
      data: {
        productId,
        links,
        gridDisclosure: DISCLOSURE_TEXTS.grid,
      },
    };
  }

  /**
   * Generate a single affiliate link
   */
  private static async generateLink(
    product: { id: string; category_id?: string },
    retailerLink: RetailerLink
  ): Promise<GeneratedLink | null> {
    // Get retailer info
    const retailer = RETAILERS[retailerLink.retailerId];
    if (!retailer || !retailer.active) {
      logger.debug({ retailerId: retailerLink.retailerId }, 'Retailer not found or inactive');
      return null;
    }

    // Get link template
    const templateKey = Object.keys(RETAILER_TEMPLATES).find(
      (k) => RETAILER_TEMPLATES[k].retailerId === retailerLink.retailerId
    );
    const template = templateKey ? RETAILER_TEMPLATES[templateKey] : null;

    if (!template || !template.active) {
      logger.debug({ retailerId: retailerLink.retailerId }, 'No active template found');
      return null;
    }

    // Get affiliate program credentials
    const program = AFFILIATE_PROGRAMS[retailerLink.retailerId];
    if (!program) {
      logger.warn({ retailerId: retailerLink.retailerId }, 'No affiliate program configured');
      return null;
    }

    // Generate tracking ID
    const trackingId = this.generateTrackingId(product.id, retailer.id);

    // Build URL from template
    const url = this.buildUrl(template.template, {
      product_id: product.id,
      asin: retailerLink.externalId,
      sku: retailerLink.externalId,
      affiliate_id: program.affiliateId,
      tracking_id: trackingId,
    });

    // Add UTM params
    const finalUrl = this.addUtmParams(url, {
      source: 'pfasfreekitchen',
      medium: 'affiliate',
      campaign: product.category_id || 'general',
    });

    return {
      retailerId: retailer.id,
      retailerName: retailer.name,
      retailerIcon: retailer.iconName,
      affiliateUrl: finalUrl,
      disclosureRequired: true,
      disclosureText: DISCLOSURE_TEXTS.single,
    };
  }

  /**
   * Build URL from template with variable substitution
   */
  private static buildUrl(template: string, params: Record<string, string>): string {
    let url = template;

    // Replace placeholders with values
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url = url.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(value));
      }
    }

    // Remove any unreplaced placeholders
    url = url.replace(/\{[^}]+\}/g, '');

    // Clean up any double ampersands or trailing ampersands
    url = url.replace(/&&+/g, '&').replace(/[?&]$/g, '');

    return url;
  }

  /**
   * Add UTM parameters to URL
   */
  private static addUtmParams(url: string, utm: Record<string, string>): string {
    try {
      const urlObj = new URL(url);
      for (const [key, value] of Object.entries(utm)) {
        if (value) {
          urlObj.searchParams.set(`utm_${key}`, value);
        }
      }
      return urlObj.toString();
    } catch (error) {
      logger.warn({ url, error }, 'Failed to add UTM params');
      return url;
    }
  }

  /**
   * Generate tracking ID (short hash without PII)
   */
  private static generateTrackingId(productId: string, retailerId: string): string {
    const input = `${productId}-${retailerId}-${Date.now()}`;
    return createHash('md5').update(input).digest('hex').slice(0, 12);
  }

  /**
   * Generate affiliate URL for a specific product/retailer
   * (Public method for direct URL generation)
   */
  static async generateUrl(
    productId: string,
    retailerId: string,
    trackingId?: string
  ): Promise<string> {
    const retailerLinks = await RetailerLinkRepository.findByProductId(productId);
    const link = retailerLinks.find((l) => l.retailerId === retailerId);

    if (!link) {
      throw new NotFoundError('Retailer link', `${productId}/${retailerId}`);
    }

    const templateKey = Object.keys(RETAILER_TEMPLATES).find(
      (k) => RETAILER_TEMPLATES[k].retailerId === retailerId
    );
    const template = templateKey ? RETAILER_TEMPLATES[templateKey] : null;

    if (!template || !template.active) {
      throw new NotFoundError('Link template', retailerId);
    }

    const program = AFFILIATE_PROGRAMS[retailerId];
    if (!program) {
      throw new NotFoundError('Affiliate program', retailerId);
    }

    const url = this.buildUrl(template.template, {
      product_id: productId,
      asin: link.externalId,
      sku: link.externalId,
      affiliate_id: program.affiliateId,
      tracking_id: trackingId || this.generateTrackingId(productId, retailerId),
    });

    return url;
  }
}
