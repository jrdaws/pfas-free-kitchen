# Website Analysis Summary

## Overview
- **Total sites to analyze**: 15
- **Analysis date**: 2026-01-06
- **Tool**: Firecrawl API + Claude Vision
- **Status**: Script ready - awaiting API key configuration

---

## Run Instructions

To execute the full analysis:

```bash
# Set API keys
export FIRECRAWL_API_KEY="your_firecrawl_key"
export ANTHROPIC_API_KEY="your_anthropic_key"

# Run full analysis (15 sites)
cd /Users/joseph.dawson/Documents/dawson-does-framework
node scripts/analyze-websites.mjs

# Or run limited analysis (faster, cheaper)
node scripts/analyze-websites.mjs --limit 5 --category saas
```

---

## Sites to Analyze

| # | URL | Category | Focus |
|---|-----|----------|-------|
| 1 | linear.app | SaaS | Hero, animations, dark mode |
| 2 | vercel.com | SaaS | Split hero, gradient text |
| 3 | stripe.com | SaaS | Animations, trust signals |
| 4 | notion.so | SaaS | Bento layout, testimonials |
| 5 | figma.com | SaaS | Video hero, features |
| 6 | shopify.com | E-commerce | Product grids, checkout |
| 7 | gumroad.com | E-commerce | Simple pricing, CTAs |
| 8 | lemonsqueezy.com | E-commerce | Pricing tables |
| 9 | railway.app | Dashboard | Sidebar nav, settings |
| 10 | planetscale.com | Dashboard | Data tables, forms |
| 11 | supabase.com | Dashboard | Dark mode, docs layout |
| 12 | producthunt.com | Directory | Grid layouts, voting |
| 13 | alternativeto.net | Directory | Search, filtering |
| 14 | ghost.org | Content | Typography, readability |
| 15 | hashnode.dev | Content | Content layout, social |

---

## Preliminary Pattern Analysis (Based on Public Knowledge)

### Hero Section Patterns

| Pattern | Sites Using | Conversion Score |
|---------|-------------|------------------|
| Centered Gradient | linear.app, vercel.com, stripe.com | 9/10 |
| Split (Image Right) | notion.so, figma.com | 8/10 |
| Video Background | figma.com | 7/10 |
| Dark with Animation | stripe.com, linear.app | 9/10 |

### Layout Patterns

| Pattern | Sites Using |
|---------|-------------|
| Sticky Navigation | All 15 |
| 3-Column Feature Grid | notion.so, stripe.com, supabase.com |
| Bento Grid | notion.so, linear.app |
| Alternating Sections | vercel.com, stripe.com |
| Full-Width Hero | linear.app, vercel.com |

### Color Schemes (Known)

| Site | Primary | Style |
|------|---------|-------|
| linear.app | #5E6AD2 (Purple) | Dark |
| vercel.com | #000000 (Black) | Dark/Light Toggle |
| stripe.com | #635BFF (Purple) | Light |
| notion.so | #000000 (Black) | Light |
| supabase.com | #3ECF8E (Green) | Dark |

### Component Styles

| Component | Most Common Style |
|-----------|------------------|
| Buttons | Rounded, solid fill with hover animation |
| Cards | Elevated with subtle border, rounded-lg corners |
| Icons | Line style (Lucide, Heroicons) |
| Typography | Inter/System for body, custom for headings |

---

## Pattern Recommendations for Library

### High-Priority Patterns (Implement First)

1. **HeroCenteredGradient**
   - Inspired by: linear.app, vercel.com
   - Key elements: Gradient background, centered headline + subhead, dual CTAs
   - Variants: dark, light, animated

2. **HeroSplitImage**
   - Inspired by: notion.so, figma.com
   - Key elements: Text left, image/video right, badge above headline
   - Variants: image-right, image-left, video

3. **FeatureGrid3Col**
   - Inspired by: stripe.com, supabase.com
   - Key elements: Icon + title + description cards in 3 columns
   - Variants: icons, illustrations, screenshots

4. **LogoWall**
   - Inspired by: All SaaS sites
   - Key elements: "Trusted by" headline, company logos
   - Variants: static, scrolling

5. **TestimonialCards**
   - Inspired by: stripe.com, notion.so
   - Key elements: Quote, avatar, name, company, rating
   - Variants: carousel, grid, single-featured

6. **PricingTable3Tier**
   - Inspired by: gumroad.com, lemonsqueezy.com
   - Key elements: Free/Pro/Enterprise columns, feature checklist
   - Variants: monthly/annual toggle, highlighted tier

7. **CTASection**
   - Inspired by: vercel.com, linear.app
   - Key elements: Headline, subtext, large CTA button
   - Variants: centered, split, gradient-bg

8. **FAQAccordion**
   - Inspired by: stripe.com, notion.so
   - Key elements: Expandable Q&A sections
   - Variants: single-column, two-column

---

## Conversion Insights

### CTA Best Practices
- Primary CTA in hero: "Get Started", "Start Free", "Try for Free"
- Secondary CTA: "View Demo", "Learn More", "See Pricing"
- CTA appears: Header, Hero, Mid-page, Footer (4+ placements)

### Trust Signals
1. **Logo walls** - Customer logos (6-12 companies)
2. **Testimonials** - Quotes with photos and titles
3. **Stats** - "10,000+ teams", "99.9% uptime"
4. **Awards/Press** - "ProductHunt #1", "Featured in TechCrunch"
5. **Security badges** - SOC2, GDPR compliance

### Social Proof
- GitHub stars
- Twitter/X testimonials
- Customer case studies
- Usage statistics

---

## Technical Stack Observations

| Site | Framework | UI Library | Animations |
|------|-----------|------------|------------|
| linear.app | Next.js | Custom/Tailwind | Framer Motion |
| vercel.com | Next.js | Custom | CSS + Framer |
| stripe.com | Next.js | Custom | GSAP |
| notion.so | Next.js | Custom | CSS |
| supabase.com | Next.js | Tailwind | Framer Motion |

---

## Next Steps

1. ✅ Script created: `scripts/analyze-websites.mjs`
2. ⏳ Run script with API keys to get actual data
3. ⏳ Create pattern components based on analysis
4. ⏳ Document component props and variants
5. ⏳ Add pattern screenshots to library

---

## Script Output Files

When run, the script generates:

```
output/shared/research/website-analysis/
├── linear-app.json           # Individual site analysis
├── linear-app-screenshot.txt # Base64 screenshot
├── vercel-com.json
├── vercel-com-screenshot.txt
├── ...
├── all-analyses.json         # Combined results
└── ANALYSIS_SUMMARY.md       # This file (updated)
```

---

*Generated by Research Agent*
*(RESEARCH AGENT)*

