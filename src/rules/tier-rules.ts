/**
 * PFAS-Free Kitchen Platform - Tier Rules Definition
 * 
 * Defines the verification rules for each tier level.
 * @see docs/pfas-platform/04-VERIFICATION-PLAYBOOK.md "3. Verification Tier Requirements"
 */

/**
 * Verification tier levels.
 */
export type VerificationTier = 0 | 1 | 2 | 3 | 4;

/**
 * Claim types for PFAS-free assertions.
 */
export type ClaimType = 'A' | 'B' | 'C';

/**
 * Evidence object from the evidence service.
 */
export interface Evidence {
  id: string;
  type: 'lab_report' | 'brand_statement' | 'policy_document' | 'screenshot' | 'correspondence';
  source: 'brand_submission' | 'retailer' | 'user_report' | 'internal';
  received_at: Date;
  expires_at: Date | null;
  metadata: Record<string, unknown>;
}

/**
 * Product component model.
 */
export interface ProductComponent {
  id: string;
  name: string;
  food_contact: boolean;
  material_id: string | null;
  coating_id: string | null;
  needs_coating?: boolean;
  pfas_risk_flag: boolean;
}

/**
 * Risk term flagged during ingestion.
 */
export interface RiskTerm {
  id: string;
  term: string;
  context: string;
  resolved: boolean;
  resolution_notes?: string;
}

/**
 * Verification history record.
 */
export interface VerificationHistoryRecord {
  id: string;
  from_tier: VerificationTier | null;
  to_tier: VerificationTier;
  decision_date: Date;
  reason: string;
}

/**
 * Context for rule evaluation.
 */
export interface VerificationContext {
  productId: string;
  product: {
    id: string;
    name: string;
    status: string;
    pfas_risk_flagged: boolean;
  };
  components: ProductComponent[];
  evidence: Evidence[];
  riskTerms: RiskTerm[];
  verificationHistory: VerificationHistoryRecord[];
  nextReviewDue?: Date | null;
  // Tier pass flags (set during evaluation)
  tier1Passed: boolean;
  tier2Passed: boolean;
  tier3Passed: boolean;
}

/**
 * Result of a single rule check.
 */
export interface CheckResult {
  passed: boolean;
  reason?: string;
  data?: Record<string, unknown>;
}

/**
 * Individual tier check.
 */
export interface TierCheck {
  id: string;
  description: string;
  check: (context: VerificationContext) => Promise<CheckResult>;
  blocking: boolean; // If fails, cannot achieve this tier
}

/**
 * Tier rule definition.
 */
export interface TierRule {
  tier: VerificationTier;
  name: string;
  description: string;
  claimType: ClaimType | null;
  checks: TierCheck[];
}

/**
 * Check if evidence is expired.
 */
export function isExpired(evidence: Evidence): boolean {
  if (!evidence.expires_at) return false;
  return new Date(evidence.expires_at) < new Date();
}

/**
 * Check if evidence expires within a number of days.
 */
export function expiresWithin(evidence: Evidence, days: number): boolean {
  if (!evidence.expires_at) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return new Date(evidence.expires_at) < threshold;
}

/**
 * Get brand attestation evidence.
 */
function getBrandAttestation(evidence: Evidence[]): Evidence | undefined {
  return evidence.find(e => e.type === 'brand_statement' && !isExpired(e));
}

/**
 * Get lab report evidence.
 */
function getLabReport(evidence: Evidence[]): Evidence | undefined {
  return evidence.find(e => e.type === 'lab_report' && !isExpired(e));
}

/**
 * Get policy document evidence.
 */
function getPolicyDocument(evidence: Evidence[]): Evidence | undefined {
  return evidence.find(e => e.type === 'policy_document' && !isExpired(e));
}

/**
 * Tier rules definition.
 * Rules are evaluated in order (Tier 1 → 2 → 3 → 4).
 * Cannot skip tiers - Tier 3 requires Tier 2 passed.
 */
