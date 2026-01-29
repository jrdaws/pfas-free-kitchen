/**
 * Enrichment Service
 * Extracts structured data from raw product text using NLP patterns
 */

import type { ProductFeatures } from '../types/domain.types.js';
import type {
  CanonicalProduct,
  EnrichedProduct,
  ExtractedMaterial,
  ExtractedCoating,
  ExtractedComponent,
} from '../types/canonical-product.types.js';
import { RiskDetectorService } from './risk-detector.service.js';
import { logger } from '../config/logger.js';

// ============================================================
// MATERIAL PATTERNS
// ============================================================

interface MaterialPattern {
  pattern: RegExp;
  slug: string;
  name: string;
  family: string;
}

const MATERIAL_PATTERNS: MaterialPattern[] = [
  // Metals
  { pattern: /\bstainless\s*steel\b/i, slug: 'stainless_steel', name: 'Stainless Steel', family: 'Metal' },
  { pattern: /\b18\/10\s*steel\b/i, slug: 'stainless_steel', name: 'Stainless Steel', family: 'Metal' },
  { pattern: /\b18\/8\s*steel\b/i, slug: 'stainless_steel', name: 'Stainless Steel', family: 'Metal' },
  { pattern: /\bcast\s*iron\b/i, slug: 'cast_iron', name: 'Cast Iron', family: 'Metal' },
  { pattern: /\bcarbon\s*steel\b/i, slug: 'carbon_steel', name: 'Carbon Steel', family: 'Metal' },
  { pattern: /\baluminum\b|\baluminium\b/i, slug: 'aluminum', name: 'Aluminum', family: 'Metal' },
  { pattern: /\bcopper\b/i, slug: 'copper', name: 'Copper', family: 'Metal' },
  { pattern: /\btri-?ply\b/i, slug: 'tri_ply', name: 'Tri-Ply', family: 'Metal' },
  
  // Glass
  { pattern: /\bborosilicate\s*glass\b/i, slug: 'borosilicate_glass', name: 'Borosilicate Glass', family: 'Glass' },
  { pattern: /\btempered\s*glass\b/i, slug: 'tempered_glass', name: 'Tempered Glass', family: 'Glass' },
  { pattern: /\bglass\b/i, slug: 'glass', name: 'Glass', family: 'Glass' },
  
  // Ceramic
  { pattern: /\bceramic\b(?!.*non-?stick)/i, slug: 'ceramic', name: 'Ceramic', family: 'Ceramic' },
  { pattern: /\bstoneware\b/i, slug: 'stoneware', name: 'Stoneware', family: 'Ceramic' },
  { pattern: /\bporcelain\b/i, slug: 'porcelain', name: 'Porcelain', family: 'Ceramic' },
  
  // Other
  { pattern: /\bsilicone\b/i, slug: 'silicone', name: 'Silicone', family: 'Polymer' },
  { pattern: /\bwood\b/i, slug: 'wood', name: 'Wood', family: 'Natural' },
  { pattern: /\bbamboo\b/i, slug: 'bamboo', name: 'Bamboo', family: 'Natural' },
];

// ============================================================
// COATING PATTERNS
// ============================================================

interface CoatingPattern {
  pattern: RegExp;
  slug: string;
  name: string;
  type: string;
  isFluoropolymer: boolean;
}

