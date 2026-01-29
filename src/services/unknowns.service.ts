/**
 * PFAS-Free Kitchen Platform - Unknowns Generator
 * 
 * Generates list of what couldn't be verified for transparency.
 * Core principle: "No Silent Failures" - if we don't know, we say we don't know.
 * 
 * @see docs/pfas-platform/04-VERIFICATION-PLAYBOOK.md "1.2 Core Principles"
 */

import type {
  VerificationContext,
  VerificationTier,
  ProductComponent,
} from '../rules/tier-rules';

/**
 * Unknown item with context.
 */
export interface Unknown {
  id: string;
  category: 'component' | 'sample' | 'method' | 'scope' | 'temporal';
  text: string;
  severity: 'info' | 'warning' | 'critical';
  details?: Record<string, unknown>;
}

/**
 * Unknowns Generator - Produces transparency list.
 * 
 * Critical: Unknowns always generated, even if empty.
 * Display "All major components verified" if no unknowns.
 */
export class UnknownsGenerator {
  /**
   * Generate unknowns list for a verification context.
   * 
   * @param context - Verification context
   * @param tier - Achieved verification tier
   * @returns List of unknown items
   */
  static generate(context: VerificationContext, tier: VerificationTier): string[] {
    const unknowns: string[] = [];
    const labReport = context.evidence.find(e => e.type === 'lab_report');

    // 1. Untested components
    unknowns.push(...this.generateComponentUnknowns(context, labReport));

    // 2. Sample scope limitations
    unknowns.push(...this.generateSampleScopeUnknowns(labReport, tier));

    // 3. Method limitations
    unknowns.push(...this.generateMethodUnknowns(labReport));

    // 4. Non-food-contact components
    unknowns.push(...this.generateNonFoodContactUnknowns(context, tier));

    // 5. Evidence limitations
    unknowns.push(...this.generateEvidenceLimitations(context, tier));

    return unknowns;
  }

  /**
   * Generate detailed unknowns with metadata.
   */
  static generateDetailed(
    context: VerificationContext,
    tier: VerificationTier
  ): Unknown[] {
    const unknowns: Unknown[] = [];
    const labReport = context.evidence.find(e => e.type === 'lab_report');

    // 1. Component unknowns
    if (labReport) {
      const metadata = labReport.metadata as { sample_scope?: { component_ids?: string[] } };
      const testedIds = new Set(metadata?.sample_scope?.component_ids || []);

      for (const component of context.components) {
        if (component.food_contact && !testedIds.has(component.id)) {
          unknowns.push({
            id: `untested_${component.id}`,
            category: 'component',
            text: `${component.name} not independently tested`,
            severity: 'warning',
            details: { componentId: component.id, foodContact: true },
          });
        }
      }
    } else if (tier > 0) {
      unknowns.push({
        id: 'no_lab_testing',
        category: 'method',
        text: 'No third-party lab testing performed',
        severity: 'info',
        details: { tier },
      });
    }

    // 2. Sample scope
    if (labReport) {
      const metadata = labReport.metadata as { sample_scope?: { units?: number; lots?: number } };
      const units = metadata?.sample_scope?.units || 1;
      const lots = metadata?.sample_scope?.lots || 1;

      if (units <= 2 || lots === 1) {
        unknowns.push({
          id: 'limited_sample',
          category: 'sample',
          text: `Testing based on ${units} unit(s) from ${lots} lot(s)`,
          severity: units === 1 ? 'warning' : 'info',
          details: { units, lots },
        });
      }
    }

    // 3. Screening limitations
    if (labReport) {
      const metadata = labReport.metadata as { method?: string };
      const method = metadata?.method?.toLowerCase() || '';
      const isScreening = method.includes('tof') ||
                          method.includes('total fluorine') ||
                          method.includes('combustion');

      if (isScreening) {
        unknowns.push({
          id: 'screening_method',
          category: 'method',
          text: 'Screening method used; individual PFAS compounds not identified',
          severity: 'info',
          details: { method: metadata?.method },
        });
      }
    }

    // 4. Non-food-contact
    const nonFoodContact = context.components.filter(c => !c.food_contact);
    if (nonFoodContact.length > 0 && tier < 4) {
      unknowns.push({
        id: 'non_food_contact',
        category: 'scope',
        text: `Non-food-contact components (${nonFoodContact.map(c => c.name).join(', ')}) not in verification scope`,
        severity: 'info',
        details: {
          componentNames: nonFoodContact.map(c => c.name),
          componentIds: nonFoodContact.map(c => c.id),
        },
      });
    }

    // 5. Evidence age
    const oldestEvidence = this.getOldestEvidence(context.evidence);
    if (oldestEvidence) {
      const monthsOld = this.getMonthsOld(oldestEvidence.received_at);
      if (monthsOld > 18) {
        unknowns.push({
          id: 'aging_evidence',
          category: 'temporal',
          text: `Primary evidence is ${monthsOld} months old - verification based on historical data`,
          severity: 'warning',
          details: { monthsOld, evidenceId: oldestEvidence.id },
        });
      }
    }

    return unknowns;
  }

