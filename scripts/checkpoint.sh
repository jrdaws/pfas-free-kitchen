#!/bin/bash
# scripts/checkpoint.sh - Tiered Checkpoint System v2.0
#
# Usage: ./scripts/checkpoint.sh [tier]
#
# Tiers:
#   light    - Commit + push only (fastest)
#   standard - Test + commit + push + memory prompt (default)
#   full     - All steps + MINDFRAME + SOP scan

set -e

TIER=${1:-standard}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🔄 CHECKPOINT ($TIER tier)                          "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

case $TIER in
  light|l)
    echo "📦 Light checkpoint: commit + push"
    echo ""
    
    git add -A
    if ! git diff --cached --quiet; then
      CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
      echo "   📁 $CHANGED files staged"
      read -p "   Commit message: " MSG
      git commit -m "$MSG"
      
      echo ""
      echo "📤 Pushing..."
      if ./scripts/git-push-safe.sh 2>/dev/null; then
        echo "   ✅ Pushed to origin/main"
      else
        git push origin main 2>/dev/null || echo "   ⚠️ Push failed - try manually"
      fi
    else
      echo "   ℹ️ No changes to commit"
    fi
    
    echo ""
    echo "✅ Light checkpoint complete"
    ;;
    
  standard|s|"")
    echo "📋 Running tests..."
    if npm test > /dev/null 2>&1; then
      TESTS=$(npm test 2>&1 | grep -E "^ℹ tests" | awk '{print $3}' || echo "?")
      echo "   ✅ Tests passing: $TESTS"
    else
      echo "   ❌ Tests failed - fix before checkpoint"
      exit 1
    fi
    
    echo ""
    git add -A
    if ! git diff --cached --quiet; then
      CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
      echo "   📁 $CHANGED files staged"
      read -p "   Commit message: " MSG
      git commit -m "$MSG"
      
      echo ""
      echo "📤 Pushing..."
      if ./scripts/git-push-safe.sh 2>/dev/null; then
        echo "   ✅ Pushed to origin/main"
      else
        git push origin main 2>/dev/null || echo "   ⚠️ Push failed - try manually"
      fi
    else
      echo "   ℹ️ No changes to commit"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 UPDATE MEMORY (5 lines max):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   Add brief session notes to your memory file:"
    echo "   prompts/agents/memory/[ROLE]_MEMORY.md"
    echo ""
    echo "   Template (5 lines max):"
    echo "   - What: [main task completed]"
    echo "   - Files: [key files changed]"
    echo "   - Next: [follow-up if any]"
    echo ""
    echo "✅ Standard checkpoint complete"
    ;;
    
  full|f)
    echo "📋 Running tests..."
    if npm test > /dev/null 2>&1; then
      TESTS=$(npm test 2>&1 | grep -E "^ℹ tests" | awk '{print $3}' || echo "?")
      echo "   ✅ Tests passing: $TESTS"
    else
      echo "   ❌ Tests failed - fix before checkpoint"
      exit 1
    fi
    
    echo ""
    echo "📁 Staged files:"
    git add -A
    git status --short
    
    if ! git diff --cached --quiet; then
      echo ""
      read -p "   Commit message: " MSG
      git commit -m "$MSG"
      COMMIT_HASH=$(git rev-parse --short HEAD)
      echo "   ✅ Committed: $COMMIT_HASH"
      
      echo ""
      echo "📤 Pushing..."
      if ./scripts/git-push-safe.sh 2>/dev/null; then
        echo "   ✅ Pushed to origin/main"
      else
        git push origin main 2>/dev/null || echo "   ⚠️ Push failed - try manually"
      fi
    else
      echo "   ℹ️ No changes to commit"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 FULL CHECKPOINT REQUIREMENTS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1️⃣  UPDATE MEMORY (full 5-category template)"
    echo "    See: prompts/agents/MEMORY_FORMAT.md"
    echo "    File: prompts/agents/memory/[ROLE]_MEMORY.md"
    echo ""
    echo "2️⃣  CERTIFY IN MINDFRAME (if significant work)"
    echo "    ./scripts/certify.sh [CODE] [AREA] [STATUS] [VIBE]"
    echo "    Or manually update: output/shared/MINDFRAME.md"
    echo ""
    echo "3️⃣  SOP SCAN (log opportunities)"
    echo "    File: output/agents/quality/workspace/sop-opportunities.md"
    echo "    Log any new patterns that could become SOPs"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Full checkpoint complete"
    ;;
    
  help|h|--help|-h)
    echo "Usage: ./scripts/checkpoint.sh [tier]"
    echo ""
    echo "Tiers:"
    echo "  light, l     Commit + push only (fastest)"
    echo "  standard, s  Test + commit + push + memory prompt (default)"
    echo "  full, f      All steps + MINDFRAME + SOP scan"
    echo ""
    echo "Aliases:"
    echo "  cp light     → ./scripts/checkpoint.sh light"
    echo "  cp           → ./scripts/checkpoint.sh standard"
    echo "  cp full      → ./scripts/checkpoint.sh full"
    echo ""
    ;;
    
  *)
    echo "❌ Unknown tier: $TIER"
    echo ""
    echo "Usage: ./scripts/checkpoint.sh [light|standard|full]"
    echo ""
    echo "Run './scripts/checkpoint.sh help' for more info"
    exit 1
    ;;
esac
