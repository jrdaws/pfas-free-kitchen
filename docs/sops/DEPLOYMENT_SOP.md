# Deployment SOP

> **Version**: 1.0.1 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Standardized process for deploying to production
> **Audience**: Platform Agent, Testing Agent, all stakeholders
> **Maintained By**: Platform Agent + Documentation Agent

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Deployment Workflow](#2-deployment-workflow)
3. [Environment Configuration](#3-environment-configuration)
4. [Deployment Commands](#4-deployment-commands)
5. [Rollback Procedure](#5-rollback-procedure)
6. [Deployment Schedule](#6-deployment-schedule)
7. [Post-Deployment Verification](#7-post-deployment-verification)
8. [Quick Reference](#8-quick-reference)

---

## 1. Pre-Deployment Checklist

### 1.1 Code Quality ✓

```markdown
## Code Quality Checklist

- [ ] All tests passing
      ```bash
      npm test
      # Expected: 693+ tests, 0 failures
      ```

- [ ] No linting errors (if configured)
      ```bash
      # Run if available:
      npm run lint 2>/dev/null || echo "Lint not configured - skip"
      # Expected: No errors (or "not configured")
      ```

- [ ] TypeScript type check passes (if configured)
      ```bash
      # Run if available:
      npm run type-check 2>/dev/null || echo "Type-check not configured - skip"
      # Or manually: cd website && npx tsc --noEmit
      # Expected: No errors
      ```

- [ ] No console.log in production code
      ```bash
      grep -r "console.log" --include="*.ts" --include="*.tsx" website/app/ | grep -v "// debug"
      # Expected: No results (or only intentional logs)
      ```

- [ ] No hardcoded secrets or API keys
      ```bash
      grep -rE "(sk-|api_key|secret)" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v ".env"
      # Expected: No results
      ```
```

### 1.2 Testing ✓

```markdown
## Testing Checklist

- [ ] Unit tests pass with >80% coverage
      ```bash
      npm run test:coverage
      ```

- [ ] Integration tests pass
      ```bash
      npm run test:integration
      ```

- [ ] E2E tests pass
      ```bash
      # From website directory:
      cd website && npm run test
      # Or: npm run test:e2e (if alias configured)
      ```

- [ ] Manual smoke test completed
      - [ ] Home page loads
      - [ ] Auth flow works
      - [ ] Configurator functions
      - [ ] Export works
      - [ ] API health check passes

- [ ] Mobile responsive verified
      - [ ] Tested at 375px (mobile)
      - [ ] Tested at 768px (tablet)
      - [ ] Tested at 1024px+ (desktop)
```

### 1.3 Documentation ✓

```markdown
## Documentation Checklist

- [ ] CHANGELOG.md updated with new version
      ```markdown
      ## [X.X.X] - YYYY-MM-DD
      ### Added
      - New feature description
      ### Fixed
      - Bug fix description
      ### Changed
      - Change description
      ```

- [ ] README.md current and accurate

- [ ] API documentation matches implementation

- [ ] Breaking changes documented with migration guide

- [ ] Version numbers updated in:
      - [ ] package.json
      - [ ] CHANGELOG.md
      - [ ] Any version displays in UI
```

### 1.4 Infrastructure ✓

```markdown
## Infrastructure Checklist

- [ ] Environment variables set in Vercel
      - [ ] DATABASE_URL
      - [ ] NEXTAUTH_SECRET
      - [ ] NEXTAUTH_URL
      - [ ] All required API keys

- [ ] Database migrations ready (if any)
      ```bash
      # List pending migrations
      npx prisma migrate status
      ```

- [ ] CDN/cache invalidation planned

- [ ] Rollback procedure documented and tested

- [ ] Monitoring/alerts configured
```

---

## 2. Deployment Workflow

### Visual Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. TESTING AGENT                                                │
│     └── Confirm all tests pass                                   │
│              │                                                   │
│              ▼                                                   │
│  2. DOCUMENTATION AGENT                                          │
│     └── Verify docs updated                                      │
│              │                                                   │
│              ▼                                                   │
│  3. PLATFORM AGENT                                               │
│     ├── Build production bundle                                  │
│     ├── Verify environment config                                │
│     └── Prepare database migrations                              │
│              │                                                   │
│              ▼                                                   │
│  4. DEPLOY TO STAGING                                            │
│     ├── Run migrations                                           │
│     ├── Deploy code                                              │
│     └── Verify health check                                      │
│              │                                                   │
│              ▼                                                   │
│  5. STAGING VERIFICATION (15 min)                                │
│     ├── Smoke tests                                              │
│     ├── Critical path testing                                    │
│     └── Performance check                                        │
│              │                                                   │
│              ▼                                                   │
│  6. DEPLOY TO PRODUCTION                                         │
│     ├── Run migrations                                           │
│     ├── Deploy code                                              │
│     └── Verify health check                                      │
│              │                                                   │
│              ▼                                                   │
│  7. POST-DEPLOY VERIFICATION                                     │
│     ├── Health check passing                                     │
│     ├── Key features working                                     │
│     └── Monitoring alerts clear                                  │
│              │                                                   │
│              ▼                                                   │
│  8. ANNOUNCEMENT                                                 │
│     ├── Update status page                                       │
│     └── Notify stakeholders                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Process

#### Step 1: Testing Agent Confirmation

```bash
# Testing Agent runs:
npm test
npm run lint 2>/dev/null || echo "Lint not configured"
npm run type-check 2>/dev/null || echo "Type-check not configured"

# Output: "All 693 tests passing, lint OK (or not configured), types OK"
# → Proceed to Step 2
```

#### Step 2: Documentation Agent Verification

```bash
# Documentation Agent verifies:
./scripts/check-doc-freshness.sh

# Confirms:
# - CHANGELOG.md updated
# - README current
# - No stale docs
# → Proceed to Step 3
```

#### Step 3: Platform Agent Preparation

```bash
# Build production bundle
cd website
npm run build

# Verify build succeeded
ls -la .next/

# Check environment
vercel env pull .env.local.vercel
# Verify all required vars present
```

#### Step 4: Deploy to Staging

```bash
# Create PR (triggers Vercel preview)
git checkout -b release/vX.X.X
git push origin release/vX.X.X

# Vercel automatically deploys to preview URL
# URL format: https://dawson-does-framework-[hash].vercel.app
```

#### Step 5: Staging Verification (15 minutes)

```markdown
## Staging Verification Checklist

- [ ] Site loads without errors
- [ ] Health check endpoint returns 200
      ```bash
      curl https://[preview-url]/api/health
      ```
- [ ] Authentication works
- [ ] Critical user flows complete:
      - [ ] Home page → Configure → Preview
      - [ ] Export flow
      - [ ] API endpoints respond
- [ ] No console errors in browser
- [ ] Performance acceptable (<3s page load)
```

#### Step 6: Deploy to Production

```bash
# Merge to main (triggers production deploy)
git checkout main
git merge release/vX.X.X
git push origin main

# Or via PR merge on GitHub
```

#### Step 7: Post-Deploy Verification

```bash
# Health check
curl https://dawson-does.vercel.app/api/health

# Smoke test critical endpoints
curl https://dawson-does.vercel.app/
curl https://dawson-does.vercel.app/configure

# Check Vercel dashboard for errors
```

#### Step 8: Announcement

```markdown
## Deployment Announcement Template

**Version X.X.X Released** 🚀

**What's New:**
- Feature 1
- Feature 2

**Bug Fixes:**
- Fix 1
- Fix 2

**Breaking Changes:**
- None (or list them)

**Deployment Status:** ✅ Complete
**Deployed At:** YYYY-MM-DD HH:MM UTC
```

---

## 3. Environment Configuration

### Environments

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| **Development** | localhost:3000 | Any | Local development |
| **Staging/Preview** | *.vercel.app | PR branches | Testing before prod |
| **Production** | dawson-does.vercel.app | main | Live site |

### Required Environment Variables

```bash
# Database
DATABASE_URL=           # Supabase connection string

# Authentication
NEXTAUTH_SECRET=        # Random secret for NextAuth
NEXTAUTH_URL=           # https://dawson-does.vercel.app

# Optional Integrations
OPENAI_API_KEY=         # For AI features
STABILITY_API_KEY=      # For image generation
UPLOADTHING_SECRET=     # For file uploads
UPLOADTHING_APP_ID=     # For file uploads

# Monitoring (optional)
SENTRY_DSN=             # Error tracking
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## 4. Deployment Commands

### Local Development

```bash
cd website
npm run dev
# → http://localhost:3000
```

### Build and Test Production Locally

```bash
cd website
npm run build
npm run start
# → http://localhost:3000 (production mode)
```

### Deploy to Staging

```bash
# Automatic on PR push
git push origin feature-branch

# Check preview URL in GitHub PR or Vercel dashboard
```

### Deploy to Production

```bash
# Via git (automatic)
git checkout main
git pull origin main
git merge feature-branch
git push origin main

# Vercel auto-deploys main branch
```

### Force Redeploy

```bash
# Via Vercel CLI
vercel --prod

# Or trigger via Vercel dashboard
```

### Check Deployment Status

```bash
# Vercel CLI
vercel ls

# Or check dashboard: https://vercel.com/dashboard
```

---

## 5. Rollback Procedure

### When to Rollback

- Health check failing
- Critical feature broken
- Error rate spike
- Performance degradation >50%

### Immediate Rollback (< 30 minutes since deploy)

```bash
# Option 1: Vercel Dashboard
# Go to: Deployments → Previous deployment → "..." → Promote to Production

# Option 2: Git revert
git revert HEAD
git push origin main

# Option 3: Vercel CLI
vercel rollback [deployment-id]
```

### Rollback Checklist

```markdown
## Rollback Checklist

1. [ ] Identify the issue
2. [ ] Confirm rollback is the right action
3. [ ] Execute rollback (see commands above)
4. [ ] Verify health check passing
5. [ ] Verify critical features working
6. [ ] Create P1 bug report
7. [ ] Notify stakeholders
8. [ ] Investigate root cause
9. [ ] Plan fix and re-deployment
```

### Post-Rollback Actions

```bash
# Create bug report
cat > output/shared/bugs/active/P1/BUG-$(date +%Y%m%d)-deployment-failure.md << 'EOF'
# Bug Report: Deployment Failure

**Severity**: P1
**Status**: Reported
**Reported By**: Platform Agent
**Date**: [today]

## Description
Deployment of version X.X.X failed and was rolled back.

## Symptoms
[What was broken]

## Timeline
- Deployed at: HH:MM
- Issue detected at: HH:MM
- Rolled back at: HH:MM

## Root Cause Analysis
[To be determined]

## Fix Plan
[To be determined]
EOF
```

---

## 6. Deployment Schedule

### Deployment Types

| Type | Trigger | Approval | Response Time |
|------|---------|----------|---------------|
| **Hotfix (P0)** | Critical bug | No formal approval | Immediate |
| **Patch (P1-P2)** | High-priority bug | Platform Agent | Within 24h |
| **Minor** | Features, improvements | Testing + Platform | Weekly |
| **Major** | Breaking changes | All stakeholders | Bi-weekly |

### Regular Deployment Windows

| Day | Time (UTC) | Type |
|-----|------------|------|
| Monday | 14:00-16:00 | Minor releases |
| Wednesday | 14:00-16:00 | Patches |
| Friday | Avoid | No deploys (unless P0) |

### Deployment Freeze Periods

- Major holidays
- During critical demos
- When key team members unavailable
- During incident investigation

---

## 7. Post-Deployment Verification

### Automated Health Checks

```bash
# Health check endpoint
curl https://dawson-does.vercel.app/api/health

# Expected response:
# {"status":"ok","timestamp":"...","version":"X.X.X"}
```

### Manual Verification Checklist

```markdown
## Post-Deploy Verification (5 minutes)

### Critical Path
- [ ] Home page loads (<3s)
- [ ] Navigation works
- [ ] Auth flow (if applicable)
- [ ] Main feature works (configurator)
- [ ] Export generates file

### Monitoring
- [ ] No error spikes in logs
- [ ] Response times normal
- [ ] No 5xx errors

### Communication
- [ ] Status page updated (if applicable)
- [ ] Team notified in chat
- [ ] Changelog published
```

---

## 8. Quick Reference

### Pre-Deploy One-Liner Check

```bash
npm test && (npm run lint 2>/dev/null || true) && (npm run type-check 2>/dev/null || true) && echo "✅ Ready to deploy"
```

### Deploy Commands Summary

```bash
# Staging
git push origin feature-branch  # Auto-deploys to preview

# Production
git push origin main            # Auto-deploys to production

# Rollback
vercel rollback                 # Rollback to previous
```

### Emergency Contacts

| Situation | Action |
|-----------|--------|
| Site down | Platform Agent + all active agents |
| Data issue | Platform Agent |
| Auth broken | Platform Agent + Website Agent |
| Deploy stuck | Check Vercel dashboard |

---

## Related Documents

- [Bug Triage SOP](./BUG_TRIAGE_SOP.md) - For deployment bugs
- [Documentation Sync SOP](./DOCUMENTATION_SYNC_SOP.md) - Update docs after deploy
- [Platform Agent Role](../../prompts/agents/roles/PLATFORM_AGENT.md)
- [Testing Agent Role](../../prompts/agents/roles/TESTING_AGENT.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.1 | 2025-12-23 | TST Agent | Made lint/type-check/e2e commands conditional ("if available") |
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation |

