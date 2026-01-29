/**
 * PFAS-Free Kitchen Platform - Rules Engine Service
 * 
 * Evaluates verification tier eligibility based on evidence and product data.
 * @see docs/pfas-platform/04-VERIFICATION-PLAYBOOK.md
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "5.2 Verification Decision Workflow"
 */

import {
  TIER_RULES,
  getTierName,
  type TierRule,
  type VerificationContext,
  type VerificationTier,
  type CheckResult,
  type Evidence,
  type ProductComponent,
  type RiskTerm,
  type VerificationHistoryRecord,
  type ClaimType,
} from '../rules/tier-rules';
import { EvidenceRepository } from '../repositories/evidence.repository';

/**
 * Result of evaluating a single check.
 */
export interface CheckEvaluationResult extends CheckResult {
  checkId: string;
  description: string;
  blocking: boolean;
}

/**
 * Result of evaluating a single tier.
 */
export interface TierResult {
  tier: VerificationTier;
  name: string;
  passed: boolean;
  checks: CheckEvaluationResult[];
  blockers: string[];
  warnings: string[];
}

/**
 * Full tier evaluation result.
 */
export interface TierEvaluationResult {
  productId: string;
  evaluatedAt: Date;
  maxAchievableTier: VerificationTier;
  recommendedClaimType: ClaimType | null;
  tierResults: TierResult[];
  blockers: string[];
  warnings: string[];
  summary: string;
}

/**
 * Validation result for a proposed decision.
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  blockers?: string[];
  maxAchievableTier?: VerificationTier;
}

// Placeholder repository interfaces (would be implemented in full system)
interface ProductRepository {
  findById(id: string): Promise<{ id: string; name: string; status: string; pfas_risk_flagged: boolean } | null>;
}
interface ComponentRepository {
  findByProductId(id: string): Promise<ProductComponent[]>;
}
interface RiskTermRepository {
  findByProductId(id: string): Promise<RiskTerm[]>;
}
interface VerificationHistoryRepository {
  findByProductId(id: string): Promise<VerificationHistoryRecord[]>;
}
interface VerificationStatusRepository {
  getNextReviewDue(productId: string): Promise<Date | null>;
}

// In-memory placeholder stores (replace with actual DB in production)
const productStore = new Map<string, { id: string; name: string; status: string; pfas_risk_flagged: boolean }>();
const componentStore = new Map<string, ProductComponent[]>();
const riskTermStore = new Map<string, RiskTerm[]>();
const verificationHistoryStore = new Map<string, VerificationHistoryRecord[]>();
const nextReviewStore = new Map<string, Date>();

/**
 * Placeholder repositories (for demo/testing).
 */
const ProductRepo: ProductRepository = {
  findById: async (id) => productStore.get(id) || null,
};
const ComponentRepo: ComponentRepository = {
  findByProductId: async (id) => componentStore.get(id) || [],
};
const RiskTermRepo: RiskTermRepository = {
  findByProductId: async (id) => riskTermStore.get(id) || [],
};
const VerificationHistoryRepo: VerificationHistoryRepository = {
  findByProductId: async (id) => verificationHistoryStore.get(id) || [],
};
const VerificationStatusRepo: VerificationStatusRepository = {
  getNextReviewDue: async (id) => nextReviewStore.get(id) || null,
};

/**
 * Rules Engine - Evaluates verification tier eligibility.
 * 
 * Critical rules:
 * - Tiers evaluated in order (1 → 2 → 3 → 4)
 * - Cannot skip tiers
 * - Blocking checks prevent tier achievement
 * - Non-blocking checks generate warnings
 */
export class RulesEngine {
  /**
   * Evaluate all tiers and return maximum achievable.
   * 
   * @param productId - Product ID to evaluate
   * @returns Full tier evaluation result
   */
  static async evaluate(productId: string): Promise<TierEvaluationResult> {
    const context = await this.buildContext(productId);

    const results: TierEvaluationResult = {
      productId,
      evaluatedAt: new Date(),
      maxAchievableTier: 0,
      recommendedClaimType: null,
      tierResults: [],
      blockers: [],
      warnings: [],
      summary: '',
    };

    // Evaluate tiers in order
    for (const tierRule of TIER_RULES) {
      const tierResult = await this.evaluateTier(tierRule, context);
      results.tierResults.push(tierResult);

      if (tierResult.passed) {
        results.maxAchievableTier = tierRule.tier;
        results.recommendedClaimType = tierRule.claimType;
        
        // Update context for next tier evaluation
        if (tierRule.tier === 1) context.tier1Passed = true;
        if (tierRule.tier === 2) context.tier2Passed = true;
        if (tierRule.tier === 3) context.tier3Passed = true;
      } else {
        // Can't achieve this tier, stop evaluating higher tiers
        results.blockers.push(...tierResult.blockers);
        break;
      }

      // Collect warnings from all evaluated tiers
      results.warnings.push(...tierResult.warnings);
    }

    // Generate summary
    results.summary = this.generateSummary(results);

    return results;
  }

