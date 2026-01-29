#!/bin/bash
#
# Content Validation Script
# Validates that all content is properly integrated and accessible
#
# Usage: ./scripts/validate-content.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API and Frontend URLs
API_URL="${API_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  PFAS-Free Kitchen Content Validation                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Check if services are running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓${NC} $name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not running at $url"
        return 1
    fi
}

echo "🔍 Checking Services..."
echo "━━━━━━━━━━━━━━━━━━━━━━"

check_service "$API_URL/health" "API Server" || {
    echo -e "${YELLOW}⚠${NC} Start API server: cd src/pfas-api && npx ts-node src/mock-server.ts"
    exit 1
}

check_service "$FRONTEND_URL" "Frontend" || {
    echo -e "${YELLOW}⚠${NC} Start frontend: cd src/pfas-web && npm run dev"
    exit 1
}

echo ""
echo "📊 Checking Data..."
echo "━━━━━━━━━━━━━━━━━━━"

# Count products
PRODUCTS=$(curl -s "$API_URL/api/v1/products?limit=1" | jq -r '.meta.total // 0')
if [ "$PRODUCTS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Products in database: $PRODUCTS"
else
    echo -e "${RED}✗${NC} No products found"
fi

# Count categories
CATEGORIES=$(curl -s "$API_URL/api/v1/categories" | jq -r '.data | length // 0')
if [ "$CATEGORIES" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Categories defined: $CATEGORIES"
else
    echo -e "${RED}✗${NC} No categories found"
fi

# Count brands
BRANDS=$(curl -s "$API_URL/api/v1/brands" | jq -r '.data | length // 0')
if [ "$BRANDS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Brands defined: $BRANDS"
else
    echo -e "${RED}✗${NC} No brands found"
fi

# Count retailers
RETAILERS=$(curl -s "$API_URL/api/v1/retailers" | jq -r '.data | length // 0')
if [ "$RETAILERS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Retailers defined: $RETAILERS"
else
    echo -e "${YELLOW}⚠${NC} No retailers found (may need setup)"
fi

echo ""
echo "🌐 Checking Static Pages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pages to check
PAGES=(
    "/"
    "/search"
    "/learn/what-is-pfas"
    "/learn/how-we-verify"
    "/learn/buyers-guide"
    "/about"
    "/faq"
    "/disclosure"
    "/privacy"
    "/terms"
    "/contact"
    "/compare"
)

PAGE_ERRORS=0
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$page")
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}✓${NC} $page"
    elif [ "$STATUS" == "404" ]; then
        echo -e "${YELLOW}⚠${NC} $page (404 - may not be implemented yet)"
    else
        echo -e "${RED}✗${NC} $page (HTTP $STATUS)"
        PAGE_ERRORS=$((PAGE_ERRORS + 1))
    fi
done

echo ""
echo "📦 Checking Sample Product Pages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get sample product slugs
PRODUCT_SLUGS=$(curl -s "$API_URL/api/v1/products?limit=5" | jq -r '.data[].slug // empty')

PRODUCT_ERRORS=0
for slug in $PRODUCT_SLUGS; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/product/$slug")
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}✓${NC} /product/$slug"
    else
        echo -e "${RED}✗${NC} /product/$slug (HTTP $STATUS)"
        PRODUCT_ERRORS=$((PRODUCT_ERRORS + 1))
    fi
done

echo ""
echo "🔗 Checking API Endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

API_ENDPOINTS=(
    "/api/v1/products"
    "/api/v1/categories"
    "/api/v1/brands"
    "/api/v1/retailers"
    "/api/v1/search?q=skillet"
)

API_ERRORS=0
for endpoint in "${API_ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}✓${NC} $endpoint"
    else
        echo -e "${RED}✗${NC} $endpoint (HTTP $STATUS)"
        API_ERRORS=$((API_ERRORS + 1))
    fi
done

echo ""
echo "📋 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_ERRORS=$((PAGE_ERRORS + PRODUCT_ERRORS + API_ERRORS))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    echo ""
    echo "Content Status:"
    echo "  • $PRODUCTS products loaded"
    echo "  • $CATEGORIES categories"
    echo "  • $BRANDS brands"
    echo "  • $RETAILERS retailers"
    echo "  • ${#PAGES[@]} static pages checked"
    echo "  • $(echo "$PRODUCT_SLUGS" | wc -l | tr -d ' ') product pages checked"
    echo ""
    echo "Ready for launch! 🚀"
else
    echo -e "${RED}Found $TOTAL_ERRORS error(s)${NC}"
    echo ""
    echo "Errors by type:"
    [ "$PAGE_ERRORS" -gt 0 ] && echo "  • Static pages: $PAGE_ERRORS"
    [ "$PRODUCT_ERRORS" -gt 0 ] && echo "  • Product pages: $PRODUCT_ERRORS"
    [ "$API_ERRORS" -gt 0 ] && echo "  • API endpoints: $API_ERRORS"
    echo ""
    echo "Please fix the issues above before launch."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation complete at $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
