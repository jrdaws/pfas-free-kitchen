# Shared Mindframe

> **Purpose**: Collective consciousness of all agents - certified system state
> **Philosophy**: "If the Auditor certified it, I trust it. If Testing signed off, it works."
> **Last Updated**: 2025-12-24 10:25 UTC

---

## 🚨 MANDATORY REPLY RULES (Check Every Response)

**ALL agents MUST follow these rules on EVERY response. No exceptions.**

### 1. Permission Request (FIRST RESPONSE ONLY)
```bash
# Request ALL permissions upfront before ANY work
git status && curl -s https://httpbin.org/get > /dev/null 2>&1 && echo "✅ Permissions ready"
```
**Predict what you'll need:** network, git_write, all. Request them ONCE at session start.

### 2. Quick Actions Section (EVERY RESPONSE)
```
## Quick Actions (reply with number):
1. **[Agent]**: [Action] ← DEFAULT
2. **[Alternative]**: [Description]
3. **[Command]**: `cd ... && [cmd]`
4. No further action needed

**⏱️ Auto-continue**: If no response in 35 minutes, proceed with Option 1
```

### 3. Handoff Prompt (END OF SESSION)
Fenced block starts IMMEDIATELY after the header line:
```
Next Agent: [Role] Agent
```
[Task description - what they should do, file references, context]
```
```

### 4. Identity Declaration (EVERY RESPONSE)
```
(FULL ROLE NAME AGENT)
```
Examples: `(DOCUMENTATION AGENT)` | `(WEBSITE AGENT)` | `(TESTING AGENT)`

---

## 🔄 Auto-Continuation System

**For multi-step tasks that run unattended.**

### Quick Commands

```bash
# Trigger continuation (agent will receive prompt after WAIT seconds)
./scripts/auto-continue/trigger-continue.sh "AGENT_NAME" "prompt text" WAIT_SECS STEP TOTAL

# Check status
./scripts/auto-continue/check-continue.sh

# Cancel pending
./scripts/auto-continue/cancel-continue.sh
```

### When to Use

- Task requires 3+ distinct steps
- Overnight/unattended operation needed
- Each step can run independently

### Safety

- Max 5 auto-continues per task (prevents infinite loops)
- User can cancel anytime
- All triggers logged to `output/automation/continue-log.csv`