  /**
   * Build context for rule evaluation.
   * Gathers all necessary data from repositories.
   */
  static async buildContext(productId: string): Promise<VerificationContext> {
    const [product, components, evidenceRows, riskTerms, history, nextReviewDue] =
      await Promise.all([
        ProductRepo.findById(productId),
        ComponentRepo.findByProductId(productId),
        EvidenceRepository.findByProductId(productId),
        RiskTermRepo.findByProductId(productId),
        VerificationHistoryRepo.findByProductId(productId),
        VerificationStatusRepo.getNextReviewDue(productId),
      ]);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Convert evidence rows to Evidence type
    const evidence: Evidence[] = evidenceRows.map(row => ({
      id: row.id,
      type: row.type,
      source: row.source,
      received_at: row.received_at,
      expires_at: row.expires_at,
      metadata: row.metadata as Record<string, unknown>,
    }));

    return {
      productId,
      product,
      components,
      evidence,
      riskTerms,
      verificationHistory: history,
      nextReviewDue,
      tier1Passed: false,
      tier2Passed: false,
      tier3Passed: false,
    };
  }

  /**
   * Evaluate a single tier's rules.
   */
  static async evaluateTier(
    tierRule: TierRule,
    context: VerificationContext
  ): Promise<TierResult> {
    const checks: CheckEvaluationResult[] = [];
    const blockers: string[] = [];
    const warnings: string[] = [];

    for (const check of tierRule.checks) {
      const result = await check.check(context);

      checks.push({
        checkId: check.id,
        description: check.description,
        blocking: check.blocking,
        ...result,
      });

      if (!result.passed) {
        const message = `${check.description}: ${result.reason || 'Failed'}`;
        
        if (check.blocking) {
          blockers.push(message);
        } else {
          warnings.push(message);
        }
      }
    }

    return {
      tier: tierRule.tier,
      name: tierRule.name,
      passed: blockers.length === 0,
      checks,
      blockers,
      warnings,
    };
  }

  /**
   * Validate a proposed tier decision.
   * Checks if the proposed tier is achievable.
   */
  static async validateDecision(
    productId: string,
    proposedTier: VerificationTier
  ): Promise<ValidationResult> {
    const evaluation = await this.evaluate(productId);

    if (proposedTier > evaluation.maxAchievableTier) {
      return {
        valid: false,
        reason: `Product can only achieve Tier ${evaluation.maxAchievableTier} (${getTierName(evaluation.maxAchievableTier)})`,
        blockers: evaluation.blockers,
        maxAchievableTier: evaluation.maxAchievableTier,
      };
    }

    // Proposing a lower tier than achievable is valid (conservative approach)
    if (proposedTier < evaluation.maxAchievableTier) {
      return {
        valid: true,
        reason: `Note: Product could achieve Tier ${evaluation.maxAchievableTier}, but Tier ${proposedTier} is acceptable`,
        maxAchievableTier: evaluation.maxAchievableTier,
      };
    }

    return { valid: true };
  }

  /**
   * Check what's needed to reach a specific tier.
   * Useful for showing users what evidence is missing.
   */
  static async getRequirementsForTier(
    productId: string,
    targetTier: VerificationTier
  ): Promise<{
    currentMaxTier: VerificationTier;
    requirements: string[];
    met: string[];
    unmet: string[];
  }> {
    const evaluation = await this.evaluate(productId);
    const met: string[] = [];
    const unmet: string[] = [];

    // Check all tiers up to and including target
    for (const tierResult of evaluation.tierResults) {
      if (tierResult.tier > targetTier) break;

      for (const check of tierResult.checks) {
        if (check.passed) {
          met.push(`✓ ${check.description}`);
        } else if (check.blocking) {
          unmet.push(`✗ ${check.description}: ${check.reason || 'Not met'}`);
        }
      }
    }

    return {
      currentMaxTier: evaluation.maxAchievableTier,
      requirements: [...met, ...unmet],
      met,
      unmet,
    };
  }

  /**
   * Quick check if a product can achieve a specific tier.
   */
  static async canAchieveTier(
    productId: string,
    tier: VerificationTier
  ): Promise<boolean> {
    const evaluation = await this.evaluate(productId);
    return evaluation.maxAchievableTier >= tier;
  }

  /**
   * Generate human-readable summary.
   */
  private static generateSummary(result: TierEvaluationResult): string {
    const tierName = getTierName(result.maxAchievableTier);
    const claimText = result.recommendedClaimType
      ? ` (Claim Type ${result.recommendedClaimType})`
      : '';

    if (result.maxAchievableTier === 0) {
      return `Product cannot be verified. ${result.blockers.length} blocking issue(s) found.`;
    }

    const warningText = result.warnings.length > 0
      ? ` with ${result.warnings.length} warning(s)`
      : '';

    return `Product can achieve Tier ${result.maxAchievableTier} - ${tierName}${claimText}${warningText}.`;
  }

  // =========================================================================
  // Test/Demo Data Management (for development)
  // =========================================================================

  /**
   * Set test product data (for development/testing).
   */
  static setTestProduct(
    id: string,
    product: { name: string; status: string; pfas_risk_flagged: boolean }
  ): void {
    productStore.set(id, { id, ...product });
  }

  /**
   * Set test components (for development/testing).
   */
  static setTestComponents(productId: string, components: ProductComponent[]): void {
    componentStore.set(productId, components);
  }

  /**
   * Set test risk terms (for development/testing).
   */
  static setTestRiskTerms(productId: string, terms: RiskTerm[]): void {
    riskTermStore.set(productId, terms);
  }

  /**
   * Set test verification history (for development/testing).
   */
  static setTestHistory(productId: string, history: VerificationHistoryRecord[]): void {
    verificationHistoryStore.set(productId, history);
  }

  /**
   * Set test next review date (for development/testing).
   */
  static setTestNextReviewDue(productId: string, date: Date): void {
    nextReviewStore.set(productId, date);
  }
}
