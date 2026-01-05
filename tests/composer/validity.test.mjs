/**
 * Composition Validity Tests
 * 
 * Ensures that compositions are valid - all patterns exist,
 * all required props are provided, and structure is correct.
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

function createMockInput(pageType = "home") {
  return {
    vision: {
      projectName: "TestApp",
      description: "A test application",
      audience: "developers",
      tone: "professional",
    },
    pageType,
    availablePatterns: getAvailablePatterns(),
  };
}

// ============================================================================
// Pattern ID Validation Tests
// ============================================================================

describe("Composition Validity - Pattern IDs", () => {
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

  test("all pattern IDs in composition exist in registry", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      const exists = getPatternById(section.patternId) !== undefined;
      assert.ok(exists, `Pattern ${section.patternId} should exist`);
    });
  });

  test("no duplicate hero patterns for home page", async () => {
    const input = createMockInput("home");
    const result = await selectPatterns(input);

    const heroPatterns = result.sections.filter(s => 
      s.patternId.includes("hero")
    );
    assert.ok(heroPatterns.length <= 1, "Should have at most one hero");
  });

  test("no duplicate footer patterns", async () => {
    const input = createMockInput("home");
    const result = await selectPatterns(input);

    const footerPatterns = result.sections.filter(s => 
      s.patternId.includes("footer")
    );
    assert.ok(footerPatterns.length <= 1, "Should have at most one footer");
  });

  test("pattern IDs follow naming convention", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      // Pattern IDs should be kebab-case
      assert.match(
        section.patternId,
        /^[a-z][a-z0-9-]*[a-z0-9]$/,
        `${section.patternId} should be kebab-case`
      );
    });
  });
});

// ============================================================================
// Slot Requirements Tests
// ============================================================================

describe("Composition Validity - Slot Requirements", () => {
  test("all patterns have defined slot requirements", () => {
    const patterns = getAvailablePatterns();

    patterns.forEach(pattern => {
      assert.ok(pattern.slots, `Pattern ${pattern.id} should have slots`);
      assert.ok(Array.isArray(pattern.slots), "Slots should be array");
    });
  });

  test("required slots are properly marked", () => {
    const patterns = getAvailablePatterns();

    patterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        assert.equal(typeof slot.required, "boolean");
      });
    });
  });

  test("slots have valid type definitions", () => {
    const validTypes = ["text", "richText", "image", "array", "boolean", "number", "object"];
    const patterns = getAvailablePatterns();

    patterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        assert.ok(
          validTypes.includes(slot.type),
          `Slot ${slot.name} in ${pattern.id} has invalid type: ${slot.type}`
        );
      });
    });
  });
});

// ============================================================================
// Composition Structure Tests
// ============================================================================

describe("Composition Validity - Structure", () => {
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

  test("sections have valid order numbers", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      assert.ok(section.order > 0, "Order should be positive");
      assert.ok(Number.isInteger(section.order), "Order should be integer");
    });
  });

  test("sections have valid confidence scores", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      assert.ok(section.confidenceScore >= 0, "Confidence should be >= 0");
      assert.ok(section.confidenceScore <= 100, "Confidence should be <= 100");
    });
  });

  test("sections have valid variant strings", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      assert.equal(typeof section.variant, "string");
      assert.ok(section.variant.length > 0, "Variant should not be empty");
    });
  });

  test("sections have reason strings", async () => {
    const input = createMockInput();
    const result = await selectPatterns(input);

    result.sections.forEach(section => {
      assert.equal(typeof section.reason, "string");
      assert.ok(section.reason.length > 0, "Reason should not be empty");
    });
  });

  test("layout recommendation is valid", async () => {
    const validLayouts = [
      "layout-marketing",
      "layout-dashboard",
      "layout-blog",
      "layout-ecommerce",
      "layout-minimal",
    ];

    const input = createMockInput();
    const result = await selectPatterns(input);

    assert.ok(
      validLayouts.includes(result.layoutRecommendation),
      `Layout ${result.layoutRecommendation} should be valid`
    );
  });
});

// ============================================================================
// Page-Specific Validation
// ============================================================================

describe("Composition Validity - Page Requirements", () => {
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

  test("home page has navigation and footer", async () => {
    const input = createMockInput("home");
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    
    const hasNav = patternIds.some(id => id.includes("nav"));
    const hasFooter = patternIds.some(id => id.includes("footer"));

    assert.ok(hasNav, "Home page should have navigation");
    assert.ok(hasFooter, "Home page should have footer");
  });

  test("pricing page has pricing pattern", async () => {
    const input = createMockInput("pricing");
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    const hasPricing = patternIds.some(id => id.includes("pricing"));

    assert.ok(hasPricing, "Pricing page should have pricing pattern");
  });

  test("about page has hero section", async () => {
    const input = createMockInput("about");
    const result = await selectPatterns(input);

    const patternIds = result.sections.map(s => s.patternId);
    const hasHero = patternIds.some(id => id.includes("hero"));

    assert.ok(hasHero, "About page should have hero section");
  });
});

// ============================================================================
// Variant Validation
// ============================================================================

describe("Composition Validity - Variants", () => {
  test("all patterns have at least one variant", () => {
    const patterns = getAvailablePatterns();

    patterns.forEach(pattern => {
      assert.ok(pattern.variants.length > 0, `${pattern.id} should have variants`);
    });
  });

  test("many patterns support dark variant", () => {
    const patterns = getAvailablePatterns();
    const patternsWithDark = patterns.filter(p => p.variants.includes("dark"));

    assert.ok(
      patternsWithDark.length > patterns.length * 0.5,
      "Most patterns should support dark variant"
    );
  });

  test("many patterns support light variant", () => {
    const patterns = getAvailablePatterns();
    const patternsWithLight = patterns.filter(p => p.variants.includes("light"));

    assert.ok(
      patternsWithLight.length > patterns.length * 0.5,
      "Most patterns should support light variant"
    );
  });
});
