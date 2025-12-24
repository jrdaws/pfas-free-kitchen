# SOP: shadcn/ui Implementation Standards

> **Version**: 1.0 | **Created**: 2025-12-23 | **Status**: Active
> **Owner**: Website Agent
> **Applies To**: All website UI development

---

## Purpose

Standardize the use of shadcn/ui components across the dawson-does-framework website to ensure consistency, accessibility, maintainability, and alignment with our brand identity.

---

## Current State Analysis

### What We Have

| Component | Status | Location |
|-----------|--------|----------|
| Button | ✅ Installed | `components/ui/button.tsx` |
| Input | ✅ Installed | `components/ui/input.tsx` |
| Label | ✅ Installed | `components/ui/label.tsx` |

### What We Need

| Component | Priority | Use Case |
|-----------|----------|----------|
| **Card** | P0 | Replace `terminal-window` pattern |
| **RadioGroup** | P0 | Integration selector, template selector |
| **Tabs** | P0 | Mode toggle, preview tabs |
| **Alert** | P1 | Error/warning messages |
| **Badge** | P1 | Status indicators, completion badges |
| **Tooltip** | P1 | Icon hints, help text |
| **Progress** | P1 | Step progress, generation progress |
| **Accordion** | P1 | Collapsible sections |
| **Select** | P1 | Dropdown selections |
| **Textarea** | P2 | Description fields |
| **Switch** | P2 | Boolean toggles |
| **Dialog** | P2 | Modal confirmations |
| **Sheet** | P2 | Sliding panels (sidebar redesign) |
| **Separator** | P2 | Visual dividers |
| **ScrollArea** | P2 | Scrollable content areas |
| **Skeleton** | P3 | Loading states |
| **Avatar** | P3 | User avatars |

---

## Configuration

### Current `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

### Brand Color Mapping

Map our brand colors to shadcn CSS variables in `globals.css`:

```css
:root {
  /* shadcn expects these variables */
  --primary: 239 84% 67%;           /* #6366F1 Indigo */
  --primary-foreground: 0 0% 100%;  /* White */
  
  --secondary: 263 90% 66%;         /* #8B5CF6 Violet */
  --secondary-foreground: 0 0% 100%;
  
  --accent: 160 84% 39%;            /* #10B981 Emerald */
  --accent-foreground: 0 0% 100%;
  
  --destructive: 0 84% 60%;         /* #EF4444 Red */
  --destructive-foreground: 0 0% 100%;
  
  --muted: 240 4% 46%;              /* #71717A Gray */
  --muted-foreground: 240 5% 65%;
  
  --background: 0 0% 4%;            /* #0A0A0A Near Black */
  --foreground: 0 0% 93%;           /* #EDEDED Light */
  
  --card: 0 0% 7%;                  /* Slightly lighter than bg */
  --card-foreground: 0 0% 93%;
  
  --border: 0 0% 20%;               /* #333333 */
  --input: 0 0% 20%;
  --ring: 239 84% 67%;              /* Indigo focus ring */
}
```

---

## Installation Commands

### Install All Priority P0 Components

```bash
cd website

# Core layout
npx shadcn@latest add card

# Form controls
npx shadcn@latest add radio-group
npx shadcn@latest add tabs

# Already installed: button, input, label
```

### Install P1 Components

```bash
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add tooltip
npx shadcn@latest add progress
npx shadcn@latest add accordion
npx shadcn@latest add select
```

### Install P2 Components (as needed)

```bash
npx shadcn@latest add textarea
npx shadcn@latest add switch
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
```

---

## Component Usage Standards

### 1. Card Component

**Replace**: Custom `terminal-window` class pattern

**Before** (Custom):
```tsx
<div className="terminal-window">
  <div className="terminal-header">
    <div className="terminal-dot bg-red-500"></div>
    <div className="terminal-dot bg-yellow-500"></div>
    <div className="terminal-dot bg-green-500"></div>
    <span className="text-xs ml-2">Title</span>
  </div>
  <div className="terminal-content">
    {/* content */}
  </div>
</div>
```

**After** (shadcn):
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

**When to Keep Terminal Style**:
- Code blocks/CLI output (actual terminal content)
- Command displays

---

### 2. RadioGroup for Selection

