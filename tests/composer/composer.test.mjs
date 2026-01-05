/**
 * AI Composer Tests
 * 
 * Tests that the pattern selector correctly chooses patterns
 * based on project context and generates appropriate compositions.
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  selectPatterns,
  getAvailablePatterns,
  getPatternById,
} from "../../website/lib/composer/selector.js";

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockVision(overrides = {}) {
  return {
    projectName: "Test SaaS App",
    description: "A project management tool for remote teams",
    audience: "Remote teams and distributed companies",
    tone: "professional",
    goals: ["Convert visitors to signups", "Showcase key features"],
    keywords: ["productivity", "remote work", "collaboration"],
    ...overrides,
  };
}

function createMockSaaSInput(overrides = {}) {
  return {
    vision: createMockVision(),
    pageType: "home",
    availablePatterns: getAvailablePatterns(),
    ...overrides,
  };
}

// ============================================================================
// Pattern Selection Tests (Fallback Mode - No API Key)
// ============================================================================

describe("AI Composer - Fallback Mode", () => {
  // Store original env
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "";
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  test("returns fallback selection when no API key", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    assert.ok(result, "Result should exist");
    assert.ok(result.sections, "Result should have sections");
    assert.ok(Array.isArray(result.sections), "Sections should be array");
    assert.ok(result.sections.length > 0, "Should have sections");
  });

  test("fallback includes hero pattern for home page", async () => {
    const input = createMockSaaSInput({ pageType: "home" });
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    const hasHero = patternIds.some(id => id.includes("hero"));
    assert.ok(hasHero, "Should have hero pattern");
  });

  test("fallback includes pricing pattern for pricing page", async () => {
    const input = createMockSaaSInput({ pageType: "pricing" });
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    const hasPricing = patternIds.some(id => id.includes("pricing"));
    assert.ok(hasPricing, "Should have pricing pattern");
  });

  test("fallback includes footer pattern", async () => {
    const input = createMockSaaSInput({ pageType: "home" });
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    const hasFooter = patternIds.some(id => id.includes("footer"));
    assert.ok(hasFooter, "Should have footer pattern");
  });

  test("fallback sections have required fields", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      assert.ok(section.patternId, "Should have patternId");
      assert.equal(typeof section.patternId, "string");
      assert.ok(section.reason, "Should have reason");
      assert.ok(section.variant, "Should have variant");
      assert.equal(typeof section.order, "number");
      assert.equal(typeof section.confidenceScore, "number");
    });
  });

  test("fallback has layout recommendation", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    assert.ok(result.layoutRecommendation, "Should have layoutRecommendation");
    assert.equal(typeof result.layoutRecommendation, "string");
  });

  test("sections are ordered correctly", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    for (let i = 1; i < result.sections.length; i++) {
      assert.ok(
        result.sections[i].order > result.sections[i - 1].order,
        "Orders should increase"
      );
    }
  });
});

// ============================================================================
// Page Type Coverage Tests
// ============================================================================

describe("AI Composer - Page Type Coverage", () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "";
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  const pageTypes = ["home", "about", "pricing", "features", "blog", "contact", "product", "dashboard"];

  for (const pageType of pageTypes) {
    test(`generates valid selection for ${pageType} page`, async () => {
      const input = createMockSaaSInput({ pageType });
      const result = await selectPatterns(input);

      assert.ok(result.sections.length > 0, `${pageType} should have sections`);
      assert.ok(result.layoutRecommendation, `${pageType} should have layout`);
    });
  }
});

// ============================================================================
// Pattern Existence Verification
// ============================================================================

describe("AI Composer - Pattern Verification", () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "";
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  test("all selected patterns exist in registry", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      const pattern = getPatternById(section.patternId);
      assert.ok(pattern, `Pattern ${section.patternId} should exist`);
    });
  });

  test("selected variants are valid for their patterns", async () => {
    const input = createMockSaaSInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      const pattern = getPatternById(section.patternId);
      if (pattern) {
        const validVariants = pattern.variants;
        assert.ok(
          validVariants.includes(section.variant),
          `Variant ${section.variant} should be valid for ${section.patternId}`
        );
      }
    });
  });
});

// ============================================================================
// Selector Utility Tests
// ============================================================================

describe("AI Composer - Utility Functions", () => {
  test("getAvailablePatterns returns all patterns", () => {
    const patterns = getAvailablePatterns();
    assert.ok(patterns.length > 0, "Should have patterns");
  });

  test("getPatternById returns correct pattern", () => {
    const pattern = getPatternById("hero-centered");
    assert.ok(pattern, "Pattern should exist");
    assert.equal(pattern.id, "hero-centered");
    assert.equal(pattern.category, "hero");
  });

  test("getPatternById returns undefined for invalid ID", () => {
    const pattern = getPatternById("invalid-pattern-id");
    assert.equal(pattern, undefined);
  });
});
