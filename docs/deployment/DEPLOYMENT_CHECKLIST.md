# Production Deployment Checklist

> Complete checklist for deploying Dawson-Does Framework website to production.

---

## Pre-Deployment

### Code Readiness

- [ ] All tests passing (`npm test`)
- [ ] No linter errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console.log debugging statements

### Monorepo Verification (CRITICAL)

Run from repo root:

```bash
# 1. Clean build from website directory
cd website && rm -rf .next && npm run build

# 2. Verify workspace package stubs exist
grep -r "from.*@dawson-framework" website/app --include="*.tsx" --include="*.ts" | head -5

# 3. Verify stubs are aliased in webpack
grep "@dawson-framework" website/next.config.js

# 4. Verify husky is CI-safe
grep '"prepare"' package.json | grep "|| true"
```

- [ ] Clean build succeeds
- [ ] All `@dawson-framework/*` imports have stub aliases
- [ ] Husky prepare script includes `|| true`

### Environment Variables

Required:
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (if used)

Rate Limiting:
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

Cost Control:
- [ ] `DAILY_TOKEN_LIMIT` - Daily token cap (default: 1M)
- [ ] `MONTHLY_TOKEN_LIMIT` - Monthly token cap (default: 20M)
- [ ] `COST_ALERT_THRESHOLD` - Alert percentage (default: 80)

Admin/Monitoring:
- [ ] `ADMIN_API_KEY` - Admin endpoints access key
- [ ] `SENTRY_DSN` - Error tracking DSN
- [ ] `NEXT_PUBLIC_SITE_URL` - Public site URL

### Database

- [ ] Projects table created in Supabase
- [ ] RLS policies configured
- [ ] Indexes created for performance

### External Services

- [ ] Anthropic API key active and funded
- [ ] Supabase project running
- [ ] Upstash Redis database created
- [ ] Sentry project configured

---

## Deployment

### Vercel Deployment

```bash
cd website
vercel --prod
```

- [ ] Deployment initiated
- [ ] Build completes without errors
- [ ] Deployment URL accessible

### Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] `/api/health` returns 200 OK
- [ ] Project generation works (test with demo limit)
- [ ] Rate limiting active (check Redis logs)
- [ ] Cost tracking active (check `/api/admin/usage`)
- [ ] Error tracking connected (check Sentry)

---

## Monitoring Setup

### Uptime Monitoring

- [ ] External monitor configured for `/api/health`
- [ ] Alert channel configured (Slack/Email/SMS)
- [ ] Check interval set (1-5 minutes)

### Error Tracking

- [ ] Sentry SDK initialized
- [ ] Source maps uploading
- [ ] Alert rules configured:
  - [ ] High error rate
  - [ ] New error types
  - [ ] AI generation failures

### Usage Monitoring

- [ ] Admin endpoint protected (`ADMIN_API_KEY`)
- [ ] Dashboard/alerts for:
  - [ ] Daily usage percentage
  - [ ] Monthly usage percentage
  - [ ] Cost projections

---

## Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enforced (Vercel default)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] API keys have appropriate scopes
- [ ] Sensitive env vars marked in Vercel

---

## Rollback Plan

If issues occur:

1. **Quick Rollback:**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback:**
   - Go to Vercel Dashboard > Deployments
   - Find last working deployment
   - Click "..." > "Promote to Production"

3. **Feature Flag:**
   - Set `DISABLE_AI_GENERATION=true` to disable expensive operations
   - Displays maintenance message to users

---

## Post-Launch

### First 24 Hours

- [ ] Monitor error rates (target: < 1%)
- [ ] Monitor response times (target: p95 < 30s)
- [ ] Monitor cost usage
- [ ] Check rate limit patterns
- [ ] Review user feedback

### First Week

- [ ] Analyze usage patterns
- [ ] Adjust rate limits if needed
- [ ] Adjust cost limits if needed
- [ ] Document any issues encountered

### Ongoing

- [ ] Weekly usage review
- [ ] Monthly cost analysis
- [ ] Quarterly security review
- [ ] API key rotation (recommended: every 90 days)

---

## Quick Reference

| Service | Dashboard URL |
|---------|---------------|
| Vercel | https://vercel.com/dashboard |
| Supabase | https://supabase.com/dashboard |
| Upstash | https://console.upstash.com/ |
| Anthropic | https://console.anthropic.com/ |
| Sentry | https://sentry.io/ |

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Health check |
| `/api/admin/usage` | Usage stats (admin) |
| `/api/generate/project` | AI project generation |

---

## Emergency Contacts

- **Anthropic Status:** https://status.anthropic.com/
- **Vercel Status:** https://www.vercel-status.com/
- **Supabase Status:** https://status.supabase.com/
- **Upstash Status:** https://status.upstash.com/

