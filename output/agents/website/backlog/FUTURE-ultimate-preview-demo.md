# Future Task: Ultimate Visual Simulator Demo

**Status**: BACKLOG - To be implemented after core composition system is complete
**Priority**: P3
**Depends On**: Pattern Expansion, Inspiration Mapping, Section CRUD, Image Integration

---

## Overview

Build the best visual simulator demo outputs for each user's inputs with:

### 1. Live Editing Mode
- Click any text to edit inline
- Click any image to replace/regenerate
- Drag sections to reorder
- "Regenerate this section" button per section

### 2. Style Playground
- Real-time color scheme changes
- Font family A/B testing
- Spacing adjustments with sliders
- Dark/light mode toggle with preview

### 3. Comparison Tools
- Split view: inspiration vs generated
- Overlay mode with opacity slider
- "Match score" percentage showing how close to inspiration

### 4. Multi-Device Preview
- Desktop/Tablet/Mobile device frames
- Rotate tablet/mobile
- Touch interaction simulation

### 5. Interactive Components
- Working dropdowns and menus
- Modals that open
- Hover states visible
- Form inputs functional

### 6. Animation Preview
- Page load animations
- Scroll-triggered animations
- Interaction micro-animations
- Animation speed controls

### 7. Export Previews
- "Export Preview" shows file structure
- Component breakdown view
- Code snippets per section
- Dependency list

---

## Technical Components Needed

```
website/app/components/preview/
├── LiveEditor/
│   ├── InlineTextEditor.tsx
│   ├── ImageReplacer.tsx
│   └── SectionDragHandle.tsx
├── StylePlayground/
│   ├── ColorPicker.tsx
│   ├── FontSelector.tsx
│   └── SpacingSlider.tsx
├── ComparisonView/
│   ├── SplitView.tsx
│   ├── OverlaySlider.tsx
│   └── MatchScore.tsx
├── DeviceFrame/
│   ├── DesktopFrame.tsx
│   ├── TabletFrame.tsx
│   └── MobileFrame.tsx
└── AnimationPreview/
    ├── AnimationControls.tsx
    └── TimelineView.tsx
```

---

## Reminder

Come back to this after completing:
- [ ] Composer Mode Toggle
- [ ] Pattern Expansion (42 patterns)
- [ ] AI Config Suggester
- [ ] Inspiration → Layout Mapping
- [ ] Section CRUD & Live Editing
- [ ] Image Generation Integration

---

*Created: 2026-01-05*
*Agent: Website Agent*