const COATING_PATTERNS: CoatingPattern[] = [
  // Safe coatings
  { pattern: /\benamel\b|\bvitreous\b|\bporcelain.{0,10}enamel/i, slug: 'enamel', name: 'Enamel', type: 'enamel', isFluoropolymer: false },
  { pattern: /\bseasoned\b|\bpre-?seasoned\b/i, slug: 'seasoning', name: 'Seasoning', type: 'seasoning', isFluoropolymer: false },
  { pattern: /\buncoated\b|\bbare\b/i, slug: 'none', name: 'None (Uncoated)', type: 'none', isFluoropolymer: false },
  { pattern: /\banodized\b|\bhard.{0,5}anodized/i, slug: 'anodized', name: 'Anodized', type: 'anodized', isFluoropolymer: false },
  
  // Requires verification
  { pattern: /\bceramic.{0,20}(non-?stick|coating)/i, slug: 'ceramic_sol_gel', name: 'Ceramic Sol-Gel', type: 'ceramic_sol_gel', isFluoropolymer: false },
  { pattern: /\bnon-?stick\b(?!.*ceramic)/i, slug: 'unknown_nonstick', name: 'Unknown Nonstick', type: 'unknown', isFluoropolymer: false },
  
  // Fluoropolymer (will trigger auto-reject)
  { pattern: /\bPTFE\b/i, slug: 'ptfe', name: 'PTFE (Teflon)', type: 'fluoropolymer', isFluoropolymer: true },
  { pattern: /\bTeflon\b/i, slug: 'ptfe', name: 'PTFE (Teflon)', type: 'fluoropolymer', isFluoropolymer: true },
];

// ============================================================
// FEATURE EXTRACTION PATTERNS
// ============================================================

