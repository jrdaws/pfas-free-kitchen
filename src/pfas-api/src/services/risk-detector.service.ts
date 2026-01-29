/**
 * Risk Detector Service
 * Detects PFAS risk terms in product text for triage and filtering
 */

import type {
  RiskLevel,
  RiskTerm,
  RiskDetectionResult,
} from '../types/canonical-product.types.js';
import { logger } from '../config/logger.js';

// ============================================================
// RISK TERM PATTERNS
// ============================================================

interface RiskPattern {
  pattern: RegExp;
  reason: string;
}

/**
 * Risk term patterns organized by severity level
 * 
 * auto_reject: Products that should not be in a PFAS-free catalog
 * high_risk: Likely contains PFAS, requires elevated review
 * moderate_risk: May contain PFAS, standard review but flagged
 */
const RISK_TERMS: Record<RiskLevel, RiskPattern[]> = {
  auto_reject: [
    { pattern: /\bPTFE\b/i, reason: 'PTFE is a fluoropolymer (PFAS)' },
    { pattern: /\bTeflon\b/i, reason: 'Teflon is a PTFE brand (PFAS)' },
    { pattern: /\bSilverstone\b/i, reason: 'Silverstone is PTFE-based' },
    { pattern: /\btitanium.{0,15}non-?stick/i, reason: 'Titanium nonstick is typically PTFE-based' },
    { pattern: /\bgranite.{0,15}non-?stick/i, reason: 'Granite nonstick is typically PTFE-based' },
    { pattern: /\bmarble.{0,15}non-?stick/i, reason: 'Marble nonstick is typically PTFE-based' },
    { pattern: /\bdiamond.{0,15}non-?stick/i, reason: 'Diamond nonstick is typically PTFE-based' },
    { pattern: /\bFEP\b/i, reason: 'FEP is a fluoropolymer (PFAS)' },
    { pattern: /\bPFA\b(?!\s*free)/i, reason: 'PFA is a fluoropolymer (PFAS)' },
    { pattern: /\bETFE\b/i, reason: 'ETFE is a fluoropolymer (PFAS)' },
    { pattern: /\bfluoropolymer/i, reason: 'Fluoropolymers are PFAS' },
  ],

  high_risk: [
    { pattern: /\bnon-?stick\b/i, reason: 'Nonstick coating may indicate PFAS - requires verification' },
    { pattern: /\bceramic.{0,20}non-?stick/i, reason: 'Ceramic nonstick requires verification of coating chemistry' },
    { pattern: /\bstain.{0,10}resist/i, reason: 'Stain resistance may indicate PFAS treatment' },
    { pattern: /\bwater.{0,10}repel/i, reason: 'Water repellency may indicate PFAS treatment' },
    { pattern: /\bgrease.{0,10}proof/i, reason: 'Grease proofing may indicate PFAS treatment' },
    { pattern: /\boil.{0,10}resist/i, reason: 'Oil resistance may indicate PFAS treatment' },
    { pattern: /\bscotchgard/i, reason: 'Scotchgard historically used PFAS' },
    { pattern: /\bGoreTex\b/i, reason: 'Gore-Tex uses PTFE membranes' },
    { pattern: /\beasy.{0,10}clean/i, reason: 'Easy-clean coatings may contain PFAS' },
  ],

  moderate_risk: [
    { pattern: /\bPFOA.{0,5}free\b/i, reason: 'PFOA-free does not mean PFAS-free' },
    { pattern: /\bPFOS.{0,5}free\b/i, reason: 'PFOS-free does not mean PFAS-free' },
    { pattern: /\bcoated\b/i, reason: 'Coating type should be verified' },
    { pattern: /\bcoating\b/i, reason: 'Coating type should be verified' },
    { pattern: /\banodized\b/i, reason: 'Hard-anodized aluminum may have additional coatings' },
    { pattern: /\breinforced\b/i, reason: 'Reinforcement may include fluoropolymer components' },
  ],

  low: [], // No patterns - baseline risk level
};

// ============================================================
// SAFE TERM PATTERNS (Override risk detection)
// ============================================================

/**
 * Patterns that indicate a product is explicitly PFAS-free
 * These can override moderate_risk flags but not high_risk or auto_reject
 */