**Replace**: Custom button-based selection with onClick handlers

**Before** (Custom):
```tsx
<div className="grid grid-cols-2 gap-4">
  {options.map((opt) => (
    <button
      key={opt.id}
      onClick={() => onSelect(opt.id)}
      className={`p-4 rounded-lg border ${
        selected === opt.id 
          ? "border-indigo-500 bg-indigo-500/10" 
          : "border-gray-700"
      }`}
    >
      {opt.label}
    </button>
  ))}
</div>
```

**After** (shadcn):
```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup value={selected} onValueChange={onSelect}>
  {options.map((opt) => (
    <div key={opt.id} className="flex items-center space-x-2">
      <RadioGroupItem value={opt.id} id={opt.id} />
      <Label htmlFor={opt.id}>{opt.label}</Label>
    </div>
  ))}
</RadioGroup>
```

**Card-Style Radio** (for integration selector):
```tsx
<RadioGroup value={selected} onValueChange={onSelect} className="grid gap-4">
  {options.map((opt) => (
    <Label
      key={opt.id}
      htmlFor={opt.id}
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4 cursor-pointer",
        "hover:bg-accent/10",
        selected === opt.id && "border-primary bg-primary/10"
      )}
    >
      <RadioGroupItem value={opt.id} id={opt.id} />
      <div>
        <p className="font-medium">{opt.label}</p>
        <p className="text-sm text-muted-foreground">{opt.description}</p>
      </div>
    </Label>
  ))}
</RadioGroup>
```

---

### 3. Tabs Component

**Replace**: Custom tab buttons with state management

**Before** (Custom):
```tsx
const [activeTab, setActiveTab] = useState("preview");

<div className="flex gap-2">
  <button
    className={activeTab === "preview" ? "bg-indigo-500" : "bg-gray-700"}
    onClick={() => setActiveTab("preview")}
  >
    Preview
  </button>
  <button
    className={activeTab === "generate" ? "bg-indigo-500" : "bg-gray-700"}
    onClick={() => setActiveTab("generate")}
  >
    Generate
  </button>
</div>

{activeTab === "preview" && <PreviewPanel />}
{activeTab === "generate" && <GeneratePanel />}
```

**After** (shadcn):
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="generate">Generate</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">
    <PreviewPanel />
  </TabsContent>
  <TabsContent value="generate">
    <GeneratePanel />
  </TabsContent>
</Tabs>
```

---

### 4. Alert Component

**Replace**: Custom warning/error divs

**Before** (Custom):
```tsx
<div className="flex items-start gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
  <AlertCircle className="h-5 w-5" />
  <div>
    <p className="font-bold">Error</p>
    <p>Something went wrong</p>
  </div>
</div>
```

**After** (shadcn):
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

---

### 5. Badge Component

**Replace**: Custom status pills

**Before** (Custom):
```tsx
<span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
  Completed
</span>
```

**After** (shadcn):
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Completed</Badge>
```

**Add Custom Variants** to `badge.tsx`:
```tsx
const badgeVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        secondary: "...",
        destructive: "...",
        outline: "...",
        // Custom variants for our brand
        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        info: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      },
    },
  }
);
```

---

### 6. Tooltip Component

**Replace**: Title attributes and custom hovers

**Before** (Custom):
```tsx
<button title="Click to regenerate">
  <RefreshCw />
</button>
```

**After** (shadcn):
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button><RefreshCw /></button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Click to regenerate</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 7. Progress Component

**Replace**: Custom progress bars

**Before** (Custom):
```tsx
<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
  <div 
    className="h-full bg-indigo-500 transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

**After** (shadcn):
```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={progress} />
```

---

### 8. Sheet Component (For Sidebar Panels)

**Use For**: The new sidebar-expanding panel pattern

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Sidebar with sheet for mobile
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[300px]">
    <NavigationPanel />
  </SheetContent>
</Sheet>
```

---

## Migration Checklist

### Phase 1: Install & Configure (Day 1)

- [ ] Install P0 components (Card, RadioGroup, Tabs)
- [ ] Update CSS variables in globals.css for brand colors
- [ ] Add custom Badge variants

### Phase 2: Core Component Migration (Day 2-3)