const FEATURE_PATTERNS = {
  ovenSafeTempF: /oven.{0,30}?(\d{3,4})\s*°?\s*F/i,
  ovenSafeTempC: /oven.{0,30}?(\d{2,3})\s*°?\s*C/i,
  inductionCompatible: /\binduction\s*(compatible|ready|safe)?\b/i,
  dishwasherSafe: /\bdishwasher.{0,10}safe\b/i,
  metalUtensilSafe: /\bmetal.{0,10}utensil.{0,10}safe\b/i,
  microwaveSafe: /\bmicrowave.{0,10}safe\b/i,
  freezerSafe: /\bfreezer.{0,10}safe\b/i,
  sizeInches: /(\d+(?:\.\d+)?)\s*(?:inch|in|"|-inch)/i,
  sizeQuarts: /(\d+(?:\.\d+)?)\s*(?:quart|qt)/i,
  sizeLiters: /(\d+(?:\.\d+)?)\s*(?:liter|litre|L)\b/i,
};

// ============================================================
// CATEGORY MAPPING
// ============================================================

const CATEGORY_HINTS: Record<string, string[]> = {
  'cat_cookware_skillets': ['skillet', 'frying pan', 'frypan', 'saute pan'],
  'cat_cookware_saucepans': ['saucepan', 'sauce pan', 'pot'],
  'cat_cookware_stockpots': ['stock pot', 'stockpot', 'dutch oven', 'cocotte'],
  'cat_cookware_woks': ['wok'],
  'cat_cookware_griddles': ['griddle', 'grill pan', 'grillpan'],
  'cat_bakeware_sheets': ['sheet pan', 'baking sheet', 'cookie sheet', 'jelly roll'],
  'cat_bakeware_cake': ['cake pan', 'springform', 'bundt'],
  'cat_bakeware_muffin': ['muffin', 'cupcake'],
  'cat_bakeware_loaf': ['loaf pan', 'bread pan'],
  'cat_bakeware_dishes': ['baking dish', 'casserole', 'roasting pan'],
  'cat_storage_glass': ['glass container', 'glass storage', 'pyrex'],
  'cat_storage_stainless': ['stainless container', 'steel container'],
  'cat_storage_silicone': ['silicone bag', 'silicone pouch'],
};

// ============================================================
// SERVICE IMPLEMENTATION
// ============================================================

const ENRICHMENT_VERSION = '1.0.0';

export class EnrichmentService {
  /**
   * Enrich a canonical product with extracted data
   */
  static async enrich(product: CanonicalProduct): Promise<EnrichedProduct> {
    const fullText = this.buildFullText(product);
    
    // Extract structured data
    const materials = this.extractMaterials(fullText);
    const coatings = this.extractCoatings(fullText);
    const features = this.extractFeatures(fullText);
    
    // Detect risk terms
    const riskDetection = RiskDetectorService.detectInProduct({
      name: product.name,
      description: product.description,
      rawAttributes: product.rawAttributes,
    });
    
    // Build components from extracted data
    const components = this.buildComponents(product.name, materials, coatings);
    
    // Map to category
    const categoryId = this.mapCategory(fullText, product.categoryHint);
    
    // Generate summaries
    const materialSummary = this.generateMaterialSummary(materials);
    const coatingSummary = this.generateCoatingSummary(coatings);
    
    const enriched: EnrichedProduct = {
      ...product,
      
      // Extracted data
      materials,
      coatings,
      components,
      features,
      
      // Risk assessment
      riskTerms: riskDetection.terms,
      riskDetection,
      pfasRiskFlagged: riskDetection.highestRisk !== 'low',
      requiresElevatedReview: riskDetection.requiresElevatedReview,
      
      // Category
      categoryId,
      
      // Summaries
      materialSummary,
      coatingSummary,
      
      // Metadata
      enrichedAt: new Date(),
      enrichmentVersion: ENRICHMENT_VERSION,
    };

    logger.info({
      productName: product.name.substring(0, 80),
      materials: materials.length,
      coatings: coatings.length,
      riskLevel: riskDetection.highestRisk,
      categoryId,
    }, 'Product enriched');

    return enriched;
  }

  /**
   * Build full text for extraction
   */
  private static buildFullText(product: CanonicalProduct): string {
    return [
      product.name,
      product.description || '',
      ...Object.values(product.rawAttributes),
    ].join(' ');
  }

  /**
   * Extract materials from text
   */
  static extractMaterials(text: string): ExtractedMaterial[] {
    const materials: ExtractedMaterial[] = [];
    const seen = new Set<string>();
    
    for (const { pattern, slug, name, family } of MATERIAL_PATTERNS) {
      const match = text.match(pattern);
      if (match && !seen.has(slug)) {
        seen.add(slug);
        materials.push({
          slug,
          name,
          confidence: 0.9, // Pattern match confidence
          extractedFrom: match[0],
        });
      }
    }
    
    return materials;
  }

  /**
   * Extract coatings from text
   */
  static extractCoatings(text: string): ExtractedCoating[] {
    const coatings: ExtractedCoating[] = [];
    const seen = new Set<string>();
    
    for (const { pattern, slug, name, type, isFluoropolymer } of COATING_PATTERNS) {
      const match = text.match(pattern);
      if (match && !seen.has(slug)) {
        seen.add(slug);
        coatings.push({
          slug,
          name,
          confidence: 0.85,
          extractedFrom: match[0],
          isFluoropolymer,
        });
      }
    }
    
    // Default to unknown if has nonstick indicator but no specific coating
    if (coatings.length === 0 && /coating|coated/i.test(text)) {
      coatings.push({
        slug: 'unknown',
        name: 'Unknown Coating',
        confidence: 0.5,
        extractedFrom: 'coating indicator',
        isFluoropolymer: false,
      });
    }
    
    return coatings;
  }

  /**
   * Extract product features from text
   */
  static extractFeatures(text: string): ProductFeatures {
    const features: ProductFeatures = {};
    
    // Oven safe temperature
    const ovenF = text.match(FEATURE_PATTERNS.ovenSafeTempF);
    if (ovenF) {
      features.ovenSafeTempF = parseInt(ovenF[1], 10);
      features.ovenSafeTempC = Math.round((features.ovenSafeTempF - 32) * 5 / 9);
    }
    
    const ovenC = text.match(FEATURE_PATTERNS.ovenSafeTempC);
    if (ovenC && !features.ovenSafeTempF) {
      features.ovenSafeTempC = parseInt(ovenC[1], 10);
      features.ovenSafeTempF = Math.round(features.ovenSafeTempC * 9 / 5 + 32);
    }
    
    // Boolean features
    features.inductionCompatible = FEATURE_PATTERNS.inductionCompatible.test(text);
    features.dishwasherSafe = FEATURE_PATTERNS.dishwasherSafe.test(text);
    features.metalUtensilSafe = FEATURE_PATTERNS.metalUtensilSafe.test(text);
    features.microwaveSafe = FEATURE_PATTERNS.microwaveSafe.test(text);
    features.freezerSafe = FEATURE_PATTERNS.freezerSafe.test(text);
    
    // Size extraction
    const sizeInches = text.match(FEATURE_PATTERNS.sizeInches);
    if (sizeInches) {
      features.sizesAvailable = [`${sizeInches[1]}-inch`];
    }
    
    return features;
  }

  /**
   * Build component models from extracted materials and coatings
   */
  private static buildComponents(
    productName: string,
    materials: ExtractedMaterial[],
    coatings: ExtractedCoating[]
  ): ExtractedComponent[] {
    const components: ExtractedComponent[] = [];
    
    // Determine main component (food contact surface)
    const mainMaterial = materials[0];
    const mainCoating = coatings.find(c => c.slug !== 'none');
    
    if (mainMaterial || mainCoating) {
      components.push({
        name: this.guessMainComponentName(productName),
        foodContact: true,
        material: mainMaterial,
        coating: mainCoating,
        pfasRiskFlag: mainCoating?.isFluoropolymer || false,
      });
    }
    
    // Add handle component if detected
    if (/\bhandle\b/i.test(productName)) {
      components.push({
        name: 'Handle',
        foodContact: false,
        pfasRiskFlag: false,
      });
    }
    
    // Add lid component if detected
    if (/\bwith\s*lid\b|\blid\s*included/i.test(productName)) {
      components.push({
        name: 'Lid',
        foodContact: false,
        material: materials.find(m => m.slug === 'tempered_glass' || m.slug === 'glass'),
        pfasRiskFlag: false,
      });
    }
    
    return components;
  }

  /**
   * Guess main component name based on product type
   */
  private static guessMainComponentName(productName: string): string {
    const lower = productName.toLowerCase();
    
    if (/skillet|fry|pan|saute/i.test(lower)) return 'Pan Body';
    if (/pot|dutch|stock/i.test(lower)) return 'Pot Body';
    if (/wok/i.test(lower)) return 'Wok Body';
    if (/baking|sheet|cake|muffin|loaf/i.test(lower)) return 'Baking Surface';
    if (/container|storage/i.test(lower)) return 'Container';
    
    return 'Main Body';
  }

  /**
   * Map product to category based on text analysis
   */
  private static mapCategory(text: string, hint?: string): string | undefined {
    const lower = text.toLowerCase();
    
    // Check hint first
    if (hint) {
      const hintLower = hint.toLowerCase();
      for (const [categoryId, keywords] of Object.entries(CATEGORY_HINTS)) {
        if (keywords.some(kw => hintLower.includes(kw))) {
          return categoryId;
        }
      }
    }
    
    // Fall back to text analysis
    for (const [categoryId, keywords] of Object.entries(CATEGORY_HINTS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return categoryId;
      }
    }
    
    return undefined;
  }

  /**
   * Generate human-readable material summary
   */
  private static generateMaterialSummary(materials: ExtractedMaterial[]): string {
    if (materials.length === 0) return 'Unknown';
    return materials.map(m => m.name).join(', ');
  }

  /**
   * Generate human-readable coating summary
   */
  private static generateCoatingSummary(coatings: ExtractedCoating[]): string {
    const nonNone = coatings.filter(c => c.slug !== 'none');
    if (nonNone.length === 0) {
      return coatings.some(c => c.slug === 'none') ? 'None (uncoated)' : 'Unknown';
    }
    return nonNone.map(c => c.name).join(', ');
  }
}
