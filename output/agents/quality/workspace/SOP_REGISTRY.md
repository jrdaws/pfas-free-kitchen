# Quality Agent SOP Registry

> **Maintained By**: Quality Agent
> **Purpose**: Track all SOPs across the framework
> **Last Updated**: 2025-12-24
> **Total SOPs**: 17

---

## Active SOPs

| # | SOP Name | Location | Version | Last Updated | Category |
|---|----------|----------|---------|--------------|----------|
| 1 | Agent Creation | `docs/sops/AGENT_CREATION_SOP.md` | 1.0.0 | 2025-12-24 | Agent Management |
| 2 | Agent Folder Structure | `docs/sops/AGENT_FOLDER_STRUCTURE_SOP.md` | 2.0.0 | 2025-12-24 | Agent Management |
| 3 | Agent Persistent Settings | `docs/sops/AGENT_PERSISTENT_SETTINGS_SOP.md` | 1.0.0 | 2025-12-24 | Agent Management |
| 4 | AI Model Selection | `docs/sops/AI_MODEL_SELECTION_SOP.md` | 1.0.0 | 2025-12-23 | Code Quality |
| 5 | Bug Triage | `docs/sops/BUG_TRIAGE_SOP.md` | 1.0.0 | 2025-12-23 | Process |
| 6 | Certification Requirements | `docs/sops/CERTIFICATION_REQUIREMENTS_SOP.md` | 1.0.0 | 2025-12-23 | Governance |
| 7 | Checkpoint | `docs/sops/CHECKPOINT_SOP.md` | 1.0.0 | 2025-12-24 | Process |
| 8 | Deployment | `docs/sops/DEPLOYMENT_SOP.md` | 1.0.1 | 2025-12-23 | Process |
| 9 | Documentation Sync | `docs/sops/DOCUMENTATION_SYNC_SOP.md` | 1.0.0 | 2025-12-23 | Process |
| 10 | Folder Deprecation | `docs/sops/FOLDER_DEPRECATION_SOP.md` | 1.0.0 | 2025-12-24 | Migration |
| 11 | Haiku JSON Compliance | `docs/sops/HAIKU_JSON_COMPLIANCE_SOP.md` | 1.0.0 | 2025-12-23 | Code Quality |
| 12 | Media Naming | `docs/sops/MEDIA_NAMING_SOP.md` | 1.0.0 | 2025-12-23 | Media |
| 13 | SEO Generation | `docs/sops/SEO_GENERATION_SOP.md` | 1.0.0 | 2025-12-24 | Media |
| 14 | Shadcn Implementation | `docs/sops/SHADCN_IMPLEMENTATION_SOP.md` | 1.0 | 2025-12-23 | UI Standards |
| 15 | SOP Proposal Process | `docs/sops/SOP_PROPOSAL_PROCESS.md` | 1.0.0 | 2025-12-23 | Governance |
| 16 | SSR Compatibility | `docs/sops/SSR_COMPATIBILITY_SOP.md` | 1.0.0 | 2025-12-23 | Code Quality |
| 17 | Template Hygiene | `docs/sops/TEMPLATE_HYGIENE_SOP.md` | 1.0.0 | 2025-12-23 | Templates |

---

## SOPs by Category

### Agent Management (3)
- Agent Creation
- Agent Folder Structure
- Agent Persistent Settings

### Code Quality (3)
- AI Model Selection
- Haiku JSON Compliance
- SSR Compatibility

### Process (4)
- Bug Triage
- Checkpoint
- Deployment
- Documentation Sync

### Governance (2)
- Certification Requirements
- SOP Proposal Process

### Media (2)
- Media Naming
- SEO Generation

### Other (3)
- Folder Deprecation (Migration)
- Shadcn Implementation (UI Standards)
- Template Hygiene (Templates)

---

## Supporting Documentation (Not SOPs)

| Document | Location | Purpose |
|----------|----------|---------|
| Photorealistic Prompt Guide | `output/shared/media/PHOTOREALISTIC_PROMPT_GUIDE.md` | Media pipeline standards |
| Media Pipeline | `output/shared/media/MEDIA_PIPELINE.md` | Media workflow |
| Agent Policies | `prompts/agents/AGENT_POLICIES.md` | Master governance |
| Color Philosophy | `output/shared/media/COLOR_PHILOSOPHY.md` | Brand colors |
| UX Multi-Step Guide | `output/shared/media/UX_MULTI_STEP_GUIDE.md` | Configurator UX |

---

## Pending SOP Proposals

| Proposed SOP | Reason | Priority | Status |
|--------------|--------|----------|--------|
| Code Review | Agents review each other's work | P2 | Proposed in PROPOSED_SOPS.md |
| Feature Request | Process new features | P2 | Proposed in PROPOSED_SOPS.md |
| Security Audit | Regular security reviews | P3 | Idea |
| Performance Optimization | Regular perf reviews | P3 | Idea |

---

## SOP Opportunities Log

Track patterns that might need SOPs:

| Date | Observation | Times Seen | SOP Created? |
|------|-------------|------------|--------------|
| 2025-12-23 | Next Agent Prompt missing | 3+ | ✅ Yes (AGENT_POLICIES) |
| 2025-12-23 | Inconsistent iteration tracking | 2 | Monitoring |
| 2025-12-24 | Path reference outdated after migration | 2 | Monitoring (FOLDER_DEPRECATION covers) |

---

## Version Check Schedule

| Check Type | Frequency | Last Run | Next Due |
|------------|-----------|----------|----------|
| Full SOP audit | Weekly | 2025-12-24 | 2025-12-31 |
| Quick version check | On use | Ongoing | Ongoing |
| Stale SOP alert | Auto (30 days) | N/A | N/A |

---

## Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total SOPs | 17 | ✅ |
| SOPs with versions | 17/17 | ✅ |
| SOPs with dates | 17/17 | ✅ |
| Consistent version format | 16/17 | ⚠️ (SHADCN uses 1.0 not 1.0.0) |

---

## Related Documents

- [Agent Policies](../../prompts/agents/AGENT_POLICIES.md)
- [PROPOSED_SOPS.md](../../docs/PROPOSED_SOPS.md)
- [SOP Proposal Process](../../docs/sops/SOP_PROPOSAL_PROCESS.md)

---

*Registry updated by Quality Agent on 2025-12-24*
