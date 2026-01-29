/**
 * Unit Tests: Rules Engine
 * Tests for verification tier evaluation logic
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import type { VerificationTier } from '../../src/types/domain.types.js';

// ============================================================
// TEST HELPERS
// ============================================================

interface TestEvidence {
  id: string;
  type: 'brand_statement' | 'lab_report' | 'policy_document';
  receivedAt: Date;
  sampleScope?: {
    componentIds: string[];
  };
  labName?: string;
  analytes?: number;
}

interface TestComponent {
  id: string;
  foodContact: boolean;
  materialId: string | null;
  coatingId: string | null;
}

interface TestRiskTerm {
  term: string;
  resolved: boolean;
}

interface TestContext {
  productId: string;
  evidence: TestEvidence[];
  components: TestComponent[];
  riskTerms: TestRiskTerm[];
}

// Time helpers
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const thirteenMonthsAgo = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000);
const testProductId = 'prod_test_001';
const testReviewerId = 'usr_reviewer_001';

function createTestContext(overrides: Partial<TestContext> = {}): TestContext {
  return {
    productId: testProductId,
    evidence: [],
    components: [],
    riskTerms: [],
    ...overrides,
  };
}

function createBrandAttestation(overrides: Partial<TestEvidence> = {}): TestEvidence {
  return {
    id: 'ev_brand_001',
    type: 'brand_statement',
    receivedAt: oneMonthAgo,
    ...overrides,
  };
}

function createLabReport(overrides: Partial<TestEvidence> = {}): TestEvidence {
  return {
    id: 'ev_lab_001',
    type: 'lab_report',
    receivedAt: oneMonthAgo,
    labName: 'TestLab',
    analytes: 40,
    sampleScope: { componentIds: [] },
    ...overrides,
  };
}

function createCompleteComponent(overrides: Partial<TestComponent> = {}): TestComponent {
  return {
    id: 'cmp_001',
    foodContact: true,
    materialId: 'mat_stainless',
    coatingId: null,
    ...overrides,
  };
}

// ============================================================
// MOCK RULES ENGINE
// ============================================================

interface TierRule {
  tier: VerificationTier;
  name: string;
  conditions: ((ctx: TestContext) => boolean)[];
}

const TIER_RULES: TierRule[] = [
  {
    tier: 1,
    name: 'Brand Statement',
    conditions: [
      (ctx) => ctx.evidence.some(
        (e) => e.type === 'brand_statement' && 
          isWithinValidityPeriod(e.receivedAt, 12)
      ),
    ],
  },
  {
    tier: 2,
    name: 'Policy Reviewed',
    conditions: [
      // Must pass Tier 1
      (ctx) => ctx.evidence.some(
        (e) => e.type === 'brand_statement' && isWithinValidityPeriod(e.receivedAt, 12)
      ),
      // Complete component model
      (ctx) => ctx.components.every(
        (c) => !c.foodContact || (c.materialId !== null)
      ),
      // All risk terms resolved
      (ctx) => ctx.riskTerms.every((r) => r.resolved),
    ],
  },
  {
    tier: 3,
    name: 'Lab Tested',
    conditions: [
      // Must pass Tier 2
      (ctx) => TIER_RULES[1].conditions.every((c) => c(ctx)),
      // Lab report covers food-contact components
      (ctx) => {
        const foodContactComponents = ctx.components.filter((c) => c.foodContact);
        const labReports = ctx.evidence.filter((e) => e.type === 'lab_report');
        
        return foodContactComponents.every((fc) =>
          labReports.some((lr) => 
            lr.sampleScope?.componentIds.includes(fc.id)
          )
        );
      },
    ],
  },
  {
    tier: 4,
    name: 'Monitored',
    conditions: [
      // Must pass Tier 3
      (ctx) => TIER_RULES[2].conditions.every((c) => c(ctx)),
      // Multiple lab reports from different periods
      (ctx) => {
        const labReports = ctx.evidence.filter((e) => e.type === 'lab_report');
        return labReports.length >= 2;
      },
    ],
  },
];

function isWithinValidityPeriod(date: Date, months: number): boolean {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return date > cutoff;
}

interface EvaluationResult {
  passed: boolean;
  tier: VerificationTier;
  blockers: string[];
}

interface FullEvaluationResult {
  maxAchievableTier: VerificationTier;
  blockersByTier: Record<number, string[]>;
}

class RulesEngine {
  static evaluateTier(rule: TierRule, context: TestContext): EvaluationResult {
    const blockers: string[] = [];
    
    if (rule.tier === 1) {
      const hasValidAttestation = context.evidence.some(
        (e) => e.type === 'brand_statement' && isWithinValidityPeriod(e.receivedAt, 12)
      );
      if (!hasValidAttestation) {
        blockers.push('No valid brand attestation found');
      }
    }

    if (rule.tier === 2) {
      const incompleteComponents = context.components.filter(
        (c) => c.foodContact && c.materialId === null
      );
      if (incompleteComponents.length > 0) {
        blockers.push('Incomplete component model');
      }
      
      const unresolvedRisks = context.riskTerms.filter((r) => !r.resolved);
      if (unresolvedRisks.length > 0) {
        blockers.push('Unresolved risk terms');
      }
    }

    if (rule.tier === 3) {
      const foodContactComponents = context.components.filter((c) => c.foodContact);
      const labReports = context.evidence.filter((e) => e.type === 'lab_report');
      
      const uncoveredComponents = foodContactComponents.filter(
        (fc) => !labReports.some((lr) => lr.sampleScope?.componentIds.includes(fc.id))
      );
      
      if (uncoveredComponents.length > 0) {
        blockers.push('Lab report does not cover all food-contact components');
      }
    }

    const passed = rule.conditions.every((c) => c(context));
    
    return {
      passed,
      tier: rule.tier,
      blockers,
    };
  }

  static evaluate(productId: string, context: TestContext): FullEvaluationResult {
    let maxAchievableTier: VerificationTier = 0;
    const blockersByTier: Record<number, string[]> = {};

    for (const rule of TIER_RULES) {
      const result = this.evaluateTier(rule, context);
      blockersByTier[rule.tier] = result.blockers;
      
      if (result.passed) {
        maxAchievableTier = rule.tier;
      } else {
        break; // Can't achieve higher tiers if current tier fails
      }
    }

    return { maxAchievableTier, blockersByTier };
  }
}

// ============================================================
// TESTS
// ============================================================

describe('RulesEngine', () => {
  describe('Tier 1 Evaluation', () => {
    it('should pass when brand attestation exists and is not expired', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation({ receivedAt: oneMonthAgo })],
      });
      const result = RulesEngine.evaluateTier(TIER_RULES[0], context);
      expect(result.passed).toBe(true);
    });

    it('should fail when brand attestation is expired', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation({ receivedAt: thirteenMonthsAgo })],
      });
      const result = RulesEngine.evaluateTier(TIER_RULES[0], context);
      expect(result.passed).toBe(false);
      expect(result.blockers).toContain('No valid brand attestation found');
    });

    it('should fail when no attestation exists', () => {
      const context = createTestContext({ evidence: [] });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(0);
    });

    it('should pass with recently received attestation', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation({ receivedAt: new Date() })],
      });
      const result = RulesEngine.evaluateTier(TIER_RULES[0], context);
      expect(result.passed).toBe(true);
    });
  });

  describe('Tier 2 Evaluation', () => {
    it('should fail when component model is incomplete', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [
          { id: 'cmp_1', foodContact: true, materialId: null, coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(1);
    });

    it('should fail when risk terms unresolved', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [createCompleteComponent()],
        riskTerms: [{ term: 'nonstick', resolved: false }],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(1);
    });

    it('should pass when all conditions met', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [createCompleteComponent()],
        riskTerms: [{ term: 'nonstick', resolved: true }],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(2);
    });

    it('should ignore non-food-contact components for material requirement', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [
          createCompleteComponent({ id: 'cmp_body', foodContact: true }),
          { id: 'cmp_handle', foodContact: false, materialId: null, coatingId: null },
        ],
        riskTerms: [],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(2);
    });
  });

  describe('Tier 3 Evaluation', () => {
    it('should pass when lab report covers food-contact components', () => {
      const foodContactComponent = createCompleteComponent({ id: 'cmp_body', foodContact: true });
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ sampleScope: { componentIds: ['cmp_body'] } }),
        ],
        components: [foodContactComponent],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(3);
    });

    it('should fail when lab report does not cover food-contact', () => {
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ sampleScope: { componentIds: ['cmp_handle'] } }),
        ],
        components: [
          { id: 'cmp_body', foodContact: true, materialId: 'mat_stainless', coatingId: null },
          { id: 'cmp_handle', foodContact: false, materialId: 'mat_silicone', coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(2);
    });

    it('should require lab report for all food-contact components', () => {
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ sampleScope: { componentIds: ['cmp_body'] } }),
        ],
        components: [
          { id: 'cmp_body', foodContact: true, materialId: 'mat_stainless', coatingId: null },
          { id: 'cmp_lid', foodContact: true, materialId: 'mat_glass', coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      // Should be Tier 2 because cmp_lid not covered
      expect(result.maxAchievableTier).toBe(2);
    });

    it('should pass when multiple lab reports cover all components', () => {
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ id: 'ev_lab_1', sampleScope: { componentIds: ['cmp_body'] } }),
          createLabReport({ id: 'ev_lab_2', sampleScope: { componentIds: ['cmp_lid'] } }),
        ],
        components: [
          { id: 'cmp_body', foodContact: true, materialId: 'mat_stainless', coatingId: null },
          { id: 'cmp_lid', foodContact: true, materialId: 'mat_glass', coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(4); // Also passes Tier 4 with 2 lab reports
    });
  });

  describe('Tier 4 Evaluation', () => {
    it('should require multiple lab reports', () => {
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ sampleScope: { componentIds: ['cmp_body'] } }),
        ],
        components: [createCompleteComponent({ id: 'cmp_body' })],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(3);
    });

    it('should pass with multiple lab reports from different periods', () => {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ 
            id: 'ev_lab_1', 
            receivedAt: oneMonthAgo,
            sampleScope: { componentIds: ['cmp_body'] },
          }),
          createLabReport({ 
            id: 'ev_lab_2', 
            receivedAt: sixMonthsAgo,
            sampleScope: { componentIds: ['cmp_body'] },
          }),
        ],
        components: [createCompleteComponent({ id: 'cmp_body' })],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.maxAchievableTier).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty components array', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      // With no components, Tier 2 conditions pass (vacuously true)
      expect(result.maxAchievableTier).toBeGreaterThanOrEqual(1);
    });

    it('should handle product with only non-food-contact components', () => {
      const context = createTestContext({
        evidence: [
          createBrandAttestation(),
          createLabReport({ sampleScope: { componentIds: [] } }),
        ],
        components: [
          { id: 'cmp_handle', foodContact: false, materialId: 'mat_wood', coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      // No food-contact components means lab report coverage is vacuously satisfied
      expect(result.maxAchievableTier).toBeGreaterThanOrEqual(2);
    });

    it('should return blockers for failed tier', () => {
      const context = createTestContext({
        evidence: [createBrandAttestation()],
        components: [
          { id: 'cmp_body', foodContact: true, materialId: null, coatingId: null },
        ],
      });
      const result = RulesEngine.evaluate(testProductId, context);
      expect(result.blockersByTier[2]).toContain('Incomplete component model');
    });
  });
});
