# SEO Generation SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-24
> 
> **Purpose**: Multi-agent pipeline for generating and implementing SEO across projects
> **Audience**: Research, Documentation, Website, Quality, and Testing Agents
> **Pipeline Location**: `output/seo-pipeline/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pipeline Flow](#2-pipeline-flow)
3. [Agent Responsibilities](#3-agent-responsibilities)
4. [SEO Standards](#4-seo-standards)
5. [Templates & Checklists](#5-templates--checklists)
6. [Technical Implementation](#6-technical-implementation)
7. [Quality Gates](#7-quality-gates)

---

## 1. Overview

### Purpose

Generate comprehensive, high-quality SEO for all pages in generated projects and templates.

### Pipeline Principle

```
Research → Content → Implementation → Review → Validation
```

### File Structure

```
output/seo-pipeline/
├── briefs/              # Research Agent output
│   ├── BRIEF-homepage.md
│   └── BRIEF-pricing.md
├── content/             # Documentation Agent output
│   ├── META-homepage.json
│   └── STRUCTURED-DATA-homepage.json
├── approved/            # Quality Agent approved
│   └── [ready for implementation]
└── templates/           # Reusable templates
    ├── SEO_BRIEF_TEMPLATE.md
    └── META_CONTENT_TEMPLATE.json
```

---

## 2. Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEO GENERATION PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STAGE 1: RESEARCH                                               │
│  Agent: Research Agent                                           │
│  Input: Project requirements, target audience                    │
│  Output: SEO Brief (output/seo-pipeline/briefs/)                │
│  Duration: ~15 minutes                                           │
│              │                                                   │
│              ▼                                                   │
│  STAGE 2: CONTENT CREATION                                       │
│  Agent: Documentation Agent                                      │
│  Input: SEO Brief                                                │
│  Output: Meta content, structured data                          │
│  Duration: ~20 minutes                                           │
│              │                                                   │
│              ▼                                                   │
│  STAGE 3: IMPLEMENTATION                                         │
│  Agent: Website Agent                                            │
│  Input: Approved SEO content                                     │
│  Output: Updated pages with SEO                                 │
│  Duration: ~30 minutes                                           │
│              │                                                   │
│              ▼                                                   │
│  STAGE 4: QUALITY REVIEW                                         │
│  Agent: Quality Agent                                            │
│  Input: Implemented SEO                                          │
│  Output: Approval or revision request                           │
│  Duration: ~10 minutes                                           │
│              │                                                   │
│              ▼                                                   │
│  STAGE 5: VALIDATION                                             │
│  Agent: Testing Agent                                            │
│  Input: Approved implementation                                  │
│  Output: Technical validation report                            │
│  Duration: ~10 minutes                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Agent Responsibilities

### Research Agent

**Mission**: Analyze project requirements and create comprehensive SEO briefs.

**Tasks**:
1. Identify target audience and search intent
2. Research primary and secondary keywords
3. Analyze competitor SEO strategies
4. Define content structure recommendations
5. Create SEO brief for each page/section

**Output Location**: `output/seo-pipeline/briefs/BRIEF-[page-name].md`

**Handoff**:
```
Next Agent: Documentation Agent
```
Create meta content and structured data based on SEO brief at output/seo-pipeline/briefs/BRIEF-[page-name].md. Follow SEO_GENERATION_SOP.md standards for character limits and keyword placement.
```

---

### Documentation Agent

**Mission**: Create optimized meta content and structured data.

**Tasks**:
1. Write meta titles (50-60 characters)
2. Write meta descriptions (150-160 characters)
3. Create Open Graph tags
4. Create Twitter Card tags
5. Generate JSON-LD structured data
6. Define URL slugs and canonical URLs

**Output Location**: `output/seo-pipeline/content/META-[page-name].json`

**Handoff**:
```
Next Agent: Website Agent
```
Implement SEO content from output/seo-pipeline/content/META-[page-name].json into the project pages. Add structured data to layout, configure sitemap.xml and robots.txt.
```

---

### Website Agent

**Mission**: Implement SEO content into actual pages.

**Tasks**:
1. Add meta tags to page components
2. Implement structured data in layouts
3. Configure sitemap.xml generation
4. Set up robots.txt
5. Optimize images with alt text
6. Ensure proper heading hierarchy

**Output**: Updated project files with SEO

**Handoff**:
```
Next Agent: Quality Agent
```
Review SEO implementation in the project. Check meta tag lengths, structured data validity, and sitemap accessibility. Reference docs/sops/SEO_GENERATION_SOP.md for quality gates.
```

