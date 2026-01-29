/**
 * Integration Tests: Product Lifecycle
 * Tests the complete flow from ingestion to publication
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';

// ============================================================
// TEST HELPERS AND MOCKS
// ============================================================

interface Product {
  id: string;
  name: string;
  brandName: string;
  status: 'draft' | 'pending_review' | 'under_review' | 'published' | 'rejected' | 'suspended';
  verificationTier?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Evidence {
  evidenceId: string;
  type: string;
  productId: string;
  sha256Hash: string;
}

interface VerificationDecision {
  productId: string;
  tier: number;
  claimType?: string;
  evidenceIds: string[];
  rationale: string;
  reviewerId: string;
}

interface SearchResult {
  results: Array<{ id: string; name: string; score: number }>;
  totalCount: number;
}

// In-memory stores for testing
const productStore: Map<string, Product> = new Map();
const evidenceStore: Map<string, Evidence> = new Map();
const verificationStore: Map<string, VerificationDecision> = new Map();
const searchIndex: Map<string, Product> = new Map();

let productIdCounter = 1;
let evidenceIdCounter = 1;

const testReviewerId = 'usr_reviewer_001';
const testBrandStatement = Buffer.from('Brand Statement: We confirm our products are PFAS-free');

// PFAS risk detection patterns
const AUTO_REJECT_PATTERNS = [/ptfe/i, /teflon/i, /silverstone/i];

// Reset stores before each test
function resetStores() {
  productStore.clear();
  evidenceStore.clear();
  verificationStore.clear();
  searchIndex.clear();
  productIdCounter = 1;
  evidenceIdCounter = 1;
}

// ============================================================
// MOCK SERVICES
// ============================================================

async function ingestTestProduct(params: {
  name: string;
  brand: string;
  materials?: string[];
  description?: string;
}): Promise<Product & { reason?: string }> {
  // Risk detection
  const textToCheck = `${params.name} ${params.description || ''}`;
  
  for (const pattern of AUTO_REJECT_PATTERNS) {
    if (pattern.test(textToCheck)) {
      const product: Product = {
        id: `prod_${productIdCounter++}`,
        name: params.name,
        brandName: params.brand,
        status: 'rejected',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      productStore.set(product.id, product);
      return { ...product, reason: 'Auto-reject: PFAS-related term detected' };
    }
  }
  
  // Create product in pending_review status
  const product: Product = {
    id: `prod_${productIdCounter++}`,
    name: params.name,
    brandName: params.brand,
    status: 'pending_review',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  productStore.set(product.id, product);
  return product;
}

const MockEvidenceService = {
  async upload(params: {
    file: Buffer;
    type: string;
    productId: string;
  }): Promise<Evidence> {
    const evidence: Evidence = {
      evidenceId: `ev_${evidenceIdCounter++}`,
      type: params.type,
      productId: params.productId,
      sha256Hash: `hash_${Date.now()}`,
    };
    evidenceStore.set(evidence.evidenceId, evidence);
    return evidence;
  },
};

const MockVerificationService = {
  async decide(decision: VerificationDecision): Promise<void> {
    verificationStore.set(decision.productId, decision);
    
    const product = productStore.get(decision.productId);
    if (product) {
      product.verificationTier = decision.tier;
      product.updatedAt = new Date();
    }
  },
};

const MockWorkflowService = {
  async transitionProduct(
    productId: string,
    event: { type: string },
    actorId: string
  ): Promise<void> {
    const product = productStore.get(productId);
    if (!product) throw new Error('Product not found');
    
    switch (event.type) {
      case 'APPROVE':
        product.status = 'published';
        product.updatedAt = new Date();
        // Add to search index
        searchIndex.set(productId, product);
        break;
      case 'REJECT':
        product.status = 'rejected';
        product.updatedAt = new Date();
        break;
      case 'SUSPEND':
        product.status = 'suspended';
        product.updatedAt = new Date();
        // Remove from search index
        searchIndex.delete(productId);
        break;
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  },
};

const MockProductRepository = {
  async findById(id: string): Promise<Product | null> {
    return productStore.get(id) || null;
  },
};

const MockSearchService = {
  async search(params: { q: string }): Promise<SearchResult> {
    const query = params.q.toLowerCase();
    const results: Array<{ id: string; name: string; score: number }> = [];
    
    for (const product of searchIndex.values()) {
      if (product.name.toLowerCase().includes(query)) {
        results.push({
          id: product.id,
          name: product.name,
          score: 1.0,
        });
      }
    }
    
    return { results, totalCount: results.length };
  },
};

// ============================================================
// TESTS
// ============================================================

describe('Product Lifecycle', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('Full Product Flow', () => {
    it('should ingest, enrich, review, and publish product', async () => {
      // Step 1: Ingest
      const product = await ingestTestProduct({
        name: 'Test Stainless Skillet',
        brand: 'TestBrand',
        materials: ['stainless_steel'],
      });
      expect(product.status).toBe('pending_review');
      expect(product.id).toBeDefined();

      // Step 2: Add evidence
      const evidence = await MockEvidenceService.upload({
        file: testBrandStatement,
        type: 'brand_statement',
        productId: product.id,
      });
      expect(evidence.evidenceId).toBeDefined();
      expect(evidence.productId).toBe(product.id);

      // Step 3: Make verification decision
      await MockVerificationService.decide({
        productId: product.id,
        tier: 1,
        claimType: 'A',
        evidenceIds: [evidence.evidenceId],
        rationale: 'Brand attestation received',
        reviewerId: testReviewerId,
      });

      // Verify tier was set
      const afterVerification = await MockProductRepository.findById(product.id);
      expect(afterVerification?.verificationTier).toBe(1);

      // Step 4: Publish
      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'APPROVE' },
        testReviewerId
      );

      const published = await MockProductRepository.findById(product.id);
      expect(published?.status).toBe('published');

      // Step 5: Verify in search index
      // In real system, would wait for async indexing
      const searchResults = await MockSearchService.search({ q: 'Test Stainless' });
      expect(searchResults.results.map((r) => r.id)).toContain(product.id);
    });

    it('should reject auto-reject products', async () => {
      const result = await ingestTestProduct({
        name: 'Test PTFE Pan',
        brand: 'TestBrand',
        description: 'Teflon coated',
      });

      expect(result.status).toBe('rejected');
      expect(result.reason).toContain('Auto-reject');
    });

    it('should auto-reject products with Teflon', async () => {
      const result = await ingestTestProduct({
        name: 'Nonstick Teflon Skillet',
        brand: 'TestBrand',
      });

      expect(result.status).toBe('rejected');
    });

    it('should auto-reject products with PTFE in description', async () => {
      const result = await ingestTestProduct({
        name: 'Classic Frying Pan',
        brand: 'TestBrand',
        description: 'Features a PTFE coating for easy release',
      });

      expect(result.status).toBe('rejected');
    });
  });

  describe('Evidence Association', () => {
    it('should associate evidence with product', async () => {
      const product = await ingestTestProduct({
        name: 'Cast Iron Skillet',
        brand: 'Lodge',
      });

      const evidence = await MockEvidenceService.upload({
        file: testBrandStatement,
        type: 'brand_statement',
        productId: product.id,
      });

      expect(evidence.productId).toBe(product.id);
      expect(evidenceStore.get(evidence.evidenceId)?.productId).toBe(product.id);
    });

    it('should allow multiple evidence items per product', async () => {
      const product = await ingestTestProduct({
        name: 'Stainless Set',
        brand: 'All-Clad',
      });

      const evidence1 = await MockEvidenceService.upload({
        file: testBrandStatement,
        type: 'brand_statement',
        productId: product.id,
      });

      const evidence2 = await MockEvidenceService.upload({
        file: Buffer.from('Lab Report Content'),
        type: 'lab_report',
        productId: product.id,
      });

      expect(evidence1.evidenceId).not.toBe(evidence2.evidenceId);
      expect(evidence1.productId).toBe(product.id);
      expect(evidence2.productId).toBe(product.id);
    });
  });

  describe('Verification Workflow', () => {
    it('should update product tier on verification', async () => {
      const product = await ingestTestProduct({
        name: 'Ceramic Pot',
        brand: 'GreenPan',
      });

      const evidence = await MockEvidenceService.upload({
        file: testBrandStatement,
        type: 'brand_statement',
        productId: product.id,
      });

      await MockVerificationService.decide({
        productId: product.id,
        tier: 2,
        claimType: 'B',
        evidenceIds: [evidence.evidenceId],
        rationale: 'Policy reviewed and complete component model',
        reviewerId: testReviewerId,
      });

      const updated = await MockProductRepository.findById(product.id);
      expect(updated?.verificationTier).toBe(2);
    });

    it('should store verification decision', async () => {
      const product = await ingestTestProduct({
        name: 'Glass Bakeware',
        brand: 'Pyrex',
      });

      const decision: VerificationDecision = {
        productId: product.id,
        tier: 3,
        claimType: 'C',
        evidenceIds: ['ev_lab_001'],
        rationale: 'Lab report confirms PFAS-free',
        reviewerId: testReviewerId,
      };

      await MockVerificationService.decide(decision);

      expect(verificationStore.get(product.id)).toEqual(decision);
    });
  });

  describe('Publication and Search', () => {
    it('should add product to search index on publish', async () => {
      const product = await ingestTestProduct({
        name: 'Dutch Oven',
        brand: 'Le Creuset',
      });

      // Before publish - not in search
      let results = await MockSearchService.search({ q: 'Dutch Oven' });
      expect(results.results).toHaveLength(0);

      // Publish
      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'APPROVE' },
        testReviewerId
      );

      // After publish - in search
      results = await MockSearchService.search({ q: 'Dutch Oven' });
      expect(results.results).toHaveLength(1);
      expect(results.results[0].id).toBe(product.id);
    });

    it('should remove product from search index on suspend', async () => {
      const product = await ingestTestProduct({
        name: 'Wok',
        brand: 'Joyce Chen',
      });

      // Publish
      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'APPROVE' },
        testReviewerId
      );

      // Verify in search
      let results = await MockSearchService.search({ q: 'Wok' });
      expect(results.results).toHaveLength(1);

      // Suspend
      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'SUSPEND' },
        testReviewerId
      );

      // Verify removed from search
      results = await MockSearchService.search({ q: 'Wok' });
      expect(results.results).toHaveLength(0);
    });
  });

  describe('Status Transitions', () => {
    it('should transition from pending_review to published', async () => {
      const product = await ingestTestProduct({
        name: 'Saucepan',
        brand: 'Cuisinart',
      });

      expect(product.status).toBe('pending_review');

      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'APPROVE' },
        testReviewerId
      );

      const updated = await MockProductRepository.findById(product.id);
      expect(updated?.status).toBe('published');
    });

    it('should transition from published to suspended', async () => {
      const product = await ingestTestProduct({
        name: 'Stockpot',
        brand: 'Tramontina',
      });

      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'APPROVE' },
        testReviewerId
      );

      let updated = await MockProductRepository.findById(product.id);
      expect(updated?.status).toBe('published');

      await MockWorkflowService.transitionProduct(
        product.id,
        { type: 'SUSPEND' },
        testReviewerId
      );

      updated = await MockProductRepository.findById(product.id);
      expect(updated?.status).toBe('suspended');
    });
  });
});
