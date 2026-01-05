/**
 * Pattern Registry Tests
 * 
 * Tests that the pattern registry is complete and all patterns
 * have the required metadata and structure.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Import from both registries
import { 
  getAllPatterns, 
  getPattern, 
  PATTERN_REGISTRY 
} from "../../packages/templates/patterns/registry.js";

import {
  getAvailablePatterns,
  getPatternById,
  getPatternsByCategory,
} from "../../website/lib/composer/selector.js";

// ============================================================================
// Package Pattern Registry Tests
// ============================================================================

describe("Pattern Registry (packages/templates/patterns)", () => {
  const patterns = getAllPatterns();

  test("loads all registered patterns", () => {
    assert.ok(patterns.length > 20, `Expected > 20 patterns, got ${patterns.length}`);
  });

  test("registry object has expected structure", () => {
    assert.ok(PATTERN_REGISTRY, "PATTERN_REGISTRY should be defined");
    assert.equal(typeof PATTERN_REGISTRY, "object");
  });

  test("getAllPatterns returns same count as PATTERN_REGISTRY", () => {
    assert.equal(patterns.length, Object.keys(PATTERN_REGISTRY).length);
  });

  test("getPattern returns correct pattern by ID", () => {
    const pattern = getPattern("button-primary");
    assert.ok(pattern, "Pattern should exist");
    assert.equal(pattern.id, "button-primary");
  });

  test("getPattern returns undefined for non-existent ID", () => {
    const pattern = getPattern("non-existent-pattern-xyz");
    assert.equal(pattern, undefined);
  });

  test("all pattern IDs are unique", () => {
    const ids = patterns.map(p => p.id);
    const uniqueIds = [...new Set(ids)];
    assert.equal(ids.length, uniqueIds.length, "Pattern IDs should be unique");
  });

  test("all patterns have required id", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.id, `Pattern should have id`);
      assert.equal(typeof pattern.id, "string");
      assert.ok(pattern.id.length > 0);
    });
  });

  test("all patterns have required name", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.name, `Pattern ${pattern.id} should have name`);
      assert.equal(typeof pattern.name, "string");
    });
  });

  test("all patterns have valid category", () => {
    const validCategories = ["atom", "molecule", "organism", "section", "layout"];
    patterns.forEach(pattern => {
      assert.ok(pattern.category, `Pattern ${pattern.id} should have category`);
      assert.ok(
        validCategories.includes(pattern.category),
        `Pattern ${pattern.id} has invalid category: ${pattern.category}`
      );
    });
  });

  test("all patterns have slots array", () => {
    patterns.forEach(pattern => {
      assert.ok(Array.isArray(pattern.slots), `Pattern ${pattern.id} should have slots array`);
    });
  });

  test("all slots have valid structure", () => {
    const validTypes = ["text", "image", "component", "array", "boolean", "number", "object"];
    patterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        assert.ok(slot.name, `Slot in ${pattern.id} should have name`);
        assert.ok(validTypes.includes(slot.type), `Slot ${slot.name} in ${pattern.id} has invalid type`);
        assert.equal(typeof slot.required, "boolean");
      });
    });
  });

  test("all patterns have component path", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.component, `Pattern ${pattern.id} should have component`);
      assert.equal(typeof pattern.component, "string");
    });
  });

  test("all patterns have variants array", () => {
    patterns.forEach(pattern => {
      assert.ok(Array.isArray(pattern.variants), `Pattern ${pattern.id} should have variants array`);
    });
  });

  test("all patterns have tags array", () => {
    patterns.forEach(pattern => {
      assert.ok(Array.isArray(pattern.tags), `Pattern ${pattern.id} should have tags array`);
      assert.ok(pattern.tags.length > 0, `Pattern ${pattern.id} should have at least one tag`);
    });
  });

  test("has atom patterns", () => {
    const atoms = patterns.filter(p => p.category === "atom");
    assert.ok(atoms.length > 0, "Should have atom patterns");
  });

  test("has molecule patterns", () => {
    const molecules = patterns.filter(p => p.category === "molecule");
    assert.ok(molecules.length > 0, "Should have molecule patterns");
  });

  test("has organism patterns", () => {
    const organisms = patterns.filter(p => p.category === "organism");
    assert.ok(organisms.length > 0, "Should have organism patterns");
  });

  test("has section patterns", () => {
    const sections = patterns.filter(p => p.category === "section");
    assert.ok(sections.length > 0, "Should have section patterns");
  });
});

// ============================================================================
// Website Composer Pattern Registry Tests
// ============================================================================

describe("Pattern Registry (website/lib/composer/selector)", () => {
  const patterns = getAvailablePatterns();

  test("loads available patterns", () => {
    assert.ok(patterns.length > 0, "Should have available patterns");
  });

  test("all patterns have required fields", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.id, `Pattern should have id`);
      assert.ok(pattern.name, `Pattern ${pattern.id} should have name`);
      assert.ok(pattern.category, `Pattern ${pattern.id} should have category`);
      assert.ok(Array.isArray(pattern.variants), `Pattern ${pattern.id} should have variants`);
      assert.ok(Array.isArray(pattern.slots), `Pattern ${pattern.id} should have slots`);
      assert.ok(Array.isArray(pattern.tags), `Pattern ${pattern.id} should have tags`);
    });
  });

  test("getPatternById returns correct pattern", () => {
    const pattern = getPatternById("hero-centered");
    assert.ok(pattern, "Pattern should exist");
    assert.equal(pattern.id, "hero-centered");
    assert.equal(pattern.category, "hero");
  });

  test("getPatternById returns undefined for non-existent ID", () => {
    const pattern = getPatternById("non-existent-xyz");
    assert.equal(pattern, undefined);
  });

  test("getPatternsByCategory returns patterns", () => {
    const heroPatterns = getPatternsByCategory("hero");
    assert.ok(heroPatterns.length > 0, "Should have hero patterns");
    heroPatterns.forEach(p => {
      assert.equal(p.category, "hero");
    });
  });

  test("has hero patterns", () => {
    const heroPatterns = getPatternsByCategory("hero");
    assert.ok(heroPatterns.length > 0, "Should have hero patterns");
  });

  test("has features patterns", () => {
    const featuresPatterns = getPatternsByCategory("features");
    assert.ok(featuresPatterns.length > 0, "Should have features patterns");
  });

  test("has pricing patterns", () => {
    const pricingPatterns = getPatternsByCategory("pricing");
    assert.ok(pricingPatterns.length > 0, "Should have pricing patterns");
  });

  test("has testimonials patterns", () => {
    const testimonialPatterns = getPatternsByCategory("testimonials");
    assert.ok(testimonialPatterns.length > 0, "Should have testimonials patterns");
  });

  test("has cta patterns", () => {
    const ctaPatterns = getPatternsByCategory("cta");
    assert.ok(ctaPatterns.length > 0, "Should have cta patterns");
  });

  test("has footer patterns", () => {
    const footerPatterns = getPatternsByCategory("footer");
    assert.ok(footerPatterns.length > 0, "Should have footer patterns");
  });
});
