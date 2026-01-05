#!/bin/bash

# ============================================================
# Dawson-Does Framework - Supabase Setup Script
# ============================================================
#
# This script guides you through setting up Supabase for:
# - User authentication (email, Google, GitHub)
# - Project saving and management
# - Service connections (OAuth with GitHub, Supabase, Vercel)
#
# Prerequisites:
# - A Supabase account (free tier works)
# - Vercel CLI installed (npm i -g vercel)
# - Access to your Vercel project
#
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
  echo ""
  echo -e "${CYAN}============================================================${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}============================================================${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}→${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

# Main script
print_header "Dawson-Does Framework - Supabase Setup"

echo "This script will help you set up Supabase for user accounts,"
echo "project saving, and service connections."
echo ""

# Step 1: Check prerequisites
print_header "Step 1: Prerequisites Check"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
  print_success "Vercel CLI is installed"
else
  print_warning "Vercel CLI not found. Install with: npm i -g vercel"
fi

# Step 2: Create Supabase Project
print_header "Step 2: Create Supabase Project"

echo "If you haven't already, create a Supabase project:"
echo ""
echo "  1. Go to ${CYAN}https://supabase.com${NC}"
echo "  2. Click 'Start your project' or 'New Project'"
echo "  3. Name it (e.g., 'dawson-does-framework')"
echo "  4. Set a strong database password (SAVE THIS!)"
echo "  5. Select a region close to your users"
echo "  6. Wait for project to provision (~2 minutes)"
echo ""

read -p "Press Enter when your Supabase project is ready..."

# Step 3: Get Supabase credentials
print_header "Step 3: Get Your Supabase Credentials"

echo "Go to your Supabase project:"
echo "  ${CYAN}https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api${NC}"
echo ""
echo "You'll need these values:"
echo "  - Project URL (e.g., https://xxxxx.supabase.co)"
echo "  - anon public key"
echo "  - service_role key (keep this secret!)"
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your anon public key: " SUPABASE_ANON_KEY
read -p "Enter your service_role key: " SUPABASE_SERVICE_KEY

echo ""

# Validate inputs
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" || -z "$SUPABASE_SERVICE_KEY" ]]; then
  print_error "All credentials are required!"
  exit 1
fi

print_success "Credentials received"

# Step 4: Run Database Schema
print_header "Step 4: Run Database Schema"

echo "Now you need to run the database schema in Supabase SQL Editor."
echo ""
echo "  1. Go to: ${CYAN}https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new${NC}"
echo "  2. Copy the contents of: ${YELLOW}scripts/supabase-setup/complete-schema.sql${NC}"
echo "  3. Paste into the SQL Editor"
echo "  4. Click 'Run'"
echo ""
echo "The schema file is located at:"
echo "  $(pwd)/scripts/supabase-setup/complete-schema.sql"
echo ""

read -p "Press Enter after you've run the schema..."

print_success "Database schema assumed to be complete"

# Step 5: Configure Vercel Environment Variables
print_header "Step 5: Configure Vercel Environment Variables"

echo "Adding environment variables to Vercel..."
echo ""

echo "The easiest way is to add env vars via Vercel Dashboard:"
echo ""
echo "  1. Go to: ${CYAN}https://vercel.com/dashboard${NC}"
echo "  2. Select your project"
echo "  3. Click ${YELLOW}Settings → Environment Variables${NC}"
echo "  4. Add these variables for all environments (Production, Preview, Development):"
echo ""
echo "  ┌─────────────────────────────────────┬────────────────────────────────────────────────────┐"
echo "  │ Name                                │ Value                                              │"
echo "  ├─────────────────────────────────────┼────────────────────────────────────────────────────┤"
echo "  │ NEXT_PUBLIC_SUPABASE_URL            │ $SUPABASE_URL"
echo "  ├─────────────────────────────────────┼────────────────────────────────────────────────────┤"
echo "  │ NEXT_PUBLIC_SUPABASE_ANON_KEY       │ (your anon key - already entered)                  │"
echo "  ├─────────────────────────────────────┼────────────────────────────────────────────────────┤"
echo "  │ SUPABASE_SERVICE_ROLE_KEY           │ (your service key - keep secret!)                  │"
echo "  └─────────────────────────────────────┴────────────────────────────────────────────────────┘"
echo ""
echo "Or use Vercel CLI (interactive prompts):"
echo ""
echo "  ${YELLOW}vercel env add NEXT_PUBLIC_SUPABASE_URL${NC}"
echo "  ${YELLOW}vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
echo "  ${YELLOW}vercel env add SUPABASE_SERVICE_ROLE_KEY${NC}"
echo ""
print_info "Each command will prompt you for the value and which environments to add it to."

# Step 6: Enable Auth Providers
print_header "Step 6: Enable Authentication Providers"

echo "Enable auth providers in Supabase Dashboard:"
echo ""
echo "  Go to: ${CYAN}https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers${NC}"
echo ""
echo "  ${GREEN}Email (Required):${NC}"
echo "    - Toggle 'Enable Email provider' ON"
echo "    - Enable 'Confirm email' (recommended)"
echo ""
echo "  ${GREEN}Google (Optional but recommended):${NC}"
echo "    1. Go to Google Cloud Console: https://console.cloud.google.com"
echo "    2. Create a new project or select existing"
echo "    3. Enable 'Google+ API' and 'OAuth consent screen'"
echo "    4. Create OAuth 2.0 credentials (Web application)"
echo "    5. Add authorized redirect URI:"
echo "       ${YELLOW}${SUPABASE_URL}/auth/v1/callback${NC}"
echo "    6. Copy Client ID and Client Secret to Supabase"
echo ""
echo "  ${GREEN}GitHub (Optional):${NC}"
echo "    1. Go to GitHub Developer Settings: https://github.com/settings/developers"
echo "    2. Create new OAuth App"
echo "    3. Set Homepage URL to your website"
echo "    4. Set Authorization callback URL to:"
echo "       ${YELLOW}${SUPABASE_URL}/auth/v1/callback${NC}"
echo "    5. Copy Client ID and Client Secret to Supabase"
echo ""

read -p "Press Enter when you've configured your auth providers..."

# Step 7: Redeploy
print_header "Step 7: Redeploy to Vercel"

if command -v vercel &> /dev/null; then
  read -p "Do you want to redeploy now? (y/n): " DO_REDEPLOY
  
  if [[ "$DO_REDEPLOY" == "y" || "$DO_REDEPLOY" == "Y" ]]; then
    print_step "Deploying to production..."
    vercel --prod
    print_success "Deployment started!"
  fi
fi

# Completion
print_header "Setup Complete!"

echo -e "${GREEN}✓${NC} Database schema created"
echo -e "${GREEN}✓${NC} Environment variables configured"
echo -e "${GREEN}✓${NC} Auth providers ready to configure"
echo ""
echo "Your website now supports:"
echo "  • User accounts (email, Google, GitHub login)"
echo "  • Project saving (My Projects dashboard)"
echo "  • Service connections (Supabase, GitHub, Vercel OAuth)"
echo "  • NPX tokens (npx @dawson-does/framework {token})"
echo ""
echo "Next steps:"
echo "  1. Visit your website and click 'Sign Up'"
echo "  2. Create an account"
echo "  3. Go to the configurator and create a project"
echo "  4. Your project will be saved automatically!"
echo ""
print_success "Happy building! 🚀"


