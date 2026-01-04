# SEO Content Pipeline

> Multi-agent workflow for creating SEO content that ranks #1 on Google

---

## Quick Start

### 1. Start a new SEO project

```
Research Agent: Create SEO brief for "[your topic]"
Target keyword: [primary keyword]
Read docs/sops/SEO_CONTENT_SOP.md
```

### 2. Write the content

```
Documentation Agent: Write SEO content
Read output/seo-pipeline/briefs/[brief-file].md
```

### 3. Review for quality

```
Quality Agent: Review SEO draft
Read output/seo-pipeline/drafts/[draft-file].md
```

### 4. Implement on website

```
Website Agent: Implement SEO content
Read output/seo-pipeline/approved/[content-file].md
```

### 5. Validate SEO

```
Testing Agent: Run SEO validation for [URL]
```

---

## Folder Structure

```
output/seo-pipeline/
├── briefs/           # Research Agent creates keyword briefs here
├── drafts/           # Documentation Agent writes content here
├── approved/         # Quality Agent moves approved content here
├── published/        # Records of live content
├── templates/        # Reusable templates
│   ├── SEO_BRIEF_TEMPLATE.md
│   └── SEO_CHECKLIST.md
└── quality-agent/
    └── workspace/    # Audit reports and reviews
```

---

## Pipeline Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Research   │───▶│Documentation │───▶│   Quality    │
│    Agent     │    │    Agent     │    │    Agent     │
│              │    │              │    │              │
│ Keyword      │    │ Write        │    │ SEO Audit    │
│ research     │    │ content      │    │ Fact check   │
│ Competitor   │    │ Optimize     │    │ AI check     │
│ analysis     │    │ structure    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   briefs/             drafts/            approved/
                                              │
                                              ▼
                          ┌──────────────┐    ┌──────────────┐
                          │   Website    │───▶│   Testing    │
                          │    Agent     │    │    Agent     │
                          │              │    │              │
                          │ Implement    │    │ Lighthouse   │
                          │ Schema       │    │ Core Vitals  │
                          │ Images       │    │ Schema test  │
                          └──────────────┘    └──────────────┘
                                 │                   │
                                 ▼                   ▼
                            published/         audit reports
```

---

## Key Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Full SOP | `docs/sops/SEO_CONTENT_SOP.md` | Complete process guide |
| Brief Template | `templates/SEO_BRIEF_TEMPLATE.md` | Keyword research format |
| Checklist | `templates/SEO_CHECKLIST.md` | Quality review scoring |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| SEO Checklist Score | 80+ |
| Lighthouse SEO Score | 90+ |
| LCP | < 2.5s |
| Time to First Ranking | 2-4 weeks |

---

*SEO Pipeline v1.0 | 2025-12-25*

