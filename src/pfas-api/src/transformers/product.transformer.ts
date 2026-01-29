/**
 * Product transformers for PFAS-Free Kitchen Platform API
 * Transform database rows to API response format
 */

import type { VerificationTier, ClaimType } from '../types/domain.types.js';
import { TIER_LABELS, CLAIM_TYPE_LABELS } from '../types/domain.types.js';
import type {
  ProductListItem,
  ProductDetail,
  ProductDetailComponent,
  ProductDetailVerification,
  ProductDetailEvidence,
  ProductDetailRetailer,
  CompareProductItem,
  CategoryListItem,
} from '../types/api.types.js';
import type { ProductWithRelations } from '../repositories/product.repository.js';
import type { ComponentWithRelations } from '../repositories/component.repository.js';
import type { CategoryTree } from '../repositories/category.repository.js';
import type { EvidenceObjectRow, RetailerRow } from '../types/database.types.js';

/**
 * Transform product to list item
 */
export function toProductListItem(product: ProductWithRelations): ProductListItem {
  const tier = product.verification?.tier 
    ? parseInt(product.verification.tier, 10) as VerificationTier 
    : 0 as VerificationTier;
  
  const claimType = product.verification?.claim_type as ClaimType | undefined;
  const evidenceCount = product.verification?.evidence_ids?.length || 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
    },
    category: {
      id: product.category.id,
      name: product.category.name,
      path: product.category.path_slugs || [],
    },
    primaryImageUrl: product.primary_image_url || undefined,
    materialSummary: product.material_summary || undefined,
    coatingSummary: product.coating_summary || undefined,
    verification: {
      tier,
      tierLabel: TIER_LABELS[tier],
      claimType,
      claimLabel: claimType ? CLAIM_TYPE_LABELS[claimType] : undefined,
      hasEvidence: evidenceCount > 0,
      evidenceCount,
    },
    retailers: product.retailers.map(r => ({
      id: r.id,
      name: r.name,
      icon: r.icon_name || undefined,
    })),
    features: {
      inductionCompatible: (product.features as Record<string, unknown>)?.induction_compatible as boolean | undefined,
      ovenSafeTempF: (product.features as Record<string, unknown>)?.oven_safe_temp_f as number | undefined,
      dishwasherSafe: (product.features as Record<string, unknown>)?.dishwasher_safe as boolean | undefined,
    },
  };
}

/**
 * Transform product to full detail
 */
export function toProductDetail(product: ProductWithRelations): ProductDetail {
  const tier = product.verification?.tier 
    ? parseInt(product.verification.tier, 10) as VerificationTier 
    : 0 as VerificationTier;
  
  const claimType = product.verification?.claim_type as ClaimType | undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || undefined,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
      website: product.brand.website || undefined,
      country: product.brand.country || undefined,
    },
    category: {
      id: product.category.id,
      name: product.category.name,
      path: product.category.path_slugs || [],
      slug: product.category.slug,
    },
    images: product.primary_image_url 
      ? [{ url: product.primary_image_url, alt: product.name, primary: true }]
      : [],
    components: product.components.map(c => toComponentResponse(c)),
    verification: product.verification ? toVerificationResponse(product.verification, tier, claimType) : undefined,
    evidence: (product.evidence || []).map(e => toEvidenceResponse(e)),
    retailers: product.retailers.map(r => toRetailerResponse(r)),
    features: {
      inductionCompatible: (product.features as Record<string, unknown>)?.induction_compatible as boolean | undefined,
      ovenSafeTempF: (product.features as Record<string, unknown>)?.oven_safe_temp_f as number | undefined,
      ovenSafeTempC: (product.features as Record<string, unknown>)?.oven_safe_temp_c as number | undefined,
      dishwasherSafe: (product.features as Record<string, unknown>)?.dishwasher_safe as boolean | undefined,
      metalUtensilSafe: (product.features as Record<string, unknown>)?.metal_utensil_safe as boolean | undefined,
      sizesAvailable: (product.features as Record<string, unknown>)?.sizes_available as string[] | undefined,
      weightLbs: (product.features as Record<string, unknown>)?.weight_lbs as number | undefined,
    },
    status: product.status,
    createdAt: product.created_at.toISOString(),
    updatedAt: product.updated_at.toISOString(),
  };
}

