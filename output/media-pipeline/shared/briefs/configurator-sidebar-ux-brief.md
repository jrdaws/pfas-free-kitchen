# Asset Brief: Configurator Sidebar UX Redesign

> Created: 2025-12-23 | Research Agent
> Priority: P0 - CRITICAL UX IMPROVEMENT
> Status: Ready for Media Agent + Website Agent
> Type: Major UX Architecture Change
> **Implementation SOP**: `docs/sops/SHADCN_IMPLEMENTATION_SOP.md`

---

## ⚠️ IMPLEMENTATION REQUIREMENT: shadcn/ui Components

**All sidebar components MUST use shadcn/ui. See `docs/sops/SHADCN_IMPLEMENTATION_SOP.md`**

| Feature | shadcn Component | Install |
|---------|------------------|---------|
| Sidebar scroll | `<ScrollArea>` | `npx shadcn@latest add scroll-area` |
| Collapsible phases | `<Collapsible>` | `npx shadcn@latest add collapsible` |
| Step buttons | `<Button>` | Already installed |
| Mobile drawer | `<Sheet>` | `npx shadcn@latest add sheet` |
| Progress bar | `<Progress>` | `npx shadcn@latest add progress` |
| Status badges | `<Badge>` | `npx shadcn@latest add badge` |
| Integration cards | `<Card>` + `<RadioGroup>` | `npx shadcn@latest add card radio-group` |

**Website Agent Task**: `output/website-agent/inbox/TASK-shadcn-migration-and-sidebar.txt`

---

## Executive Summary

Transform the Project Configurator from a **full-page step wizard** to a **persistent sidebar navigation** with expandable panels. This addresses cognitive overload, improves navigation, and creates a more professional, app-like experience.

---

## Current Problems (From Screenshot Analysis)

### 1. Vertical Scroll Overload
The Integrations step has 7+ categories stacked vertically. Users must scroll extensively, losing context of what they've already selected.

### 2. Full-Page Takeover
Each step replaces the entire page. Users lose:
- Visual context of overall progress
- Ability to quickly review previous choices
- Sense of how much remains

### 3. Sub-Step Confusion
The numbered dots (1, 2, 3) below phase icons create unclear hierarchy:
```
Current (confusing):
    ●────────○────────○
   Setup   Configure  Launch
   (1)(2)(3)           ???
```

### 4. No Persistent Navigation
Users can't easily jump between steps. The only navigation is Previous/Next.

### 5. Terminal Card Fatigue
Every input is wrapped in the same "terminal window" card with red/yellow/green dots. This becomes visually repetitive.

---

## Proposed Solution: Sidebar Navigation Architecture

### Core Concept

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER: Project Configurator                          [Beginner ▾] │
├──────────┬───────────────────────────────────────────────────────────┤
│          │                                                           │
│  SIDEBAR │              MAIN CONTENT AREA                           │
│          │                                                           │
│  ● Setup │   ┌─────────────────────────────────────────────────┐   │
│    └ Template    │  Currently editing: Template Selection      │   │
│    └ Inspiration │                                              │   │
│    └ Project     │  [Content for selected step]                 │   │
│                  │                                              │   │
│  ○ Configure     │                                              │   │
│    └ Integrations│                                              │   │
│    └ Environment │                                              │   │
│                  │                                              │   │
│  ○ Launch        │                                              │   │
│    └ Preview     └─────────────────────────────────────────────────┘   │
│    └ Context     │                                                   │
│    └ Export      │                                                   │
│                  │                                                   │
├──────────┴───────────────────────────────────────────────────────────┤
│  FOOTER: Progress 37%  ████████░░░░░░░░░░░░░░  [Previous] [Next →]  │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Benefits

1. **Persistent Navigation**: Always visible, click any step
2. **Context Preserved**: See where you are in the journey
3. **Reduced Scrolling**: Content area is focused
4. **Professional Feel**: Apps like Linear, Notion, Stripe use this
5. **Mobile Adaptable**: Sidebar becomes drawer on mobile

---

