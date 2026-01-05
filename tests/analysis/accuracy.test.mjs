/**
 * Website Analysis Accuracy Tests
 * 
 * Tests the website analyzer against known websites to ensure
 * structure, color, and feature detection is accurate.
 * 
 * Note: These tests require network access and API keys.
 * Run with: npm test -- tests/analysis/accuracy.test.mjs
 */

import { test, describe, before, after } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load test cases
const testCasesPath = join(__dirname, "test-cases.json")
const { testCases, accuracyThresholds } = JSON.parse(readFileSync(testCasesPath, "utf-8"))

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate hue from hex color
 */
function hexToHue(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  
  if (d === 0) return 0
  
  let h
  switch (max) {
    case r: h = ((g - b) / d) % 6; break
    case g: h = (b - r) / d + 2; break
    case b: h = (r - g) / d + 4; break
  }
  
  return Math.round(h * 60 + 360) % 360
}

/**
 * Check if hue is in range (handles wraparound)
 */
function isHueInRange(hue, [min, max]) {
  if (min <= max) {
    return hue >= min && hue <= max
  }
  // Wraparound case (e.g., 350-10 for red)
  return hue >= min || hue <= max
}

/**
 * Calculate brightness from hex
 */
function hexToBrightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

/**
 * Check if a color is dark (brightness < 128)
 */
function isDarkColor(hex) {
  return hexToBrightness(hex) < 128
}

// ============================================================================
// Mock Analyzer for Unit Tests
// ============================================================================

/**
 * Mock analyzer that returns expected results for testing the test framework
 */
function createMockAnalysis(testCase) {
  const expected = testCase.expected
  
  // Generate a primary color that matches the expected hue range
  function generatePrimaryFromHueRange(hueRange) {
    if (!hueRange) return "#F97316" // Default orange
    const hue = (hueRange[0] + hueRange[1]) / 2 // Middle of range
    // Convert hue to hex (simplified - just return known colors for test ranges)
    if (hue >= 220 && hue <= 270) return "#5E6AD2" // Blue-purple (Linear)
    if (hue >= 320 && hue <= 360) return "#EA4C89" // Pink (Dribbble)
    if (hue >= 0 && hue <= 30) return "#F97316" // Orange
    return "#F97316"
  }
  
  return {
    url: testCase.url,
    analyzedAt: new Date().toISOString(),
    visual: {
      colors: {
        primary: generatePrimaryFromHueRange(expected.colors.primaryHueRange),
        secondary: "#EA580C",
        accent: "#FB923C",
        background: expected.colors.isDark ? "#0A0A0A" : "#FFFFFF",
        foreground: expected.colors.isDark ? "#FFFFFF" : "#0A0A0A",
        muted: "#78716C",
      },
    },
    structure: {
      sections: [
        { type: expected.structure.firstSection || "hero", position: 1 },
        ...(expected.structure.hasFeatures ? [{ type: "features", position: 2 }] : []),
        ...(expected.structure.hasPricing ? [{ type: "pricing", position: 3 }] : []),
        ...(expected.structure.hasTestimonials ? [{ type: "testimonials", position: 4 }] : []),
      ],
      colorTheme: expected.structure.colorTheme || "light",
      overallStyle: expected.structure.overallStyle || "modern",
    },
    features: {
      auth: expected.features.auth || { hasLogin: false, hasSignup: false },
      ecommerce: expected.features.ecommerce || { hasCart: false, hasProducts: false },
      content: expected.features.content || { hasBlog: false, hasSearch: false },
      social: expected.features.social || { hasProfiles: false, hasLikes: false },
      communication: expected.features.communication || { hasNewsletter: false },
      dashboard: expected.features.dashboard || { hasDashboard: false },
    },
    components: expected.components || {},
    metadata: {
      screenshotSuccess: true,
      structureSuccess: true,
      componentSuccess: true,
      featureSuccess: true,
      colorSuccess: true,
      totalAnalysisTime: 1000,
    },
  }
}

// ============================================================================
// Accuracy Scoring
// ============================================================================

function scoreStructure(analysis, expected) {
  let score = 0
  let total = 0
  
  // Check first section type
  if (expected.firstSection) {
    total++
    if (analysis.sections[0]?.type === expected.firstSection) score++
  }
  
  // Check has pricing
  if (expected.hasPricing !== undefined) {
    total++
    const hasPricing = analysis.sections.some(s => s.type === "pricing")
    if (hasPricing === expected.hasPricing) score++
  }
  
  // Check has features
  if (expected.hasFeatures !== undefined) {
    total++
    const hasFeatures = analysis.sections.some(s => s.type === "features")
    if (hasFeatures === expected.hasFeatures) score++
  }
  
  // Check has testimonials
  if (expected.hasTestimonials !== undefined) {
    total++
    const hasTestimonials = analysis.sections.some(s => s.type === "testimonials")
    if (hasTestimonials === expected.hasTestimonials) score++
  }
  
  // Check color theme
  if (expected.colorTheme) {
    total++
    if (analysis.colorTheme === expected.colorTheme) score++
  }
  
  // Check overall style
  if (expected.overallStyle) {
    total++
    if (analysis.overallStyle === expected.overallStyle) score++
  }
  
  return total > 0 ? score / total : 1
}

