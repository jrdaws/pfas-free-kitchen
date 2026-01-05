/**
 * Pattern Rendering Tests
 * 
 * Tests that pattern components have the expected structure.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { 
  getAllPatterns,
} from "../../packages/templates/patterns/registry.js";

import {
  getAvailablePatterns,
} from "../../website/lib/composer/selector.js";

// ============================================================================
// Pattern Component Path Tests
// ============================================================================

describe("Pattern Rendering - Component Paths", () => {
  const patterns = getAllPatterns();

  test("all patterns have component path defined", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.component, `Pattern ${pattern.id} should have component`);
      assert.equal(typeof pattern.component, "string");
      assert.ok(pattern.component.length > 0);
    });
  });

  test("component paths follow expected format", () => {
    patterns.forEach(pattern => {
      // Should be category/name format like "atoms/button-primary"
      assert.match(
        pattern.component,
        /^[a-z]+\/[a-z0-9-]+$/,
        `${pattern.id} component path should be category/name format`
      );
    });
  });
});

// ============================================================================
// Pattern Variant Tests
// ============================================================================

describe("Pattern Rendering - Variants", () => {
  const patterns = getAllPatterns();

  test("all patterns have at least one variant", () => {
    patterns.forEach(pattern => {
      assert.ok(pattern.variants.length > 0, `${pattern.id} should have variants`);
    });
  });

  test("all variants have id and name", () => {
    patterns.forEach(pattern => {
      pattern.variants.forEach(variant => {
        assert.ok(variant.id, `Variant in ${pattern.id} should have id`);
        assert.ok(variant.name, `Variant in ${pattern.id} should have name`);
      });
    });
  });

  test("variant IDs are unique within pattern", () => {
    patterns.forEach(pattern => {
      const ids = pattern.variants.map(v => v.id);
      const uniqueIds = [...new Set(ids)];
      assert.equal(ids.length, uniqueIds.length, `${pattern.id} variant IDs should be unique`);
    });
  });
});

// ============================================================================
// Pattern Slot Tests
// ============================================================================

describe("Pattern Rendering - Slots", () => {
  const patterns = getAllPatterns();

  test("all patterns have slots array", () => {
    patterns.forEach(pattern => {
      assert.ok(Array.isArray(pattern.slots), `${pattern.id} should have slots array`);
    });
  });

  test("all slots have required fields", () => {
    patterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        assert.ok(slot.name, `Slot in ${pattern.id} should have name`);
        assert.ok(slot.type, `Slot in ${pattern.id} should have type`);
        assert.equal(typeof slot.required, "boolean");
      });
    });
  });

  test("slot names are unique within pattern", () => {
    patterns.forEach(pattern => {
      const names = pattern.slots.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      assert.equal(names.length, uniqueNames.length, `${pattern.id} slot names should be unique`);
    });
  });

  test("slot names are valid identifiers", () => {
    patterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        // Should be camelCase or snake_case
        assert.match(
          slot.name,
          /^[a-zA-Z][a-zA-Z0-9_]*$/,
          `Slot ${slot.name} in ${pattern.id} should be valid identifier`
        );
      });
    });
  });
});

// ============================================================================
// Pattern Dependencies Tests
// ============================================================================

describe("Pattern Rendering - Dependencies", () => {
  const patterns = getAllPatterns();

  test("all patterns have dependencies array", () => {
    patterns.forEach(pattern => {
      assert.ok(Array.isArray(pattern.dependencies), `${pattern.id} should have dependencies array`);
    });
  });

  test("dependencies are valid npm package names", () => {
    patterns.forEach(pattern => {
      pattern.dependencies.forEach(dep => {
        // NPM package names can include @ for scoped packages
        assert.match(
          dep,
          /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
          `Dependency ${dep} in ${pattern.id} should be valid npm package`
        );
      });
    });
  });
});

// ============================================================================
// Minimal Props Tests
// ============================================================================

describe("Pattern Rendering - Minimal Props", () => {
  const patterns = getAllPatterns();

  test("required slots can be identified", () => {
    patterns.forEach(pattern => {
      const requiredSlots = pattern.slots.filter(s => s.required);
      const optionalSlots = pattern.slots.filter(s => !s.required);

      assert.equal(
        requiredSlots.length + optionalSlots.length,
        pattern.slots.length,
        "All slots should be categorized"
      );
    });
  });

  test("text slots have reasonable constraints", () => {
    patterns.forEach(pattern => {
      const textSlots = pattern.slots.filter(s => s.type === "text");

      textSlots.forEach(slot => {
        if (slot.validation?.maxLength) {
          assert.ok(slot.validation.maxLength > 0, "maxLength should be positive");
          assert.ok(slot.validation.maxLength < 10000, "maxLength should be reasonable");
        }
      });
    });
  });
});

// ============================================================================
// Composer Pattern Compatibility Tests
// ============================================================================

describe("Pattern Rendering - Composer Patterns", () => {
  const composerPatterns = getAvailablePatterns();

  test("all composer patterns have required fields", () => {
    composerPatterns.forEach(pattern => {
      assert.ok(pattern.id, "Should have id");
      assert.ok(pattern.name, "Should have name");
      assert.ok(pattern.category, "Should have category");
      assert.ok(pattern.variants, "Should have variants");
      assert.ok(pattern.slots, "Should have slots");
      assert.ok(pattern.tags, "Should have tags");
    });
  });

  test("slots have type information for prop generation", () => {
    const validTypes = ["text", "richText", "image", "array", "boolean", "number"];
    
    composerPatterns.forEach(pattern => {
      pattern.slots.forEach(slot => {
        assert.ok(
          validTypes.includes(slot.type),
          `Slot ${slot.name} in ${pattern.id} should have valid type`
        );
      });
    });
  });
});
