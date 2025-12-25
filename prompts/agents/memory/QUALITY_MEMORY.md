# Quality Agent Memory (Media Pipeline)

> **Role**: Media Pipeline Agent - Quality Reviewer
> **Code**: QUA
> **Domain**: Asset review, photorealism validation, approval/feedback
> **Pipeline**: Media Generation (Agent 3 of 3)

---

## Role Summary

The Quality Agent is the third and final agent in the Media Generation Pipeline. It reviews generated assets against the original brief, validates photorealism quality, and either approves assets or sends feedback for revision.

### Key Responsibilities
- Review assets against original brief requirements
- Validate photorealism (no AI artifacts)
- Score assets on Visual Quality, Brand Alignment, Technical specs
- Approve (≥90) or request revisions (<90)
- Hand off approved assets to Template Agent or Website Agent
- Manage feedback loops (max 3 iterations)

### Key Files
- SOP: `prompts/agents/roles/media-pipeline/QUALITY_AGENT.md`
- Prompt Guide: `output/shared/media/PHOTOREALISTIC_PROMPT_GUIDE.md`
- Output: `output/agents/quality/`
- Approved: `output/shared/media/approved/[project]/`

---

## Session History

### Session: 2025-12-25 (WebP Indigo Audit - Color Palette Transition)

#### Work Completed
- ✅ Visual review of all 13 WebP images in `output/shared/media/approved/`
- ✅ Identified 5 images with prominent purple/indigo elements
- ✅ Confirmed 7 images PASS (no action needed)
- ✅ Confirmed 1 image ACCEPTABLE (minor issues, keep)
- ✅ Created Media Agent task: `P1-regenerate-webp-purple-to-orange.txt`
- ✅ Created audit report: `workspace/webp-indigo-audit-report.md`

#### Audit Results
| Status | Count | Files |
|--------|-------|-------|
| ✅ PASS | 7 | dashboard-preview, code-editor-visual, 3 avatars, 2 hero-workspace |
| 🟡 ACCEPTABLE | 1 | empty-state-data.webp |
| 🔴 REGENERATE | 5 | 2 hero gradients, abstract graphic, terminal mockup, export success |

#### Key Findings
- **Hero gradients are 100% purple** - Critical issue
- **Export success has purple mountains** - High priority
- **Terminal mockup still wrong subject** - Was already flagged
- **Avatars all neutral** - No brand colors (expected)
- **Workspace photos clean** - Natural colors only

#### Handoff Notes
- Media Agent should regenerate 5 images per task file
- All prompts include explicit negative prompts for purple/violet
- After regeneration, Quality Agent to re-review

---

### Session: 2025-12-24 (SOP Registry Audit)

#### Work Completed
- ✅ Audited all 17 SOPs in `docs/sops/`
- ✅ Updated SOP_REGISTRY.md with complete inventory
- ✅ Identified 2 outdated path references in AGENT_POLICIES.md
- ✅ Identified 6 SOPs missing from AGENT_POLICIES.md table
- ✅ Confirmed 0 conflicts and 0 duplicates
- ✅ Created comprehensive audit report: `output/agents/quality/outbox/sop-review-report.md`

#### Key Findings
| Finding | Status |
|---------|--------|
| Total SOPs | 17 (up from 7 in registry) |
| Conflicts | 0 ✅ |
| Duplicates | 0 ✅ |
| Outdated paths | 2 (lines 933-935 AGENT_POLICIES.md) |
| Missing from governance | 6 SOPs |

#### Recommendations Created
- P1: Update `output/media-agent/` → `output/agents/media/` in AGENT_POLICIES.md
- P1: Add 6 missing SOPs to AGENT_POLICIES.md table
- P2: Standardize SHADCN_IMPLEMENTATION_SOP version (1.0 → 1.0.0)

#### Handoff Notes
- Documentation Agent should update AGENT_POLICIES.md
- Full report at: `output/agents/quality/outbox/sop-review-report.md`

---

### Session: 2025-12-23 (Configurator UX Redesign - PERFECT SCORE)