## Expandable Panel System

### The Three-Panel Expansion (Your Idea!)

For complex steps like Integrations or Environment Variables:

```
┌──────────┬──────────────────┬──────────────────┬─────────────────────┐
│          │                  │                  │                     │
│  SIDEBAR │  CATEGORY LIST   │  PROVIDER LIST   │  CONFIGURATION      │
│          │                  │                  │                     │
│  ● Setup │  Auth ●          │  ○ Supabase ✓    │  API Keys           │
│  ○ Config│  Payments        │  ○ Clerk         │  ─────────────────  │
│  ○ Launch│  Email           │                  │  SUPABASE_URL       │
│          │  Database ●      │                  │  [____________]     │
│          │  AI              │                  │                     │
│          │  Analytics       │                  │  SUPABASE_ANON_KEY  │
│          │  Storage         │                  │  [____________]     │
│          │                  │                  │                     │
│          │  ────────────    │                  │  [Test Connection]  │
│          │  4 selected      │                  │                     │
│          │                  │                  │                     │
└──────────┴──────────────────┴──────────────────┴─────────────────────┘
          ↑                   ↑                   ↑
      Always visible     Expands when          Expands when
                        category selected     provider selected
```

### Expansion States

| State | Panels Visible | When |
|-------|----------------|------|
| Collapsed | Sidebar only | Mobile, or user minimizes |
| Standard | Sidebar + Content | Most steps |
| Expanded | Sidebar + 2 panels | Integrations, Environment |
| Full Expanded | Sidebar + 3 panels | API key configuration |

### Animation Flow

```
Step 1: User clicks "Integrations" in sidebar
→ Content area shows category list (Auth, Payments, Email...)

Step 2: User clicks "Auth" category  
→ Second panel slides in from left showing providers (Supabase, Clerk)

Step 3: User selects "Supabase"
→ Third panel slides in showing configuration fields

Step 4: User clicks different category or collapses
→ Panels slide back, maintaining selections
```

---

## Step-by-Step Layouts

### Setup Phase

#### 1. Template Selection
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   Choose Your Template                                    │
│  ● Setup │                                                           │
│    ● Tmpl│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│    ○ Insp│   │  SaaS   │  │  Blog   │  │Directory│  │  Custom │    │
│    ○ Proj│   │ Starter │  │  Site   │  │  SEO    │  │         │    │
│          │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│  ○ Config│                                                           │
│  ○ Launch│   [Template preview/details below when selected]          │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

#### 2. Inspiration
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   Add Inspiration (Optional)                              │
│  ● Setup │                                                           │
│    ✓ Tmpl│   ┌─────────────────────────────────────────────────────┐│
│    ● Insp│   │ Describe what you want to build...                  ││
│    ○ Proj│   │                                                      ││
│          │   └─────────────────────────────────────────────────────┘│
│  ○ Config│                                                           │
│  ○ Launch│   ┌──────────────┐  ┌──────────────┐                     │
│          │   │ + Add Image  │  │ + Paste URL  │                     │
│          │   └──────────────┘  └──────────────┘                     │
│          │                                                           │
│          │   Added: [image1.png] [dribbble.com/...]                 │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

#### 3. Project Details
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   Project Details                                         │
│  ● Setup │                                                           │
│    ✓ Tmpl│   Project Name                                           │
│    ✓ Insp│   [my-awesome-app_____________]                          │
│    ● Proj│                                                           │
│          │   Output Directory                                        │
│  ○ Config│   [./my-awesome-app____________]                          │
│  ○ Launch│                                                           │
│          │   Preview: ./my-awesome-app/my-awesome-app                │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### Configure Phase (Three-Panel Expansion)

