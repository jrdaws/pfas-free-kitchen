#!/bin/bash
# Validate Agent Work
# Runs automated checks to verify an agent followed governance rules
#
# Usage:
#   ./scripts/validate-agent-work.sh           - Run all checks
#   ./scripts/validate-agent-work.sh --strict  - Fail on any warning
#   ./scripts/validate-agent-work.sh --quick   - Skip tests (faster)
#
# Integration Points:
#   - Called by: scripts/agent-lock.sh release
#   - Called by: .github/workflows/governance-check.yml
#   - Called by: scripts/hooks/pre-commit (in CI mode)
#
# Version: 2.0
# Last Updated: 2025-12-22

set -e

STRICT_MODE=false
ERRORS=0
WARNINGS=0

if [ "${1:-}" = "--strict" ]; then
    STRICT_MODE=true
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🔍 AGENT WORK VALIDATION                            "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# Check 1: Protected Files Exist
# ============================================================================
echo "📋 Check 1: Protected Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CRITICAL_FILES=(
    "AGENT_CONTEXT.md"
    "CLAUDE.md"
    ".cursorrules"
    ".protected-files"
    "prompts/agents/UNIVERSAL_BOOTSTRAP.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# ============================================================================
# Check 2: Governance Version Consistency
# ============================================================================
echo "📋 Check 2: Governance Version Consistency"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EXPECTED_VERSION="2.0"
VERSION_FILES=("AGENT_CONTEXT.md" "CLAUDE.md" ".cursorrules")

for file in "${VERSION_FILES[@]}"; do
    if [ -f "$file" ]; then
        VERSION=$(grep -o "Governance Version: [0-9.]*" "$file" 2>/dev/null | head -1 | sed 's/Governance Version: //')
        if [ "$VERSION" = "$EXPECTED_VERSION" ]; then
            echo "   ✅ $file: v$VERSION"
        else
            echo "   ⚠️  $file: v$VERSION (expected v$EXPECTED_VERSION)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done
echo ""

# ============================================================================
# Check 3: No Forbidden Patterns in Recent Changes
# ============================================================================
echo "📋 Check 3: Forbidden Patterns in Staged/Recent Changes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for console.log in .mjs files (should use logger)
CONSOLE_LOGS=$(git diff --cached --name-only -- '*.mjs' 2>/dev/null | xargs grep -l "console\.log" 2>/dev/null || true)
if [ -n "$CONSOLE_LOGS" ]; then
    echo "   ⚠️  console.log found in staged .mjs files (use logger.mjs instead):"
    echo "$CONSOLE_LOGS" | sed 's/^/      /'
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ No console.log in .mjs files"
fi

# Check for .env files being committed
ENV_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E "^\.env" || true)
if [ -n "$ENV_FILES" ]; then
    echo "   ❌ .env files in staged changes:"
    echo "$ENV_FILES" | sed 's/^/      /'
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ No .env files staged"
fi

# Check for deleted protected files
DELETED_PROTECTED=$(git diff --cached --name-only --diff-filter=D 2>/dev/null | grep -E "AGENT_CONTEXT|CLAUDE.md|.cursorrules|_MEMORY.md|_AGENT.md" || true)
if [ -n "$DELETED_PROTECTED" ]; then
    echo "   ❌ Protected files being deleted:"
    echo "$DELETED_PROTECTED" | sed 's/^/      /'
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ No protected files deleted"
fi
echo ""

# ============================================================================
# Check 4: Tests Pass
# ============================================================================
echo "📋 Check 4: Tests"
echo "━━━━━━━━━━━━━━━━"

if npm test --silent 2>/dev/null; then
    echo "   ✅ All tests passing"
else
    echo "   ❌ Tests failing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# Check 5: Memory Files Updated (if session active)
# ============================================================================
echo "📋 Check 5: Memory Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".current-session" ]; then
    SESSION=$(cat .current-session)
    ROLE=$(echo "$SESSION" | cut -d'-' -f1)
    ROLE_UPPER=$(echo "$ROLE" | tr '[:lower:]' '[:upper:]')
    MEMORY_FILE="prompts/agents/memory/${ROLE_UPPER}_MEMORY.md"
    
    if [ -f "$MEMORY_FILE" ]; then
        NOW=$(date +%s)
        MOD_TIME=$(stat -f %m "$MEMORY_FILE" 2>/dev/null || stat -c %Y "$MEMORY_FILE" 2>/dev/null)
        AGE=$(( (NOW - MOD_TIME) / 60 ))
        
        if [ $AGE -lt 60 ]; then
            echo "   ✅ $MEMORY_FILE updated $AGE min ago"
        else
            echo "   ⚠️  $MEMORY_FILE not updated recently ($AGE min)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo "   ℹ️  No active session (skipping memory check)"
fi
echo ""

# ============================================================================
# Check 6: Commit Message Format
# ============================================================================
echo "📋 Check 6: Recent Commit Messages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LAST_COMMIT=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "")
if echo "$LAST_COMMIT" | grep -qE "^(feat|fix|docs|chore|test|refactor)\(.*\):"; then
    echo "   ✅ Last commit follows conventional format"
    echo "      $LAST_COMMIT"
else
    echo "   ⚠️  Last commit doesn't follow conventional format:"
    echo "      $LAST_COMMIT"
    echo "      Expected: <type>(<scope>): <description>"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           📊 VALIDATION SUMMARY                               "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "   Errors:   $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ VALIDATION FAILED - $ERRORS error(s) found"
    echo ""
    echo "   Agent work should NOT be accepted until errors are fixed."
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ] && [ "$STRICT_MODE" = true ]; then
    echo "⚠️  VALIDATION FAILED (strict mode) - $WARNINGS warning(s)"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  VALIDATION PASSED with $WARNINGS warning(s)"
    echo ""
    echo "   Consider fixing warnings before accepting."
    echo ""
    exit 0
else
    echo "✅ VALIDATION PASSED - All checks OK"
    echo ""
    exit 0
fi

