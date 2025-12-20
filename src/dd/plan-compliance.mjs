/**
 * Plan compliance checking - verify enabled capabilities align with plan tier
 */

const PLAN_TIERS = ["free", "pro", "team"];

function getPlanRank(plan) {
  const idx = PLAN_TIERS.indexOf(plan);
  return idx >= 0 ? idx : 0; // Default to free if unknown
}

/**
 * Check if enabled capabilities comply with current plan tier
 * @param {Array} capabilities - Array of capabilities with { id, enabled, tier, label }
 * @param {string} currentPlan - Current plan tier (free|pro|team)
 * @returns {{ compliant: boolean, violations: Array<{ capId, capLabel, requiredTier, currentPlan, message }> }}
 */
export function checkPlanCompliance(capabilities, currentPlan) {
  const currentRank = getPlanRank(currentPlan || "free");
  const violations = [];

  for (const cap of capabilities) {
    if (!cap.enabled) continue; // Skip disabled capabilities

    const requiredTier = cap.tier || "free";
    const requiredRank = getPlanRank(requiredTier);

    if (requiredRank > currentRank) {
      violations.push({
        capId: cap.id,
        capLabel: cap.label || cap.id,
        requiredTier,
        currentPlan: currentPlan || "free",
        message: `${cap.label || cap.id} requires ${requiredTier} plan but current plan is ${currentPlan || "free"}`
      });
    }
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}
