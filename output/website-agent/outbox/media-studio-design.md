# Media Studio GUI Design Document

> **Status**: ✅ Substantially Implemented
> **Date**: 2026-01-05
> **Agent**: Website Agent

---

## Executive Summary

The Media Studio is already substantially implemented with a 4-step wizard flow for planning, building prompts, generating, and reviewing AI-generated images. This document details the current implementation and identifies remaining work.

---

## Current Implementation Status

### ✅ Completed Components

| Component | File | Status |
|-----------|------|--------|
| Step Indicator | `MediaStudioStepIndicator.tsx` | ✅ Complete |
| Asset Planner Form | `AssetPlannerForm.tsx` | ✅ Complete |
| Prompt Builder | `PromptBuilder.tsx` | ✅ Complete |
| Generation Progress | `GenerationProgress.tsx` | ✅ Complete (simulated) |
| Quality Reviewer | `QualityReviewer.tsx` | ✅ Complete |
| State Management | `lib/media-studio-state.ts` | ✅ Complete |
| Prompt Templates | `lib/prompt-templates.ts` | ✅ Complete |

### 🔄 Needs Implementation

| Component | Priority | Notes |
|-----------|----------|-------|
| `/api/media/generate` | P1 | Real API integration |
| `/api/media/status` | P1 | Generation status polling |
| `/api/media/library` | P2 | Asset library API |
| Asset Library UI | P2 | Browse approved assets |
| Real Replicate/OpenAI integration | P1 | Replace simulation |

---

## Architecture

### User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        MEDIA STUDIO                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 1. Plan  │───▶│ 2. Build │───▶│3.Generate│───▶│ 4. Review│  │
│  │  Assets  │    │  Prompts │    │          │    │          │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  Asset Types:                                                    │
│  • Hero Image (1920×1080)                                        │
│  • Feature Icons (512×512)                                       │
│  • Illustrations (1280×720)                                      │
│  • Avatars (256×256)                                             │
│  • Backgrounds (1920×1080)                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

Uses Zustand with persistence:

```typescript
interface MediaStudioState {
  // Step tracking
  currentStep: MediaStudioStep; // 1-4
  completedSteps: Set<MediaStudioStep>;

  // Project context
  projectName: string;
  template: string;
  assetTarget: 'PROJECT' | 'TEMPLATE';

  // Assets
  assets: PlannedAsset[];
  currentAssetIndex: number;

  // Generation
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;

  // Costs
  estimatedCost: number;
  actualCost: number;
}
```

---

## Component Details

### 1. Asset Planner Form (`AssetPlannerForm.tsx`)

**Purpose**: Define what images the project needs

**Features**:
- ✅ Project context (name, template) auto-filled from Configurator
- ✅ Asset target selection (PROJECT vs TEMPLATE)
- ✅ Asset type grid (hero, icon, illustration, avatar, background, feature)
- ✅ Dimension presets per asset type
- ✅ Priority levels (P1, P2, P3)
- ✅ Description input for each asset
- ✅ Add/remove asset cards

**UI Design**:
```
┌─────────────────────────────────────────────────────┐
│ Project Context                  [Auto-filled]      │
├─────────────────────────────────────────────────────┤
│ Project Name: [my-project]  Template: [saas]        │
├─────────────────────────────────────────────────────┤
│ Asset Target:                                        │
│ ┌────────────────┐  ┌────────────────┐              │
│ │ ○ PROJECT      │  │ ○ TEMPLATE     │              │
│ │ For this app   │  │ For starter    │              │
│ └────────────────┘  └────────────────┘              │
├─────────────────────────────────────────────────────┤
│ Required Assets                    [+ Add Asset]    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🖼️ hero-main | P1 | 1920×1080                   │ │
│ │ Professional dashboard screenshot...      [🗑️]   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

### 2. Prompt Builder (`PromptBuilder.tsx`)

**Purpose**: Configure photorealistic prompts for each asset

**Features**:
- ✅ Subject description input (pre-filled from asset description)
- ✅ Camera model selector (Canon EOS R5, Sony A7R V, etc.)
- ✅ Lens selector (85mm f/1.4, 35mm f/1.4, etc.)
- ✅ Lighting type (natural window, studio, golden hour)
- ✅ Lighting direction (from left, from right, etc.)
- ✅ Photography style (editorial, commercial, lifestyle)
- ✅ Color grade (film grain, cinematic, natural)
- ✅ Shallow DOF toggle
- ✅ Candid moment toggle
- ✅ Auto-composed prompt preview
- ✅ Negative prompt auto-included
- ✅ Copy prompt button
- ✅ Cost estimate display
- ✅ Asset navigation dots

**Photorealistic Formula Applied**:
```
[Subject], shot on [Camera] with [Lens], [Lighting] [Direction],
[Style] photography, [Color Grade], [Additional Modifiers]

