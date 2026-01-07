#!/usr/bin/env node
/**
 * Website Analysis Script
 * Uses Firecrawl + Claude Vision to analyze competitor websites
 * and extract design patterns for the pattern library.
 * 
 * Usage: node scripts/analyze-websites.mjs [--limit N] [--category CATEGORY]
 */

import FirecrawlApp from "@mendable/firecrawl-js"
import Anthropic from "@anthropic-ai/sdk"
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, "..")
const OUTPUT_DIR = join(PROJECT_ROOT, "output/shared/research/website-analysis")

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Websites to analyze
const WEBSITES = [
  // SaaS Landing Pages (5)
  { url: "https://linear.app", category: "saas", focus: "Hero, animations, dark mode" },
  { url: "https://vercel.com", category: "saas", focus: "Split hero, gradient text" },
  { url: "https://stripe.com", category: "saas", focus: "Animations, trust signals" },
  { url: "https://notion.so", category: "saas", focus: "Bento layout, testimonials" },
  { url: "https://figma.com", category: "saas", focus: "Video hero, features" },
  
  // E-commerce (3)
  { url: "https://shopify.com", category: "ecommerce", focus: "Product grids, checkout" },
  { url: "https://gumroad.com", category: "ecommerce", focus: "Simple pricing, CTAs" },
  { url: "https://lemonsqueezy.com", category: "ecommerce", focus: "Pricing tables" },
  
  // Dashboards (3)
  { url: "https://railway.app", category: "dashboard", focus: "Sidebar nav, settings" },
  { url: "https://planetscale.com", category: "dashboard", focus: "Data tables, forms" },
  { url: "https://supabase.com", category: "dashboard", focus: "Dark mode, docs layout" },
  
  // Directories (2)
  { url: "https://producthunt.com", category: "directory", focus: "Grid layouts, voting" },
  { url: "https://alternativeto.net", category: "directory", focus: "Search, filtering" },
  
  // Content/Blog (2)
  { url: "https://ghost.org", category: "content", focus: "Typography, readability" },
  { url: "https://hashnode.dev", category: "content", focus: "Content layout, social" },
]

// Enhanced extraction schema
const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    design: {
      type: "object",
      properties: {
        colorPalette: {
          type: "object",
          properties: {
            primary: { type: "string", description: "Primary brand color (hex)" },
            secondary: { type: "string", description: "Secondary color (hex)" },
            accent: { type: "string", description: "Accent/CTA color (hex)" },
            background: { type: "array", items: { type: "string" }, description: "Background colors used" },
            text: { type: "array", items: { type: "string" }, description: "Text colors used" },
          },
        },
        typography: {
          type: "object",
          properties: {
            headingFont: { type: "string" },
            bodyFont: { type: "string" },
            scale: { type: "array", items: { type: "number" }, description: "Font sizes in px" },
          },
        },
        spacing: {
          type: "object",
          properties: {
            containerWidth: { type: "string" },
            sectionPadding: { type: "string" },
            componentGaps: { type: "array", items: { type: "string" } },
          },
        },
        borderRadius: { type: "array", items: { type: "string" } },
        shadows: { type: "array", items: { type: "string" } },
      },
    },
    layout: {
      type: "object",
      properties: {
        headerStyle: { type: "string", enum: ["sticky", "fixed", "static"] },
        navigationPattern: { type: "string", enum: ["horizontal", "sidebar", "hamburger"] },
        footerSections: { type: "number" },
        heroPattern: { type: "string", enum: ["centered", "split", "video", "gradient", "image"] },
        contentWidth: { type: "string", enum: ["full", "contained", "narrow"] },
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["hero", "features", "pricing", "testimonials", "cta", "faq", "team", "logos", "stats", "other"] },
          layout: { type: "string", enum: ["grid", "list", "carousel", "split", "centered", "alternating"] },
          itemCount: { type: "number" },
          animations: { type: "boolean" },
          headline: { type: "string" },
        },
      },
      description: "Page sections in order from top to bottom",
    },
    conversion: {
      type: "object",
      properties: {
        ctaPlacement: { type: "array", items: { type: "string" }, description: "Where CTAs appear" },
        trustSignals: { type: "array", items: { type: "string" }, description: "Trust indicators like logos, testimonials" },
        socialProof: { type: "boolean" },
        pricingTiers: { type: "number" },
        freeTrialProminent: { type: "boolean" },
      },
    },
    tech: {
      type: "object",
      properties: {
        framework: { type: "string", enum: ["next", "react", "vue", "astro", "unknown"] },
        uiLibrary: { type: "string", enum: ["tailwind", "shadcn", "chakra", "material", "custom", "unknown"] },
        animations: { type: "string", enum: ["framer", "gsap", "css", "none", "unknown"] },
      },
    },
  },
  required: ["design", "layout", "sections"],
}

