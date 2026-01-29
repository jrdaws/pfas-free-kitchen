/**
 * PFAS-Free Kitchen Platform - Confidence Calculator
 * 
 * Calculates verification confidence scores based on evidence quality.
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "5.2 Verification Decision Workflow"
 */

import type {
  VerificationContext,
  VerificationTier,
  Evidence,
} from '../rules/tier-rules';

/**
 * Confidence calculation breakdown.
 */
export interface ConfidenceBreakdown {
  score: number;
  baseConfidence: number;
  evidenceQualityBoost: number;
  sampleCoverageFactor: number;
  components: {
    name: string;
    impact: number;
    reason: string;
  }[];
}

/**
 * Base confidence scores by tier.
 */
const BASE_CONFIDENCE: Record<VerificationTier, number> = {
  0: 0,
  1: 0.5,
  2: 0.7,
  3: 0.85,
  4: 0.95,
};

/**
 * Confidence Calculator - Determines verification confidence score.
 * 
 * Formula:
 * confidence = base_confidence * evidence_quality * sample_coverage
 */
export class ConfidenceCalculator {
  /**
   * Calculate confidence score for a verification context.
   * 
   * @param context - Verification context with evidence and components
   * @param tier - Target verification tier
   * @returns Confidence score between 0 and 1
   */
  static calculate(context: VerificationContext, tier: VerificationTier): number {
    const breakdown = this.calculateWithBreakdown(context, tier);
    return breakdown.score;
  }

