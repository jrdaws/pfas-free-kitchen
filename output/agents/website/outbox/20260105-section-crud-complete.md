# Section CRUD & Real-time Preview Editing - Complete

**Status**: ✅ COMPLETE
**Agent**: Website Agent
**Date**: 2026-01-05
**Build**: Passing

---

## Summary

Implemented a complete Section CRUD system for real-time preview editing with:
- Zustand store with undo/redo (20-step history)
- Drag & drop section reordering
- Add/remove/duplicate sections
- Inline text editing
- Property editor sidebar
- Pattern picker modal

---

## Files Created

### 1. Composition Store
`website/lib/stores/composition-store.ts`

**Usage:**
```typescript
import { useCompositionStore, useSelectedSection, useCurrentPage } from '@/lib/stores/composition-store';

// In component
const { 
  composition, 
  setComposition,
  addSection, 
  removeSection, 
  moveSection,
  duplicateSection,
  updateSectionProps,
  undo,
  redo,
  canUndo,
  canRedo,
} = useCompositionStore();

// Selectors
const section = useSelectedSection();
const page = useCurrentPage();
```

**API:**
| Method | Description |
|--------|-------------|
| `setComposition(comp)` | Set composition (adds to history) |
| `selectSection(pageId, index)` | Select a section for editing |
| `addSection(pageId, section, atIndex?)` | Add new section |
| `removeSection(pageId, index)` | Remove section (if not last) |
| `moveSection(pageId, from, to)` | Move section position |
| `duplicateSection(pageId, index)` | Duplicate section |
| `updateSectionProps(pageId, index, props)` | Update section props |
| `updateSectionVariant(pageId, index, variant)` | Change variant |
| `replaceSection(pageId, index, section)` | Replace entire section |
| `undo()` / `redo()` | Navigate history |
| `canUndo()` / `canRedo()` | Check if available |
| `markSaved()` | Mark composition as saved |
| `reset()` | Clear all state |

---

### 2. API Endpoints

**POST `/api/compose/section`**
Generate a new section with AI-generated props.

Request:
```json
{
  "patternId": "hero-centered",
  "atIndex": 0,
  "variant": "dark",
  "context": {
    "vision": { "projectName": "...", "description": "..." },
    "template": "saas"
  }
}
```

Response:
```json
{
  "success": true,
  "section": { "patternId": "...", "variant": "...", "order": 1, "props": {...} }
}
```

**POST `/api/compose/section/[id]`**
Regenerate section with optional feedback.

**PATCH `/api/compose/section/[id]`**
Update section props.

---

### 3. UI Components

#### SectionToolbar
`website/app/components/preview/SectionToolbar.tsx`

Appears on hover with actions:
- Move up/down
- Duplicate
- Edit (opens PropEditor)
- Regenerate
- Delete

```tsx
<SectionToolbar
  pageId="home"
  sectionIndex={0}
  totalSections={5}
  onMoveUp={() => {}}
  onMoveDown={() => {}}
  onDuplicate={() => {}}
  onDelete={() => {}}
  onEdit={() => {}}
  onRegenerate={() => {}}
  isRegenerating={false}
/>
```

#### PatternPicker
`website/app/components/preview/PatternPicker.tsx`

Modal to browse and add patterns.

```tsx
<PatternPicker
  isOpen={true}
  onClose={() => {}}
  onSelect={(patternId) => console.log(patternId)}
  insertAtIndex={2}
/>
```

Features:
- Category sidebar
- Search by name/tags
- Shows variant count
- Shows required fields

#### InlineEditor
`website/app/components/preview/InlineEditor.tsx`

Double-click to edit text inline.

```tsx
<InlineEditor
  value="Hello World"
  onChange={(v) => console.log(v)}
  tag="h1"
  editable={true}
/>

// Specialized versions
<HeadlineEditor value="..." onChange={...} level={1} />
<ParagraphEditor value="..." onChange={...} />
```

#### PropEditor
`website/app/components/preview/PropEditor.tsx`

Sidebar for editing all section props.

```tsx
<PropEditor
  isOpen={true}
  onClose={() => {}}
/>
```

Features:
- Shows pattern info
- Variant selector
- Slot editors by type (text, richText, boolean, number, image, array)
- Undo/redo buttons
- Regenerate button

#### EditablePreview
`website/app/components/preview/EditablePreview.tsx`

Main component with drag & drop.

```tsx
<EditablePreview
  renderSection={(section, index) => (
    <YourSectionRenderer section={section} />
  )}
/>
```

Features:
- Drag & drop reordering (dnd-kit)
- Section selection
- Add section buttons between sections
- PatternPicker integration
- PropEditor integration

---

## Dependencies Added

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

## Integration with LivePreviewPanel

To integrate with the existing preview panel:

```tsx
// In LivePreviewPanel.tsx
import { EditablePreview } from '@/app/components/preview';
import { useCompositionStore } from '@/lib/stores/composition-store';

function LivePreviewPanel() {
  const { composition, setComposition } = useCompositionStore();
  
  // When composition is received from API, set it in store
  useEffect(() => {
    if (apiComposition) {
      setComposition(apiComposition);
    }
  }, [apiComposition]);
  
  return (
    <EditablePreview
      renderSection={(section, index) => (
        <PreviewSection section={section} />
      )}
    />
  );
}
```

---

## Testing Checklist

- [x] Build passes
- [ ] Add section via PatternPicker
- [ ] Remove section (not last)
- [ ] Drag & drop reorder
- [ ] Duplicate section
- [ ] Inline text editing
- [ ] PropEditor opens on edit
- [ ] Undo/redo works
- [ ] Selection highlights correctly

---

## Next Steps

1. **Integrate with LivePreviewPanel** - Connect the store to the existing preview
2. **Add visual section renderers** - Create components for each pattern type
3. **Implement regeneration** - Wire up the regenerate button to the API
4. **Add keyboard shortcuts** - Ctrl+Z, Ctrl+Y, Delete, etc.

---

## Known Limitations

1. **Array editing is basic** - Can add/remove items but not edit item contents
2. **No image upload** - Image slots accept URLs only
3. **No cross-page section moves** - Can only reorder within a page
4. **No persistent storage** - Composition is in-memory only

---

*Website Agent - 2026-01-05*