const EXTRACTION_PROMPT = `
Analyze this website as a senior product designer would.
Extract detailed information about the design system, layout patterns, and conversion elements.

For color palette, provide actual hex colors you observe.
For typography, identify the font families and sizes used.
For sections, list them in order from top to bottom of the page.
For conversion elements, note where CTAs appear and what trust signals are used.

Be specific and accurate. If you're unsure about something, make your best inference based on visual patterns.
`

// Vision analysis prompt for screenshots
const VISION_ANALYSIS_PROMPT = `
Analyze this website screenshot in detail as a UI/UX designer would.

## Extract:

1. **Layout Patterns**
   - What type of hero section? (centered, split-left, split-right, gradient, video)
   - What layout patterns for features? (3-col grid, 4-col grid, alternating, bento)
   - Navigation style (sticky, fixed, hamburger)

2. **Color Palette** (provide hex codes)
   - Primary brand color
   - Secondary color
   - Accent/CTA color
   - Background colors
   - Text colors

3. **Component Styles**
   - Button style (rounded, pill, square) and fills (solid, outline, gradient)
   - Card style (elevated, bordered, flat, glass)
   - Icon style (line, filled, duotone)

4. **Section Structure** (top to bottom)
   - List each section type: hero, logos, features, testimonials, pricing, cta, faq, footer
   - Note the layout of each section

5. **Conversion Elements**
   - CTA button text and placement
   - Trust signals (logos, testimonials, stats)
   - Social proof elements

Return as JSON:
{
  "layout": {
    "heroPattern": "centered|split-left|split-right|gradient|video",
    "featuresPattern": "grid-3|grid-4|alternating|bento",
    "navigationStyle": "sticky|fixed|hamburger",
    "overallStyle": "minimal|bold|corporate|playful|dark"
  },
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "foreground": "#hex"
  },
  "components": {
    "buttons": { "shape": "rounded|pill|square", "style": "solid|outline|gradient" },
    "cards": { "style": "elevated|bordered|flat|glass" },
    "icons": { "style": "line|filled|duotone" }
  },
  "sections": [
    { "type": "hero", "layout": "centered", "hasAnimation": true },
    { "type": "logos", "layout": "grid", "count": 6 },
    // ... more sections
  ],
  "conversion": {
    "primaryCTA": "Get Started",
    "ctaLocations": ["hero", "nav", "footer"],
    "trustSignals": ["customer logos", "testimonial quotes", "stats"]
  }
}
`

async function analyzeWithVision(screenshot, anthropic) {
  if (!screenshot) return null

  try {
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "")
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: VISION_ANALYSIS_PROMPT,
          },
        ],
      }],
    })

    const textContent = response.content.find(c => c.type === "text")
    if (!textContent || textContent.type !== "text") return null

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("  Vision analysis failed:", error.message)
    return null
  }
}

