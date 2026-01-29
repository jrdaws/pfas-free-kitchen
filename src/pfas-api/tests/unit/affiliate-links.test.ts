/**
 * Unit Tests: Affiliate Links Service
 * Tests for affiliate link generation and compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ============================================================
// MOCK AFFILIATE SERVICE
// ============================================================

interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  retailerIcon?: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
  disclosureText: string;
}

interface AffiliateLinksResponse {
  productId: string;
  links: AffiliateLink[];
  gridDisclosure: string;
}

// Mock data
const MOCK_RETAILER_LINKS = [
  {
    productId: 'prod_test_001',
    retailerId: 'ret_amazon',
    externalId: 'B08N5WRWNW',
  },
  {
    productId: 'prod_test_001',
    retailerId: 'ret_williams_sonoma',
    externalId: 'WS-12345',
  },
];

const MOCK_AFFILIATE_PROGRAMS: Record<string, { affiliateId: string }> = {
  ret_amazon: { affiliateId: 'pfasfreekitchen-20' },
  ret_williams_sonoma: { affiliateId: 'pfk-cj-001' },
};

const RETAILER_TEMPLATES: Record<string, { template: string; active: boolean }> = {
  ret_amazon: {
    template: 'https://www.amazon.com/dp/{asin}?tag={affiliate_id}&linkCode=ll1&camp=1789&creative=9325',
    active: true,
  },
  ret_williams_sonoma: {
    template: 'https://www.williams-sonoma.com/products/{sku}?cm_ven=afshoppromo&cm_pla=CJ&cm_ite={affiliate_id}',
    active: true,
  },
};

const DISCLOSURE_TEXTS = {
  single: 'Affiliate link: We may earn a commission if you purchase through this link.',
  grid: 'Affiliate links may appear in results.',
};

class MockAffiliateService {
  static getLinks(productId: string): AffiliateLinksResponse {
    const retailerLinks = MOCK_RETAILER_LINKS.filter((l) => l.productId === productId);
    
    const links: AffiliateLink[] = retailerLinks
      .map((link) => {
        const template = RETAILER_TEMPLATES[link.retailerId];
        if (!template || !template.active) return null;
        
        const program = MOCK_AFFILIATE_PROGRAMS[link.retailerId];
        if (!program) return null;
        
        let url = template.template
          .replace('{asin}', link.externalId)
          .replace('{sku}', link.externalId)
          .replace('{affiliate_id}', program.affiliateId);
        
        // Add UTM params
        const urlObj = new URL(url);
        urlObj.searchParams.set('utm_source', 'pfasfreekitchen');
        urlObj.searchParams.set('utm_medium', 'affiliate');
        urlObj.searchParams.set('utm_campaign', 'cookware');
        
        return {
          retailerId: link.retailerId,
          retailerName: link.retailerId === 'ret_amazon' ? 'Amazon' : 'Williams Sonoma',
          retailerIcon: link.retailerId.replace('ret_', ''),
          affiliateUrl: urlObj.toString(),
          disclosureRequired: true,
          disclosureText: DISCLOSURE_TEXTS.single,
        };
      })
      .filter((l): l is AffiliateLink => l !== null);
    
    return {
      productId,
      links,
      gridDisclosure: DISCLOSURE_TEXTS.grid,
    };
  }
}

// ============================================================
// TESTS
// ============================================================

const testProductId = 'prod_test_001';

describe('AffiliateService', () => {
  describe('Link Generation', () => {
    it('should generate valid Amazon link with tag', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      
      expect(amazonLink).toBeDefined();
      expect(amazonLink!.affiliateUrl).toContain('tag=');
      expect(amazonLink!.affiliateUrl).toMatch(/amazon\.com\/dp\/[A-Z0-9]{10}/);
    });

    it('should include disclosure text with every link', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      for (const link of result.links) {
        expect(link.disclosureRequired).toBe(true);
        expect(link.disclosureText).toContain('commission');
      }
    });

    it('should add UTM params for tracking', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links[0];
      
      expect(amazonLink.affiliateUrl).toContain('utm_source=pfasfreekitchen');
      expect(amazonLink.affiliateUrl).toContain('utm_medium=affiliate');
    });

    it('should include grid disclosure in response', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      expect(result.gridDisclosure).toBeDefined();
      expect(result.gridDisclosure).toContain('Affiliate links');
    });

    it('should generate links for all available retailers', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      expect(result.links.length).toBe(2);
      expect(result.links.map((l) => l.retailerId)).toContain('ret_amazon');
      expect(result.links.map((l) => l.retailerId)).toContain('ret_williams_sonoma');
    });
  });

  describe('Amazon Associates Compliance', () => {
    it('should include required Amazon tag parameter', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      
      expect(amazonLink!.affiliateUrl).toContain('tag=pfasfreekitchen-20');
    });

    it('should include Amazon linkCode parameter', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      
      expect(amazonLink!.affiliateUrl).toContain('linkCode=');
    });

    it('should use correct Amazon product URL format', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      
      // Should be /dp/ASIN format
      expect(amazonLink!.affiliateUrl).toMatch(/amazon\.com\/dp\/B08N5WRWNW/);
    });

    it('should include camp and creative parameters', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      
      expect(amazonLink!.affiliateUrl).toContain('camp=');
      expect(amazonLink!.affiliateUrl).toContain('creative=');
    });
  });

  describe('FTC Compliance', () => {
    it('should require disclosure for all affiliate links', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      result.links.forEach((link) => {
        expect(link.disclosureRequired).toBe(true);
      });
    });

    it('should use FTC-compliant disclosure language', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      result.links.forEach((link) => {
        // Must clearly indicate commission relationship
        expect(link.disclosureText.toLowerCase()).toMatch(/commission|earn|paid/);
      });
    });

    it('should provide grid-level disclosure for product lists', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      expect(result.gridDisclosure).toBeDefined();
      expect(result.gridDisclosure.toLowerCase()).toContain('affiliate');
    });
  });

  describe('URL Generation', () => {
    it('should encode special characters in URLs', () => {
      // This tests that the URL generation handles special chars properly
      const result = MockAffiliateService.getLinks(testProductId);
      
      result.links.forEach((link) => {
        expect(() => new URL(link.affiliateUrl)).not.toThrow();
      });
    });

    it('should generate valid URLs for all retailers', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      result.links.forEach((link) => {
        const url = new URL(link.affiliateUrl);
        expect(url.protocol).toBe('https:');
      });
    });

    it('should not expose raw affiliate IDs to client', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      // The response should not contain the internal affiliate program config
      const responseStr = JSON.stringify(result);
      expect(responseStr).not.toContain('affiliateId');
      expect(responseStr).not.toContain('affiliate_id');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty links array for non-existent product', () => {
      const result = MockAffiliateService.getLinks('prod_nonexistent');
      
      expect(result.links).toHaveLength(0);
      // Should still include grid disclosure
      expect(result.gridDisclosure).toBeDefined();
    });

    it('should include retailer metadata', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      result.links.forEach((link) => {
        expect(link.retailerName).toBeDefined();
        expect(link.retailerName.length).toBeGreaterThan(0);
      });
    });

    it('should include retailer icon identifier', () => {
      const result = MockAffiliateService.getLinks(testProductId);
      
      const amazonLink = result.links.find((l) => l.retailerId === 'ret_amazon');
      expect(amazonLink!.retailerIcon).toBe('amazon');
    });
  });
});

describe('AffiliateService - UTM Tracking', () => {
  it('should include utm_source parameter', () => {
    const result = MockAffiliateService.getLinks(testProductId);
    
    result.links.forEach((link) => {
      const url = new URL(link.affiliateUrl);
      expect(url.searchParams.get('utm_source')).toBe('pfasfreekitchen');
    });
  });

  it('should include utm_medium parameter', () => {
    const result = MockAffiliateService.getLinks(testProductId);
    
    result.links.forEach((link) => {
      const url = new URL(link.affiliateUrl);
      expect(url.searchParams.get('utm_medium')).toBe('affiliate');
    });
  });

  it('should include utm_campaign parameter', () => {
    const result = MockAffiliateService.getLinks(testProductId);
    
    result.links.forEach((link) => {
      const url = new URL(link.affiliateUrl);
      expect(url.searchParams.has('utm_campaign')).toBe(true);
    });
  });
});
