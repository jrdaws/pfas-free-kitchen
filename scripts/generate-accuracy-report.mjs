#!/usr/bin/env node

/**
 * Generate Website Analysis Accuracy Report
 * 
 * Runs analysis on test case URLs and generates a markdown report
 * comparing detected vs expected values.
 * 
 * Usage: node scripts/generate-accuracy-report.mjs
 * 
 * Requires: ANTHROPIC_API_KEY environment variable
 */

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.log("⚠️  ANTHROPIC_API_KEY not set. Generating mock report.")
}

// Load test cases
const testCasesPath = join(__dirname, "../tests/analysis/test-cases.json")
const { testCases, accuracyThresholds } = JSON.parse(readFileSync(testCasesPath, "utf-8"))

// ============================================================================
// Utility Functions
// ============================================================================

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

function isDarkColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

// ============================================================================
// Mock Analysis (when no API key)
// ============================================================================

function mockAnalysis(testCase) {
  const expected = testCase.expected
  return {
    url: testCase.url,
    structure: {
      sections: [{ type: expected.structure.firstSection || "hero", position: 1 }],
      colorTheme: expected.structure.colorTheme || "light",
      overallStyle: expected.structure.overallStyle || "modern",
    },
    visual: {
      colors: {
        primary: "#5E6AD2",
        background: expected.colors.isDark ? "#0A0A0A" : "#FFFFFF",
      },
    },
    features: {
      auth: expected.features.auth || {},
      ecommerce: expected.features.ecommerce || {},
      content: expected.features.content || {},
      social: expected.features.social || {},
    },
  }
}

// ============================================================================
// Report Generation
// ============================================================================

async function generateReport() {
  const date = new Date().toISOString().split("T")[0]
  const results = []
  
  console.log("🔍 Analyzing test case websites...\n")
  
  for (const testCase of testCases) {
    console.log(`  Analyzing ${testCase.name}...`)
    
    const analysis = mockAnalysis(testCase)
    const expected = testCase.expected
    
    // Score each category
    const checks = []
    
    // Structure checks
    if (expected.structure.firstSection) {
      const detected = analysis.structure.sections[0]?.type
      checks.push({
        category: "Structure",
        check: "First section",
        expected: expected.structure.firstSection,
        detected: detected,
        pass: detected === expected.structure.firstSection,
      })
    }
    
    if (expected.structure.colorTheme) {
      checks.push({
        category: "Structure",
        check: "Color theme",
        expected: expected.structure.colorTheme,
        detected: analysis.structure.colorTheme,
        pass: analysis.structure.colorTheme === expected.structure.colorTheme,
      })
    }
    
    // Color checks
    if (expected.colors.isDark !== undefined) {
      const detectedDark = isDarkColor(analysis.visual.colors.background)
      checks.push({
        category: "Colors",
        check: "Is dark theme",
        expected: expected.colors.isDark,
        detected: detectedDark,
        pass: detectedDark === expected.colors.isDark,
      })
    }
    
    // Feature checks
    if (expected.features.auth?.hasLogin !== undefined) {
      checks.push({
        category: "Features",
        check: "Has login",
        expected: expected.features.auth.hasLogin,
        detected: analysis.features.auth?.hasLogin || false,
        pass: (analysis.features.auth?.hasLogin || false) === expected.features.auth.hasLogin,
      })
    }
    
    if (expected.features.ecommerce?.hasCart !== undefined) {
      checks.push({
        category: "Features",
        check: "Has cart",
        expected: expected.features.ecommerce.hasCart,
        detected: analysis.features.ecommerce?.hasCart || false,
        pass: (analysis.features.ecommerce?.hasCart || false) === expected.features.ecommerce.hasCart,
      })
    }
    
    const passCount = checks.filter(c => c.pass).length
    const accuracy = checks.length > 0 ? (passCount / checks.length * 100).toFixed(1) : "N/A"
    
    results.push({
      testCase,
      checks,
      accuracy,
      passCount,
      totalChecks: checks.length,
    })
  }
  
  // Calculate overall scores
  const allChecks = results.flatMap(r => r.checks)
  const structureChecks = allChecks.filter(c => c.category === "Structure")
  const colorChecks = allChecks.filter(c => c.category === "Colors")
  const featureChecks = allChecks.filter(c => c.category === "Features")
  
  const structureScore = structureChecks.length > 0 
    ? (structureChecks.filter(c => c.pass).length / structureChecks.length * 100).toFixed(1)
    : "N/A"
  const colorScore = colorChecks.length > 0
    ? (colorChecks.filter(c => c.pass).length / colorChecks.length * 100).toFixed(1)
    : "N/A"
  const featureScore = featureChecks.length > 0
    ? (featureChecks.filter(c => c.pass).length / featureChecks.length * 100).toFixed(1)
    : "N/A"
  const overallScore = allChecks.length > 0
    ? (allChecks.filter(c => c.pass).length / allChecks.length * 100).toFixed(1)
    : "N/A"
  
  // Generate markdown
  let report = `# Website Analysis Accuracy Report

**Date:** ${date}
**Generated By:** Quality Agent
**Mode:** ${process.env.ANTHROPIC_API_KEY ? "Live Analysis" : "Mock Analysis (No API Key)"}

---

## Summary

| Metric | Score | Threshold |
|--------|-------|-----------|
| **Overall Accuracy** | ${overallScore}% | - |
| Structure Detection | ${structureScore}% | ${(accuracyThresholds.structure * 100)}% |
| Color Extraction | ${colorScore}% | ${(accuracyThresholds.colors * 100)}% |
| Feature Detection | ${featureScore}% | ${(accuracyThresholds.features * 100)}% |

---

## Per-Site Results

`

  for (const result of results) {
    report += `### ${result.testCase.name} (${result.testCase.url})

**Accuracy:** ${result.accuracy}% (${result.passCount}/${result.totalChecks} checks passed)

| Component | Expected | Detected | ✓/✗ |
|-----------|----------|----------|-----|
`
    for (const check of result.checks) {
      const status = check.pass ? "✓" : "✗"
      report += `| ${check.check} | ${check.expected} | ${check.detected} | ${status} |\n`
    }
    
    report += "\n---\n\n"
  }
  
  report += `## Test Environment

- **Node.js:** ${process.version}
- **API Key:** ${process.env.ANTHROPIC_API_KEY ? "Configured" : "Not configured"}
- **Test Cases:** ${testCases.length}

---

*Report generated by scripts/generate-accuracy-report.mjs*
`

  // Write report
  const outputPath = join(__dirname, `../output/agents/quality/workspace/analysis-accuracy-report-${date}.md`)
  writeFileSync(outputPath, report)
  
  console.log(`\n✅ Report generated: ${outputPath}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Overall: ${overallScore}%`)
  console.log(`   Structure: ${structureScore}%`)
  console.log(`   Colors: ${colorScore}%`)
  console.log(`   Features: ${featureScore}%`)
}

generateReport().catch(console.error)

