# Production Deployment Guide

> Complete guide for deploying the Dawson-Does Framework website to production.

---

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Vercel account (or alternative hosting provider)
- [ ] Anthropic API key for AI generation
- [ ] Supabase project for database/auth
- [ ] Upstash Redis for rate limiting
- [ ] Error monitoring service (Sentry recommended)

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | AI project generation | [Anthropic Console](https://console.anthropic.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard > Settings > API |

### Rate Limiting (Recommended)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | [Upstash Console](https://console.upstash.com/) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Upstash Console |

### Cost Control (Recommended)

| Variable | Description | Default |
|----------|-------------|---------|
| `DAILY_TOKEN_LIMIT` | Max tokens per day (all users) | `1000000` (1M) |
| `MONTHLY_TOKEN_LIMIT` | Max tokens per month | `20000000` (20M) |
| `DEMO_RATE_LIMIT` | Requests per session (no API key) | `5` |
| `COST_ALERT_THRESHOLD` | Alert at this % of limit | `80` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3000` |
| `NEXT_PUBLIC_COLLABORATION_WS` | WebSocket server URL | `ws://localhost:1234` |
| `NODE_ENV` | Environment mode | `development` |
| `SENTRY_DSN` | Sentry error tracking | - |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | - |

---

## Deployment Steps

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from website directory)
cd website
vercel

# For production
vercel --prod
```

### 2. Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to Settings > Environment Variables
4. Add each variable from the table above

**Security note**: Mark sensitive variables as "Sensitive" in Vercel to hide them from logs.

### 3. Supabase Setup

Run these SQL migrations in Supabase SQL Editor:

```sql
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template VARCHAR(100),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_projects_token ON projects(token);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_projects_expires ON projects(expires_at);

-- RLS policies (optional but recommended)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to projects
CREATE POLICY "Allow anonymous read" ON projects
  FOR SELECT TO anon USING (expires_at > NOW());

-- Allow anonymous insert
CREATE POLICY "Allow anonymous insert" ON projects
  FOR INSERT TO anon WITH CHECK (true);
```

### 4. Upstash Redis Setup

1. Create account at [Upstash](https://upstash.com/)
2. Create new Redis database (select region closest to Vercel deployment)
3. Copy REST URL and Token to environment variables
4. Enable "Eviction" for automatic cleanup

---

## Rate Limiting Configuration

The framework includes built-in rate limiting:

### Demo Mode (No API Key)
- 5 requests per 24 hours per session
- Tracked via Redis (or in-memory fallback)
- Encourages users to add their own API key

### User API Key Mode
- Unlimited requests (uses user's credits)
- Bypasses demo rate limiting
- Cost tracked in user's Anthropic dashboard

### Customizing Limits

Edit `website/lib/rate-limiter.ts`:

```typescript
const DEMO_RATE_LIMIT = 5;           // Requests per window
const RATE_LIMIT_WINDOW = 24 * 60 * 60; // 24 hours in seconds
```

---

## Cost Monitoring

### Estimated Costs

| Operation | Avg Tokens | Cost (Claude 3.5 Sonnet) |
|-----------|------------|--------------------------|
| Project generation | ~15,000 | ~$0.045 |
| Cached result | 0 | $0.00 |

### Monthly Cost Estimation

| Daily Generations | Monthly Cost (Est.) |
|-------------------|---------------------|
| 100 | ~$135 |
| 500 | ~$675 |
| 1000 | ~$1,350 |

### Cost Controls Built-in

1. **Input length limit**: 10,000 characters max
2. **Result caching**: 30 minute TTL, prevents duplicate API calls
3. **Session rate limiting**: 5 demo requests per 24 hours
4. **Model tier selection**: Users can choose cost/quality tradeoff

### Adding Daily/Monthly Caps

See `website/lib/cost-tracker.ts` for token usage tracking implementation.

---

## Error Monitoring

### Recommended: Sentry

1. Create account at [Sentry.io](https://sentry.io/)
2. Create Next.js project
3. Add environment variables:

```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

4. Install Sentry:

```bash
cd website
npx @sentry/wizard@latest -i nextjs
```

### Alerting Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| Error rate | > 1% of requests | Investigate immediately |
| Response time | > 30s p95 | Check AI API status |
| Rate limit hits | > 50/hour | Consider limit increase |
| Cost | > 80% of budget | Send admin notification |

### Key Errors to Monitor

1. **AI API failures** (429, 500 from Anthropic)
2. **Database connection errors**
3. **Rate limit exceeded events**
4. **Invalid project token lookups**

---

## Security Checklist

- [ ] All API keys stored in environment variables (never in code)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly
- [ ] Supabase RLS policies enabled
- [ ] Sensitive env vars marked as "Sensitive" in Vercel
- [ ] API keys rotated periodically

---

## Health Checks

### Endpoints to Monitor

| Endpoint | Expected | Alert If |
|----------|----------|----------|
| `/api/health` | 200 OK | Non-200 response |
| `/api/generate/project` | 200/429 | 500 errors |
| Supabase connection | Connected | Connection timeout |
| Redis connection | Connected | Fallback mode active |

### Monitoring Commands

```bash
# Check API health
curl https://your-domain.com/api/health

# Check rate limiter status
curl https://your-domain.com/api/rate-limit/status

# Check Redis connectivity (logs)
# Look for: "Redis: true" in generation logs
```

---

## Scaling Considerations

### Current Architecture

- **Stateless API**: Scales horizontally via Vercel
- **Database**: Supabase handles connection pooling
- **Cache**: In-memory (per-instance) + Redis (distributed)
- **Rate Limiting**: Redis-based (distributed)

### Scaling Recommendations

| Traffic Level | Recommendation |
|---------------|----------------|
| < 1000/day | Current setup sufficient |
| 1000-10000/day | Ensure Redis enabled, increase cache TTL |
| > 10000/day | Consider CDN, database optimization |

---

## Rollback Procedure

If deployment issues occur:

```bash
# Via Vercel CLI
vercel rollback

# Or via Dashboard
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "..." > "Promote to Production"
```

---

## Post-Deployment Verification

After deploying, verify:

1. **Homepage loads**: Visit site URL
2. **Project generation works**: Try creating a project
3. **Rate limiting active**: Check Redis connection in logs
4. **Error tracking connected**: Trigger a test error
5. **Database connected**: Save and retrieve a project

---

## Support

- **Issues**: [GitHub Issues](https://github.com/jrdaws/dawson-does-framework/issues)
- **Documentation**: [Framework Docs](https://dawson.dev/docs)
- **Anthropic Status**: [status.anthropic.com](https://status.anthropic.com/)

