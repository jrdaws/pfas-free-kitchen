# Agent Roles

This directory contains persistent role files for the 7 key AI agent roles in dawson-does-framework.

## How It Works

1. **New agent starts** → Read `AGENT_CONTEXT.md` first
2. **Check role assignment** → Read the appropriate role file
3. **Get full context** → Role file contains previous work, current state, priorities
4. **Do work** → Complete assigned tasks
5. **Update role file** → Log what was done, update state, set next priorities
6. **End with handoff prompt** → Next agent can continue seamlessly

## The 7 Roles

| Role | File | Scope |
|------|------|-------|
| **CLI Agent** | `CLI_AGENT.md` | Core framework CLI, commands, bin/framework.js |
| **Website Agent** | `WEBSITE_AGENT.md` | Next.js web configurator, UI components |
| **Template Agent** | `TEMPLATE_AGENT.md` | Starter templates, template.json, structure |
| **Integration Agent** | `INTEGRATION_AGENT.md` | Auth, payments, email integrations |
| **Documentation Agent** | `DOCUMENTATION_AGENT.md` | Docs, standards, guides |
| **Testing Agent** | `TESTING_AGENT.md` | Unit tests, E2E tests, coverage |
| **Platform Agent** | `PLATFORM_AGENT.md` | Preview, deploy, pull, cloud features |

## Starting an Agent

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework
claude

# First message to Claude:
"Read your role file and continue where the previous agent left off:
cat prompts/agents/roles/CLI_AGENT.md"
```

## Role File Structure

Each role file contains:
- **Role Definition** - What this agent is responsible for
- **Current State** - What's working, what's not
- **Work Log** - Chronological record of actions taken
- **Active Issues** - Known problems to address
- **Next Priorities** - What to work on next
- **Handoff Prompt** - Ready-to-use prompt for new agent

## Updating Your Role File

**IMPORTANT**: After completing work, update your role file with:
1. Add entry to Work Log with date and description
2. Update Current State if things changed
3. Update Active Issues if any were found/fixed
4. Update Next Priorities based on what's remaining
5. Refresh the Handoff Prompt with latest context

---
*Last updated: 2024-12-22*

