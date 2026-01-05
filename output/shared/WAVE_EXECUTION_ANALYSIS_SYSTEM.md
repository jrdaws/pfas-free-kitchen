# Deep Website Analysis System - Wave Execution Plan

## Overview

This system enables the framework to deeply analyze inspiration websites and use that analysis to generate accurate previews and exports that match the inspiration site's structure, style, and features.

## Architecture

```
User Input: Inspiration URL(s)
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ WAVE 1: Deep Analysis (Foundation)                               │
├──────────────────┬──────────────────────────────────────────────┤
│ Platform Agent   │ Screenshot + Structure + Feature Detection   │
│ Research Agent   │ Enhanced Firecrawl + Multi-page Analysis     │
└──────────────────┴──────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ WAVE 2: Apply Analysis (Parallel Preview + Export)              │
├──────────────────┬──────────────────────────────────────────────┤
│ Website Agent    │ Preview uses analyzed structure/style        │
│ Template Agent   │ Export includes detected features            │
└──────────────────┴──────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ WAVE 2.5: Enhanced Visuals                                       │
├──────────────────┬──────────────────────────────────────────────┤
│ Website Agent    │ Flux generates images matching analysis       │
└──────────────────┴──────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ WAVE 3: Quality Assurance                                        │
├──────────────────┬──────────────────────────────────────────────┤
│ Quality Agent    │ Test accuracy of analysis + generated output │
└──────────────────┴──────────────────────────────────────────────┘
```

## Prompt Files by Wave

### Wave 1: Deep Analysis (Run in Parallel)

| Agent | Prompt File | Purpose |
|-------|-------------|---------|
| Platform | `20260105-P0-deep-website-analysis.txt` | Screenshot, structure, component, feature detection |
| Research | `20260105-P0-enhanced-firecrawl-analysis.txt` | Enhanced Firecrawl extraction with schemas |

### Wave 2: Apply Analysis (Run in Parallel)

| Agent | Prompt File | Purpose |
|-------|-------------|---------|
| Website | `20260105-P0-analysis-to-preview.txt` | Structure-aware, style-aware preview generation |
| Template | `20260105-P0-analysis-to-export.txt` | Feature-based export generation |

### Wave 2.5: Enhanced Visuals

| Agent | Prompt File | Purpose |
|-------|-------------|---------|
| Website | `20260105-P1-flux-preview-images.txt` | Flux image generation using analysis |

### Wave 3: Quality Assurance

| Agent | Prompt File | Purpose |
|-------|-------------|---------|
| Quality | `20260105-P1-analysis-accuracy-testing.txt` | Accuracy testing across known sites |

## Dependencies

```
Wave 1 (Platform + Research) - No dependencies, run parallel
    ↓
Wave 2 (Website + Template) - Depends on Wave 1 output
    ↓
Wave 2.5 (Website/Images) - Depends on Wave 2 preview
    ↓
Wave 3 (Quality) - Depends on all above
```

## Expected Deliverables

### From Wave 1
- `WebsiteAnalysis` object containing:
  - Structure (sections, layouts, heights)
  - Components (button/card/image styles)
  - Features (auth, ecommerce, social, content)
  - Colors (6-color palette extracted)
  - Screenshot (base64 PNG)

### From Wave 2
- Preview that mirrors inspiration structure
- Export that includes detected feature components

### From Wave 2.5
- Custom Flux-generated images matching style

### From Wave 3
- Accuracy report with metrics
- Identified gaps and improvement areas

## Environment Variables Required

```bash
# Already configured
FIRECRAWL_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
ANTHROPIC_API_KEY=xxx

# May need to add
BROWSERLESS_TOKEN=xxx  # For screenshots (optional if Firecrawl screenshots work)
```

## Estimated Time

| Wave | Time | Parallel |
|------|------|----------|
| Wave 1 | 2-3 hours | Yes (2 agents) |
| Wave 2 | 2-3 hours | Yes (2 agents) |
| Wave 2.5 | 1-2 hours | No |
| Wave 3 | 1-2 hours | No |

**Total**: 6-10 hours with parallelization, or 3-4 hours real-time with 2 parallel agents.

