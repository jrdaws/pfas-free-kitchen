# Project Priorities Dashboard

> **Purpose**: Central source of truth for what needs to be done next
> **Updated By**: ALL agents (on session end)
> **Last Updated**: 2025-12-25 16:30 (Cycle 16 Strategy - GOVERNANCE PAUSE)

---

## ⚠️ GOVERNANCE PAUSE IN EFFECT

**Cycles 11-15**: Governance agents ran, executor agents idle.
**Cycle 16 Directive**: PAUSE governance, ACTIVATE executors.

**Human Action Required**: Copy prompts below into new Cursor tabs.

---

## 🚨 Urgent (Do Now)

| Priority | Task | Best Agent | Prompt File | Status |
|----------|------|------------|-------------|--------|
| **P0** | Commit uncommitted work | CLI | cycle16-T0-cli-commit.txt | 🔴 Pending |

---

## 🔴 High Priority (This Cycle)

| Priority | Task | Best Agent | Prompt File | Status |
|----------|------|------------|-------------|--------|
| P1 | Accordion UI Tests | Testing | cycle16-T1-testing-accordion.txt | 🔴 Pending |
| P2 | Connected Services UI | Website | cycle16-T2-website-services.txt | 🔴 Pending |
| P2 | Supabase OAuth E2E Tests | Testing | cycle16-T3-testing-oauth.txt | 🔴 Pending |

---

## 🟡 Medium Priority (Soon)

| Priority | Task | Best Agent | Prompt File | Status |
|----------|------|------------|-------------|--------|
| P3 | Create CODING_STANDARDS.md | Documentation | cycle16-T4-docs-standards.txt | 🔴 Pending |
| P3 | Create deployment guides | Documentation | cycle16-T5-docs-deploy.txt | 🔴 Pending |

---

## 🟢 Low Priority (Backlog)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P3 | UI Media Polish (custom icons, illustrations) | Media | Enhancement after UI implementation | RES |
| P3 | Add velocity tracking automation | Platform | Metrics | AUD |
| P3 | Create user feedback collection | Website | UX improvement | AUD |

---

## Activation Sequence (HUMAN ACTION REQUIRED)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: CLI Agent (5 min)                                  │
│  Task: T0 - Commit uncommitted work                         │
│  Prompt: output/agents/strategist/outbox/drafts/            │
│          cycle16-T0-cli-commit.txt                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Testing Agent (30 min)                             │
│  Task: T1 - Accordion UI tests                              │
│  Prompt: cycle16-T1-testing-accordion.txt                   │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  STEP 3a: Website (60m) │   │  STEP 3b: Testing (30m) │
│  T2: Connected Services │   │  T3: OAuth E2E          │
│  (can run parallel)     │   │  (can run parallel)     │
└─────────────────────────┘   └─────────────────────────┘
          │                             │
          └──────────────┬──────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Documentation Agent (40 min, parallel tasks)       │
│  T4: CODING_STANDARDS.md + T5: Deployment guides            │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start Prompts

### T0: CLI Agent
```
Read prompts/agents/roles/CLI.md and execute task T0 from Cycle 16 strategy. 
Commit all uncommitted work and push to origin/main. This is P0 priority.
```

### T1: Testing Agent
```
Read prompts/agents/roles/TESTING.md and execute task T1 from Cycle 16 strategy.
Complete the accordion UI tests in website/tests/configurator-accordion.spec.ts.
Verify the new sidebar accordion behavior works correctly. Run npm test to confirm.
```

### T2: Website Agent
```
Read prompts/agents/roles/WEBSITE.md and execute task T2 from Cycle 16 strategy.
Create the Connected Services UI component for the configurator.
Backend routes are ready at website/app/api/services/connected/.
Integrate into the accordion sidebar. Follow 5DS dark theme design.
```

---

## Recently Completed

| Task | Agent | Date | Notes |
|------|-------|------|-------|
| Cycle 16 Strategy (Governance Pause) | Strategist | 2025-12-25 | 6 tasks defined, executor activation prioritized |
| Accordion Sidebar (Phase 1) | Website | 2025-12-25 | Implemented inline sections, mobile pattern |
| Section Content Components | Website | 2025-12-25 | SupabaseSetup integrated into sidebar |
| Supabase OAuth Integration | Platform | 2025-12-25 | OAuth routes, database schema complete |
| UploadThing E2E Tests | Testing | 2025-12-25 | 370 lines of integration tests |
| **UI Design Specification** | RES | 2025-12-24 | Analyzed reference screenshots, created 5DS_UI_SPECIFICATION.md |
| **Feature-to-Code Mapping System** | TPL | 2025-12-24 | 20 templates, feature-assembler.mjs, enables 5.4 |
| **Vercel Production Deploy** | PLT | 2025-12-24 | website-iota-ten-11.vercel.app - needs env vars |

---

## How to Update This File

**On session end, every agent should:**

1. Mark completed tasks (move to Recently Completed)
2. Update Status column for pending tasks
3. Add any new tasks discovered during session

**DO NOT start new governance cycles until:**
- At least 3 executor tasks completed (T0, T1, T2)
- Task backlog reduced from 35+ to <25

---

*Cycle 16 Strategy | GOVERNANCE PAUSE | Strategist Agent*
