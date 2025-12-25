# Media Agent Memory (Media Pipeline)

> **Role**: Media Pipeline Agent - Image Generator
> **Code**: MED
> **Domain**: AI image generation, asset optimization, manifest creation
> **Pipeline**: Media Generation (Agent 2 of 3)

---

## Role Summary

The Media Agent is the second agent in the Media Generation Pipeline. It receives asset briefs from the Research Agent, generates images using AI tools (Stable Diffusion, DALL-E), optimizes files for web, and hands off to the Quality Agent.

### Key Responsibilities
- Read and execute asset briefs
- Generate images using AI tools (SD API, DALL-E, etc.)
- Optimize images for web (compression, format conversion)
- Create asset manifests with metadata
- Handle feedback loops for revisions (max 3 iterations)
- Hand off to Quality Agent

### Key Files
- SOP: `prompts/agents/roles/media-pipeline/MEDIA_AGENT.md`
- Output: `output/agents/media/`
- Assets: `output/shared/media/assets/[project]/`

---

## Session History

### Session: 2025-12-23 (Production Run - Major)

#### Work Completed
1. **E2E Test Project** (5 assets)
   - Generated hero-workspace, hero-workspace-mobile, empty-state-data
   - Created SVG icons (icon-analytics, icon-analytics-2x)
   - Completed 2 iterations based on Quality Agent feedback
   
2. **Framework UI Redesign** (18 assets)
   - Hero backgrounds (gradient-bg, gradient-bg-mobile)
   - Hero abstract graphic + mesh pattern
   - 6 feature icons (templates, plugins, providers, trust, cli, extensible)
   - 3 demo screenshots (terminal, dashboard, code-editor)
   - 3 avatar placeholders
   - 2 pattern SVGs (section-divider, footer-pattern)
   - Iteration 2: Fixed terminal-mockup with UI mockup style
   
3. **Configurator UX Redesign** (12 assets)
   - 3 phase icons (setup, configure, launch)
   - 4 step status icons (completed, current, pending, locked)
   - 2 stepper connectors (horizontal, vertical)
   - 3 celebration assets (confetti, success animation, export graphic)

#### Key Learnings - CRITICAL

**SDXL Dimension Requirements:**
- MUST use allowed dimensions: 1024x1024, 1152x896, 1216x832, 1344x768, 1536x640, 640x1536, 768x1344, 832x1216, 896x1152
- Generate at allowed size, then resize to target with ImageMagick

**ImageMagick 7 on macOS:**
- Use `/opt/homebrew/bin/magick` (not `convert`)
- `convert` is deprecated in IMv7

**UI Screenshots Prompt Strategy:**
- **DON'T** use photographic prompts for UI mockups
- **DO** use `digital-art` style preset with "flat design mockup" language
- Add negative prompts: "photograph, physical device, hardware, LED lights"

**SVG Icons - Reliable 100%:**
- Hand-coded SVGs have 100% approval rate
- Use consistent 2px stroke, rounded caps, viewBox 0 0 24 24
- Follow Lucide/Heroicons style for consistency

**Color Philosophy Compliance (Warm Neutral v2.0):**
- Orange #F97316 = PRIMARY (CTAs, active states)
- Emerald #10B981 = SUCCESS ONLY (completed steps)
- Amber #F59E0B = Warning states
- Stone #78716C = Disabled/pending (warm neutral, not gray)

#### Blockers Encountered
- SDXL dimension errors (solved with dimension mapping)
- Terminal mockup generated hardware instead of UI (solved with style preset change)

#### Next Priorities
1. Await Quality Agent reviews for all 3 projects
2. Complete any remaining iterations
3. Handoff approved assets to Website Agent

#### Handoff Notes
- E2E Test: Iteration 2 complete, awaiting review
- Framework UI: Iteration 2 complete (terminal fixed), awaiting review
- Configurator UX: Iteration 1 complete, awaiting review

---

## Metrics Tracking

| Metric | Value | Trend |
|--------|-------|-------|
| Assets generated | 35 | ↑ |
| AI-generated images | 18 | ↑ |
| Hand-coded SVGs | 17 | ↑ |
| Iterations used | 5 | - |
| Total cost | ~$0.38 | - |
| SVG approval rate | 100% | ✓ |
| Photo approval rate | ~70% | ↑ |

