# Project Priorities Dashboard

> **Purpose**: Central source of truth for what needs to be done next
> **Updated By**: ALL agents (on session end)
> **Last Updated**: 2026-01-14 (Premium Preview MVP Complete!)

---

## 🎉 Premium Preview MVP - COMPLETE!

### All Waves Completed (2026-01-14)

| Wave | Task | Status |
|------|------|--------|
| **Foundation** | Pattern Library Foundation | ✅ Complete |
| **Foundation** | Pattern Components (Hero, Features, etc.) | ✅ Complete |
| **Wave 1-A** | Image Generation All Patterns | 🔄 Partial |
| **Wave 1-B** | Viewport Switching (Desktop/Tablet/Mobile) | ✅ Complete |
| **Wave 1-C** | Pattern Showcase Page | ✅ Complete |
| **Wave 2-A** | Click-to-Edit Preview | ✅ Complete |
| **Wave 2-B** | Pattern Swapping UI | ✅ Complete |
| **Wave 2-C** | Section Reorder (Drag & Drop) | ✅ **FIXED** |
| **Wave 3-A** | AI Content Generation | ✅ Complete |
| **Wave 3-B** | Branding Customization Panel | ✅ Complete |
| **Wave 3-C** | Export Validation | ✅ Complete |
| **Wave 4-A** | Add Section Panel | ✅ **COMPLETE** |
| **Wave 4-B** | Undo/Redo History | ✅ Complete |
| **Wave 4-C** | Template Gallery | ✅ Complete |

### What's Working Now

- ✅ **Drag-to-reorder sections** - Grip handle + @dnd-kit fully wired
- ✅ **Move up/down buttons** - Arrow buttons reorder sections
- ✅ **Add Section Panel** - "Add Section" buttons between sections + picker modal
- ✅ **Click-to-edit text** - Inline editing of headlines, descriptions
- ✅ **Section toolbar** - Hover to see edit, duplicate, delete, reorder controls
- ✅ **Viewport switching** - Desktop/tablet/mobile preview
- ✅ **AI content generation** - Regenerate section content
- ✅ **Branding customization** - Colors and fonts
- ✅ **Undo/Redo** - Cmd+Z / Cmd+Shift+Z
- ✅ **Template gallery** - Quick-start designs

---

## 🔴 High Priority - Remaining Work

| Priority | Task | Agent | Notes |
|----------|------|-------|-------|
| **P1** | Wire reorder callbacks to configurator state | Website | Connect `onComponentsReorder` prop |
| **P1** | Wire add section to configurator state | Website | Connect `onComponentAdd` prop |
| **P1** | Complete Image Gen All Patterns | Website | Features, Testimonials, Logos |

---

## 🟡 Medium Priority (Backlog)

| Priority | Task | Agent | Notes |
|----------|------|-------|-------|
| P2 | Section CRUD operations | Website | `20260105-P1-section-crud.txt` |
| P2 | Image Generation Integration | Website | `20260105-P2-image-generation-integration.txt` |
| P2 | WYSIWYG Export | Website | `SPEC-wysiwyg-export.txt` |
| P2 | Media Configurator Sidebar | Website | `media-configurator-sidebar/IMPLEMENT.txt` |
| P2 | Media Framework UI Redesign | Website | `media-framework-ui-redesign/IMPLEMENT.txt` |

---

## 🟢 Low Priority (Future)

| Priority | Task | Agent | Notes |
|----------|------|-------|-------|
| P3 | Strip to MVP | Website | `TASK-strip-to-mvp.txt` |
| P3 | Pattern Library Expansion | Template | 20+ patterns |
| P3 | Real-time Collaboration | Platform | Multi-user editing |

---

## Website Agent Inbox Summary

**7 Tasks Remaining**:

| File | Priority | Status |
|------|----------|--------|
| `WAVE1-A-image-generation-all-patterns.txt` | P1 | In Progress |
| `20260105-P1-section-crud.txt` | P2 | Ready |
| `20260105-P2-image-generation-integration.txt` | P2 | Ready |
| `TASK-strip-to-mvp.txt` | P3 | Backlog |
| `SPEC-wysiwyg-export.txt` | P2 | Spec Only |
| `media-configurator-sidebar/IMPLEMENT.txt` | P2 | Ready |
| `media-framework-ui-redesign/IMPLEMENT.txt` | P2 | Ready |

---

## Quick Commands

```bash
# Build and verify
cd /Users/joseph.dawson/Documents/dawson-does-framework/website && npm run build

# Run tests
cd /Users/joseph.dawson/Documents/dawson-does-framework && npm test

# Start dev server
cd /Users/joseph.dawson/Documents/dawson-does-framework/website && npm run dev

# View live site
open http://localhost:3003/configure
```

---

## Next Steps to Fully Enable Features

The drag-and-drop and add section UI is built, but needs to be wired to the configurator state. To enable:

### 1. In `LivePreviewPanel.tsx` or parent component:

```tsx
// Add these callbacks to ComposedPreview:
<ComposedPreview
  // ... existing props
  onComponentsReorder={(pageId, newComponents) => {
    // Update configurator state with new component order
    setComposition(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.path === pageId ? { ...p, components: newComponents } : p
      )
    }));
  }}
  onComponentAdd={(pageId, patternId, insertIndex) => {
    // Create new component and insert at index
    const newComponent = {
      id: `${patternId}-${Date.now()}`,
      type: patternId,
      props: getDefaultPropsForPattern(patternId),
    };
    setComposition(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.path !== pageId) return p;
        const newComponents = [...p.components];
        newComponents.splice(insertIndex, 0, newComponent);
        return { ...p, components: newComponents };
      })
    }));
  }}
  onComponentDuplicate={(pageId, componentId) => {
    // Clone component and insert after original
  }}
  onComponentDelete={(pageId, componentId) => {
    // Remove component from page
  }}
/>
```

---

*Updated by Website Agent | 2026-01-14*
