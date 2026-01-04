# Governance Card v3.0

## Philosophy
Export-first | Zero lock-in | Main branch only | Cursor-native

## Code Style
| Language | Semicolons | Indent |
|----------|------------|--------|
| .mjs | No | 2 spaces |
| .ts/.tsx | Yes | 2 spaces |

## Commands
```bash
npm test                    # Before commit
git add -A && git commit    # Save work
git push origin main        # Share work
```

## Shortcuts (User → Agent)
| Cmd | Action |
|-----|--------|
| `cp` | Checkpoint - save work, commit, memory |
| `rr` | Re-Read - reload .cursorrules, apply updates |

## Never Do
- Delete protected files (.cursorrules, *_MEMORY.md, AGENT_CONTEXT.md)
- Create feature branches
- Add unrequested features
- Split fenced code blocks
- Add `#` comments in command blocks for humans
- Omit Next Agent Prompt option (unless no obvious next steps)

## Session Start (SLIM - Default)
```
✓ Governance 3.0 | Export-first | No protected file deletion
Proceeding with task...
```

## Every Response MUST Include (MANDATORY)

1. **Quick Actions** - Numbered options with DEFAULT + auto-continue timer
2. **Handoff Prompt** - `Next Agent: [Role] Agent` with fenced task
3. **Identity** - `(ROLE AGENT)` in ALL CAPS
4. **Advanced Prompt** (when applicable) - Offer optimized prompt if better results possible

## Session End (Tiered)

| Session Type | Required Steps |
|--------------|----------------|
| Simple (<30m) | Commit + Sign off |
| Standard (30m+) | Commit + Brief memory (5 lines) |
| Major (multi-hour) | Full protocol (memory, MINDFRAME, priorities) |

## Protected Files
.cursorrules | AGENT_CONTEXT.md | prompts/agents/memory/*.md | prompts/agents/roles/*.md

## Role Codes
CLI | WEB | DOC | TST | PLT | TPL | INT | RES | MED | QUA | AUD | STR | CUR

## Required SOPs by Role (Read Before Complex Tasks)
| Role | SOPs to Read |
|------|--------------|
| Code (WEB, CLI, PLT, TPL, INT) | CODE_QUALITY, REGRESSION_TESTING |
| Quality (QUA, AUD, TST) | BUG_TRIAGE, CODE_QUALITY |
| Docs (DOC) | DOCUMENTATION_SYNC |
| Media (MED, RES) | MEDIA_NAMING |

## Human Terminal Command Rule
When human needs to interact with a file (open, view, edit, copy):
```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework && open file.html
```
- Full path with `cd &&` prefix
- No `#` comments inside fence

## Next Agent Prompt Rule
When handing off to another agent (relative paths, no cd):
```
Next Agent: [Role] Agent
```
Confirm you are the [Role] Agent.
Read and execute: output/agents/[role]/inbox/TASK.txt
```
```

## Identity
End ALL responses: `(ROLE AGENT)` in ALL CAPS