#### 4. Integrations (The Star Feature)
```
┌──────────┬─────────────┬─────────────┬───────────────────────────────┐
│  SIDEBAR │  CATEGORIES │  PROVIDERS  │  QUICK CONFIG                 │
│          │             │             │                               │
│  ✓ Setup │  Auth *     │ ● Supabase  │  ✓ Email/Password            │
│          │  ─────────  │   ✓ Selected│  ✓ OAuth (Google, GitHub)    │
│  ● Config│  Payments   │             │  ○ Magic Links               │
│    ● Intg│  Email      │ ○ Clerk     │                               │
│    ○ Env │  Database * │             │  [Configure in Environment]  │
│          │  AI         │             │                               │
│  ○ Launch│  Analytics  │             │                               │
│          │  Storage    │             │                               │
│          │             │             │                               │
│          │  ───────    │             │                               │
│          │  4/7 done   │             │                               │
└──────────┴─────────────┴─────────────┴───────────────────────────────┘
```

**Key Improvements:**
- Categories on left, providers in middle, quick config on right
- Visual indication of required (*) and completed (✓)
- Never need to scroll through 7 categories vertically
- Click category → see providers → see options

#### 5. Environment Variables
```
┌──────────┬─────────────┬─────────────┬───────────────────────────────┐
│  SIDEBAR │  SERVICES   │  VARIABLES  │  VALUE ENTRY                  │
│          │             │             │                               │
│  ✓ Setup │  Supabase   │ URL         │  ┌─────────────────────────┐ │
│          │   4 vars    │ ANON_KEY    │  │ https://xxx.supabase.co │ │
│  ● Config│  ─────────  │ ────────    │  └─────────────────────────┘ │
│    ✓ Intg│  Stripe     │ SECRET_KEY* │                               │
│    ● Env │   3 vars    │ PUBLISH_KEY │  * = Required                 │
│          │  ─────────  │ WEBHOOK     │                               │
│  ○ Launch│  Resend     │             │  [Copy from Supabase ↗]       │
│          │   1 var     │             │                               │
│          │  ─────────  │             │  ──────────────────────────   │
│          │  OpenAI     │             │  💡 Tip: You can skip this    │
│          │   1 var     │             │  and add values to .env.local │
│          │             │             │  after export.                │
└──────────┴─────────────┴─────────────┴───────────────────────────────┘
```

**Key Improvements:**
- Group variables by service
- Show count of variables per service
- Direct links to service dashboards
- Clear required vs optional indication
- Tip about skipping and adding later

### Launch Phase

#### 6. Preview (Full Width)
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   AI Preview                    [5 generations remaining] │
│  ✓ Setup │   ─────────────────────────────────────────────────────   │
│          │   ┌─────────────────────────────────────────────────────┐│
│  ✓ Config│   │                                                     ││
│          │   │        [Live Preview iFrame]                        ││
│  ● Launch│   │                                                     ││
│    ● Prev│   │                                                     ││
│    ○ Ctxt│   └─────────────────────────────────────────────────────┘│
│    ○ Expo│                                                           │
│          │   [💻 Desktop] [📱 Tablet] [📱 Mobile]                    │
│          │                                                           │
│          │   [✏️ Edit Mode]  [↗ Open Tab]  [🔄 Regenerate]          │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

