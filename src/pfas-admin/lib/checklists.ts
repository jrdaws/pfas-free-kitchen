/**
 * Category-specific verification checklists
 */

import type { ChecklistItem } from './types';

export const CATEGORY_CHECKLISTS: Record<string, ChecklistItem[]> = {
  // Base cookware checklist
  cookware: [
    {
      id: 'food_contact_identified',
      label: 'Food-contact surface material identified',
      required: true,
    },
    {
      id: 'coating_identified',
      label: 'Food-contact coating identified (or "none" confirmed)',
      required: true,
    },
    {
      id: 'handle_documented',
      label: 'Handle material documented',
      required: false,
    },
    {
      id: 'lid_documented',
      label: 'Lid material documented (if included)',
      required: false,
    },
  ],

  // Non-stick cookware - additional checks
  cookware_nonstick: [
    {
      id: 'coating_type_clarified',
      label: 'Coating type clarified (PTFE = REJECT, ceramic = proceed)',
      required: true,
    },
    {
      id: 'brand_confirms_pfas_free',
      label: 'Brand confirms coating is PFAS-free',
      required: true,
    },
    {
      id: 'coating_brand_documented',
      label: 'Coating brand name documented (e.g., Thermolon)',
      required: false,
    },
    {
      id: 'reinforcement_checked',
      label: 'Reinforcement materials checked (diamond, titanium)',
      required: false,
    },
  ],

  // Ceramic cookware - sol-gel verification
  cookware_ceramic: [
    {
      id: 'sol_gel_confirmed',
      label: 'Coating is sol-gel based (not PTFE with ceramic particles)',
      required: true,
    },
    {
      id: 'tech_spec_available',
      label: 'Brand provides technical specification',
      required: false,
    },
    {
      id: 'no_pfas_in_layers',
      label: 'No PFAS in binder or primer layers confirmed',
      required: true,
    },
  ],

  // Enameled cast iron
  cookware_enameled: [
    {
      id: 'enamel_type',
      label: 'Enamel type confirmed (vitreous/porcelain)',
      required: true,
    },
    {
      id: 'interior_enamel',
      label: 'Interior cooking surface is enameled (not just exterior)',
      required: true,
    },
  ],

  // Bakeware
  bakeware: [
    {
      id: 'food_contact_surface',
      label: 'Food-contact surface material identified',
      required: true,
    },
    {
      id: 'coating_status',
      label: 'Coating presence and type documented',
      required: true,
    },
    {
      id: 'silicone_check',
      label: 'Silicone products: brand confirms PFAS-free',
      required: false,
    },
  ],

  // Food storage
  food_storage: [
    {
      id: 'container_material',
      label: 'Container material identified',
      required: true,
    },
    {
      id: 'lid_seal_material',
      label: 'Lid and seal material documented',
      required: true,
    },
    {
      id: 'water_resistance_treatment',
      label: 'Water/grease resistance treatment checked',
      required: true,
    },
  ],
};

/**
 * Get checklist for a category, including parent category items
 */
export function getCategoryChecklists(categorySlug: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Add base category items
  if (CATEGORY_CHECKLISTS[categorySlug]) {
    items.push(...CATEGORY_CHECKLISTS[categorySlug]);
  }

  // Add parent category items (e.g., cookware for cookware_ceramic)
  const parentCategory = categorySlug.split('_')[0];
  if (parentCategory !== categorySlug && CATEGORY_CHECKLISTS[parentCategory]) {
    items.push(...CATEGORY_CHECKLISTS[parentCategory]);
  }

  return items;
}

/**
 * Calculate max achievable tier based on checklist completion
 */
export function calculateMaxTier(
  checklist: ChecklistItem[],
  hasLabReport: boolean,
  hasOngoingMonitoring: boolean
): number {
  // Check if all required items are completed
  const requiredItems = checklist.filter((item) => item.required);
  const allRequiredComplete = requiredItems.every((item) => item.completed);

  if (!allRequiredComplete) {
    return 0; // Can't achieve any tier without required items
  }

  // Tier 4 requires ongoing monitoring
  if (hasOngoingMonitoring && hasLabReport) {
    return 4;
  }

  // Tier 3 requires lab report
  if (hasLabReport) {
    return 3;
  }

  // Tier 2 requires policy documentation
  const hasPolicyDoc = checklist.some(
    (item) => item.id.includes('policy') && item.completed
  );
  if (hasPolicyDoc) {
    return 2;
  }

  // Tier 1 for brand statement only
  return 1;
}
