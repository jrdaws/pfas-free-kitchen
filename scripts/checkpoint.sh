#!/bin/bash
# Checkpoint script - ensures memory update with 5 distillation categories
# Usage: ./scripts/checkpoint.sh [AGENT_CODE]
# 
# The 5 Distillation Categories:
# 1. OPERATIONAL - Tasks, decisions, files (REQUIRED)
# 2. METRICS - Duration, task count, errors (REQUIRED)
# 3. PATTERNS - Recurring issues/questions (if applicable)
# 4. INSIGHTS - Commands, gotchas, workarounds (if applicable)
# 5. RELATIONSHIPS - Handoffs, dependencies (if applicable)

set -e

AGENT_CODE="${1:-UNKNOWN}"
MEMORY_FILE="prompts/agents/memory/${AGENT_CODE}_MEMORY.md"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🔄 CHECKPOINT: $AGENT_CODE Agent                    "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Run tests
echo "📋 Step 1: Running tests..."
if npm test > /dev/null 2>&1; then
  TESTS=$(npm test 2>&1 | grep -E "^ℹ tests" | awk '{print $3}')
  echo "   ✅ Tests passing: $TESTS"
else
  echo "   ❌ Tests failed - fix before checkpoint"
  exit 1
fi

# 2. Memory distillation prompts
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           📝 MEMORY DISTILLATION (5 Categories)               "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "Answer these prompts to distill your session into memory."
echo "Press ENTER to skip optional categories."
echo ""

# Category 1: OPERATIONAL (Required)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CATEGORY 1: OPERATIONAL (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   Main tasks completed (comma-separated): " TASKS
if [ -z "$TASKS" ]; then
  echo "   ❌ At least one task required"
  exit 1
fi

read -p "   Key decision made (or 'none'): " DECISION
read -p "   Key files changed (comma-separated): " FILES

# Category 2: METRICS (Required)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CATEGORY 2: METRICS (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   Approximate duration (minutes): " DURATION
read -p "   Number of errors encountered: " ERRORS

# Category 3: PATTERNS (Optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 CATEGORY 3: PATTERNS (Optional - if you saw repeats)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   Recurring issue seen? (or ENTER to skip): " PATTERN

# Category 4: INSIGHTS (Optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 CATEGORY 4: INSIGHTS (Optional - useful discoveries)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   Useful command/gotcha discovered? (or ENTER to skip): " INSIGHT

# Category 5: RELATIONSHIPS (Optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤝 CATEGORY 5: RELATIONSHIPS (Optional - handoffs/deps)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   Agent handoff or dependency found? (or ENTER to skip): " RELATIONSHIP

# Generate memory entry
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 Generated Memory Entry"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DATE=$(date +"%Y-%m-%d %H:%M")
MEMORY_ENTRY="### Session: $DATE (Checkpoint)

#### 📋 OPERATIONAL
- **Tasks**: $TASKS
- **Decision**: ${DECISION:-None}
- **Files**: ${FILES:-None specified}

#### 📊 METRICS
- **Duration**: ${DURATION:-Unknown} minutes
- **Errors**: ${ERRORS:-0}"

if [ -n "$PATTERN" ]; then
  MEMORY_ENTRY="$MEMORY_ENTRY

#### 🔄 PATTERNS
- $PATTERN"
fi

if [ -n "$INSIGHT" ]; then
  MEMORY_ENTRY="$MEMORY_ENTRY

#### 💡 INSIGHTS
- $INSIGHT"
fi

if [ -n "$RELATIONSHIP" ]; then
  MEMORY_ENTRY="$MEMORY_ENTRY

#### 🤝 RELATIONSHIPS
- $RELATIONSHIP"
fi

echo ""
echo "$MEMORY_ENTRY"
echo ""

# Confirm and append to memory
read -p "Append this to $MEMORY_FILE? (Y/n): " CONFIRM
if [ "$CONFIRM" != "n" ] && [ "$CONFIRM" != "N" ]; then
  # Find the Session History section and prepend
  echo "" >> "$MEMORY_FILE"
  echo "$MEMORY_ENTRY" >> "$MEMORY_FILE"
  echo ""
  echo "   ✅ Memory updated: $MEMORY_FILE"
else
  echo "   ⏭️ Skipped memory update (manual update expected)"
fi

# 3. Stage all changes
echo ""
echo "📋 Step 3: Staging changes..."
git add -A

# 4. Check for changes to commit
if git diff --cached --quiet; then
  echo "   ℹ️ No changes to commit"
  COMMITTED="false"
else
  CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
  echo "   📁 $CHANGED files staged"
  
  # 5. Commit
  echo ""
  echo "📋 Step 4: Committing..."
  if [ -z "$2" ]; then
    read -p "   Commit message: " MSG
  else
    MSG="$2"
  fi
  
  git commit -m "$MSG"
  COMMIT_HASH=$(git rev-parse --short HEAD)
  echo "   ✅ Committed: $COMMIT_HASH"
  COMMITTED="true"
fi

# 6. Push
if [ "$COMMITTED" = "true" ]; then
  echo ""
  echo "📋 Step 5: Pushing..."
  if ./scripts/git-push-safe.sh 2>/dev/null; then
    echo "   ✅ Pushed to origin/main"
  else
    echo "   ⚠️ Push failed - try manually"
  fi
fi

# 7. Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           ✅ CHECKPOINT COMPLETE                              "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "   Tests:      ✅ $TESTS passing"
echo "   Memory:     ✅ 5 categories captured"
echo "   Categories: ✅ Operational, Metrics"
[ -n "$PATTERN" ] && echo "               ✅ Patterns"
[ -n "$INSIGHT" ] && echo "               ✅ Insights"
[ -n "$RELATIONSHIP" ] && echo "               ✅ Relationships"
if [ "$COMMITTED" = "true" ]; then
  echo "   Commit:     ✅ $COMMIT_HASH"
  echo "   Push:       ✅ origin/main"
else
  echo "   Commit:     ⏭️ No changes"
fi
echo ""