#### Work Completed
- ✅ Reviewed 12 assets for new 3-phase configurator stepper
- ✅ **100% approval rate** (12/12 approved)
- ✅ **99/100 overall score** - highest yet!
- ✅ **100% color philosophy compliance**
- ✅ Created review report: `quality-agent/workspace/configurator-ux-redesign-review.md`
- ✅ Moved approved assets to: `shared/approved/configurator-ux-redesign/`
- ✅ Created Website Agent handoff: `website-agent/inbox/media-configurator-ux-redesign/IMPLEMENT.txt`

#### Assets Reviewed
| Category | Assets | Score |
|----------|--------|-------|
| Phase Icons | 3 SVGs | 98/100 |
| Step Status Icons | 4 SVGs | 99/100 |
| Connectors | 2 SVGs | 100/100 |
| Feedback/Celebration | 2 SVGs + 1 WebP | 97/100 |

#### Key Learnings
- **Hand-coded SVGs excel**: All 11 SVGs passed first time
- **Color Philosophy works**: Emerald ONLY for success = no misuse
- **Animation support built-in**: CSS keyframes in SVGs validated
- **AI illustration quality high**: export-success-graphic.webp scored 98/100

#### Documentation Created
- `output/shared/media/COLOR_PHILOSOPHY.md` - Official color guidelines
- `output/shared/media/UX_MULTI_STEP_GUIDE.md` - Multi-step wizard UX patterns

---

### Session: 2025-12-23 (Framework UI Redesign - Iterations 1 & 2)

#### Work Completed
- ✅ Reviewed 18 assets across 5 categories
- ✅ Iteration 1: 15 approved, 1 needs testing, 1 rejected, 1 critical fail
- ✅ Iteration 2: Reviewed revisions, approved hero-abstract-graphic
- ✅ Flagged terminal-mockup-clean for manual creation (AI limitation)
- ✅ Moved 16 approved assets to: `shared/approved/framework-ui-redesign/`
- ✅ Created Website Agent handoff with manual creation notes

#### Key Learnings
- **UI mockups are AI's weakness**: Terminal window generation failed twice
- **Composite testing works**: hero-combined-test.webp validated graphic placement
- **Style preset matters**: "digital-art" doesn't fix fundamental prompt issues
- **Manual creation backup**: Some assets better created manually

#### Decision Made
- `terminal-mockup-clean.webp` → Manual creation during website implementation

---

### Session: 2025-12-23 (First Review Cycle - E2E Test Project)

#### Work Completed
- ✅ First asset review cycle completed
- ✅ Reviewed 5 assets (3 WebP images, 2 SVG icons)
- ✅ Approved 2 SVG icons (icon-analytics.svg, icon-analytics-2x.svg)
- ✅ Sent revision feedback for 3 WebP images
- ✅ Created review report: `quality-agent/workspace/e2e-test-project-review.md`
- ✅ Created feedback: `media-agent/inbox/feedback-e2e-test-project.md`
- ✅ Moved approved SVGs to: `shared/approved/e2e-test-project/`

#### Key Learnings
- **Screen content is hard to control**: Both hero images struggled with displaying correct dashboard UI
- **Prompt interpretation issues**: "Empty state" was interpreted as "collection of charts" instead of "illustration for no data"
- **SVG icons are reliable**: Hand-coded SVGs passed without issues
- **Photorealism quality is good**: All 3 WebP images passed photorealism checks - issues were content mismatches, not AI artifacts

#### Blockers Encountered
- None (process working as designed)

#### Issues Identified for Pipeline Improvement
1. Screen content generation needs explicit compositing approach (photo + screenshot overlay)
2. "Empty state" illustrations may be better as hand-coded SVG than AI-generated
3. Consider prompt templates with worked examples for abstract concepts

#### Next Priorities
1. Review iteration 2 when Media Agent completes revisions
2. If hero-workspace can't be fixed, recommend composite approach
3. Consider alternative empty-state as SVG

#### Handoff Notes
- 2 SVG icons ready in `shared/approved/e2e-test-project/`
- Awaiting Media Agent revisions for 3 WebP images (iteration 2)
- Asset target: TEMPLATE (templates/saas/public/images/)

---

### Session: 2025-12-23 (Initial Setup)

#### Work Completed
- SOP created
- Photorealism checklist integrated
- Scoring system established (100-point scale)