/**
 * Transform component to API response
 */
export function toComponentResponse(component: ComponentWithRelations): ProductDetailComponent {
  return {
    id: component.id,
    name: component.name,
    foodContact: component.food_contact,
    material: component.material ? {
      id: component.material.id,
      name: component.material.name,
      family: component.material.family || undefined,
    } : undefined,
    coating: component.coating ? {
      id: component.coating.id,
      name: component.coating.name,
      type: component.coating.type || undefined,
    } : null,
    pfasRiskFlag: component.pfas_risk_flag,
  };
}

/**
 * Transform verification to API response
 */
function toVerificationResponse(
  verification: NonNullable<ProductWithRelations['verification']>,
  tier: VerificationTier,
  claimType: ClaimType | undefined
): ProductDetailVerification {
  return {
    id: verification.id,
    tier,
    tierLabel: TIER_LABELS[tier],
    claimType,
    claimTypeLabel: claimType ? CLAIM_TYPE_LABELS[claimType] : undefined,
    claimTypeDescription: claimType ? getClaimTypeDescription(claimType) : undefined,
    scopeText: verification.scope_text || undefined,
    scopeComponentIds: verification.scope_component_ids || undefined,
    confidenceScore: verification.confidence_score || undefined,
    decisionDate: verification.decision_date?.toISOString().split('T')[0],
    evidenceIds: verification.evidence_ids || undefined,
    unknowns: verification.unknowns || undefined,
  };
}

/**
 * Transform evidence to API response
 */
function toEvidenceResponse(evidence: EvidenceObjectRow): ProductDetailEvidence {
  const metadata = evidence.metadata as Record<string, unknown>;
  const isLabReport = evidence.type === 'lab_report';
  const isBrandStatement = evidence.type === 'brand_statement';

  return {
    id: evidence.id,
    type: evidence.type as ProductDetailEvidence['type'],
    typeLabel: getEvidenceTypeLabel(evidence.type),
    source: getEvidenceSourceLabel(evidence.source),
    labName: isLabReport ? metadata.lab_name as string : undefined,
    methodSummary: isLabReport ? metadata.method as string : undefined,
    analyteCount: isLabReport ? metadata.analyte_count as number : undefined,
    lodLoq: isLabReport && metadata.lod_ng_g ? {
      lodNgG: metadata.lod_ng_g as number,
      loqNgG: metadata.loq_ng_g as number,
      explanation: `Can detect PFAS at ${metadata.lod_ng_g} ppb; can measure at ${metadata.loq_ng_g} ppb`,
    } : undefined,
    sampleScope: isLabReport && metadata.sample_scope ? {
      units: (metadata.sample_scope as Record<string, unknown>).units as number,
      lots: (metadata.sample_scope as Record<string, unknown>).lots as number,
      components: [], // TODO: Resolve component IDs to names
    } : undefined,
    statementText: isBrandStatement ? metadata.statement_text as string : undefined,
    statementDate: isBrandStatement ? metadata.statement_date as string : undefined,
    collectionDate: isLabReport ? metadata.collection_date as string : undefined,
    receivedDate: evidence.received_at.toISOString().split('T')[0],
    artifactUrl: `/api/v1/evidence/${evidence.id}/artifact`,
    expiresAt: evidence.expires_at?.toISOString().split('T')[0],
  };
}

/**
 * Transform retailer to API response
 */
function toRetailerResponse(retailer: RetailerRow): ProductDetailRetailer {
  return {
    id: retailer.id,
    name: retailer.name,
    icon: retailer.icon_name || undefined,
    productUrlMasked: true, // Always mask until affiliate link is generated
  };
}

/**
 * Transform product to compare item
 */