### Cost Breakdown
| Project | Images | Cost |
|---------|--------|------|
| E2E Test | 6 | $0.12 |
| Framework UI | 10 | $0.20 |
| Configurator UX | 1 | $0.02 |
| **Total** | **17** | **$0.34** |

---

## Cost Optimization Strategy

| Tool | Cost/Image | Use For |
|------|-----------|---------|
| Stable Diffusion API | $0.002-0.02 | All drafts, iterations, bulk |
| DALL-E 3 | $0.04-0.12 | Final hero images only |
| Local SD | Free | High volume, privacy needs |

### Recommended Workflow
1. Generate drafts with SD ($0.01/image)
2. Iterate with SD until close to final
3. Final hero images only with DALL-E
4. Expected savings: 60-80% vs all DALL-E

---

## Generation Settings (Stable Diffusion XL via Stability AI)

| Setting | Recommended Value |
|---------|-------------------|
| Model | stable-diffusion-xl-1024-v1-0 |
| Steps | 40-50 |
| CFG Scale | 7-8 |
| Style Preset | `photographic` (photos), `digital-art` (UI/illustrations) |

### CRITICAL: SDXL Allowed Dimensions
```javascript
const SDXL_DIMS = {
  '16:9': { width: 1344, height: 768 },   // Landscape hero
  '9:16': { width: 768, height: 1344 },   // Mobile/portrait
  '4:3': { width: 1152, height: 896 },    // Screenshots
  '3:4': { width: 896, height: 1152 },    // Tall
  '3:2': { width: 1216, height: 832 },    // Wide screenshots
  '1:1': { width: 1024, height: 1024 }    // Square/avatars
}
```

### ImageMagick 7 (macOS)
```bash
# Use magick, not convert
/opt/homebrew/bin/magick input.png -resize 1920x1080! -quality 85 output.webp
```

---

## Common Patterns

### Asset Manifest Structure
```json
{
  "project": "project-name",
  "generatedAt": "2025-12-23T14:00:00Z",
  "generator": "stable-diffusion-xl",
  "assets": [
    {
      "id": "hero-main",
      "file": "optimized/hero-main.webp",
      "dimensions": "1920x1080",
      "format": "webp",
      "size": "245KB",
      "prompt": "...",
      "iterations": 2,
      "status": "pending-review"
    }
  ]
}
```

### Trigger Command
```
Read prompts/agents/roles/media-pipeline/MEDIA_AGENT.md and generate assets from the brief in your inbox.
```

---

## Notes

- Media Agent is the SECOND agent in the Media Pipeline
- REQUIRES brief from Research Agent
- Verify prompts include camera/lens before generating
- Generated assets go to: `output/shared/media/assets/[project]/`
- Create review request in Quality Agent inbox for handoff
- Max 3 iterations per asset before escalation

### Prompt Strategy by Asset Type

| Asset Type | Style Preset | Key Prompt Elements |
|------------|--------------|---------------------|
| Photorealistic | `photographic` | Camera model, lens, lighting, negative prompts |
| UI Mockups | `digital-art` | "flat design mockup", "pure UI interface", NO hardware |
| Illustrations | `digital-art` | Color palette, style reference (Linear, Notion) |
| Avatars | `photographic` | 1:1 ratio, natural lighting, genuine expression |

### Common Negative Prompts

**Photography:**
```
cartoon, illustration, CGI, 3d render, oversaturated, plastic skin, 
stock photo, fake, artificial, HDR overdone, uncanny valley
```

**UI Mockups:**
```
photograph, physical device, monitor, laptop, LED lights, 
industrial equipment, hardware, real world objects
```

### Active Projects

| Project | Status | Location |
|---------|--------|----------|
| e2e-test-project | Iteration 2 complete | shared/assets/e2e-test-project/ |
| framework-ui-redesign | Iteration 2 complete | shared/assets/framework-ui-redesign/ |
| configurator-ux-redesign | Iteration 1 complete | shared/assets/configurator-ux-redesign/ |

