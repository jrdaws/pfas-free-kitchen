# SEO Content Creation SOP

> **Version**: 1.0 | **Created**: 2025-12-25
> **Purpose**: Create SEO content that ranks #1 on Google
> **Pipeline**: 5-agent workflow

---

## Pipeline Overview

| Stage | Agent | Input | Output |
|-------|-------|-------|--------|
| 1. Research | Research Agent | Topic/keyword | SEO Brief |
| 2. Write | Documentation Agent | SEO Brief | Draft content |
| 3. Review | Quality Agent | Draft | Approved content |
| 4. Implement | Website Agent | Approved | Live page |
| 5. Validate | Testing Agent | Live page | SEO audit report |

---

## Stage 1: Keyword Research (Research Agent)

### Trigger
```
Research Agent: Create SEO brief for "[topic]"
Read docs/sops/SEO_CONTENT_SOP.md and output/seo-pipeline/templates/SEO_BRIEF_TEMPLATE.md
```

### Process
1. **Identify primary keyword** - Use search volume + difficulty data
2. **Map search intent** - Informational, transactional, navigational, commercial
3. **Analyze top 10 competitors** - Word count, structure, unique angles
4. **Find content gaps** - What's missing from existing content?
5. **Define secondary keywords** - Related terms, questions, long-tail

### Output
Save to: `output/seo-pipeline/briefs/[YYYY-MM-DD]-[slug]-brief.md`

---

## Stage 2: Content Writing (Documentation Agent)

### Trigger
```
Documentation Agent: Write SEO content from brief
Read output/seo-pipeline/briefs/[brief-file].md
```

### Content Structure Requirements

```markdown
# [Title with Primary Keyword] (H1)

[Hook paragraph - include keyword in first 100 words]

## Table of Contents (for 1500+ word articles)

## [H2 - Secondary Keyword 1]
[Content with natural keyword usage]

### [H3 - Subtopic]
[Detailed explanation]

## [H2 - Secondary Keyword 2]
...

## Frequently Asked Questions
### [Question from "People Also Ask"]
[40-60 word answer for featured snippet]

## Conclusion
[Summary + clear CTA]
```

### Writing Guidelines

| Do | Don't |
|----|-------|
| Match or exceed competitor word count | Pad with filler |
| Use specific examples, data, code | Generic statements |
| Vary sentence length (8-20 words avg) | Uniform AI-style sentences |
| Include original insights | Rehash existing content |
| Add visuals every 300-500 words | Walls of text |
| Use active voice | Passive constructions |
| Cite sources for claims | Unsourced statistics |

### AI Content Quality Checks
- [ ] No repetitive sentence starters
- [ ] Specific numbers, not "many" or "several"
- [ ] Real examples, not hypotheticals
- [ ] Brand voice matches site
- [ ] Would pass as human-written

### Output
Save to: `output/seo-pipeline/drafts/[YYYY-MM-DD]-[slug]-draft.md`

---

## Stage 3: Quality Review (Quality Agent)

### Trigger
```
Quality Agent: Review SEO draft
Read output/seo-pipeline/drafts/[draft-file].md
```

### SEO Audit Checklist

#### On-Page SEO (40 points)
| Check | Points | Pass/Fail |
|-------|--------|-----------|
| Title: Primary keyword, 50-60 chars | 5 | |
| Meta: Compelling, 150-160 chars | 5 | |
| URL: Short, keyword-rich | 5 | |
| H1: Matches title intent | 5 | |
| First 100 words: Contains keyword | 5 | |
| H2s: Include secondary keywords | 5 | |
| Internal links: 3-5 relevant | 5 | |
| External links: 2-3 authoritative | 5 | |

#### Content Quality (40 points)
| Check | Points | Pass/Fail |
|-------|--------|-----------|
| Word count: Meets/exceeds competitors | 10 | |
| Readability: Flesch 60+ | 5 | |
| Unique value: Clear differentiator | 10 | |
| Accuracy: Facts verified | 10 | |
| AI detection: Passes human test | 5 | |

#### Technical (20 points)
| Check | Points | Pass/Fail |
|-------|--------|-----------|
| Images: Alt text, compressed | 5 | |
| Schema markup: Defined | 5 | |
| Mobile-friendly: Responsive | 5 | |
| FAQ: Targets PAA questions | 5 | |

**Scoring**:
- 90-100: Approved
- 70-89: Minor revisions
- <70: Major revisions needed

### Output
- Approved: Move to `output/seo-pipeline/approved/`
- Revisions: Return to Documentation Agent with feedback

---