export function toCompareProductItem(product: ProductWithRelations): CompareProductItem {
  const tier = product.verification?.tier 
    ? parseInt(product.verification.tier, 10) as VerificationTier 
    : 0 as VerificationTier;
  
  const claimType = product.verification?.claim_type as ClaimType | undefined;
  const evidenceCount = product.verification?.evidence_ids?.length || 0;

  // Determine food contact surface from components
  const foodContactComponents = product.components.filter(c => c.food_contact);
  let foodContactSurface = 'Unknown';
  if (foodContactComponents.length > 0) {
    const coatings = foodContactComponents.map(c => c.coating?.type).filter(Boolean);
    if (coatings.includes('none') || coatings.length === 0) {
      const materials = foodContactComponents.map(c => c.material?.family).filter(Boolean);
      if (materials.includes('Metal')) {
        foodContactSurface = 'Bare metal';
      } else if (materials.includes('Glass')) {
        foodContactSurface = 'Glass';
      } else if (materials.includes('Ceramic')) {
        foodContactSurface = 'Ceramic';
      }
    } else if (coatings.includes('enamel')) {
      foodContactSurface = 'Enamel';
    } else if (coatings.includes('ceramic_sol_gel')) {
      foodContactSurface = 'Ceramic coating';
    }
  }

  return {
    id: product.id,
    name: product.name,
    brandName: product.brand.name,
    verificationTier: tier,
    claimType,
    materialSummary: product.material_summary || undefined,
    coatingSummary: product.coating_summary || undefined,
    foodContactSurface,
    evidenceCount,
    features: {
      inductionCompatible: (product.features as Record<string, unknown>)?.induction_compatible as boolean | undefined,
      ovenSafeTempF: (product.features as Record<string, unknown>)?.oven_safe_temp_f as number | undefined,
      dishwasherSafe: (product.features as Record<string, unknown>)?.dishwasher_safe as boolean | undefined,
    },
  };
}

/**
 * Compute differences between products
 */
export function computeProductDifferences(products: CompareProductItem[]): string[] {
  if (products.length < 2) return [];

  const differences: string[] = [];
  const [first, ...rest] = products;

  // Check each comparable field
  if (rest.some(p => p.verificationTier !== first.verificationTier)) {
    differences.push('verification_tier');
  }
  if (rest.some(p => p.claimType !== first.claimType)) {
    differences.push('claim_type');
  }
  if (rest.some(p => p.materialSummary !== first.materialSummary)) {
    differences.push('material_summary');
  }
  if (rest.some(p => p.coatingSummary !== first.coatingSummary)) {
    differences.push('coating_summary');
  }
  if (rest.some(p => p.foodContactSurface !== first.foodContactSurface)) {
    differences.push('food_contact_surface');
  }
  if (rest.some(p => p.features.inductionCompatible !== first.features.inductionCompatible)) {
    differences.push('induction_compatible');
  }
  if (rest.some(p => p.features.ovenSafeTempF !== first.features.ovenSafeTempF)) {
    differences.push('oven_safe_temp_f');
  }
  if (rest.some(p => p.features.dishwasherSafe !== first.features.dishwasherSafe)) {
    differences.push('dishwasher_safe');
  }

  return differences;
}

/**
 * Transform category tree to API response
 */
export function toCategoryListItem(category: CategoryTree): CategoryListItem {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parent_id || undefined,
    productCount: category.product_count,
    children: category.children.map(c => toCategoryListItem(c)),
  };
}

// Helper functions

function getClaimTypeDescription(claimType: ClaimType): string {
  const descriptions: Record<ClaimType, string> = {
    A: 'Brand confirms no PFAS are intentionally added to the product.',
    B: 'Lab tested for specific PFAS compounds; all below detection limits.',
    C: 'Third-party certified as PFAS-free.',
  };
  return descriptions[claimType];
}

function getEvidenceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    lab_report: 'Lab Report',
    brand_statement: 'Brand Statement',
    policy_document: 'Policy Document',
    screenshot: 'Screenshot',
    correspondence: 'Correspondence',
  };
  return labels[type] || type;
}

function getEvidenceSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    brand_submission: 'Brand submission',
    retailer: 'Retailer',
    user_report: 'User report',
    internal: 'Internal',
  };
  return labels[source] || source;
}