---

### Quality Agent

**Mission**: Validate SEO implementation meets standards.

**Tasks**:
1. Check meta tag character limits
2. Validate structured data with Schema.org
3. Verify keyword placement
4. Check Open Graph rendering
5. Approve or request revisions

**Output**: Approval or revision feedback

**Handoff (if approved)**:
```
Next Agent: Testing Agent
```
Run technical SEO validation on the implemented pages. Execute Lighthouse SEO audit, check sitemap accessibility, validate robots.txt rules.
```

**Handoff (if revision needed)**:
```
Next Agent: Website Agent
```
Revisions needed for SEO implementation. Issues: [list issues]. Reference Quality Agent feedback at output/seo-pipeline/quality-agent/workspace/[review-file].md.
```

---

### Testing Agent

**Mission**: Technical validation of SEO implementation.

**Tasks**:
1. Run Lighthouse SEO audit (target: 90+)
2. Validate sitemap.xml accessibility
3. Test robots.txt rules
4. Check Core Web Vitals
5. Verify mobile-friendliness
6. Test Open Graph preview rendering

**Validation Commands**:
```bash
# Lighthouse SEO audit
npx lighthouse http://localhost:3000 --only-categories=seo --output=json

# Validate sitemap
curl -s http://localhost:3000/sitemap.xml | head -20

# Check robots.txt
curl -s http://localhost:3000/robots.txt

# Validate structured data
npx structured-data-testing-tool --url http://localhost:3000
```

---

## 4. SEO Standards

### Meta Tag Limits

| Element | Min | Max | Notes |
|---------|-----|-----|-------|
| Meta Title | 30 | 60 | Include primary keyword |
| Meta Description | 120 | 160 | Include CTA |
| URL Slug | 3 | 75 | Lowercase, hyphenated |
| H1 | 20 | 70 | One per page |
| Image Alt | 5 | 125 | Descriptive, natural |

### Keyword Placement

| Location | Primary Keyword | Secondary Keywords |
|----------|-----------------|-------------------|
| Meta Title | ✅ Required (front) | Optional |
| Meta Description | ✅ Required | ✅ 1-2 recommended |
| H1 | ✅ Required | Optional |
| URL Slug | ✅ Required | ❌ Avoid |
| First Paragraph | ✅ Required | ✅ Natural placement |
| Image Alt | Optional | Optional |

### Structured Data Types

| Page Type | Schema.org Type | Required Properties |
|-----------|-----------------|---------------------|
| Homepage | Organization | name, url, logo, sameAs |
| Product | Product | name, description, price, image |
| Article | Article | headline, author, datePublished |
| FAQ | FAQPage | mainEntity (Q&A pairs) |
| Pricing | Product + Offer | name, price, priceCurrency |
| About | AboutPage | name, description |
| Contact | ContactPage | name, contactPoint |

---

## 5. Templates & Checklists

### SEO Brief Template

Located at: `output/seo-pipeline/templates/SEO_BRIEF_TEMPLATE.md`

```markdown
# SEO Brief: [Page Name]

## Page Overview
- **URL**: /[slug]
- **Purpose**: [Primary purpose of page]
- **Target Audience**: [Who this page serves]
- **Search Intent**: [Informational/Transactional/Navigational]

## Keywords

### Primary Keyword
- **Keyword**: [exact phrase]
- **Search Volume**: [monthly searches]
- **Difficulty**: [Low/Medium/High]
- **Current Ranking**: [if applicable]

### Secondary Keywords
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| [keyword 1] | [vol] | [diff] | [intent] |
| [keyword 2] | [vol] | [diff] | [intent] |

## Competitor Analysis

### Top 3 Ranking Pages
1. [URL] - [What they do well]
2. [URL] - [What they do well]
3. [URL] - [Gap we can exploit]

### Content Gaps
- [Gap 1 - topic competitors miss]
- [Gap 2 - angle we can own]

## Content Recommendations

### Structure
- **H1**: [Recommended H1 with keyword]
- **H2s**: [List of recommended subheadings]
- **Word Count**: [Target length]
- **Content Type**: [Guide/List/Comparison/etc.]

### Unique Value Proposition
[What makes this page uniquely valuable for searchers]

## Technical Notes
- **Canonical**: [URL]
- **Indexable**: Yes/No
- **Priority in Sitemap**: [0.5-1.0]
```