const SAFE_PATTERNS: RiskPattern[] = [
  { pattern: /\bPFAS.{0,5}free\b/i, reason: 'Explicitly claims PFAS-free' },
  { pattern: /\bno\s+PFAS\b/i, reason: 'States no PFAS' },
  { pattern: /\bwithout\s+PFAS\b/i, reason: 'States without PFAS' },
  { pattern: /\buncoated\b/i, reason: 'Uncoated surface' },
  { pattern: /\bbare\s+(metal|steel|iron|cast)/i, reason: 'Bare metal cooking surface' },
  { pattern: /\bpre-?seasoned\s+(cast\s*iron|carbon\s*steel)/i, reason: 'Traditional seasoning only' },
];

// ============================================================
// SERVICE IMPLEMENTATION
// ============================================================

export class RiskDetectorService {
  /**
   * Detect PFAS risk terms in text
   */
  static detect(text: string): RiskDetectionResult {
    const terms: RiskTerm[] = [];
    const normalizedText = text.toLowerCase();
    
    // Check for auto_reject terms first (highest priority)
    for (const { pattern, reason } of RISK_TERMS.auto_reject) {
      const match = text.match(pattern);
      if (match) {
        terms.push({
          term: pattern.source,
          level: 'auto_reject',
          reason,
          matched: match[0],
          position: match.index,
        });
      }
    }

    // If auto_reject found, return immediately
    if (terms.length > 0) {
      return {
        terms,
        highestRisk: 'auto_reject',
        requiresElevatedReview: true,
        autoReject: true,
        autoRejectReason: terms[0].reason,
      };
    }

    // Check for high_risk terms
    for (const { pattern, reason } of RISK_TERMS.high_risk) {
      const match = text.match(pattern);
      if (match) {
        terms.push({
          term: pattern.source,
          level: 'high_risk',
          reason,
          matched: match[0],
          position: match.index,
        });
      }
    }

    // Check for moderate_risk terms
    for (const { pattern, reason } of RISK_TERMS.moderate_risk) {
      const match = text.match(pattern);
      if (match) {
        terms.push({
          term: pattern.source,
          level: 'moderate_risk',
          reason,
          matched: match[0],
          position: match.index,
        });
      }
    }

    // Check for safe patterns that might reduce risk level
    const safeMatches = SAFE_PATTERNS.filter(({ pattern }) => pattern.test(text));
    
    // Determine highest risk level
    const highestRisk = this.getHighestRisk(terms);
    
    // Safe patterns can reduce moderate_risk to low, but not high_risk
    const effectiveRisk = (
      highestRisk === 'moderate_risk' && safeMatches.length > 0
    ) ? 'low' : highestRisk;

    return {
      terms,
      highestRisk: effectiveRisk,
      requiresElevatedReview: effectiveRisk === 'high_risk',
      autoReject: false,
    };
  }

  /**
   * Get the highest risk level from detected terms
   */
  private static getHighestRisk(terms: RiskTerm[]): RiskLevel {
    if (terms.some(t => t.level === 'auto_reject')) return 'auto_reject';
    if (terms.some(t => t.level === 'high_risk')) return 'high_risk';
    if (terms.some(t => t.level === 'moderate_risk')) return 'moderate_risk';
    return 'low';
  }

  /**
   * Detect risk in multiple text fields and combine results
   */
  static detectInProduct(product: {
    name: string;
    description?: string;
    rawAttributes?: Record<string, string>;
  }): RiskDetectionResult {
    // Combine all text for detection
    const textParts = [
      product.name,
      product.description || '',
      ...Object.values(product.rawAttributes || {}),
    ];
    
    const fullText = textParts.join(' ');
    const result = this.detect(fullText);
    
    logger.debug({
      productName: product.name.substring(0, 100),
      termsFound: result.terms.length,
      highestRisk: result.highestRisk,
      autoReject: result.autoReject,
    }, 'Risk detection complete');

    return result;
  }

  /**
   * Check if a specific term is in the auto-reject list
   */
  static isAutoRejectTerm(term: string): boolean {
    return RISK_TERMS.auto_reject.some(({ pattern }) => pattern.test(term));
  }

  /**
   * Get human-readable summary of risk detection
   */
  static getSummary(result: RiskDetectionResult): string {
    if (result.autoReject) {
      return `AUTO-REJECT: ${result.autoRejectReason}`;
    }
    if (result.highestRisk === 'high_risk') {
      return `HIGH RISK: ${result.terms.filter(t => t.level === 'high_risk').map(t => t.matched).join(', ')}`;
    }
    if (result.highestRisk === 'moderate_risk') {
      return `MODERATE RISK: Requires verification`;
    }
    return 'LOW RISK: No concerning terms detected';
  }
}