Negative: [Standard negative prompt for AI artifacts]
```

---

### 3. Generation Progress (`GenerationProgress.tsx`)

**Purpose**: Generate images and track progress

**Features**:
- ✅ Generate All / Stop buttons
- ✅ Overall progress bar
- ✅ Current generation details (stage, percent)
- ✅ Asset gallery grid with status badges
- ✅ Model selector per asset (SD vs DALL-E)
- ✅ Cost summary (estimated vs actual)
- ⚠️ **Currently simulated** - needs real API integration

**Current Limitation**: Uses placeholder images and simulated delays. 
Real implementation needs `/api/media/generate` endpoint.

---

### 4. Quality Reviewer (`QualityReviewer.tsx`)

**Purpose**: Review generated assets against quality standards

**Features**:
- ✅ Side-by-side image preview + prompt
- ✅ Photorealism checklist (7 items)
  - Skin texture natural
  - Eyes realistic
  - Lighting consistent
  - Colors natural
  - Hands correct
  - Background clean
  - Overall photorealistic
- ✅ Quality scores (Visual/Brand/Technical)
- ✅ Total score calculation (0-100)
- ✅ Approve / Approve with Notes / Regenerate buttons
- ✅ Feedback input
- ✅ Review progress summary
- ✅ Iteration tracking (max 3)

---

## API Routes Required

### `/api/media/generate` (POST)

```typescript
interface GenerateRequest {
  assets: Array<{
    id: string;
    prompt: string;
    negativePrompt: string;
    width: number;
    height: number;
    model: 'stable-diffusion' | 'dall-e-3' | 'flux';
  }>;
  projectName: string;
  assetTarget: 'PROJECT' | 'TEMPLATE';
}

interface GenerateResponse {
  jobId: string;
  estimatedTime: number;
}
```

### `/api/media/status/[jobId]` (GET)

```typescript
interface StatusResponse {
  status: 'pending' | 'processing' | 'complete' | 'failed';
  assets: Array<{
    id: string;
    status: 'pending' | 'generating' | 'complete' | 'failed';
    progress: number;
    imageUrl?: string;
    error?: string;
  }>;
}
```

### `/api/media/library` (GET)

```typescript
interface LibraryResponse {
  assets: Array<{
    id: string;
    name: string;
    url: string;
    type: AssetType;
    projectName: string;
    createdAt: string;
    score: number;
  }>;
}
```

---

## Integration Points

### 1. Configurator Integration

The Media Studio can be accessed from the configurator with project context:

```tsx
<Link href={`/media-studio?project=${projectName}&template=${template}`}>
  Open Media Studio
</Link>
```

### 2. Export Integration

Approved assets should be included in project exports:

```typescript
// In export flow
const approvedAssets = await getApprovedAssets(projectId);
for (const asset of approvedAssets) {
  zip.file(`public/images/${asset.name}`, await fetch(asset.url));
}
```

### 3. Preview Integration

Generated images can be used in the preview system:

```typescript
// Connect to existing image generation infrastructure
import { generateImageWithCache } from '@/lib/image-cache';
```

---

## Cost Model

| Model | Cost/Image | Best For |
|-------|-----------|----------|
| Stable Diffusion (via Replicate) | $0.02 | Iterations, bulk |
| DALL-E 3 | $0.08 | Final hero images |
| Flux (via Replicate) | $0.03 | High quality, fast |

**Recommendation**: 
- Use Stable Diffusion/Flux for all iterations
- Switch to DALL-E only for final critical assets

---

## Files Summary

```
website/
├── app/
│   ├── media-studio/
│   │   └── page.tsx                    ✅ Main page
│   └── components/
│       └── media-studio/
│           ├── MediaStudioStepIndicator.tsx  ✅
│           ├── AssetPlannerForm.tsx          ✅
│           ├── PromptBuilder.tsx             ✅
│           ├── GenerationProgress.tsx        ✅ (needs real API)
│           └── QualityReviewer.tsx           ✅
├── lib/
│   ├── media-studio-state.ts           ✅ Zustand store
│   └── prompt-templates.ts             ✅ Photorealistic presets
└── app/api/
    └── media/                          ❌ Not yet created
        ├── generate/route.ts           ❌
        ├── status/[jobId]/route.ts     ❌
        └── library/route.ts            ❌
```

---

## Next Steps

1. **P1**: Create `/api/media/generate` route with Replicate integration
2. **P1**: Wire `GenerationProgress.tsx` to real API
3. **P2**: Create Asset Library page for browsing approved assets
4. **P2**: Add asset integration into export flow
5. **P3**: Add comparison view (original prompt vs. generated)

---

## Testing Checklist

- [ ] Asset planning form saves state correctly
- [ ] Prompt builder auto-composes valid prompts
- [ ] Model selector updates cost estimates
- [ ] Real image generation works via API
- [ ] Quality review scoring calculates correctly
- [ ] Approved assets persist to library
- [ ] Assets integrate into export

---

*Document generated by Website Agent*