#### 7. Context (Optional Step - Collapsible Sections)
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   Project Context (Optional)                              │
│  ✓ Setup │   ─────────────────────────────────────────────────────   │
│          │                                                           │
│  ✓ Config│   ▼ Vision Statement                                     │
│          │     [What is the long-term vision?_______________]        │
│  ● Launch│                                                           │
│    ✓ Prev│   ▶ Mission Statement (collapsed)                        │
│    ● Ctxt│                                                           │
│    ○ Expo│   ▶ Success Criteria (collapsed)                         │
│          │                                                           │
│          │   ℹ️ These will be saved to .dd/ for AI assistants        │
│          │                                                           │
│          │   [Skip - I'll add these later]                          │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

**Key Improvement:** Collapsible sections reduce intimidation. Users can focus on one at a time or skip entirely.

#### 8. Export (Summary + Actions)
```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │                                                           │
│          │   🎉 Ready to Export!                                     │
│  ✓ Setup │   ─────────────────────────────────────────────────────   │
│          │                                                           │
│  ✓ Config│   Configuration Summary                                  │
│          │   ├─ Template: SaaS Starter                              │
│  ✓ Launch│   ├─ Project: my-awesome-app                             │
│    ✓ Prev│   ├─ Integrations: 7 selected                            │
│    ✓ Ctxt│   └─ Output: ./my-awesome-app                            │
│    ● Expo│                                                           │
│          │   Choose Export Method:                                   │
│          │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│          │   │   CLI    │ │   ZIP    │ │  Cloud   │ │  Wizard  │   │
│          │   │ Fastest  │ │ Complete │ │  Sync    │ │  Guided  │   │
│          │   └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│          │                                                           │
│          │   [🚀 Export Project]                                    │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## Mobile Adaptation

### Drawer Navigation

On screens < 768px, the sidebar becomes a slide-out drawer:

```
┌─────────────────────────────────────┐
│  ☰  Project Configurator   [Next →]│
├─────────────────────────────────────┤
│                                     │
│  Setup > Template                   │
│  ───────────────────────────────    │
│                                     │
│  Choose Your Template               │
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │   SaaS    │  │   Blog    │      │
│  │  Starter  │  │   Site    │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │ Directory │  │  Custom   │      │
│  │    SEO    │  │           │      │
│  └───────────┘  └───────────┘      │
│                                     │
├─────────────────────────────────────┤
│  ████████░░░░░░░░  37%   [Next →]  │
└─────────────────────────────────────┘

When ☰ tapped:
┌─────────────────────────────────────┐
│  ← Back                             │
├─────────────────────────────────────┤
│                                     │
│  ● Setup                            │
│    ● Template ← You are here        │
│    ○ Inspiration                    │
│    ○ Project                        │
│                                     │
│  ○ Configure                        │
│    ○ Integrations                   │
│    ○ Environment                    │
│                                     │
│  ○ Launch                           │
│    ○ Preview                        │
│    ○ Context                        │
│    ○ Export                         │
│                                     │
│  ──────────────────────────────     │
│  Progress: 37%                      │
│                                     │
└─────────────────────────────────────┘
```

### Three-Panel on Mobile → Stacked

On mobile, the three-panel Integrations view becomes stacked with back navigation:

```
Level 1: Categories       Level 2: Providers      Level 3: Config
┌───────────────────┐    ┌───────────────────┐   ┌───────────────────┐
│ ← Integrations    │    │ ← Auth            │   │ ← Supabase        │
├───────────────────┤    ├───────────────────┤   ├───────────────────┤
│                   │    │                   │   │                   │
│ Auth * →          │ →  │ ● Supabase ✓  →   │ → │ ✓ Email/Password  │
│ Payments →        │    │ ○ Clerk       →   │   │ ✓ OAuth           │
│ Email →           │    │                   │   │ ○ Magic Links     │
│ Database * →      │    │                   │   │                   │
│ AI →              │    │                   │   │ [Done]            │
│ Analytics →       │    │                   │   │                   │
│ Storage →         │    │                   │   │                   │
│                   │    │                   │   │                   │
│ ──────────────    │    │                   │   │                   │
│ 4/7 configured    │    │                   │   │                   │
└───────────────────┘    └───────────────────┘   └───────────────────┘
```

---

## Required Assets (15 Total)

### Category 1: Sidebar Navigation Icons (8 assets)

| Asset | Dimensions | Format | Priority |
|-------|-----------|--------|----------|
| nav-template | 20x20 | SVG | P1 |
| nav-inspiration | 20x20 | SVG | P1 |
| nav-project | 20x20 | SVG | P1 |
| nav-integrations | 20x20 | SVG | P1 |
| nav-environment | 20x20 | SVG | P1 |
| nav-preview | 20x20 | SVG | P1 |
| nav-context | 20x20 | SVG | P1 |
| nav-export | 20x20 | SVG | P1 |

### Category 2: Status Indicators (4 assets)

| Asset | Dimensions | Format | Priority |
|-------|-----------|--------|----------|
| status-completed | 16x16 | SVG | P1 |
| status-current | 16x16 | SVG | P1 |
| status-pending | 16x16 | SVG | P1 |
| status-required | 16x16 | SVG | P1 |

### Category 3: Panel UI Elements (3 assets)

| Asset | Dimensions | Format | Priority |
|-------|-----------|--------|----------|
| panel-expand-arrow | 16x16 | SVG | P1 |
| panel-collapse-arrow | 16x16 | SVG | P1 |
| panel-divider | 1x100 | SVG | P2 |

---

## Icon Specifications

### Sidebar Navigation Icons

**Style:**
```
All navigation icons should:
- 20x20 viewBox
- 1.5px stroke weight (thinner than feature icons)
- Indigo #6366F1 when active/current
- Gray #71717A when pending
- Emerald #10B981 checkmark overlay when completed
- Rounded corners, friendly aesthetic
- Match Lucide icon style
```

**Icon Concepts:**

| Icon | Concept | Lucide Reference |
|------|---------|------------------|
| nav-template | Grid/layers | `layout-grid` |
| nav-inspiration | Lightbulb/sparkle | `sparkles` |
| nav-project | Folder/file | `folder` |
| nav-integrations | Puzzle/plug | `puzzle` |
| nav-environment | Key/lock | `key` |
| nav-preview | Eye/monitor | `eye` |
| nav-context | Target/goal | `target` |
| nav-export | Download/rocket | `rocket` |

---

## Color Application

### Sidebar States

```css
/* Active step */
.nav-item--active {
  background: rgba(99, 102, 241, 0.1);  /* Indigo 10% */
  border-left: 2px solid #6366F1;       /* Indigo */
  color: #6366F1;
}

/* Completed step */
.nav-item--completed {
  color: #10B981;  /* Emerald */
}
.nav-item--completed::after {
  content: "✓";
  color: #10B981;
}

/* Pending step */
.nav-item--pending {
  color: #71717A;  /* Gray */
  opacity: 0.7;
}

/* Current phase highlight */
.phase--current {
  background: rgba(99, 102, 241, 0.05);
}
```

### Three-Panel Transitions

```css
/* Panel slide animation */
.panel {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}

.panel--visible {
  transform: translateX(0);
}

/* Stagger effect for multi-panel */
.panel:nth-child(2) { transition-delay: 50ms; }
.panel:nth-child(3) { transition-delay: 100ms; }
```

---

## Implementation Notes for Website Agent

### Phase 1: Sidebar Foundation
1. Create `<ConfiguratorSidebar>` component
2. Add persistent left sidebar with step list
3. Implement active/completed/pending states
4. Add collapsible phase grouping

### Phase 2: Content Area
1. Refactor step content into `<ConfiguratorContent>`
2. Remove full-page step transitions
3. Content updates in place when step changes
4. Add breadcrumb: "Setup > Template"

### Phase 3: Three-Panel System
1. Create `<PanelStack>` component for Integrations/Environment
2. Implement slide-in animations
3. Handle panel state (which panels visible)
4. Add mobile stacked navigation fallback

### Phase 4: Polish
1. Add keyboard navigation (Tab, arrows)
2. Implement mobile drawer for sidebar
3. Add smooth panel transitions
4. Save/restore step progress

---

## Comparison: Before vs After

| Aspect | Current | Proposed |
|--------|---------|----------|
| Navigation | Next/Previous only | Click any step |
| Context | Lost between steps | Always visible in sidebar |
| Integrations | 7 categories vertical scroll | 3-panel expansion |
| Mobile | Crowded horizontal stepper | Slide-out drawer |
| Progress | Dots + percentage | Sidebar checkmarks + bar |
| Visual style | Terminal cards everywhere | Clean panels with subtle borders |

---

## Success Metrics

After implementation, measure:

1. **Completion rate**: Should increase (less abandonment)
2. **Time to complete**: Should decrease (less scrolling/confusion)
3. **Error rate**: Should decrease (clearer required fields)
4. **User satisfaction**: Survey "How easy was setup?" (1-5)

---

*Brief created by Research Agent | Ready for Media Agent + Website Agent*