- [ ] Replace `terminal-window` with Card (except for actual CLI output)
- [ ] Replace integration selector buttons with RadioGroup
- [ ] Replace mode toggle with Tabs
- [ ] Replace template selector with RadioGroup + Card layout

### Phase 3: Feedback Components (Day 4)

- [ ] Replace warning/error divs with Alert
- [ ] Replace status pills with Badge
- [ ] Replace title attributes with Tooltip
- [ ] Replace custom progress bars with Progress

### Phase 4: Advanced Components (Week 2)

- [ ] Implement Sheet for sidebar panels
- [ ] Add Accordion for collapsible sections
- [ ] Add Select for dropdowns
- [ ] Add ScrollArea for long lists

---

## Accessibility Standards

### All Components Must Have:

1. **Keyboard Navigation**: Focus states, Enter/Space activation
2. **ARIA Labels**: For screen readers
3. **Focus Visible**: Clear focus indicators
4. **Color Contrast**: WCAG AA minimum (4.5:1)

### shadcn Built-in Accessibility:

| Component | Keyboard | ARIA | Notes |
|-----------|----------|------|-------|
| Button | ✅ | ✅ | Enter/Space to activate |
| RadioGroup | ✅ | ✅ | Arrow keys to navigate |
| Tabs | ✅ | ✅ | Arrow keys, auto-focus |
| Dialog | ✅ | ✅ | Escape to close, focus trap |
| Tooltip | ✅ | ✅ | Shows on focus |

---

## Performance Guidelines

### 1. Only Import What You Use

```tsx
// ✅ Good - named imports
import { Button } from "@/components/ui/button";

// ❌ Bad - full component import
import * as UI from "@/components/ui";
```

### 2. Use `asChild` for Custom Elements

```tsx
// ✅ Renders as anchor, inherits button styles
<Button asChild>
  <Link href="/next">Continue</Link>
</Button>
```

### 3. Memoize Complex Renders

```tsx
const MemoizedCard = memo(({ item }) => (
  <Card>
    <CardContent>{item.content}</CardContent>
  </Card>
));
```

---

## Custom Component Extensions

### When to Extend vs Create New

| Scenario | Action |
|----------|--------|
| Need new variant | Extend existing component |
| Need new size | Extend existing component |
| Completely different behavior | Create new component |
| Composition of multiple shadcn | Create wrapper component |

### Extending Button Example

```tsx
// components/ui/button.tsx - add new variant

const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... existing variants
        
        // Custom brand variants
        brand: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90",
        "brand-outline": "border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500/10",
      },
    },
  }
);
```

---

## File Organization

```
website/
├── components/
│   ├── ui/                    # shadcn components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── custom/                # Our custom components using shadcn
│       ├── IntegrationCard.tsx    # Uses Card + RadioGroup
│       ├── StepProgress.tsx       # Uses Progress + Badge
│       └── SettingsPanel.tsx      # Uses Sheet + Accordion
```

---

## Prohibited Patterns

### ❌ Don't Do These:

1. **Inline className for common patterns**
   ```tsx
   // ❌ Bad
   <div className="p-4 rounded-lg border bg-card">
   
   // ✅ Good
   <Card>
   ```

2. **Custom state management for tabs**
   ```tsx
   // ❌ Bad
   const [tab, setTab] = useState("a");
   
   // ✅ Good
   <Tabs defaultValue="a">
   ```

3. **Title attribute instead of Tooltip**
   ```tsx
   // ❌ Bad
   <button title="Help">
   
   // ✅ Good
   <Tooltip><TooltipTrigger>...
   ```

4. **Custom radio/checkbox styling**
   ```tsx
   // ❌ Bad - custom checkbox CSS
   <input type="checkbox" className="custom-checkbox">
   
   // ✅ Good
   <Checkbox />
   ```

---

## Verification Checklist

Before merging UI changes:

- [ ] New components use shadcn where applicable
- [ ] Custom variants follow brand color palette
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Dark mode works correctly
- [ ] No inline className for patterns that have shadcn equivalents
- [ ] TooltipProvider wraps components using Tooltip

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Our Color Philosophy](../output/media-pipeline/shared/COLOR_PHILOSOPHY.md)

---

*SOP Version 1.0 | Created by Quality Agent | 2025-12-23*