  /**
   * Calculate confidence with detailed breakdown.
   * 
   * @param context - Verification context
   * @param tier - Target verification tier
   * @returns Full confidence breakdown
   */
  static calculateWithBreakdown(
    context: VerificationContext,
    tier: VerificationTier
  ): ConfidenceBreakdown {
    const components: ConfidenceBreakdown['components'] = [];
    
    // 1. Base confidence from tier
    const baseConfidence = BASE_CONFIDENCE[tier];
    components.push({
      name: 'Base Tier Confidence',
      impact: baseConfidence,
      reason: `Tier ${tier} base confidence`,
    });

    // 2. Evidence quality boost
    let evidenceQualityBoost = 0;

    // Has lab report
    const hasLabReport = context.evidence.some(e => e.type === 'lab_report' && !this.isExpired(e));
    if (hasLabReport) {
      evidenceQualityBoost += 0.1;
      components.push({
        name: 'Lab Report Present',
        impact: 0.1,
        reason: 'Third-party lab testing increases confidence',
      });
    }

    // Multiple evidence types
    const evidenceTypes = new Set(context.evidence.map(e => e.type));
    if (evidenceTypes.size > 1) {
      evidenceQualityBoost += 0.05;
      components.push({
        name: 'Multiple Evidence Types',
        impact: 0.05,
        reason: `${evidenceTypes.size} different evidence types available`,
      });
    }

    // All evidence is recent
    const allRecent = context.evidence.length > 0 && 
                      context.evidence.every(e => this.isRecent(e));
    if (allRecent) {
      evidenceQualityBoost += 0.05;
      components.push({
        name: 'Recent Evidence',
        impact: 0.05,
        reason: 'All evidence received within last 6 months',
      });
    }

    // Accredited lab
    const labReport = context.evidence.find(e => e.type === 'lab_report');
    if (labReport) {
      const metadata = labReport.metadata as { accreditation?: string };
      if (metadata?.accreditation?.includes('ISO 17025')) {
        evidenceQualityBoost += 0.03;
        components.push({
          name: 'ISO 17025 Accreditation',
          impact: 0.03,
          reason: 'Lab has recognized accreditation',
        });
      }
    }

    // 3. Sample coverage factor
    let sampleCoverageFactor = 1.0;

    // Check sample scope
    if (labReport) {
      const metadata = labReport.metadata as {
        sample_scope?: { units?: number; lots?: number; component_ids?: string[] };
      };
      const units = metadata?.sample_scope?.units || 1;
      const lots = metadata?.sample_scope?.lots || 1;

      // Single unit penalty
      if (units === 1) {
        sampleCoverageFactor *= 0.9;
        components.push({
          name: 'Single Unit Sample',
          impact: -0.1,
          reason: 'Only 1 unit tested - limited sample size',
        });
      }

      // Single lot penalty
      if (lots === 1) {
        sampleCoverageFactor *= 0.95;
        components.push({
          name: 'Single Lot Sample',
          impact: -0.05,
          reason: 'Only 1 lot tested - may not represent all production',
        });
      }

      // Multiple samples boost
      if (units > 2 && lots > 1) {
        sampleCoverageFactor *= 1.05;
        components.push({
          name: 'Robust Sample Size',
          impact: 0.05,
          reason: `${units} units from ${lots} lots tested`,
        });
      }

      // Component coverage
      const testedComponents = metadata?.sample_scope?.component_ids || [];
      const foodContactComponents = context.components.filter(c => c.food_contact);
      const coverage = testedComponents.length / Math.max(foodContactComponents.length, 1);
      
      if (coverage < 1) {
        sampleCoverageFactor *= (0.85 + coverage * 0.15);
        components.push({
          name: 'Partial Component Coverage',
          impact: -(1 - coverage) * 0.15,
          reason: `Only ${Math.round(coverage * 100)}% of food-contact components tested`,
        });
      }
    } else if (tier > 0) {
      // No lab report at all
      sampleCoverageFactor *= 0.85;
      components.push({
        name: 'No Lab Testing',
        impact: -0.15,
        reason: 'Based on brand claims only, not independent testing',
      });
    }

    // 4. Component completeness
    const foodContactWithMaterial = context.components.filter(
      c => c.food_contact && c.material_id
    ).length;
    const totalFoodContact = context.components.filter(c => c.food_contact).length;
    
    if (totalFoodContact > 0 && foodContactWithMaterial < totalFoodContact) {
      const completeness = foodContactWithMaterial / totalFoodContact;
      sampleCoverageFactor *= (0.8 + completeness * 0.2);
      components.push({
        name: 'Incomplete Component Model',
        impact: -(1 - completeness) * 0.2,
        reason: `${foodContactWithMaterial}/${totalFoodContact} components documented`,
      });
    }

    // Calculate final score
    const rawScore = (baseConfidence + evidenceQualityBoost) * sampleCoverageFactor;
    const score = Math.min(1.0, Math.max(0, rawScore));

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      baseConfidence,
      evidenceQualityBoost,
      sampleCoverageFactor,
      components,
    };
  }

  /**
   * Get confidence level description.
   */
  static getConfidenceLevel(score: number): {
    level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
    description: string;
    color: string;
  } {
    if (score >= 0.9) {
      return {
        level: 'very_high',
        description: 'Very High Confidence',
        color: '#10B981', // green
      };
    }
    if (score >= 0.75) {
      return {
        level: 'high',
        description: 'High Confidence',
        color: '#3B82F6', // blue
      };
    }
    if (score >= 0.6) {
      return {
        level: 'moderate',
        description: 'Moderate Confidence',
        color: '#F59E0B', // yellow
      };
    }
    if (score >= 0.4) {
      return {
        level: 'low',
        description: 'Low Confidence',
        color: '#F97316', // orange
      };
    }
    return {
      level: 'very_low',
      description: 'Very Low Confidence',
      color: '#EF4444', // red
    };
  }

  /**
   * Check if evidence is expired.
   */
  private static isExpired(evidence: Evidence): boolean {
    if (!evidence.expires_at) return false;
    return new Date(evidence.expires_at) < new Date();
  }

  /**
   * Check if evidence is recent (within 6 months).
   */
  private static isRecent(evidence: Evidence): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(evidence.received_at) > sixMonthsAgo;
  }
}
