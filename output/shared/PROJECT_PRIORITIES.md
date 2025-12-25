# Project Priorities Dashboard

> **Purpose**: Central source of truth for what needs to be done next
> **Updated By**: ALL agents (on session end)
> **Last Updated**: 2025-12-25 16:00 (Cycle 14 Strategy)

---

## 🚨 Urgent (Do Now)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| **P0** | **Commit Uncommitted Work (22 files)** | CLI | 3+ cycles overdue - BLOCKS ALL | STR |

---

## 🔴 High Priority (This Cycle)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P1 | Complete Accordion UI Tests | Testing | Validate new sidebar | STR |
| P1 | Update Project Cards (terminal style) | Website | UI alignment with reference design | RES |

---

## 🟡 Medium Priority (Soon)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P2 | Connected Services UI | Website | Backend routes ready | STR |
| P2 | Test Supabase OAuth E2E | Testing | Validate integration | STR |
| P2 | Configure env vars in Vercel Dashboard | User | ANTHROPIC_API_KEY, SUPABASE, REDIS | PLT |

---

## 🟢 Low Priority (Backlog)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P3 | UI Media Polish (custom icons, illustrations) | Media | Enhancement after UI implementation | RES |
| P3 | Add velocity tracking automation | Platform | Metrics | AUD |
| P3 | Create user feedback collection | Website | UX improvement | AUD |
| P3 | Create missing deployment guides (vercel/netlify/railway.md) | Documentation | Dead links | TST |
| P3 | Create docs/standards/CODING_STANDARDS.md | Documentation | Referenced but missing | TST |

---

## Development Sequence

Current recommended order based on dependencies (Cycle 14):

```
0. CLI Agent     → COMMIT WORK (P0, unblocks all) - 22+ FILES!
        ↓
1. Testing Agent → T1: Accordion UI Tests (P1) + T3: OAuth E2E (P2)
        ↓
2. Website Agent → T2: Connected Services UI (P2)
        ↓
3. Documentation Agent → T4: CODING_STANDARDS + T5: Deploy Guides (P3)
        ↓
4. (Parallel) Platform, Template, Integration → Available for new work
```

### Task Inbox Locations (Cycle 14)
| Agent | Inbox File | Priority |
|-------|------------|----------|
| CLI | 20251225-1600-P0-task-commit-work.txt | **P0** |
| Testing | 20251225-1600-P1-task-accordion-tests.txt | P1 |
| Testing | 20251225-1600-P2-task-oauth-e2e.txt | P2 |
| Website | 20251225-1600-P2-task-connected-services-ui.txt | P2 |
| Documentation | 20251225-1600-P3-task-coding-standards.txt | P3 |
| Documentation | 20251225-1600-P3-task-deployment-guides.txt | P3 |

---

## Recently Completed

| Task | Agent | Date | Notes |
|------|-------|------|-------|
| Accordion Sidebar (Phase 1) | Website | 2025-12-25 | Implemented inline sections, mobile pattern |
| Section Content Components | Website | 2025-12-25 | SupabaseSetup integrated into sidebar |
| Supabase OAuth Integration | Platform | 2025-12-25 | OAuth routes, database schema complete |
| UploadThing E2E Tests | Testing | 2025-12-25 | 370 lines of integration tests |
| **UI Design Specification** | RES | 2025-12-24 | Analyzed reference screenshots, created 5DS_UI_SPECIFICATION.md |
| **Feature-to-Code Mapping System** | TPL | 2025-12-24 | 20 templates, feature-assembler.mjs, enables 5.4 |
| **Vercel Production Deploy** | PLT | 2025-12-24 | website-iota-ten-11.vercel.app - needs env vars |
| SaaS template content fix | TPL | 2025-12-24 | Added dashboard, pricing, settings pages; templates/README.md |
| Vercel alt domain working | PLT | 2025-12-24 | `-bv8x` subdomain live, primary needs dashboard fix |
| CI Vercel status checks | PLT | 2025-12-24 | Added vercel-status + pr-preview-comment jobs |
| Monorepo build fixes | PLT | 2025-12-24 | Stubs, husky, lazy init - all pushed |
| Media Pipeline E2E tests | TST | 2025-12-24 | 47/47 checks pass, Part 4 needs API keys |
| Vercel deployment prep | PLT | 2025-12-23 | Build verified, scripts created, awaiting auth |
| Verify Priority SOPs | TST | 2025-12-23 | All 3 SOPs verified actionable |
| Create Shared Mindframe | DOC | 2025-12-23 | MINDFRAME.md + certify.sh |
| Context Freshness System | DOC | 2025-12-23 | check-context-freshness.sh |
| Smart Handoff System | DOC | 2025-12-23 | Numbered options, auto-continue |
| Create Priority SOPs | DOC | 2025-12-23 | Bug Triage, Doc Sync, Deployment |
| Add SOP Guardian role | DOC | 2025-12-23 | Quality Agent tracks SOPs |
| Mandatory handoff prompts | DOC | 2025-12-23 | All agents must output next prompt |

---

## How to Update This File

**On session end, every agent should:**

1. Add any new tasks discovered during session
2. Mark completed tasks (move to Recently Completed)
3. Adjust priorities based on new information
4. Update the Development Sequence if dependencies changed

**Format for new entries:**
```markdown
| P[0-3] | [Task description] | [Best Agent] | [Why urgent/important] | [Your Code] |
```

