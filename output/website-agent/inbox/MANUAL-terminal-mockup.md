# Manual Asset Creation Required: terminal-mockup-clean.webp

**Priority**: P1
**Date**: 2025-12-24
**From**: Quality Agent
**Project**: framework-ui-redesign

---

## Background

AI generation failed after 3 iterations to produce a macOS Terminal.app window mockup:

| Iteration | Result |
|-----------|--------|
| 1 | Industrial device with LED bars |
| 2 | Kanban dashboard with colored cards |
| 3 | Kanban dashboard again |

The AI model (SDXL) cannot correctly interpret "Terminal.app" and consistently generates project management dashboards instead.

---

## Manual Creation Instructions

### Option A: Screenshot Approach (Recommended)

1. **Open Terminal.app** on macOS

2. **Set up the appearance**:
   - Use a dark theme (Pro or Homebrew profile)
   - Font: SF Mono or Menlo, 14-16pt
   - Window size: ~1200x800

3. **Run demo commands**:
   ```bash
   $ npx create-dawson-app my-project
   $ cd my-project
   $ npm run dev
   ```
   
4. **Take screenshot**: `Cmd + Shift + 4` and select window

5. **Clean up in Figma/Photoshop**:
   - Add subtle rounded corners if needed
   - Add soft drop shadow
   - Place on indigo-to-violet gradient background (#667EEA → #764BA2)

6. **Export as WebP**:
   - Dimensions: 1200x800
   - Quality: 80-85%
   - Target size: ~50-70KB

### Option B: Figma Design

1. Create a new frame: 1200x800
2. Draw macOS window chrome:
   - Rounded corners (10px)
   - Title bar with traffic lights (red #FF5F56, yellow #FFBD2E, green #27C93F)
   - Dark background (#1E1E1E or #282828)
3. Add monospace text content:
   - Green (#10B981) for prompt/commands
   - White (#EDEDED) for output
   - Cyan (#22D3EE) for paths
4. Place on gradient background
5. Export as WebP

---

## Target Specifications

| Property | Value |
|----------|-------|
| Filename | `terminal-mockup-clean.webp` |
| Dimensions | 1200x800 |
| Format | WebP |
| Max Size | 100KB |
| Location | `website/public/images/redesign/screenshots/` |

---

## Visual Reference

The terminal should look like this conceptually:

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●                    Terminal                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  $ npx create-dawson-app my-saas-project                   │
│  ✓ Created project structure                                │
│  ✓ Installed dependencies                                   │
│  ✓ Configured templates                                     │
│                                                             │
│  $ cd my-saas-project && npm run dev                       │
│  › Server running at http://localhost:3000                 │
│                                                             │
│  █                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## When Complete

1. Save to `website/public/images/redesign/screenshots/terminal-mockup-clean.webp`
2. Also copy to `output/media-pipeline/shared/approved/framework-ui-redesign/screenshots/`
3. Delete this task file

---

*Manual Creation Task | Quality Agent → Website Agent | 2025-12-24*