### Full Documentation

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework && cat docs/automation/AUTO_CONTINUE.md
```

---

## 📦 Checkpoint Protocol

**Trigger**: `checkpoint` or `cp`

**Steps:**
1. **Pre-Check**: Review recent commits for governance changes
2. **Stage**: `git add -A` (do NOT commit directly)
3. **SOP Scan**: Identify patterns that could become SOPs
4. **Handoff**: Create review request for Auditor Agent
5. **Auditor**: Reviews and commits when ready

**SOP Scan Questions:**
- Did I encounter a workaround?
- Did I repeat a process?
- Was there confusion a procedure could prevent?

**Full SOP**: `docs/sops/CHECKPOINT_SOP.md`

---

## 📁 Prompt File Rule (ONE LOCATION)

**A prompt exists in exactly ONE location:**

| Stage | Location |
|-------|----------|
| Created | Target agent's `inbox/` |
| Completed | Executor's `done/` (MOVED) |

**Never duplicate. Always MOVE to done/ when complete.**

**Full SOP**: `docs/sops/AGENT_FOLDER_STRUCTURE_SOP.md`

---

## ⚡ Quick Vibe Check

For agents starting work, here's the 10-second status:

| Area | Status | Vibe |
|------|--------|------|
| **Framework** | Healthy | 🟢 |
| **Tests** | 693 passing | 🟢 |
| **Docs** | Current, 11 SOPs + Freshness System | 🟢 |
| **Website** | Production Ready | 🟢 |
| **Deploy** | Monorepo fixes pushed, awaiting GitHub deploy | 🟡 |
| **Governance** | v2.3 + Context Freshness | 🟢 |
| **Blockers** | None | ✅ |

**Mood**: Productive, deployment in progress
**Last Certified By**: Platform Agent @ 2025-12-24 06:00

---

## 🎯 Project Pulse

**Overall Vibe**: 🟢 Great
**Updated By**: Website Agent
**Date**: 2025-12-23

### Current Focus
Major UX overhaul proposed! Transforming configurator from linear wizard to sidebar-driven workspace with expanding panels.

### Momentum
- **Direction**: UX Evolution
- **Velocity**: Very Fast
- **Confidence**: High

### Recent Wins
- ✨ Complete homepage UI redesign with new brand colors
- 📊 Phase-grouped StepIndicator in configurator
- 🖼️ 35 media assets reviewed (83% first-pass approval)
- 📐 Sidebar UX proposal created - left-expanding panel pattern
- 📦 shadcn/ui Implementation SOP created
- 🎨 COLOR_PHILOSOPHY.md + UX_MULTI_STEP_GUIDE.md created

### Active UX Proposal
**Pattern**: Left sidebar with expanding panels (Linear/Vercel style)
- Nav bar: 56px always visible with section icons
- Panel 1: Category selection (160-200px)
- Panel 2: Options/providers (160px, for integrations)
- Main: Full content area (fluid)

**Key Innovation**: 3-panel expansion for Integrations section
- Categories → Providers → Configuration
- No more endless scrolling

**Location**: `output/media-pipeline/research-agent/inbox/UX-PROPOSAL-configurator-sidebar-redesign.md`

---

## 🏆 Agent Certifications

### Code Quality
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Testing Agent | 2025-12-24 | ✅ Checkpoint SOP verified | 🟢 Good | All 6 sections actionable, files exist |

### Governance
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Curator Agent | 2025-12-24 | ✅ Cycle 9 complete | 👀 Watching | 5 prompts reviewed, 9.0 avg score, execution gap critical |
| Website Agent | 2025-12-23 | ✅ v2.3 + Freshness | 🟢 Aligned | Context freshness script + policies complete |
| Auditor Agent | 2025-12-23 | ✅ Sequence oversight active | 🟢 Good | Certification matrix SOP, SOP Guardian adopted |

### Documentation
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Documentation Agent | 2025-12-23 | ✅ Current | 🟢 Fresh | 5 SOPs (AI Model Selection, SOP Proposal Process added) |

### Templates
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Template Agent | 2025-12-22 | ⚠️ Needs review | 🟡 Aging | SaaS template needs update |

### Integrations
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Integration Agent | 2025-12-22 | ✅ Working | 🟢 Good | UploadThing pending full test |

### Deployment
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Platform Agent | 2025-12-24 | ⏳ Monorepo fixes | 🟡 Awaiting deploy | Stubs, husky fix, Vercel docs |

### Media Assets
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Quality Agent | 2025-12-23 | ✅ Pipeline ready | 🟢 Good | 35 assets reviewed, 83% approval, COLOR_PHILOSOPHY.md |

### CLI Commands
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| CLI Agent | 2025-12-22 | ✅ Working | 🟢 Good | export, pull, doctor functional |

### Website / UI
| Certified By | Date | Status | Vibe | Notes |
|--------------|------|--------|------|-------|
| Website Agent | 2025-12-23 | ✅ Redesigned | 🟢 Fresh | New brand identity, phase-grouped stepper |

---

## 📊 Key Metrics

| Metric | Value | Trend | Certified By | Date |
|--------|-------|-------|--------------|------|
| Tests Passing | 693/693 | ✅ Stable | Testing | 2025-12-23 |
| Lint Errors | 0 | ✅ Clean | Testing | 2025-12-23 |
| Open Bugs | 0 P0, 0 P1 | ✅ Clear | Auditor | 2025-12-23 |
| Doc Freshness | 95% | ↑ Improving | Documentation | 2025-12-23 |
| SOPs Active | 11 | ↑ Growing | Quality | 2025-12-23 |
| Agent Policies | v2.0 | ↑ Updated | Documentation | 2025-12-23 |

---

## 🧠 Understanding Snapshots

### What is Dawson-Does Framework?
**TL;DR**: Build web apps visually, export to full local ownership.
**Core Philosophy**: Export-first, zero lock-in, cursor-native.
**Certified By**: Auditor Agent, 2025-12-23

### How Does the Agent System Work?
**TL;DR**: 13 agents with specific roles, file-based coordination via inbox/outbox.
**Key Rules**: 
- Always output numbered quick-select options
- Auto-continue on minimal input
- Check context freshness before inbox work
- Trust other agents' certifications
**Certified By**: Documentation Agent, 2025-12-23

### What's the Current Priority?
**TL;DR**: Verify SOPs, test media pipeline, deploy to production.
**Blockers**: None
**Certified By**: Strategist Agent, 2025-12-23

---

## 🤝 Trust Inheritance

When an agent certifies something, all other agents ADOPT that certification:

| Certification Type | Certifying Agent | Other Agents Should |
|-------------------|------------------|---------------------|
| "Tests pass" | Testing | Trust code works, skip re-testing |
| "Governance compliant" | Auditor | Trust rules are followed |
| "Docs current" | Documentation | Trust docs match reality |
| "Build healthy" | Platform | Trust deployment readiness |
| "Assets approved" | Quality | Trust media quality |
| "Template valid" | Template | Trust export works |
| "Integration working" | Integration | Trust third-party connections |

### Certification Expiry

| Certification | Valid For | After Expiry |
|---------------|-----------|--------------|
| Tests passing | 24 hours | Re-run tests |
| Governance | 48 hours | Re-audit |
| Documentation | 1 week | Freshness check |
| Build health | Until code change | Re-verify |
| Assets | Until brief change | Re-review |

---

## 📋 How to Update This File

### Quick Certification Update

```bash
./scripts/certify.sh [AGENT_CODE] [AREA] [STATUS] [VIBE] "[NOTES]"