  /**
   * Get display message for unknowns.
   * Returns positive message if no unknowns.
   */
  static getDisplayMessage(unknowns: string[]): {
    hasUnknowns: boolean;
    summary: string;
    items: string[];
  } {
    if (unknowns.length === 0) {
      return {
        hasUnknowns: false,
        summary: 'All major food-contact components verified',
        items: [],
      };
    }

    return {
      hasUnknowns: true,
      summary: `${unknowns.length} limitation(s) noted`,
      items: unknowns,
    };
  }

  // =========================================================================
  // Private generators
  // =========================================================================

  private static generateComponentUnknowns(
    context: VerificationContext,
    labReport: typeof context.evidence[0] | undefined
  ): string[] {
    const unknowns: string[] = [];

    if (labReport) {
      const metadata = labReport.metadata as { sample_scope?: { component_ids?: string[] } };
      const testedIds = new Set(metadata?.sample_scope?.component_ids || []);

      for (const component of context.components) {
        if (component.food_contact && !testedIds.has(component.id)) {
          unknowns.push(`${component.name} not independently tested`);
        }
      }

      // Check for unknown materials
      const unknownMaterials = context.components.filter(
        c => c.food_contact && !c.material_id
      );
      for (const component of unknownMaterials) {
        unknowns.push(`${component.name} material not documented`);
      }
    }

    return unknowns;
  }

  private static generateSampleScopeUnknowns(
    labReport: { metadata: Record<string, unknown> } | undefined,
    tier: VerificationTier
  ): string[] {
    const unknowns: string[] = [];

    if (!labReport && tier > 0) {
      unknowns.push('No third-party lab testing performed');
      return unknowns;
    }

    if (labReport) {
      const metadata = labReport.metadata as { sample_scope?: { units?: number; lots?: number } };
      const units = metadata?.sample_scope?.units || 1;
      const lots = metadata?.sample_scope?.lots || 1;

      if (units <= 2 || lots === 1) {
        unknowns.push(`Testing based on ${units} unit(s) from ${lots} lot(s)`);
      }
    }

    return unknowns;
  }

  private static generateMethodUnknowns(
    labReport: { metadata: Record<string, unknown> } | undefined
  ): string[] {
    const unknowns: string[] = [];

    if (!labReport) return unknowns;

    const metadata = labReport.metadata as {
      method?: string;
      analyte_count?: number;
    };
    const method = metadata?.method?.toLowerCase() || '';

    // Check for screening vs targeted
    const isScreening = method.includes('tof') ||
                        method.includes('total fluorine') ||
                        method.includes('combustion') ||
                        method.includes('pige');

    if (isScreening) {
      unknowns.push('Screening method used; individual PFAS compounds not identified');
    }

    // Check analyte coverage
    const analyteCount = metadata?.analyte_count;
    if (analyteCount && analyteCount < 20) {
      unknowns.push(`Limited PFAS panel (${analyteCount} compounds) - some PFAS may not be covered`);
    }

    // Check for extraction method limitations
    if (method.includes('surface') || method.includes('wipe')) {
      unknowns.push('Surface/wipe testing may not detect PFAS embedded in material');
    }

    return unknowns;
  }

  private static generateNonFoodContactUnknowns(
    context: VerificationContext,
    tier: VerificationTier
  ): string[] {
    const unknowns: string[] = [];

    const nonFoodContact = context.components.filter(c => !c.food_contact);
    if (nonFoodContact.length > 0 && tier < 4) {
      const names = nonFoodContact.map(c => c.name).join(', ');
      unknowns.push(`Non-food-contact components (${names}) not in verification scope`);
    }

    return unknowns;
  }

  private static generateEvidenceLimitations(
    context: VerificationContext,
    tier: VerificationTier
  ): string[] {
    const unknowns: string[] = [];

    // Check for brand statement only (no policy review)
    if (tier === 1) {
      const hasPolicy = context.evidence.some(e => e.type === 'policy_document');
      if (!hasPolicy) {
        unknowns.push('Based on brand statement only - no detailed policy review');
      }
    }

    // Check for single evidence source
    if (context.evidence.length === 1 && tier > 1) {
      unknowns.push('Verification based on single evidence source');
    }

    // Check evidence freshness
    const oldEvidence = context.evidence.filter(e => {
      const monthsOld = this.getMonthsOld(e.received_at);
      return monthsOld > 12;
    });
    if (oldEvidence.length > 0 && tier >= 2) {
      unknowns.push('Some evidence is over 12 months old');
    }

    return unknowns;
  }

  private static getOldestEvidence(
    evidence: VerificationContext['evidence']
  ): VerificationContext['evidence'][0] | undefined {
    if (evidence.length === 0) return undefined;

    return evidence.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.received_at);
      const currentDate = new Date(current.received_at);
      return currentDate < oldestDate ? current : oldest;
    });
  }

  private static getMonthsOld(date: Date): number {
    const now = new Date();
    const receivedAt = new Date(date);
    const diffMs = now.getTime() - receivedAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  }
}