## Stage 4: Implementation (Website Agent)

### Trigger
```
Website Agent: Implement SEO content
Read output/seo-pipeline/approved/[content-file].md
```

### Implementation Checklist

#### Page Setup
```tsx
// app/blog/[slug]/page.tsx or similar

export const metadata: Metadata = {
  title: "[Title from brief]",
  description: "[Meta description]",
  openGraph: {
    title: "[Title]",
    description: "[Description]",
    type: "article",
    publishedTime: "[ISO date]",
    authors: ["[Author name]"],
  },
};
```

#### Structured Data (JSON-LD)

```tsx
// Article schema
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "[Title]",
  description: "[Description]",
  author: {
    "@type": "Person",
    name: "[Author]",
  },
  datePublished: "[ISO date]",
  dateModified: "[ISO date]",
  publisher: {
    "@type": "Organization",
    name: "[Site name]",
    logo: {
      "@type": "ImageObject",
      url: "[Logo URL]",
    },
  },
};

// FAQ schema (if FAQ section exists)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "[Question 1]",
      acceptedAnswer: {
        "@type": "Answer",
        text: "[Answer 1]",
      },
    },
    // ... more questions
  ],
};
```

#### Image Optimization
```bash
# Compress images
npx @squoosh/cli --webp auto image.png

# Ensure alt text is descriptive and includes keyword where natural
```

#### Sitemap Update
```tsx
// Ensure page is in sitemap.xml
// Next.js: app/sitemap.ts handles this automatically
```

### Output
- Live URL documented
- Move brief to `output/seo-pipeline/published/`

---

## Stage 5: Validation (Testing Agent)

### Trigger
```
Testing Agent: Validate SEO implementation
URL: [live-page-url]
```

### Validation Tests

#### Lighthouse SEO Audit
```bash
npx lighthouse [URL] --only-categories=seo --output=json
```
**Target**: Score 90+

#### Core Web Vitals
| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |

#### Schema Validation
```bash
# Test structured data
curl -s "[URL]" | npx schema-validator
```
Or use: https://search.google.com/test/rich-results

#### Mobile-Friendly Test
```bash
# Google Mobile-Friendly Test API or manual check
```

### Output
Save report to: `output/seo-pipeline/quality-agent/workspace/[slug]-seo-audit.md`

---

## Folder Structure

```
output/seo-pipeline/
├── briefs/                    # Research Agent output
│   └── 2025-12-25-topic-brief.md
├── drafts/                    # Documentation Agent output
│   └── 2025-12-25-topic-draft.md
├── approved/                  # Quality Agent approved
│   └── 2025-12-25-topic-approved.md
├── published/                 # Live content records
│   └── 2025-12-25-topic-published.md
├── templates/                 # Reusable templates
│   ├── SEO_BRIEF_TEMPLATE.md
│   └── SEO_CHECKLIST.md
└── quality-agent/
    └── workspace/             # Audit reports
```

---

## Quick Reference: E-E-A-T Signals

| Signal | How to Demonstrate |
|--------|-------------------|
| **Experience** | First-hand examples, screenshots, code you've written |
| **Expertise** | Technical depth, accurate details, cite sources |
| **Authoritativeness** | Author bio, credentials, backlinks from trusted sites |
| **Trustworthiness** | Updated dates, HTTPS, transparent about limitations |

---

## Anti-AI Detection Guidelines

1. **Vary sentence structure** - Mix short punchy sentences with longer explanatory ones
2. **Use specific numbers** - "47% faster" not "significantly faster"
3. **Include anecdotes** - Real stories, not hypotheticals
4. **Add opinion** - "In my experience..." or "We've found that..."
5. **Reference current events** - Recent dates, versions, news
6. **Imperfect formatting** - Don't be too polished
7. **Domain expertise** - Details only practitioners would know

---

## Agent Activation Prompts

### Full Pipeline
```
Research Agent: Create SEO brief for "[topic]"
Target keyword: [primary keyword]
Intent: [informational/transactional/etc]
Output: output/seo-pipeline/briefs/
```

### Individual Stages
```
# Stage 2
Documentation Agent: Write SEO content from output/seo-pipeline/briefs/[file].md

# Stage 3
Quality Agent: Review SEO draft at output/seo-pipeline/drafts/[file].md

# Stage 4
Website Agent: Implement approved SEO content from output/seo-pipeline/approved/[file].md

# Stage 5
Testing Agent: Run SEO validation for [URL]
```

---

*SEO Content SOP v1.0 | Multi-Agent Pipeline | 2025-12-25*

