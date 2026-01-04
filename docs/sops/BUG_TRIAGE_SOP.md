# Bug Triage SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Systematic handling of bugs from discovery to resolution
> **Audience**: All 13 agents
> **Maintained By**: Documentation Agent + Testing Agent

---

## Table of Contents

1. [Severity Classification](#1-severity-classification)
2. [Bug Report Template](#2-bug-report-template)
3. [Agent Routing Matrix](#3-agent-routing-matrix)
4. [Bug Lifecycle](#4-bug-lifecycle)
5. [Escalation Path](#5-escalation-path)
6. [Bug Tracking Location](#6-bug-tracking-location)
7. [Quick Reference](#7-quick-reference)

---

## 1. Severity Classification

| Level | Name | Definition | Response Time | Examples |
|-------|------|------------|---------------|----------|
| **P0** | Critical | Production down, data loss, security breach | **Immediate** | Site offline, auth broken, data exposed |
| **P1** | High | Major feature completely broken | **<6 hours** | Can't export, API 500 errors, login fails |
| **P2** | Medium | Feature partially broken or degraded | **<24 hours** | UI glitch, slow response, minor flow issue |
| **P3** | Low | Cosmetic issue or enhancement | **Next cycle** | Typo, color mismatch, UX improvement |

### Decision Tree

```
Is production/site down?
├── YES → P0
└── NO → Can users complete their primary task?
         ├── NO → P1
         └── YES → Is the issue visible to users?
                   ├── YES → P2
                   └── NO → P3
```

---

## 2. Bug Report Template

Save bug reports to: `output/shared/bugs/active/P[0-3]/BUG-[YYYYMMDD]-[short-name].md`

```markdown
# Bug Report: [Short Descriptive Title]

**ID**: BUG-YYYYMMDD-[short-name]
**Severity**: P[0-3]
**Status**: Reported | Triaged | Assigned | In Progress | Fixed | Verified | Closed
**Reported By**: [Agent Role or User]
**Date Reported**: YYYY-MM-DD HH:MM
**Assigned To**: [Agent Role]

---

## Description

[Clear, concise description of what's happening]

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. [Expected vs actual result]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens - include error messages]

## Environment

- **Browser/OS**: [e.g., Chrome 120 / macOS 14.2]
- **Node Version**: [e.g., v20.10.0]
- **Framework Version**: [from package.json]
- **Relevant Logs**: 
```
[paste relevant logs here]
```

## Screenshots/Videos

[If applicable]

## Impact Assessment

- **Users Affected**: [All / Some / Few]
- **Workaround Available**: [Yes/No - describe if yes]
- **Revenue Impact**: [None / Low / High]

## Fix Notes

[To be filled by fixing agent]

- **Root Cause**: 
- **Fix Applied**: 
- **Files Changed**: 
- **Test Added**: [Yes/No - test name]

## Verification

- **Verified By**: [Agent Role]
- **Verification Date**: YYYY-MM-DD
- **Verification Notes**: 
```

---

## 3. Agent Routing Matrix

| Bug Type | Primary Agent | Backup Agent | Keywords |
|----------|---------------|--------------|----------|
| **UI/Visual** | Website | Template | CSS, layout, responsive, display |
| **CLI Commands** | CLI | Platform | command, terminal, export, pull |
| **API Errors** | Platform | Website | 500, 404, endpoint, request |
| **Authentication** | Platform | Website | login, auth, session, token |
| **Database** | Platform | Integration | query, data, migration, schema |
| **Integration** | Integration | Platform | provider, API key, third-party |
| **Test Failures** | Testing | (by type) | test, spec, assertion, coverage |
| **Documentation** | Documentation | - | docs, readme, typo, guide |
| **Template** | Template | Integration | template, scaffold, export |
| **Media/Assets** | Quality | Media | image, icon, asset, generation |
| **Build/Deploy** | Platform | Testing | build, deploy, vercel, CI |

### Routing Decision

```
1. Identify bug type from keywords
2. Assign to Primary Agent
3. If Primary Agent unavailable (>2 hours for P0-P1), assign to Backup
4. CC Platform Agent for all P0-P1 bugs
```

---

## 4. Bug Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────────┐
│ REPORTED │───▶│ TRIAGED  │───▶│ ASSIGNED │───▶│ IN PROGRESS │
└──────────┘    └──────────┘    └──────────┘    └─────────────┘
                                                       │
                                                       ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────────┐
│  CLOSED  │◀───│ VERIFIED │◀───│  FIXED   │◀───│   (work)    │
└──────────┘    └──────────┘    └──────────┘    └─────────────┘
```

### Status Definitions

| Status | Definition | Who Sets |
|--------|------------|----------|
| **Reported** | Bug initially documented | Reporter |
| **Triaged** | Severity confirmed, agent assigned | Auditor/Strategist |
| **Assigned** | Agent acknowledged and will fix | Assigned Agent |
| **In Progress** | Actively being worked on | Assigned Agent |
| **Fixed** | Code fix applied, PR merged | Assigned Agent |
| **Verified** | Fix confirmed working | Testing Agent |
| **Closed** | Bug resolved and documented | Testing Agent |

### Status Transitions

- `Reported → Triaged`: Within 1 hour for P0-P1, 6 hours for P2-P3
- `Triaged → Assigned`: Immediate for P0, within response time for others
- `Fixed → Verified`: Testing Agent must verify within 2 hours of fix
- `Verified → Closed`: Automatic if verification passes

---

## 5. Escalation Path

### P0 - Critical (Immediate)

```
1. ALERT all active agents immediately
2. Platform Agent takes lead
3. All other work stops until resolved
4. Post-mortem required after resolution
```

**Notification**:
```bash
# Create P0 alert file
echo "P0 ALERT: [description]" > output/shared/bugs/active/P0/ALERT-$(date +%Y%m%d-%H%M).txt
```

### P1 - High (<6 hours)

```
1. Notify assigned agent + Platform Agent
2. Begin work within 30 minutes
3. Update status every 2 hours
4. Escalate to P0 if not resolved in 6 hours
```

### P2 - Medium (<24 hours)

```
1. Notify assigned agent
2. Add to current work queue
3. Provide initial assessment within 4 hours
```

### P3 - Low (Next cycle)

```
1. Log in bug tracker
2. Include in next Strategist planning cycle
3. No immediate action required
```

---

## 6. Bug Tracking Location

```
output/shared/bugs/
├── active/                    # Current open bugs
│   ├── P0/                    # Critical - immediate
│   ├── P1/                    # High - <6 hours
│   ├── P2/                    # Medium - <24 hours
│   └── P3/                    # Low - next cycle
├── fixed/                     # Fixed, awaiting verification
│   └── BUG-YYYYMMDD-*.md
└── closed/                    # Verified and closed
    └── YYYY-MM/               # Organized by month
        └── BUG-YYYYMMDD-*.md
```

### File Naming Convention

```
BUG-YYYYMMDD-short-description.md

Examples:
- BUG-20251223-auth-token-expired.md
- BUG-20251223-export-fails-saas.md
- BUG-20251223-ui-button-alignment.md
```

---

## 7. Quick Reference

### Creating a Bug Report

```bash
# Navigate to appropriate priority folder
cd output/shared/bugs/active/P2/

# Create bug file
touch BUG-$(date +%Y%m%d)-short-name.md

# Open and fill template
```

### Checking Active Bugs

```bash
# List all active bugs
find output/shared/bugs/active -name "*.md" -type f

# Count by priority (works in bash and zsh)
for p in P0 P1 P2 P3; do echo "$p: $(find output/shared/bugs/active/$p -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"; done
```

### Moving Bug Through Lifecycle

```bash
# When fixed
mv output/shared/bugs/active/P2/BUG-xxx.md output/shared/bugs/fixed/

# When verified
mkdir -p output/shared/bugs/closed/$(date +%Y-%m)
mv output/shared/bugs/fixed/BUG-xxx.md output/shared/bugs/closed/$(date +%Y-%m)/
```

---

## Related Documents

### Bug Prevention System
- [CODE_QUALITY_SOP.md](./CODE_QUALITY_SOP.md) - Prevent bugs with quality gates
- [REGRESSION_TESTING_SOP.md](./REGRESSION_TESTING_SOP.md) - Mandatory tests for fixes
- [SENTRY_BUG_AUTOMATION_SOP.md](./SENTRY_BUG_AUTOMATION_SOP.md) - Auto-create reports from Sentry
- [BUG_PREVENTION_CHECKLIST.md](../standards/BUG_PREVENTION_CHECKLIST.md) - Quick reference

### Other
- [Deployment SOP](./DEPLOYMENT_SOP.md) - For deployment-related bugs
- [Documentation Sync SOP](./DOCUMENTATION_SYNC_SOP.md) - Update docs after fix
- [Sentry Setup](../integrations/monitoring/sentry.md) - Error monitoring
- [Testing Agent Role](../../prompts/agents/roles/TESTING_AGENT.md) - Verification process

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.1 | 2025-12-23 | TST Agent | Fixed zsh glob compatibility in bug count command |
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation |

