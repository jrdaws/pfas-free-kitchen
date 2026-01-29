# PFAS-Free Kitchen - Admin Console

Internal admin console for product review, verification, and evidence management.

## Quick Start

```bash
cd src/pfas-admin
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (runs on port 3001 to avoid conflict with public site).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with metrics and activity |
| `/queue` | Review queue list |
| `/queue/[id]` | Product review interface |
| `/reports` | User reports with SLA tracking |
| `/evidence` | Evidence library |
| `/evidence/upload` | Upload new evidence |
| `/audit` | Audit log |
| `/catalog/products` | Product management |
| `/catalog/brands` | Brand management |
| `/settings` | Admin settings |

## Features

### Dashboard
- Queue metrics (pending, high-risk, avg review time)
- Report metrics with SLA status
- Tier distribution chart
- Recent activity feed

### Review Queue
- Filter by lane (standard/high-risk), status, assignment
- Risk score indicator with detected terms
- Batch assignment

### Product Review Interface
- Component model editor
- Evidence linking and upload
- Category-specific checklists
- Tier selection with requirements
- Decision form with rationale

### Evidence Management
- SHA-256 hash verification
- Type-specific metadata forms
- Product linking

### Reports
- Priority tracking (critical/high/normal/low)
- SLA deadline monitoring
- Resolution workflow

### Audit Log
- Action filtering
- Date range selection
- Full activity history

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `g d` | Go to Dashboard |
| `g q` | Go to Queue |
| `j` / `k` | Navigate list items |
| `a` | Assign to me |
| `Ctrl+S` | Save draft |
| `Ctrl+Enter` | Submit decision |
| `?` | Show all shortcuts |

## Auth & Permissions

```typescript
type AdminRole = 'reviewer' | 'senior_reviewer' | 'admin' | 'super_admin';

// Permissions by role:
// reviewer: view_queue, review_products, upload_evidence
// senior_reviewer: + approve_tier_3, handle_reports
// admin: + approve_tier_4, manage_users, view_audit
// super_admin: + manage_settings
```

## Category Checklists

Verification checklists are category-specific and include:

- **Cookware**: Food-contact surface, coating, handle
- **Cookware Nonstick**: Coating type, PFAS-free confirmation
- **Cookware Ceramic**: Sol-gel confirmation, no PFAS in layers
- **Bakeware**: Surface material, coating presence
- **Food Storage**: Container material, lid/seal, treatments

## Project Structure

```
src/pfas-admin/
├── app/
│   ├── layout.tsx              # Admin layout with auth
│   ├── page.tsx                # Dashboard
│   ├── queue/
│   │   ├── page.tsx            # Queue list
│   │   └── [id]/page.tsx       # Review interface
│   ├── reports/page.tsx        # Reports list
│   ├── evidence/
│   │   ├── page.tsx            # Evidence library
│   │   └── upload/page.tsx     # Upload form
│   ├── audit/page.tsx          # Audit log
│   └── ...
├── components/
│   ├── layout/                 # AdminSidebar, AdminHeader, UserMenu
│   └── dashboard/              # MetricCard, TierChart, SLAStatus, ActivityFeed
└── lib/
    ├── types.ts                # TypeScript types
    ├── auth.ts                 # Auth utilities
    ├── api.ts                  # API client (stub)
    └── checklists.ts           # Category checklists
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- CSS Modules
- Radix UI primitives
- date-fns
- recharts (for charts)

## Environment Variables

```env
# API connection
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Auth (implement with your provider)
AUTH_SECRET=xxx
```