export const TIER_RULES: TierRule[] = [
  // =========================================================================
  // TIER 1 - Brand Statement
  // =========================================================================
  {
    tier: 1,
    name: 'Brand Statement',
    description: 'No intentionally added PFAS (brand attestation)',
    claimType: 'A',
    checks: [
      {
        id: 'has_brand_attestation',
        description: 'Brand attestation evidence exists',
        check: async (ctx) => {
          const attestation = getBrandAttestation(ctx.evidence);
          return {
            passed: !!attestation,
            reason: attestation ? undefined : 'No valid brand attestation found (or attestation expired)',
            data: { evidenceId: attestation?.id },
          };
        },
        blocking: true,
      },
      {
        id: 'attestation_within_12_months',
        description: 'Attestation dated within 12 months',
        check: async (ctx) => {
          const attestation = getBrandAttestation(ctx.evidence);
          if (!attestation) return { passed: false, reason: 'No attestation to check' };
          
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
          const receivedAt = new Date(attestation.received_at);
          
          return {
            passed: receivedAt > twelveMonthsAgo,
            reason: receivedAt <= twelveMonthsAgo ? 'Attestation older than 12 months' : undefined,
          };
        },
        blocking: true,
      },
      {
        id: 'attestation_has_scope',
        description: 'Attestation specifies component scope',
        check: async (ctx) => {
          const attestation = getBrandAttestation(ctx.evidence);
          if (!attestation) return { passed: false, reason: 'No attestation to check' };
          
          const metadata = attestation.metadata as { statement_text?: string };
          const statementText = metadata?.statement_text?.toLowerCase() || '';
          
          const hasScope = statementText.includes('all') ||
                           statementText.includes('component') ||
                           statementText.includes('product') ||
                           statementText.includes('entire');
          
          return {
            passed: hasScope,
            reason: hasScope ? undefined : 'Attestation scope unclear - specify which components covered',
          };
        },
        blocking: false, // Warning but not blocking
      },
    ],
  },
  
  // =========================================================================
  // TIER 2 - Policy Reviewed
  // =========================================================================
  {
    tier: 2,
    name: 'Policy Reviewed',
    description: 'No intentionally added PFAS (policy + materials review)',
    claimType: 'A',
    checks: [
      {
        id: 'all_tier1_passed',
        description: 'All Tier 1 requirements met',
        check: async (ctx) => ({
          passed: ctx.tier1Passed,
          reason: ctx.tier1Passed ? undefined : 'Tier 1 requirements not met',
        }),
        blocking: true,
      },
      {
        id: 'component_model_complete',
        description: 'All components have material/coating assigned',
        check: async (ctx) => {
          const incomplete = ctx.components.filter(c =>
            c.food_contact && (
              !c.material_id ||
              (c.needs_coating !== false && c.pfas_risk_flag && !c.coating_id)
            )
          );
          
          return {
            passed: incomplete.length === 0,
            reason: incomplete.length > 0
              ? `${incomplete.length} component(s) incomplete`
              : undefined,
            data: { incompleteComponents: incomplete.map(c => c.name) },
          };
        },
        blocking: true,
      },
      {
        id: 'all_food_contact_documented',
        description: 'All food-contact surfaces documented',
        check: async (ctx) => {
          const foodContact = ctx.components.filter(c => c.food_contact);
          const undocumented = foodContact.filter(c => !c.material_id);
          
          return {
            passed: undocumented.length === 0,
            reason: undocumented.length > 0
              ? `${undocumented.length} food-contact surface(s) without material documentation`
              : undefined,
            data: { undocumentedComponents: undocumented.map(c => c.name) },
          };
        },
        blocking: true,
      },
      {
        id: 'risk_terms_resolved',
        description: 'All risk terms addressed in review',
        check: async (ctx) => {
          const unresolved = ctx.riskTerms.filter(t => !t.resolved);
          
          return {
            passed: unresolved.length === 0,
            reason: unresolved.length > 0
              ? `${unresolved.length} unresolved risk term(s): ${unresolved.map(t => t.term).join(', ')}`
              : undefined,
            data: { unresolvedTerms: unresolved.map(t => ({ term: t.term, context: t.context })) },
          };
        },
        blocking: true,
      },
      {
        id: 'has_policy_document',
        description: 'Policy document or detailed specification exists',
        check: async (ctx) => {
          const hasPolicy = getPolicyDocument(ctx.evidence);
          
          return {
            passed: !!hasPolicy,
            reason: hasPolicy ? undefined : 'No policy document found (recommended for Tier 2)',
          };
        },
        blocking: false, // Recommended but not required
      },
    ],
  },
  
  // =========================================================================
  // TIER 3 - Lab Tested
  // =========================================================================
  {
    tier: 3,
    name: 'Lab Tested',
    description: 'Below detection limit OR screening passed',
    claimType: 'B', // or 'C' for screening - determined by lab report type
    checks: [
      {
        id: 'all_tier2_passed',
        description: 'All Tier 2 requirements met',
        check: async (ctx) => ({
          passed: ctx.tier2Passed,
          reason: ctx.tier2Passed ? undefined : 'Tier 2 requirements not met',
        }),
        blocking: true,
      },
      {
        id: 'has_lab_report',
        description: 'Third-party lab report exists',
        check: async (ctx) => {
          const labReport = getLabReport(ctx.evidence);
          
          return {
            passed: !!labReport,
            reason: labReport ? undefined : 'No valid lab report found (or lab report expired)',
            data: {
              evidenceId: labReport?.id,
              expiresAt: labReport?.expires_at,
            },
          };
        },
        blocking: true,
      },
      {
        id: 'lab_within_24_months',
        description: 'Lab report dated within 24 months',
        check: async (ctx) => {
          const labReport = getLabReport(ctx.evidence);
          if (!labReport) return { passed: false, reason: 'No lab report to check' };
          
          const twentyFourMonthsAgo = new Date();
          twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
          const receivedAt = new Date(labReport.received_at);
          
          return {
            passed: receivedAt > twentyFourMonthsAgo,
            reason: receivedAt <= twentyFourMonthsAgo ? 'Lab report older than 24 months' : undefined,
          };
        },
        blocking: true,
      },
      {
        id: 'lab_covers_food_contact',
        description: 'Lab report covers food-contact components',
        check: async (ctx) => {
          const labReport = getLabReport(ctx.evidence);
          if (!labReport) return { passed: false, reason: 'No lab report to check' };
          
          const metadata = labReport.metadata as { sample_scope?: { component_ids?: string[] } };
          const testedComponents = metadata?.sample_scope?.component_ids || [];
          const foodContactIds = ctx.components
            .filter(c => c.food_contact)
            .map(c => c.id);
          
          const allCovered = foodContactIds.every(id => testedComponents.includes(id));
          const missingComponents = foodContactIds.filter(id => !testedComponents.includes(id));
          
          return {
            passed: allCovered,
            reason: allCovered
              ? undefined
              : `Lab report does not cover all food-contact components`,
            data: {
              testedComponents,
              foodContactIds,
              missingComponents,
            },
          };
        },
        blocking: true,
      },
      {
        id: 'lab_has_method_and_limits',
        description: 'Lab report documents method and LOD/LOQ',
        check: async (ctx) => {
          const labReport = getLabReport(ctx.evidence);
          if (!labReport) return { passed: false, reason: 'No lab report to check' };
          
          const metadata = labReport.metadata as {
            method?: string;
            lod_ng_g?: number;
            loq_ng_g?: number;
          };
          
          const hasMethod = !!metadata?.method;
          const hasLod = typeof metadata?.lod_ng_g === 'number';
          const hasLoq = typeof metadata?.loq_ng_g === 'number';
          
          const issues: string[] = [];
          if (!hasMethod) issues.push('method');
          if (!hasLod) issues.push('LOD');
          if (!hasLoq) issues.push('LOQ');
          
          return {
            passed: hasMethod && hasLod && hasLoq,
            reason: issues.length > 0
              ? `Lab report missing: ${issues.join(', ')}`
              : undefined,
            data: {
              method: metadata?.method,
              lod_ng_g: metadata?.lod_ng_g,
              loq_ng_g: metadata?.loq_ng_g,
            },
          };
        },
        blocking: true,
      },
      {
        id: 'lab_accredited',
        description: 'Lab report from accredited laboratory',
        check: async (ctx) => {
          const labReport = getLabReport(ctx.evidence);
          if (!labReport) return { passed: false, reason: 'No lab report to check' };
          
          const metadata = labReport.metadata as { accreditation?: string; lab_name?: string };
          const hasAccreditation = !!metadata?.accreditation;
          
          return {
            passed: hasAccreditation,
            reason: hasAccreditation
              ? undefined
              : 'Lab accreditation not documented (ISO 17025 preferred)',
            data: {
              labName: metadata?.lab_name,
              accreditation: metadata?.accreditation,
            },
          };
        },
        blocking: false, // Preferred but not strictly required
      },
    ],
  },
  
  // =========================================================================
  // TIER 4 - Monitored
  // =========================================================================
  {
    tier: 4,
    name: 'Monitored',
    description: 'Verified + ongoing monitoring',
    claimType: 'B', // inherits from Tier 3
    checks: [
      {
        id: 'all_tier3_passed',
        description: 'All Tier 3 requirements met',
        check: async (ctx) => ({
          passed: ctx.tier3Passed,
          reason: ctx.tier3Passed ? undefined : 'Tier 3 requirements not met',
        }),
        blocking: true,
      },
      {
        id: 'has_verification_history',
        description: 'Previous verification exists',
        check: async (ctx) => {
          const hasHistory = ctx.verificationHistory.length > 0;
          const previousTier3 = ctx.verificationHistory.some(h => h.to_tier >= 3);
          
          return {
            passed: hasHistory && previousTier3,
            reason: !hasHistory
              ? 'No verification history - product must have been Tier 3 verified before'
              : !previousTier3
                ? 'No previous Tier 3 verification found'
                : undefined,
            data: {
              historyCount: ctx.verificationHistory.length,
              previousVerifications: ctx.verificationHistory.map(h => ({
                tier: h.to_tier,
                date: h.decision_date,
              })),
            },
          };
        },
        blocking: true,
      },
      {
        id: 'revalidation_scheduled',
        description: 'Next revalidation date is set',
        check: async (ctx) => ({
          passed: !!ctx.nextReviewDue,
          reason: ctx.nextReviewDue
            ? undefined
            : 'Revalidation schedule not set - required for Tier 4',
          data: { nextReviewDue: ctx.nextReviewDue },
        }),
        blocking: true,
      },
      {
        id: 'no_recent_changes',
        description: 'No material changes since last verification',
        check: async (ctx) => {
          // Check if there are any recent risk flags or report activity
          const hasRecentRiskFlags = ctx.product.pfas_risk_flagged;
          
          return {
            passed: !hasRecentRiskFlags,
            reason: hasRecentRiskFlags
              ? 'Product flagged for potential changes - review required'
              : undefined,
          };
        },
        blocking: false, // Warning - prompts investigation
      },
    ],
  },
];

/**
 * Get a specific tier rule.
 */
export function getTierRule(tier: VerificationTier): TierRule | undefined {
  return TIER_RULES.find(r => r.tier === tier);
}

/**
 * Get the tier name for display.
 */
export function getTierName(tier: VerificationTier): string {
  const names: Record<VerificationTier, string> = {
    0: 'Unknown',
    1: 'Brand Statement',
    2: 'Policy Reviewed',
    3: 'Lab Tested',
    4: 'Monitored',
  };
  return names[tier];
}

/**
 * Get claim type description.
 */
export function getClaimTypeDescription(type: ClaimType): string {
  const descriptions: Record<ClaimType, string> = {
    A: 'No intentionally added PFAS',
    B: 'Below detection limit for specific PFAS compounds',
    C: 'Total fluorine screen below threshold',
  };
  return descriptions[type];
}