### Meta Content Template

Located at: `output/seo-pipeline/templates/META_CONTENT_TEMPLATE.json`

```json
{
  "page": "[page-name]",
  "url": "/[slug]",
  "meta": {
    "title": "[50-60 chars with primary keyword]",
    "description": "[150-160 chars with keyword and CTA]",
    "keywords": ["primary", "secondary1", "secondary2"],
    "canonical": "https://example.com/[slug]",
    "robots": "index, follow"
  },
  "openGraph": {
    "title": "[OG title - can be longer]",
    "description": "[OG description]",
    "type": "website",
    "image": "/og/[page-name].png",
    "imageAlt": "[Descriptive alt text]"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "[Twitter title]",
    "description": "[Twitter description]",
    "image": "/og/[page-name].png"
  },
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "[Schema type]",
    "name": "[Name]",
    "description": "[Description]"
  }
}
```

### Quality Checklist

```markdown
## SEO Quality Checklist

### Meta Tags
- [ ] Title: 50-60 characters
- [ ] Title: Contains primary keyword (preferably front)
- [ ] Description: 150-160 characters
- [ ] Description: Contains keyword + CTA
- [ ] Canonical URL set correctly

### Structured Data
- [ ] JSON-LD valid (no console errors)
- [ ] Schema.org type matches page content
- [ ] All required properties present
- [ ] Tested with Google Rich Results Test

### Content
- [ ] H1 contains primary keyword
- [ ] Only one H1 per page
- [ ] Heading hierarchy logical (H1 > H2 > H3)
- [ ] Images have descriptive alt text
- [ ] Internal links use descriptive anchor text

### Technical
- [ ] Page in sitemap.xml
- [ ] robots.txt allows crawling
- [ ] Page loads < 3 seconds
- [ ] Mobile-friendly
- [ ] HTTPS enabled

### Open Graph
- [ ] OG image exists (1200x630px)
- [ ] OG title and description set
- [ ] Preview renders correctly in social debuggers
```

---

## 6. Technical Implementation

### Next.js Metadata API

```typescript
// app/[page]/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Primary Keyword - Brand Name',
  description: 'Meta description with keyword and CTA. 150-160 chars.',
  keywords: ['primary', 'secondary1', 'secondary2'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    type: 'website',
    images: [{ url: '/og/page.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
  },
  alternates: {
    canonical: 'https://example.com/page',
  },
};
```

### JSON-LD Structured Data

```typescript
// app/[page]/page.tsx
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Page Name',
    description: 'Page description',
    url: 'https://example.com/page',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Sitemap Configuration

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://example.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
```

### Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

---

## 7. Quality Gates

### Stage Gate: Research → Content

| Check | Requirement |
|-------|-------------|
| Primary keyword defined | ✅ Must have |
| Search intent identified | ✅ Must have |
| Competitor analysis | ✅ At least 3 |
| Content structure | ✅ H1, H2s defined |

### Stage Gate: Content → Implementation

| Check | Requirement |
|-------|-------------|
| Meta title | 50-60 chars |
| Meta description | 150-160 chars |
| Structured data | Valid JSON-LD |
| OG image specified | 1200x630px |

### Stage Gate: Implementation → Approval

| Check | Requirement |
|-------|-------------|
| Lighthouse SEO | ≥ 90 |
| Structured data valid | No errors |
| Sitemap accessible | 200 response |
| Mobile-friendly | Pass |

---

## Related Documents

- [MEDIA_NAMING_SOP.md](./MEDIA_NAMING_SOP.md) - For OG image naming
- [DOCUMENTATION_SYNC_SOP.md](./DOCUMENTATION_SYNC_SOP.md) - Keep SEO docs current
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-24 | DOC Agent | Initial creation |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Drafter | Documentation Agent | 2025-12-24 | ✅ Complete |
| Reviewer | Auditor Agent | Pending | ⏳ Awaiting |

