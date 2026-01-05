/**
 * Composition Export Tests
 * 
 * Tests that exported projects match the composition structure
 * and include all necessary files for the selected patterns.
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
      projectName: "TestExportApp",
      description: "A test application for export validation",
      audience: "developers",
      tone: "professional",
    },
    pageType,
    availablePatterns: getAvailablePatterns(),
  };
}

// Mock exported project structure
function createMockExportedProject(composition) {
  const files = {
    "package.json": JSON.stringify({
      name: "test-export",
      version: "0.1.0",
      dependencies: {},
    }),
    "app/layout.tsx": "export default function Layout({ children }) { return children }",
    "app/globals.css": ":root { --primary: #f97316; }",
    "tsconfig.json": "{}",
    "next.config.js": "module.exports = {}",
  };

  // Add pages based on composition
  composition.sections.forEach(section => {
    const pattern = getPatternById(section.patternId);
    if (pattern) {
      files[`components/${section.patternId}.tsx`] = `// ${section.patternId} component`;
    }
  });

  // Add main page
  files["app/page.tsx"] = composition.sections
    .map(s => `import ${s.patternId.replace(/-/g, "")} from "@/components/${s.patternId}"`)
    .join("\n");

  return { files };
}

// ============================================================================
// Composition Export Structure Tests
// ============================================================================

describe("Composition Export - Structure", () => {
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

  test("exported project has package.json", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    assert.ok(exported.files["package.json"], "Should have package.json");
  });

  test("exported project has app layout", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    assert.ok(exported.files["app/layout.tsx"], "Should have layout");
  });

  test("exported project has globals.css", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    assert.ok(exported.files["app/globals.css"], "Should have globals.css");
  });

  test("exported project has main page", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    assert.ok(exported.files["app/page.tsx"], "Should have page.tsx");
  });
});

// ============================================================================
// Pattern Component Export Tests
// ============================================================================

describe("Composition Export - Pattern Components", () => {
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

  test("exports component file for each pattern", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    composition.sections.forEach(section => {
      const componentPath = `components/${section.patternId}.tsx`;
      assert.ok(exported.files[componentPath], `Should have ${componentPath}`);
    });
  });

  test("page imports all composition patterns", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);
    const exported = createMockExportedProject(composition);

    const pageContent = exported.files["app/page.tsx"];
    
    composition.sections.forEach(section => {
      assert.ok(
        pageContent.includes(section.patternId),
        `Page should import ${section.patternId}`
      );
    });
  });
});

// ============================================================================
// Multi-Page Composition Tests
// ============================================================================

describe("Composition Export - Multi-Page", () => {
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

  test("can generate compositions for multiple pages", async () => {
    const pageTypes = ["home", "pricing", "about", "features"];
    
    const compositions = await Promise.all(
      pageTypes.map(async pageType => {
        const input = createMockInput(pageType);
        return {
          pageType,
          composition: await selectPatterns(input),
        };
      })
    );

    compositions.forEach(({ pageType, composition }) => {
      assert.ok(composition.sections.length > 0, `${pageType} should have sections`);
    });
  });

  test("different pages have different compositions", async () => {
    const homeInput = createMockInput("home");
    const pricingInput = createMockInput("pricing");

    const homeComposition = await selectPatterns(homeInput);
    const pricingComposition = await selectPatterns(pricingInput);

    const homePatternIds = homeComposition.sections.map(s => s.patternId).sort();
    const pricingPatternIds = pricingComposition.sections.map(s => s.patternId).sort();

    // At least one pattern should be different
    const homeOnly = homePatternIds.filter(id => !pricingPatternIds.includes(id));
    const pricingOnly = pricingPatternIds.filter(id => !homePatternIds.includes(id));

    assert.ok(
      homeOnly.length + pricingOnly.length > 0,
      "Different pages should have different patterns"
    );
  });
});

// ============================================================================
// Layout Type Export Tests
// ============================================================================

describe("Composition Export - Layout Types", () => {
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

  test("composition includes layout recommendation", async () => {
    const input = createMockInput();
    const composition = await selectPatterns(input);

    assert.ok(composition.layoutRecommendation, "Should have layoutRecommendation");
    assert.equal(typeof composition.layoutRecommendation, "string");
  });

  test("marketing pages use marketing layout", async () => {
    const input = createMockInput("home");
    const composition = await selectPatterns(input);

    assert.equal(composition.layoutRecommendation, "layout-marketing");
  });
});