#### Key Learnings
- Plastic/waxy skin is the most common AI tell
- Hands/fingers require extra scrutiny
- Consistent lighting direction is critical
- Score ≥90 = approved, <90 = revisions needed

#### Blockers Encountered
- None

#### Next Priorities
1. Complete first review cycle
2. Build rejection criteria library
3. Track approval rates by asset type

#### Handoff Notes
Approved assets go to Template Agent (for templates) or Website Agent (for projects).

---

## Metrics Tracking

| Metric | Value | Trend |
|--------|-------|-------|
| Assets reviewed | 35 | ↑↑↑ |
| First-pass approval rate | 83% (29/35) | ↑ |
| Average iterations needed | 1.2 | ↓ |
| Revision rate | 17% (6/35) | ↓ |
| Perfect reviews (100%) | 1 | ✓ |
| SOPs audited | 17 | NEW |

### Review History
| Date | Project | Total | Approved | Revisions | Avg Score |
|------|---------|-------|----------|-----------|-----------|
| 2025-12-23 | configurator-ux-redesign | 12 | 12 | 0 | 99/100 ⭐ |
| 2025-12-23 | framework-ui-redesign | 18 | 16 | 1 | 92/100 |
| 2025-12-23 | e2e-test-project | 5 | 2 | 3 | 74/100 |

### Color Philosophy Compliance
| Project | Compliance |
|---------|------------|
| configurator-ux-redesign | 100% ✓ |
| framework-ui-redesign | 100% ✓ |
| e2e-test-project | 100% ✓ |

---

## Scoring System

### Visual Quality (40 points)
- Resolution appropriate (10)
- Composition balanced (10)
- No artifacts (10)
- Consistent style (10)

### Brand Alignment (30 points)
- Colors match palette (10)
- Style matches brief (10)
- Appropriate for audience (10)

### Technical Requirements (30 points)
- Correct dimensions (10)
- File size optimized (10)
- Format correct (10)

### Score Interpretation
| Score | Status | Action |
|-------|--------|--------|
| 90-100 | ✅ Approved | Move to approved folder |
| 70-89 | ⚠️ Minor revisions | Send specific feedback |
| 50-69 | 🔄 Major revisions | Regenerate with new prompt |
| <50 | ❌ Rejected | Back to Research |

---

## Photorealism Checklist

| Check | What to Look For |
|-------|------------------|
| Skin texture | Natural pores, not waxy/plastic |
| Eyes | Realistic catchlights, not vacant |
| Lighting | Consistent direction, natural shadows |
| Colors | Not oversaturated, realistic tones |
| Hands | Correct fingers, natural positioning |
| Background | Appropriate bokeh, no artifacts |
| Overall | Would you believe this is a real photo? |

---

## Common Rejection Reasons

1. **Plastic skin** - Regenerate with "natural skin texture, visible pores"
2. **Wrong hands** - Add "natural hand position" + negative "malformed hands"
3. **Oversaturated** - Lower CFG, add "natural colors, subtle tones"
4. **Inconsistent lighting** - Specify single light source direction
5. **Stock photo feel** - Add "authentic, candid, genuine moment"

---

## Handoff Destinations

| Asset Target | Receiving Agent | Inbox |
|--------------|-----------------|-------|
| TEMPLATE | Template Agent | `output/agents/template/inbox/media-[project]/` |
| PROJECT | Website Agent | `output/agents/website/inbox/media-[project]/` |

---

## Common Patterns

### Review Report Structure
```
1. Summary (approved/revisions/rejected counts)
2. Per-Asset Reviews (score breakdown)
3. Feedback for Media Agent (if revisions needed)
4. Overall Recommendations
```

### Trigger Command
```
Read prompts/agents/roles/media-pipeline/QUALITY_AGENT.md and review the assets waiting in your inbox.
```

---

## Notes

- Quality Agent is the THIRD and FINAL agent in the Media Pipeline
- REQUIRES assets from Media Agent
- All images must pass photorealism checklist
- Max 3 iterations before forced approval with notes
- Approved assets go to: `output/shared/media/approved/[project]/`
- Handoff to Template Agent or Website Agent based on Asset Target