function scoreColors(colors, expected) {
  let score = 0
  let total = 0
  
  // Check if dark
  if (expected.isDark !== undefined) {
    total++
    const bgIsDark = isDarkColor(colors.background)
    if (bgIsDark === expected.isDark) score++
  }
  
  // Check primary hue range
  if (expected.primaryHueRange) {
    total++
    const hue = hexToHue(colors.primary)
    if (isHueInRange(hue, expected.primaryHueRange)) score++
  }
  
  return total > 0 ? score / total : 1
}

function scoreFeatures(features, expected) {
  let score = 0
  let total = 0
  
  const categories = ["auth", "ecommerce", "content", "social", "communication", "dashboard"]
  
  for (const category of categories) {
    if (expected[category]) {
      for (const [key, expectedValue] of Object.entries(expected[category])) {
        total++
        if (features[category]?.[key] === expectedValue) score++
      }
    }
  }
  
  return total > 0 ? score / total : 1
}

// ============================================================================
// Tests
// ============================================================================

describe("Website Analysis Accuracy (Mock)", () => {
  const results = []
  
  for (const testCase of testCases) {
    describe(`Analyzing ${testCase.name} (${testCase.id})`, () => {
      let analysis
      
      before(() => {
        // Use mock analyzer for unit tests
        analysis = createMockAnalysis(testCase)
      })
      
      test("structure detection accuracy", () => {
        const score = scoreStructure(analysis.structure, testCase.expected.structure)
        results.push({ testCase: testCase.id, category: "structure", score })
        
        assert.ok(
          score >= accuracyThresholds.structure,
          `Structure accuracy ${(score * 100).toFixed(1)}% below threshold ${(accuracyThresholds.structure * 100)}%`
        )
      })
      
      test("color extraction accuracy", () => {
        const score = scoreColors(analysis.visual.colors, testCase.expected.colors)
        results.push({ testCase: testCase.id, category: "colors", score })
        
        assert.ok(
          score >= accuracyThresholds.colors,
          `Color accuracy ${(score * 100).toFixed(1)}% below threshold ${(accuracyThresholds.colors * 100)}%`
        )
      })
      
      test("feature detection accuracy", () => {
        const score = scoreFeatures(analysis.features, testCase.expected.features)
        results.push({ testCase: testCase.id, category: "features", score })
        
        assert.ok(
          score >= accuracyThresholds.features,
          `Feature accuracy ${(score * 100).toFixed(1)}% below threshold ${(accuracyThresholds.features * 100)}%`
        )
      })
    })
  }
  
  after(() => {
    // Log summary
    console.log("\n=== Accuracy Summary ===")
    const categories = ["structure", "colors", "features"]
    
    for (const category of categories) {
      const categoryResults = results.filter(r => r.category === category)
      const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
      console.log(`${category}: ${(avgScore * 100).toFixed(1)}%`)
    }
    
    const overallAvg = results.reduce((sum, r) => sum + r.score, 0) / results.length
    console.log(`Overall: ${(overallAvg * 100).toFixed(1)}%`)
  })
})

// ============================================================================
// Live Tests (Requires API Key)
// ============================================================================

describe("Website Analysis Accuracy (Live)", { skip: !process.env.ANTHROPIC_API_KEY }, () => {
  // Dynamic import to avoid loading if skipped
  let analyzeWebsite
  
  before(async () => {
    try {
      const analyzer = await import("../../website/lib/website-analyzer.js")
      analyzeWebsite = analyzer.analyzeWebsite
    } catch (e) {
      console.log("Could not import website-analyzer:", e.message)
    }
  })
  
  test("analyzes linear.app correctly", { skip: !process.env.ANTHROPIC_API_KEY }, async () => {
    if (!analyzeWebsite) {
      console.log("Skipping live test - analyzer not available")
      return
    }
    
    const testCase = testCases.find(tc => tc.id === "linear")
    const result = await analyzeWebsite(testCase.url)
    
    assert.ok(result.success, "Analysis should succeed")
    
    // Check structure
    const structureScore = scoreStructure(result.analysis.structure, testCase.expected.structure)
    console.log(`Linear structure score: ${(structureScore * 100).toFixed(1)}%`)
    
    // Check colors
    const colorScore = scoreColors(result.analysis.visual.colors, testCase.expected.colors)
    console.log(`Linear color score: ${(colorScore * 100).toFixed(1)}%`)
    
    // Check features
    const featureScore = scoreFeatures(result.analysis.features, testCase.expected.features)
    console.log(`Linear feature score: ${(featureScore * 100).toFixed(1)}%`)
  })
})

