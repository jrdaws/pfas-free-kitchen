# Governance Backup Manifest

**Backup Date**: 2025-12-25
**Recovery Source**: Git commit `269abd2` (pre-optimization)
**Reason**: Recovered original files after token efficiency optimization was run without backup

## Files Recovered

| Original File | Backup File | Original Lines | Current Lines |
|---------------|-------------|----------------|---------------|
| `AGENT_CONTEXT.md` | AGENT_CONTEXT-original.md | 347 | 67 (81% reduced) |
| `.cursorrules` | cursorrules-original.txt | 243 | 80 (67% reduced) |
| `AGENT_POLICIES.md` | AGENT_POLICIES-original.md | 1,389 | ~1,400 (similar) |
| `MINDFRAME.md` | MINDFRAME-original.md | 356 | ~360 (similar) |
| `UNIVERSAL_BOOTSTRAP.md` | UNIVERSAL_BOOTSTRAP-original.md | 302 | 302 (unchanged) |

## What Happened

The token efficiency optimization task was executed before this backup was created.
The files were modified by commit `4f1f675` on 2025-12-25.

These backups were recovered from git history (commit `269abd2` - the last version before optimization).

## Restoration Instructions

To restore any file to pre-optimization state:

```bash
# Restore AGENT_CONTEXT.md
cp docs/archive/governance-v2.3-backup/AGENT_CONTEXT-original.md AGENT_CONTEXT.md

# Restore .cursorrules
cp docs/archive/governance-v2.3-backup/cursorrules-original.txt .cursorrules

# Restore AGENT_POLICIES.md
cp docs/archive/governance-v2.3-backup/AGENT_POLICIES-original.md prompts/agents/AGENT_POLICIES.md

# Restore MINDFRAME.md
cp docs/archive/governance-v2.3-backup/MINDFRAME-original.md output/shared/MINDFRAME.md

# Restore UNIVERSAL_BOOTSTRAP.md
cp docs/archive/governance-v2.3-backup/UNIVERSAL_BOOTSTRAP-original.md prompts/agents/UNIVERSAL_BOOTSTRAP.md
```

To restore ALL files:

```bash
cp docs/archive/governance-v2.3-backup/AGENT_CONTEXT-original.md AGENT_CONTEXT.md
cp docs/archive/governance-v2.3-backup/cursorrules-original.txt .cursorrules
cp docs/archive/governance-v2.3-backup/AGENT_POLICIES-original.md prompts/agents/AGENT_POLICIES.md
cp docs/archive/governance-v2.3-backup/MINDFRAME-original.md output/shared/MINDFRAME.md
cp docs/archive/governance-v2.3-backup/UNIVERSAL_BOOTSTRAP-original.md prompts/agents/UNIVERSAL_BOOTSTRAP.md
echo "✅ All governance files restored to v2.3"
```

## Notes

- CLAUDE.md was already archived separately (before this backup)
- Memory files were NOT part of this recovery (check git log for those if needed)
- The optimized versions are still the current versions - this is just a backup

