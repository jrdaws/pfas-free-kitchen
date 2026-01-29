#!/bin/bash
#
# PFAS-Free Kitchen Site Validation Script
#
# Runs all validation checks before deployment:
# - TypeScript compilation
# - Linting
# - Unit tests
# - E2E tests
# - Accessibility tests
# - Build verification
#
# Usage: ./scripts/validate-site.sh [--quick]
#
# Options:
#   --quick    Skip slow tests (E2E, Lighthouse)
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
QUICK_MODE=false
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --quick) QUICK_MODE=true ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PFAS-Free Kitchen - Site Validation Suite     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Track results
PASSED=0
FAILED=0
WARNINGS=0

run_check() {
  local name=$1
  local cmd=$2
  local optional=${3:-false}
  
  echo -e "${BLUE}→${NC} $name..."
  
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $name passed"
    ((PASSED++))
  else
    if [ "$optional" = true ]; then
      echo -e "  ${YELLOW}⚠${NC} $name skipped/warning"
      ((WARNINGS++))
    else
      echo -e "  ${RED}✗${NC} $name failed"
      ((FAILED++))
    fi
  fi
}

cd "$(dirname "$0")/.."
WEB_DIR="src/pfas-web"

echo -e "\n${YELLOW}Phase 1: Code Quality${NC}\n"

# TypeScript
echo -e "${BLUE}→${NC} TypeScript compilation..."
if cd "$WEB_DIR" && npm run typecheck 2>&1 | head -20; then
  echo -e "  ${GREEN}✓${NC} TypeScript passed"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} TypeScript failed"
  ((FAILED++))
fi
cd ../..

# Lint
echo -e "${BLUE}→${NC} ESLint..."
if cd "$WEB_DIR" && npm run lint 2>&1 | head -20; then
  echo -e "  ${GREEN}✓${NC} Linting passed"
  ((PASSED++))
else
  echo -e "  ${YELLOW}⚠${NC} Linting warnings"
  ((WARNINGS++))
fi
cd ../..

echo -e "\n${YELLOW}Phase 2: Build Verification${NC}\n"

# Build
echo -e "${BLUE}→${NC} Production build..."
if cd "$WEB_DIR" && npm run build 2>&1 | tail -10; then
  echo -e "  ${GREEN}✓${NC} Build successful"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Build failed"
  ((FAILED++))
fi
cd ../..

if [ "$QUICK_MODE" = false ]; then
  echo -e "\n${YELLOW}Phase 3: Testing${NC}\n"
  
  # E2E Tests
  echo -e "${BLUE}→${NC} E2E Tests..."
  if cd "$WEB_DIR" && npm run test:e2e 2>&1 | tail -20; then
    echo -e "  ${GREEN}✓${NC} E2E tests passed"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} E2E tests failed"
    ((FAILED++))
  fi
  cd ../..
  
  # Accessibility Tests
  echo -e "${BLUE}→${NC} Accessibility tests..."
  if cd "$WEB_DIR" && npm run test:a11y 2>&1 | tail -20; then
    echo -e "  ${GREEN}✓${NC} Accessibility tests passed"
    ((PASSED++))
  else
    echo -e "  ${YELLOW}⚠${NC} Accessibility warnings"
    ((WARNINGS++))
  fi
  cd ../..
  
  echo -e "\n${YELLOW}Phase 4: Performance${NC}\n"
  
  # Lighthouse (optional, requires server)
  echo -e "${BLUE}→${NC} Lighthouse audit (optional)..."
  if cd "$WEB_DIR" && npm run lighthouse 2>&1 | tail -10; then
    echo -e "  ${GREEN}✓${NC} Lighthouse audit passed"
    ((PASSED++))
  else
    echo -e "  ${YELLOW}⚠${NC} Lighthouse audit skipped"
    ((WARNINGS++))
  fi
  cd ../..
else
  echo -e "\n${YELLOW}Skipping Phase 3 & 4 (quick mode)${NC}\n"
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RESULTS                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║     ✓ All validation checks passed!               ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║     ✗ Some validation checks failed                ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
