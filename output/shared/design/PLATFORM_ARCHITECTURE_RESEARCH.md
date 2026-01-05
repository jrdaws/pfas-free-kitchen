# Admin Dashboard & Multi-Page Preview System
## Research & Architecture Document

> **Research Agent** | January 4, 2026  
> **Status**: Complete Research & Recommendations

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part A: Project Management Dashboard](#part-a-project-management-dashboard)
3. [Part B: Visual Page Builder & Navigation](#part-b-visual-page-builder--navigation)
4. [Part C: Interactive Multi-Page Preview](#part-c-interactive-multi-page-preview)
5. [Part D: API Key & Environment Management](#part-d-api-key--environment-management)
6. [Part E: Framework Best Practices](#part-e-framework-best-practices)
7. [Deliverables](#deliverables)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Risk Assessment](#risk-assessment)

---

## Executive Summary

### The Vision

Transform dawson-does-framework from a "configure once, export, done" tool into a **Project Lifecycle Management Platform** where users can:

1. Manage multiple projects from a single dashboard
2. Visually design page hierarchies and navigation flows
3. Preview entire applications with AI-generated pages that link together
4. Manage API keys and sync environment variables locally

### Key Research Findings

| Area | Primary Recommendation |
|------|------------------------|
| **Dashboard** | Modular card-based layout with project cards (Vercel-style) |
| **Page Builder** | Hybrid tree + graph view for page hierarchy |
| **Preview System** | Hybrid generation (visible pages upfront, lazy-load rest) |
| **API Keys** | Never store highly-sensitive keys; offer optional encrypted storage |
| **Sync Workflow** | CLI-based pull/push with dashboard as source of truth |

### MVP Definition

**Minimum Viable Platform (3-month target)**:
- Multi-project dashboard with create/archive/clone
- Simple page tree editor (not full graph)
- Single-page preview with navigation links
- CLI-based env pull (no cloud key storage initially)

---

## Part A: Project Management Dashboard

### A.1 Data Model

```typescript
// Recommended Schema

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
  subscription_tier: 'free' | 'pro' | 'team';
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;  // URL-safe identifier
  description?: string;
  status: 'active' | 'archived' | 'deleted';
  created_at: Date;
  updated_at: Date;
  
  // Configuration snapshot
  config: ProjectConfig;
  
  // Metadata
  last_generated_at?: Date;
  generation_count: number;
  
  // Collaboration (future)
  team_id?: string;
}

interface ProjectConfig {
  // Feature selections
  features: FeatureSelection[];
  
  // Page structure
  pages: PageNode[];
  
  // Integration settings
  integrations: IntegrationConfig[];
  
  // Theme/styling
  theme: ThemeConfig;
}

interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  name?: string;  // "Before auth refactor"
  config_snapshot: ProjectConfig;
  created_at: Date;
  created_by: string;
  
  // Diff from previous
  changes_summary?: string;
}

interface PageNode {
  id: string;
  project_id: string;
  
  // Hierarchy
  parent_id?: string;  // null = root page
  order: number;
  
  // Route info
  path: string;  // "/products/[id]"
  route_type: 'static' | 'dynamic' | 'catch-all' | 'api';
  
  // Layout
  layout_id?: string;  // Shared layout reference
  
  // Content
  title: string;
  description?: string;
  components: ComponentSlot[];
  
  // Generation
  generation_prompt?: string;
  generated_content?: string;
  generated_at?: Date;
  
  // Access control
  auth_required: boolean;
  allowed_roles?: string[];
}

interface ComponentSlot {
  id: string;
  page_id: string;
  slot_type: 'header' | 'hero' | 'content' | 'sidebar' | 'footer' | 'custom';
  order: number;
  
  // Source
  source: 'shared' | 'page-specific' | 'ai-generated';
  shared_component_id?: string;  // Reference to shared component
  
  // AI generation settings
  generation_prompt?: string;
  generation_context?: object;  // Data to include in generation
  
  // Rendered output
  content?: string;
  last_generated_at?: Date;
}

interface GenerationHistory {
  id: string;
  project_id: string;
  page_id?: string;
  
  type: 'full-project' | 'single-page' | 'component';
  prompt_used: string;
  model_used: string;
  tokens_used: number;
  
  // Rollback capability
  config_before: ProjectConfig;
  config_after: ProjectConfig;
  
  created_at: Date;
  created_by: string;
}
```

### A.2 UX Patterns from Research

**Patterns to Adopt** (from Vercel, Webflow, Framer, Linear):

| Pattern | Source | Implementation |
|---------|--------|----------------|
| **Project Cards Grid** | Vercel | Card with preview thumbnail, last updated, status badge |
| **Quick Actions Menu** | Webflow | ⋯ menu with Clone, Archive, Settings, Delete |
| **Search + Filter** | Linear | Command palette (⌘K) for project search |
| **Status Indicators** | All | Visual badges: Active, Generating, Error, Archived |
| **Empty State CTA** | Framer | "Create your first project" with template gallery |
| **Keyboard Navigation** | Linear | Arrow keys to navigate, Enter to open |

**Patterns to Avoid**:

| Anti-Pattern | Why |
|--------------|-----|
| Nested folder hierarchy | Adds complexity without value for most users |
| Project tags/categories | Over-engineering for MVP; use search instead |
| Custom project colors | Nice-to-have, not essential |
| Real-time presence indicators | Complex; save for team tier |

### A.3 Collaboration Recommendations

**Minimum Viable Collaboration (MVP - Solo users)**:
- Version history with named checkpoints
- "Duplicate" to fork a project

**Phase 2 Collaboration (Pro tier)**:
- Share project with view-only link
- Export/import project configs

**Phase 3 Collaboration (Team tier)**:
- Multiple editors (last-write-wins, no CRDT)
- Comment threads on pages
- Change history with author attribution
- Activity feed

**Recommendation**: Skip real-time collaboration initially. It adds significant complexity (conflict resolution, presence, WebSockets) for a feature most users won't need. Focus on async collaboration patterns first.

---

## Part B: Visual Page Builder & Navigation

### B.1 Page Graph Visualization

**Recommended Approach: Hybrid Tree + Graph**

| View | Use Case | Implementation |
|------|----------|----------------|
| **Tree View** (Default) | Managing page hierarchy | Collapsible sidebar like VS Code/Notion |
| **Graph View** (Toggle) | Visualizing navigation flows | Node editor for advanced users |

```
Tree View Example:
├── / (Home)
│   ├── /products
│   │   ├── /products/[id] (Dynamic)
│   │   └── /products/[id]/reviews
│   ├── /about
│   ├── /pricing
│   └── /dashboard (🔒 Protected)
│       ├── /dashboard/settings
│       └── /dashboard/billing
```

**Dynamic Route Handling**:

| Route Pattern | Visual Indicator | User Input |
|---------------|-----------------|------------|
| `/products/[id]` | 🔷 Blue badge "Dynamic" | Param name field |
| `/blog/[...slug]` | 🟣 Purple badge "Catch-All" | Catch-all toggle |
| `/api/webhook` | ⚡ Yellow badge "API" | Route type selector |

### B.2 Component Slot System

**Recommended: Block-Based with AI Slots**

```
┌──────────────────────────────────────┐
│ 🔗 Shared: Header (nav, logo)        │ ← Inherited from layout
├──────────────────────────────────────┤
│ 🤖 AI Generate: Hero Section         │ ← "Generate a hero for SaaS pricing"
│    [Prompt field]                    │
├──────────────────────────────────────┤
│ 📝 Static: Pricing Table             │ ← Pre-built component
├──────────────────────────────────────┤
│ 🤖 AI Generate: FAQ Section          │ ← "Generate 5 FAQs about pricing"
│    [Prompt field]                    │
├──────────────────────────────────────┤
│ 🔗 Shared: Footer (links, copyright) │ ← Inherited from layout
└──────────────────────────────────────┘
```

**Slot Types**:

| Type | Icon | Description |
|------|------|-------------|
| **Shared** | 🔗 | Inherited from layout (header, footer, nav) |
| **AI Generated** | 🤖 | User provides prompt, AI fills content |
| **Static** | 📝 | Pre-built component from library |
| **Custom** | ⚙️ | User will implement manually after export |

### B.3 Route Configuration

```typescript
interface RouteConfig {
  path: string;
  
  // Route type
  type: 'page' | 'api' | 'layout';
  
  // Dynamic segments
  params: {
    name: string;
    type: 'string' | 'number';
    optional: boolean;
  }[];
  
  // Protection
  auth: {
    required: boolean;
    roles?: string[];
    redirectTo?: string;
  };
  
  // Layout nesting
  layout: string | null;  // Layout ID or null for no layout
  
  // Metadata
  meta: {
    title: string;
    description: string;
    og_image?: string;
  };
}
```

---

## Part C: Interactive Multi-Page Preview

### C.1 Technical Architecture Comparison

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A: Upfront** | Generate all pages before preview | Fast navigation, coherent | Slow initial load, expensive |
| **B: On-Demand** | Generate pages as user navigates | Fast start, cost-effective | Slow navigation, less coherent |
| **C: Hybrid** ✅ | Generate visible + lazy-load rest | Balanced speed/cost | Moderate complexity |

**Recommended: Option C (Hybrid)**

```
User clicks "Preview" →
  1. Generate current page immediately
  2. Start background generation for linked pages
  3. Show skeleton/placeholder for pending pages
  4. Swap in real content as generated
  5. Cache all generated pages for session
```

### C.2 State Persistence Architecture

**Mock Data Layer**:

```typescript
interface PreviewContext {
  // Simulated auth state
  auth: {
    isLoggedIn: boolean;
    user: MockUser | null;
    session: MockSession | null;
  };
  
  // Simulated database state
  data: {
    products: MockProduct[];
    cart: MockCartItem[];
    orders: MockOrder[];
  };
  
  // Navigation context
  navigation: {
    previousPage: string | null;
    breadcrumbs: string[];
    currentParams: Record<string, string>;
  };
  
  // Generation context
  generation: {
    projectTheme: ThemeConfig;
    brandVoice: string;
    consistencyHash: string;  // For coherent generation
  };
}
```

**Auth State Simulation**:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Logged Out** | Show public pages only | Testing marketing pages |
| **Logged In** | Show dashboard, user data | Testing authenticated flows |
| **Admin** | Show all pages including admin | Testing full app |

### C.3 Navigation Coherence

**Cross-Page Context Passing**:

```typescript
interface GenerationContext {
  // Project-level consistency
  project: {
    name: string;
    description: string;
    primaryColor: string;
    fontFamily: string;
    voiceTone: 'professional' | 'casual' | 'technical';
  };
  
  // Page-specific context
  page: {
    title: string;
    purpose: string;
    previousPage?: string;
    nextPage?: string;
  };
  
  // Mock data references
  data: {
    // Same mock user across all pages
    currentUser: MockUser;
    // Same cart state across pages
    cartItems: MockCartItem[];
  };
  
  // Consistency hash (for reproducibility)
  seed: string;
}
```

**Implementation Pattern**:

1. **First Generation**: Create base context with mock data
2. **Subsequent Pages**: Pass context + modifications
3. **Navigation**: Include "came from X" in prompt
4. **Visual Consistency**: Share color/font tokens across generations

---

## Part D: API Key & Environment Management

### D.1 Security Model

**Keys to NEVER Store (Even Encrypted)**:

| Key Type | Why Not | Alternative |
|----------|---------|-------------|
| **Stripe Secret Key** | Full payment access | Use restricted keys |
| **Database Connection String** | Full DB access | Local .env only |
| **JWT Signing Secret** | Auth compromise | Local .env only |
| **Admin API Keys** | Full system access | Local .env only |

**Keys OK to Store (Encrypted, Optional)**:

| Key Type | Why OK | Benefit |
|----------|--------|---------|
| **Stripe Publishable Key** | Public anyway | Convenience |
| **Supabase Anon Key** | Public, row-level security | Auto-config |
| **Vercel Project ID** | Not sensitive | Deployment sync |
| **OAuth Client IDs** | Public | Integration setup |

**Recommended Approach**:

```
┌─────────────────────────────────────────────────────────┐
│ SECURITY TIERS                                          │
├─────────────────────────────────────────────────────────┤
│ 🔴 NEVER CLOUD: Secret keys, DB strings, JWT secrets   │
│    → Always local .env only                             │
├─────────────────────────────────────────────────────────┤
│ 🟡 OPTIONAL CLOUD: Publishable keys, project IDs       │
│    → Encrypted storage, user opt-in                     │
├─────────────────────────────────────────────────────────┤
│ 🟢 ALWAYS LOCAL: All keys synced to local .env         │
│    → CLI pull command, user has full control            │
└─────────────────────────────────────────────────────────┘
```

### D.2 Local Sync Mechanisms

**Comparison**:

| Method | Reliability | UX | Security | Recommendation |
|--------|-------------|-----|----------|----------------|
| **CLI Pull** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Primary |
| **Cursor Extension** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Phase 2 |
| **File System API** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Not recommended |

**Recommended: CLI-First**

```bash
# Pull environment variables from dashboard
npx @jrdaws/framework env pull

# Push local changes to dashboard (public keys only)
npx @jrdaws/framework env push --public-only

# Validate all keys are set
npx @jrdaws/framework env check
```

**CLI Pull Flow**:

```
1. User runs: npx @jrdaws/framework env pull
2. CLI prompts for authentication (browser OAuth)
3. CLI fetches project config from API
4. CLI generates .env.local with:
   - Public keys from cloud (if stored)
   - Placeholder comments for secret keys
   - Links to get missing keys
5. User fills in secret keys manually
```

### D.3 Service Connection Flow

**OAuth Integration Pattern**:

```typescript
interface ServiceConnection {
  service: 'stripe' | 'supabase' | 'vercel' | 'github';
  status: 'connected' | 'disconnected' | 'expired';
  
  // What we store
  stored: {
    accessToken?: string;  // For API calls
    refreshToken?: string;  // For token refresh
    publicKeys?: Record<string, string>;
  };
  
  // What we DON'T store
  // (User must provide via CLI or paste)
  userProvided: {
    secretKeys: string[];  // Names only, not values
  };
  
  // Validation
  lastValidated: Date;
  validationError?: string;
}
```

**Per-Service Flows**:

| Service | Auth Method | What We Fetch | What User Provides |
|---------|-------------|---------------|-------------------|
| **Stripe** | OAuth (Connect) | Publishable key, account ID | Secret key (manual) |
| **Supabase** | API key input | Project URL, anon key | Service role key (manual) |
| **Vercel** | OAuth | Project list, env vars | None (full access via OAuth) |
| **GitHub** | OAuth | Repo list | None |

### D.4 Cross-Environment Sync

**Phase 1 (MVP)**: Local .env only
**Phase 2**: Vercel env sync
**Phase 3**: GitHub secrets sync

```
┌─────────────────────────────────────────────────────────┐
│ Environment Sync Matrix                                 │
├─────────────────────────────────────────────────────────┤
│                      │ Local │ Vercel │ GitHub │        │
│ ─────────────────────┼───────┼────────┼────────┤        │
│ Public Keys          │  ✓    │   ✓    │   ✓    │ Auto   │
│ Secret Keys          │  ✓    │   ⚠    │   ⚠    │ Manual │
│ ─────────────────────┴───────┴────────┴────────┘        │
│                                                          │
│ ⚠ = Requires explicit user action to sync               │
└─────────────────────────────────────────────────────────┘
```

---

## Part E: Framework Best Practices

### E.1 Dashboard vs Local Development

| Use Dashboard For | Use Local Dev For |
|------------------|-------------------|
| ✅ Initial project setup | ✅ Custom business logic |
| ✅ Page structure design | ✅ API integrations |
| ✅ Feature selection | ✅ Testing with real data |
| ✅ Theme customization | ✅ Debugging |
| ✅ AI content generation | ✅ Performance optimization |
| ✅ Preview and iteration | ✅ Deployment |

### E.2 Re-Sync Workflow

**Dashboard → Local (Primary Flow)**:

```
1. User makes changes in dashboard
2. User clicks "Export" or runs `npx @jrdaws/framework pull`
3. CLI downloads project config
4. CLI generates/updates local files:
   - New pages added
   - Deleted pages removed (with confirmation)
   - Modified content updated
5. User reviews changes in git diff
6. User commits changes locally
```

**Local → Dashboard (Limited)**:

```
SUPPORTED:
- Theme changes (colors, fonts)
- Feature flags (on/off)
- Page metadata (titles, descriptions)

NOT SUPPORTED (by design):
- Custom code changes
- Manual template modifications
- Package.json changes

Rationale: Dashboard is for DESIGN, local is for IMPLEMENTATION
```

**Conflict Prevention**:

| Scenario | Handling |
|----------|----------|
| Dashboard changed, local unchanged | Clean merge |
| Local changed, dashboard unchanged | User keeps local changes |
| Both changed same file | Dashboard wins + backup of local |
| Local has custom code | Preserved in `// CUSTOM CODE` blocks |

### E.3 Monetization Recommendations

**Free Tier**:
- 1 project
- Basic features only
- Community templates
- CLI export only (no cloud preview)

**Pro Tier ($20/month)**:
- Unlimited projects
- All features
- Cloud preview
- Version history (30 days)
- Priority generation queue

**Team Tier ($50/month per seat)**:
- Everything in Pro
- Collaboration features
- Shared team projects
- Admin controls
- 90-day version history

**Natural Upgrade Triggers**:

| Trigger | From → To | Why It Works |
|---------|-----------|--------------|
| "Create second project" | Free → Pro | Clear value moment |
| "Preview takes too long" | Free → Pro | Frustration to feature |
| "Share with teammate" | Pro → Team | Collaboration need |
| "Restore old version" | Pro → Team | Recovery need |

---

## Deliverables

### 1. Architecture Document ✅
This document serves as the architecture specification.

### 2. UX Wireframes (Rough Sketches)

**Dashboard Main View**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 dawson-does                    [Search ⌘K]    [+ New]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Preview  │  │ Preview  │  │ Preview  │  │   + New   │    │
│  │          │  │          │  │          │  │  Project  │    │
│  ├──────────┤  ├──────────┤  ├──────────┤  │           │    │
│  │ Project A│  │ Project B│  │ Project C│  │           │    │
│  │ ● Active │  │ ● Active │  │ ◐ Draft  │  │           │    │
│  │ 2h ago   │  │ 1d ago   │  │ 1w ago   │  │           │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Page Tree Editor**:
```
┌─────────────────────────────────────────────────────────────┐
│ ◀ Back to Dashboard        Project: My SaaS        [Preview]│
├──────────────────┬──────────────────────────────────────────┤
│ PAGES            │  PAGE SETTINGS                            │
│ ────────────────│                                           │
│ 📄 / (Home)      │  Title: [Home                    ]       │
│ 📄 /pricing      │  Path:  [/                       ]       │
│ 📄 /about        │  Type:  (●) Page  ( ) Layout  ( ) API    │
│ 📁 /dashboard 🔒 │                                           │
│   📄 /settings   │  ─────────────────────────────────────   │
│   📄 /billing    │  COMPONENTS                               │
│ 📄 /blog         │  ┌─────────────────────────────────┐     │
│   📄 /[slug] 🔷  │  │ 🔗 Header (shared)              │     │
│                  │  ├─────────────────────────────────┤     │
│ [+ Add Page]     │  │ 🤖 Hero Section                 │     │
│                  │  │    "Generate SaaS hero..."      │     │
│                  │  ├─────────────────────────────────┤     │
│                  │  │ 📝 Feature Grid                 │     │
│                  │  ├─────────────────────────────────┤     │
│                  │  │ 🔗 Footer (shared)              │     │
│                  │  └─────────────────────────────────┘     │
└──────────────────┴──────────────────────────────────────────┘
```

### 3. Technical Spike List

| Spike | Question to Answer | Time |
|-------|-------------------|------|
| **S1: Preview Iframe** | Can we render Next.js pages in iframe without full app? | 4h |
| **S2: AI Coherence** | Can we maintain visual consistency across page generations? | 8h |
| **S3: File System Write** | What's the most reliable CLI → local file write pattern? | 4h |
| **S4: Version Snapshots** | What's the storage cost/complexity of full config snapshots? | 2h |
| **S5: OAuth Flows** | How complex are Stripe/Supabase/Vercel OAuth integrations? | 4h |
| **S6: Real-time Preview** | Can we update preview without full page regeneration? | 4h |

### 4. Implementation Roadmap

```
PHASE 1: Foundation (Months 1-2)
════════════════════════════════
Week 1-2: Data model + basic API
Week 3-4: Project CRUD + dashboard UI
Week 5-6: Page tree editor (basic)
Week 7-8: Single page preview

PHASE 2: Core Features (Months 3-4)
═══════════════════════════════════
Week 9-10: Multi-page preview (linked)
Week 11-12: AI component generation
Week 13-14: CLI pull/push commands
Week 15-16: Version history + rollback

PHASE 3: Polish & Scale (Months 5-6)
════════════════════════════════════
Week 17-18: Service integrations (Stripe, Supabase)
Week 19-20: Env variable management
Week 21-22: Team features (if demand)
Week 23-24: Performance + stability

BEYOND 6 MONTHS:
- Real-time collaboration
- Graph view for page relationships
- Custom component marketplace
- White-label/embed options
```

### 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **AI coherence fails** | Medium | High | Fallback to templates; iterate on prompts |
| **Preview iframe security** | Low | High | Sandboxed iframe; CSP headers |
| **OAuth complexity** | Medium | Medium | Start with API key input; add OAuth later |
| **Scope creep** | High | High | Strict MVP definition; say no often |
| **Performance at scale** | Medium | Medium | Lazy loading; generation queue |
| **Export breaks local code** | Medium | High | CUSTOM CODE blocks; git backup |
| **Key storage security breach** | Low | Very High | Never store secrets; encrypt optional keys |
| **User confusion (dashboard vs local)** | High | Medium | Clear documentation; in-app guidance |

---

## Success Criteria Answers

### 1. What's the MVP that delivers value without overbuilding?

**MVP Features**:
- Multi-project dashboard (create, list, archive)
- Page tree editor (add, remove, reorder pages)
- Basic page settings (title, path, auth required)
- Single-page AI generation with preview
- CLI export to local project
- CLI env pull (placeholders only, no cloud storage)

**NOT in MVP**:
- Graph view for page relationships
- Real-time collaboration
- Cloud key storage
- Service OAuth integrations
- Version history beyond "last export"
- Custom component marketplace

### 2. What's the 6-month vision for the full platform?

A complete Project Lifecycle Management Platform where developers can:
- Design multi-page app structures visually
- Preview linked pages with simulated auth/data
- Generate AI content with cross-page coherence
- Sync configuration and public env vars to local
- Connect services (Stripe, Supabase) with OAuth
- Collaborate with team (Pro/Team tiers)
- Roll back to previous versions

### 3. What do we build first, second, third?

1. **First**: Project dashboard + basic page tree + single-page preview
2. **Second**: Multi-page preview with navigation + AI component generation
3. **Third**: CLI sync + version history + service integrations

### 4. What should we explicitly NOT build?

| Feature | Why Not |
|---------|---------|
| **Real-time collaboration** | Too complex for MVP; async first |
| **Full drag-and-drop builder** | We're config-first, not Webflow |
| **Custom component code editing** | Keep it in local IDE |
| **Mobile app** | Web-first, CLI-second |
| **Analytics dashboard** | Focus on building, not metrics |
| **Template marketplace** | Curated templates only initially |
| **White-label/embed** | Enterprise feature for later |
| **AI chat interface** | Structured forms work better |

---

## Appendix: Research Sources

1. Dashboard UX best practices (letsgroto.com, covio.agency)
2. Vercel, Webflow, Framer, Linear UI patterns
3. Figma prototype linking documentation
4. Storybook composition patterns
5. API key security best practices (OWASP)
6. Environment variable management (dotenv, Infisical patterns)
7. SaaS pricing strategy research
8. Multi-page application patterns (frontendmasters.com)

---

*Research complete. Ready for implementation planning.*

