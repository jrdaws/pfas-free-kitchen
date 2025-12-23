# Vercel Deployment Guide

> Last Updated: 2025-12-23

This guide covers deploying the Dawson Framework website to Vercel.

---

## Prerequisites

- Vercel account with team access
- GitHub repository connected
- Supabase project configured
- Anthropic API key

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI generation | `sk-ant-...` |
| `NEXT_PUBLIC_SITE_URL` | Production site URL | `https://framework.dawson.dev` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | None (uses in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | None |
| `ADMIN_API_KEY` | Admin API access key | None |
| `DAILY_TOKEN_LIMIT` | Daily token budget | `1000000` |
| `MONTHLY_TOKEN_LIMIT` | Monthly token budget | `20000000` |
| `COST_ALERT_THRESHOLD` | Alert at X% of budget | `80` |
| `NEXT_PUBLIC_COLLABORATION_WS` | WebSocket URL for collaboration | None |

### Setting Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope:
   - **Production**: Required for live site
   - **Preview**: Recommended for PR previews
   - **Development**: Optional (use .env.local locally)

---

## Deployment Configuration

### vercel.json

The `website/vercel.json` configures:

- **Regions**: `iad1` (US East) - closest to Supabase
- **Clean URLs**: Removes `.html` extensions
- **Security Headers**: X-Frame-Options, CSP, etc.
- **Function Timeouts**:
  - `/api/generate/project`: 60s (AI generation)
  - `/api/preview/generate`: 30s (preview generation)
  - `/api/projects/[token]/download`: 30s

### next.config.js

Production optimizations:

- `poweredByHeader: false` - Hide Next.js header
- `compress: true` - Enable Brotli/gzip
- `reactStrictMode: true` - Catch React issues
- HSTS header for security
- Bundle fallbacks for client-side

---

## Deployment Steps

### Initial Deployment

1. **Connect Repository**
   ```bash
   # In Vercel dashboard:
   # 1. Import Git Repository
   # 2. Select dawson-does-framework
   # 3. Configure:
   #    - Root Directory: website
   #    - Framework: Next.js
   #    - Build Command: npm run build
   ```

2. **Add Environment Variables**
   - Add all required variables (see table above)
   - Ensure `NEXT_PUBLIC_*` variables are present

3. **Deploy**
   - Click "Deploy"
   - Wait for build (typically 2-3 minutes)

### Subsequent Deployments

Automatic deployment on push to `main` branch.

For manual deployment:
```bash
cd website
npx vercel --prod
```

---

## Domain Configuration

### Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your domain (e.g., `framework.dawson.dev`)
3. Configure DNS:
   - **CNAME**: `framework` → `cname.vercel-dns.com`
   - Or **A Record**: `76.76.21.21`
4. Wait for SSL certificate provisioning (automatic)

### HTTPS Enforcement

Vercel automatically:
- Provisions Let's Encrypt SSL certificates
- Redirects HTTP → HTTPS
- Adds HSTS headers (configured in next.config.js)

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Production build succeeds locally (`npm run build`)
- [ ] Environment variables documented
- [ ] No secrets in code
- [ ] Rate limiting configured (Upstash Redis recommended)

### Post-Deployment

- [ ] Site loads correctly
- [ ] API endpoints responding
- [ ] Supabase connection working
- [ ] AI generation working
- [ ] Rate limiting active
- [ ] Error monitoring configured

---

## Smoke Test Checklist

Run these tests after each production deployment:

### Critical Path Tests

1. **Homepage Load**
   - [ ] Homepage loads in < 3s
   - [ ] No console errors
   - [ ] Styling correct

2. **Configurator Flow**
   - [ ] Navigate to /configure
   - [ ] Template selection works
   - [ ] Integration toggles work
   - [ ] Description input works

3. **AI Generation (with API key)**
   - [ ] Click "Generate Project"
   - [ ] Progress bar shows stages
   - [ ] Generation completes
   - [ ] Download ZIP works

4. **API Health**
   - [ ] `GET /api/health` returns 200
   - [ ] All services show "configured"

5. **Error Handling**
   - [ ] Rate limit shows friendly message
   - [ ] Invalid requests handled gracefully

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shifts

---

## Rollback Procedure

### Automatic Rollback (Recommended)

1. Go to Vercel Dashboard → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"

### Manual Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Emergency Rollback

If dashboard is inaccessible:

```bash
# Force rollback to previous commit
git revert HEAD
git push origin main
```

---

## Monitoring

### Built-in Monitoring

- **Vercel Analytics**: Performance metrics
- **Vercel Functions**: API latency, errors

### Recommended Additions

- **Sentry**: Error tracking
- **PostHog**: User analytics
- **Upstash**: Redis monitoring

### Key Metrics to Watch

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.9% | < 99.5% |
| API Latency (p95) | < 500ms | > 1000ms |
| Error Rate | < 1% | > 5% |
| Token Usage | < budget | > 80% |

---

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Check logs in Vercel dashboard
# Common fixes:
npm install  # Update lockfile
npm run build  # Test locally first
```

**API 500 Errors**
- Check function logs in Vercel
- Verify environment variables
- Check Supabase connection

**Rate Limiting Not Working**
- Ensure Upstash variables are set
- Check Redis connection in logs

**Slow Generation**
- Check Anthropic API status
- Consider model tier selection

### Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## Security Considerations

### API Keys

- Never commit API keys to git
- Use Vercel's encrypted environment variables
- Rotate keys periodically
- Use separate keys for development/production

### Rate Limiting

Production uses Upstash Redis for:
- Per-session rate limits
- Cost control
- Abuse prevention

### Headers

Security headers configured:
- `X-Frame-Options: DENY` (API) / `SAMEORIGIN` (pages)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000`

---

*Documentation Version: 1.0 | Governance Version: 2.2*