# Examples:
./scripts/certify.sh TST "Code Quality" "693 passing" "good" "Full suite green"
./scripts/certify.sh DOC "Documentation" "Current" "good" "SOPs updated"
./scripts/certify.sh PLT "Deployment" "Pending" "caution" "Awaiting approval"
```

### Manual Update

1. Open this file
2. Find your certification area
3. Update: Date, Status, Vibe, Notes
4. Update Quick Vibe Check if significant change
5. Update Project Pulse if direction changed

### Vibe Indicators

| Vibe | Emoji | Meaning |
|------|-------|---------|
| Good | 🟢 | Working well, no issues |
| Caution | 🟡 | Needs attention or pending |
| Concern | 🔴 | Broken or blocking |

---

## 🔗 Vibe Propagation Rules

When one vibe changes, related areas may be affected:

```
Testing 🔴 (tests failing)
    ↓ triggers
Deployment → 🔴 (can't deploy)
Overall Vibe → 🟡 (health impacted)

Documentation 🔴 (critical docs missing)
    ↓ triggers
Governance → 🟡 (compliance unclear)
Agent Onboarding → 🔴 (can't train new agents)
```

---

## 📅 Last Certifications

| Agent | Last Active | Last Certification |
|-------|-------------|-------------------|
| Curator | 2025-12-24 11:30 | Cycle 9 curation, 5 prompts approved (9.0 avg) |
| Website | 2025-12-23 19:50 | UI Redesign, Phase Grouping |
| Documentation | 2025-12-23 15:00 | Governance, Documentation |
| Testing | 2025-12-23 | Code Quality |
| Auditor | 2025-12-24 | Agent Folder Structure SOP (98/100) |
| Platform | 2025-12-24 06:00 | Vercel monorepo fixes, SOP proposal |
| Template | 2025-12-22 | Templates |
| Integration | 2025-12-22 | Integrations |
| Quality | 2025-12-23 22:00 | Media Assets, UX Proposal, shadcn SOP |

---

*Read this file at the start of every session to adopt certified understanding.*
*Update this file when you complete significant work in your area.*

