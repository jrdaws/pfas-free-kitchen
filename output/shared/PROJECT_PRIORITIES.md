# Project Priorities Dashboard

> **Purpose**: Central source of truth for what needs to be done next
> **Updated By**: ALL agents (on session end)
> **Last Updated**: 2025-12-24

---

## 🚨 Urgent (Do Now)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P0 | - | - | - | - |

---

## 🔴 High Priority (This Cycle)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P1 | - | - | - | - |

---

## 🟡 Medium Priority (Soon)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P2 | Configure env vars in Vercel Dashboard | User | ANTHROPIC_API_KEY, SUPABASE, REDIS | PLT |
| P2 | Test UploadThing integration | Integration | Feature complete | AUD |
| P2 | Add UI tests for configurator | Testing | Coverage gap | WEB |

---

## 🟢 Low Priority (Backlog)

| Priority | Task | Best Agent | Reason | Added By |
|----------|------|------------|--------|----------|
| P3 | Add velocity tracking automation | Platform | Metrics | AUD |
| P3 | Create user feedback collection | Website | UX improvement | AUD |
| P3 | Create missing deployment guides (vercel/netlify/railway.md) | Documentation | Dead links | TST |
| P3 | Create docs/standards/CODING_STANDARDS.md | Documentation | Referenced but missing | TST |

---

## Development Sequence

Current recommended order based on dependencies:

```
1. Testing Agent  → Verify SOPs, run E2E tests
        ↓
2. Platform Agent → Deploy to Vercel
        ↓
3. Integration Agent → Test UploadThing, storage
        ↓
4. Website Agent → UI improvements, feedback collection
        ↓
5. Template Agent → Update templates with lessons learned
```

---

## Recently Completed

| Task | Agent | Date | Notes |
|------|-------|------|-------|
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