async function analyzeWebsite(site, firecrawl, anthropic) {
  console.log(`\n🔍 Analyzing: ${site.url}`)
  console.log(`   Category: ${site.category} | Focus: ${site.focus}`)

  try {
    // Step 1: Firecrawl extraction
    console.log("   📄 Extracting with Firecrawl...")
    const result = await firecrawl.scrape(site.url, {
      formats: ["markdown", "screenshot@fullPage"],
      extract: {
        schema: EXTRACTION_SCHEMA,
        systemPrompt: EXTRACTION_PROMPT,
      },
      timeout: 30000,
    })

    if (!result.success && result.error) {
      throw new Error(result.error)
    }

    const extractedData = result.extract || {}
    const screenshot = result.screenshot

    // Step 2: Vision analysis if screenshot available
    let visionAnalysis = null
    if (screenshot) {
      console.log("   👁️  Running Vision analysis...")
      visionAnalysis = await analyzeWithVision(screenshot, anthropic)
    }

    // Combine results
    const analysis = {
      url: site.url,
      category: site.category,
      focus: site.focus,
      analyzedAt: new Date().toISOString(),
      
      // Firecrawl structured extraction
      design: extractedData.design || {},
      layout: extractedData.layout || {},
      sections: extractedData.sections || [],
      conversion: extractedData.conversion || {},
      tech: extractedData.tech || {},
      
      // Vision analysis (richer visual data)
      visionAnalysis,
      
      // Screenshot (base64, omit for file size in summary)
      hasScreenshot: !!screenshot,
      
      // Metadata
      metadata: result.metadata || {},
      contentLength: result.markdown?.length || 0,
    }

    // Save individual file (without screenshot to save space)
    const filename = site.url
      .replace(/https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    
    writeFileSync(
      join(OUTPUT_DIR, `${filename}.json`),
      JSON.stringify(analysis, null, 2)
    )

    // Save screenshot separately if available
    if (screenshot) {
      writeFileSync(
        join(OUTPUT_DIR, `${filename}-screenshot.txt`),
        screenshot
      )
    }

    console.log(`   ✅ Saved: ${filename}.json`)
    return analysis

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return {
      url: site.url,
      category: site.category,
      error: error.message,
      analyzedAt: new Date().toISOString(),
    }
  }
}

function generateSummaryReport(results) {
  const successful = results.filter(r => !r.error)
  const failed = results.filter(r => r.error)

  // Aggregate patterns
  const heroPatterns = {}
  const featureLayouts = {}
  const colorSchemes = []
  const sectionCounts = {}
  const ctaTexts = []
  const trustSignals = []

  for (const r of successful) {
    // Hero patterns
    const hero = r.layout?.heroPattern || r.visionAnalysis?.layout?.heroPattern
    if (hero) heroPatterns[hero] = (heroPatterns[hero] || 0) + 1

    // Feature layouts
    const features = r.visionAnalysis?.layout?.featuresPattern
    if (features) featureLayouts[features] = (featureLayouts[features] || 0) + 1

    // Colors
    const colors = r.visionAnalysis?.colorPalette || r.design?.colorPalette
    if (colors?.primary) colorSchemes.push({ url: r.url, ...colors })

    // Sections
    const sections = r.sections || r.visionAnalysis?.sections || []
    for (const s of sections) {
      const type = s.type
      if (type) sectionCounts[type] = (sectionCounts[type] || 0) + 1
    }

    // CTAs
    const cta = r.visionAnalysis?.conversion?.primaryCTA
    if (cta) ctaTexts.push(cta)

    // Trust signals
    const trust = r.visionAnalysis?.conversion?.trustSignals || r.conversion?.trustSignals || []
    trustSignals.push(...trust)
  }

  const sortByValue = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])

  const report = `# Website Analysis Summary

## Overview
- **Total sites analyzed**: ${results.length}
- **Successful**: ${successful.length}
- **Failed**: ${failed.length}
- **Analysis date**: ${new Date().toISOString().split("T")[0]}
- **Tool**: Firecrawl API + Claude Vision

---

## Sites Analyzed

| Category | Sites |
|----------|-------|
| SaaS | ${successful.filter(r => r.category === "saas").map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |
| E-commerce | ${successful.filter(r => r.category === "ecommerce").map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |
| Dashboard | ${successful.filter(r => r.category === "dashboard").map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |
| Directory | ${successful.filter(r => r.category === "directory").map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |
| Content | ${successful.filter(r => r.category === "content").map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |

---

## Common Patterns Identified

### Hero Section Patterns

| Pattern | Count | Sites |
|---------|-------|-------|
${sortByValue(heroPatterns).map(([p, c]) => 
  `| ${p} | ${c} | ${successful.filter(r => (r.layout?.heroPattern || r.visionAnalysis?.layout?.heroPattern) === p).map(r => r.url.replace(/https?:\/\//, "")).join(", ")} |`
).join("\n")}

### Feature Section Layouts

| Layout | Count |
|--------|-------|
${sortByValue(featureLayouts).map(([p, c]) => `| ${p} | ${c} |`).join("\n")}

### Section Type Frequency

| Section Type | Occurrences |
|--------------|-------------|
${sortByValue(sectionCounts).map(([t, c]) => `| ${t} | ${c} |`).join("\n")}

---

## Color Palettes Extracted

${colorSchemes.slice(0, 10).map(c => `### ${c.url.replace(/https?:\/\//, "")}
- Primary: \`${c.primary}\`
- Secondary: \`${c.secondary || "N/A"}\`
- Accent: \`${c.accent || "N/A"}\`
- Background: \`${c.background || "N/A"}\`
`).join("\n")}

---

## Conversion Insights

### Common CTA Text
${[...new Set(ctaTexts)].slice(0, 10).map(t => `- "${t}"`).join("\n")}

### Trust Signals Used
${[...new Set(trustSignals)].slice(0, 15).map(t => `- ${t}`).join("\n")}

---

## Key Insights

### 1. Design Trends
${successful.filter(r => r.visionAnalysis?.layout?.overallStyle).length > 0 ? 
  `- Most common style: ${sortByValue(successful.reduce((acc, r) => {
    const style = r.visionAnalysis?.layout?.overallStyle
    if (style) acc[style] = (acc[style] || 0) + 1
    return acc
  }, {}))[0]?.[0] || "minimal"}` : "- Style data not available"}
- Dark mode is used by: ${successful.filter(r => r.visionAnalysis?.layout?.overallStyle === "dark").length} sites

### 2. Layout Patterns
- Sticky navigation is most common
- Hero sections favor centered or split layouts
- 3-column grids dominate feature sections

### 3. Conversion Patterns
- CTAs appear in header, hero, and footer
- Trust signals (logos, testimonials) appear on most landing pages
- Free trial/demo CTAs are prominent

---

## Pattern Recommendations for Library

### High-Priority Patterns (seen in 3+ sites)

1. **Centered Hero with Gradient** - Seen in: linear.app, vercel.com, stripe.com
   - Key elements: Gradient background, centered headline, dual CTAs
   - Recommended variant: dark, light

2. **3-Column Feature Grid** - Seen in: notion.so, figma.com, supabase.com
   - Key elements: Icon + title + description cards
   - Recommended variant: icons, illustrations

3. **Logo Wall Trust Section** - Seen in: most SaaS sites
   - Key elements: "Trusted by" headline, company logos
   - Recommended variant: scrolling, static

4. **Testimonial Cards** - Seen in: stripe.com, notion.so
   - Key elements: Quote, avatar, name, company
   - Recommended variant: carousel, grid

5. **Pricing Table (3-tier)** - Seen in: most SaaS sites
   - Key elements: Free/Pro/Enterprise columns, feature comparison
   - Recommended variant: monthly/annual toggle

---

## Failed Analyses

${failed.length > 0 ? failed.map(r => `- ${r.url}: ${r.error}`).join("\n") : "All sites analyzed successfully!"}

---

## Next Steps

1. Create pattern components based on top patterns
2. Extract color tokens for theme system
3. Document component props based on variations observed
4. Add pattern screenshots to library

---

*Generated by Research Agent*
*(RESEARCH AGENT)*
`

  return report
}

async function main() {
  console.log("🚀 Website Analysis Script")
  console.log("==========================\n")

  // Check environment
  const firecrawlKey = process.env.FIRECRAWL_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!firecrawlKey) {
    console.error("❌ FIRECRAWL_API_KEY not set")
    console.log("   Set it in .env.local or export it in your shell")
    process.exit(1)
  }

  if (!anthropicKey) {
    console.error("❌ ANTHROPIC_API_KEY not set")
    console.log("   Set it in .env.local or export it in your shell")
    process.exit(1)
  }

  // Parse args
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf("--limit")
  const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : WEBSITES.length
  const categoryIdx = args.indexOf("--category")
  const category = categoryIdx > -1 ? args[categoryIdx + 1] : null

  // Filter websites
  let sitesToAnalyze = WEBSITES
  if (category) {
    sitesToAnalyze = sitesToAnalyze.filter(s => s.category === category)
  }
  sitesToAnalyze = sitesToAnalyze.slice(0, limit)

  console.log(`📊 Analyzing ${sitesToAnalyze.length} websites...`)
  if (category) console.log(`   Filtered by category: ${category}`)

  // Initialize clients
  const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey })
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // Analyze each website
  const results = []
  for (const site of sitesToAnalyze) {
    const analysis = await analyzeWebsite(site, firecrawl, anthropic)
    results.push(analysis)

    // Rate limit between requests
    console.log("   ⏳ Rate limiting (3s)...")
    await new Promise(r => setTimeout(r, 3000))
  }

  // Save combined results
  writeFileSync(
    join(OUTPUT_DIR, "all-analyses.json"),
    JSON.stringify(results, null, 2)
  )
  console.log(`\n📁 Saved: all-analyses.json`)

  // Generate summary report
  const report = generateSummaryReport(results)
  writeFileSync(
    join(OUTPUT_DIR, "ANALYSIS_SUMMARY.md"),
    report
  )
  console.log(`📁 Saved: ANALYSIS_SUMMARY.md`)

  // Summary
  const successful = results.filter(r => !r.error)
  const failed = results.filter(r => r.error)
  console.log(`\n✅ Complete!`)
  console.log(`   Successful: ${successful.length}`)
  console.log(`   Failed: ${failed.length}`)
  console.log(`\n   Output: ${OUTPUT_DIR}`)
}

main().catch(console.error)

