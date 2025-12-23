# Error Monitoring Setup Guide

> Configure error tracking and alerting for production deployment.

---

## Recommended Solution: Sentry

Sentry is the recommended error monitoring solution for the Dawson-Does Framework because:
- First-class Next.js support
- Automatic source map upload
- Real-time alerting
- Performance monitoring
- Session replay

### Quick Setup

```bash
cd website
npx @sentry/wizard@latest -i nextjs
```

This wizard will:
1. Create `sentry.client.config.ts` and `sentry.server.config.ts`
2. Update `next.config.js` with Sentry webpack plugin
3. Add required environment variables

### Manual Setup

1. **Install packages:**

```bash
npm install @sentry/nextjs
```

2. **Create configuration files:**

`sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions for performance
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

`sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

3. **Add environment variables:**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=dawson-does
```

---

## Alerting Configuration

### Critical Alerts (Immediate)

| Condition | Action | Threshold |
|-----------|--------|-----------|
| Error rate spike | Page on-call | > 5% of requests |
| API 5xx errors | Slack + Email | > 10/minute |
| Anthropic API down | Slack + Email | Any 5xx from Anthropic |
| Database unreachable | Page on-call | Any connection failure |

### Warning Alerts

| Condition | Action | Threshold |
|-----------|--------|-----------|
| High response time | Slack | p95 > 30 seconds |
| Rate limit hits | Slack | > 100/hour |
| Cost threshold | Email | > 80% of daily limit |
| Memory usage | Slack | > 85% |

### Sentry Alert Rules

Create these alert rules in Sentry:

1. **High Error Rate:**
   - Trigger: Error count > 50 in 1 hour
   - Action: Notify Slack channel
   
2. **New Error Type:**
   - Trigger: First occurrence of new issue
   - Action: Create Slack thread
   
3. **AI Generation Failure:**
   - Trigger: Tag `operation:project_generation` with error
   - Action: Email + Slack

---

## Key Errors to Monitor

### AI Generation Errors

```typescript
// These errors indicate AI service issues
{
  tag: "operation:project_generation",
  codes: [
    "ANTHROPIC_429", // Rate limited by Anthropic
    "ANTHROPIC_500", // Anthropic server error
    "ANTHROPIC_401", // Invalid API key
    "GENERATION_TIMEOUT", // Request took too long
  ]
}
```

### Database Errors

```typescript
// Supabase connection issues
{
  tag: "service:supabase",
  codes: [
    "PGRST301", // Connection timeout
    "PGRST502", // Database unavailable
    "PGRST503", // Service unavailable
  ]
}
```

### Rate Limiting Events

```typescript
// Track rate limit patterns
{
  tag: "operation:rate_limit",
  events: [
    "rate_limit_exceeded",
    "cost_limit_exceeded",
    "redis_fallback", // Using in-memory instead of Redis
  ]
}
```

---

## Health Endpoint Integration

The framework includes a health check endpoint at `/api/health`:

```bash
# Check health status
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "api": { "status": "up" },
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "anthropic": { "status": "up" },
    "costTracking": { "status": "up" }
  },
  "timestamp": "2024-01-15T12:00:00.000Z",
  "responseTimeMs": 45
}
```

### Uptime Monitoring

Configure external uptime monitoring to hit `/api/health`:

**Recommended services:**
- [UptimeRobot](https://uptimerobot.com/) (free tier available)
- [Better Uptime](https://betteruptime.com/)
- [Pingdom](https://www.pingdom.com/)

**Configuration:**
- Check interval: 1 minute
- Alert if: Status code != 200 or response > 30s
- Alert channels: Email, Slack, PagerDuty

---

## Usage Monitoring

### Admin Dashboard Endpoint

Access usage statistics at `/api/admin/usage`:

```bash
# With admin key
curl -H "x-admin-key: your-admin-key" \
  https://your-domain.com/api/admin/usage
```

Response:
```json
{
  "success": true,
  "stats": {
    "daily": {
      "used": 150000,
      "limit": 1000000,
      "remaining": 850000,
      "percentUsed": 15
    },
    "monthly": {
      "used": 2500000,
      "limit": 20000000,
      "remaining": 17500000,
      "percentUsed": 12
    }
  },
  "tracking": "redis",
  "estimatedMonthlyCost": "$7.50"
}
```

### Setting Up Admin Access

Add to environment variables:
```bash
ADMIN_API_KEY=your-secure-random-key
```

---

## Log Aggregation

### Vercel Logs

Vercel provides built-in log aggregation. Access via:
- Vercel Dashboard > Project > Logs
- Real-time log streaming
- Searchable by time range

### Custom Logging Format

The framework uses structured logging:

```typescript
// Success log
console.log(`[Project Generated] ${projectName} | ${duration}ms | Template: ${template}`);

// Error log  
console.error(`[Project Generation Error] ${duration}ms`, error);

// Alert log
console.warn(`[Cost Alert] Daily usage at ${percent}% (${tokens} tokens)`);
```

### Log Search Patterns

| Pattern | Meaning |
|---------|---------|
| `[Project Generated]` | Successful generation |
| `[Project Generation Error]` | Failed generation |
| `[Cost Alert]` | Approaching usage limits |
| `[Cost Limit]` | Request blocked by cost limit |
| `Redis: false` | Using in-memory fallback |

---

## Runbook: Common Issues

### Issue: High Error Rate

1. Check Sentry for error details
2. Check `/api/health` endpoint
3. Review Anthropic status page
4. Check Vercel function logs
5. If Anthropic issue: Wait for resolution, enable fallback messaging

### Issue: Slow Response Times

1. Check Anthropic API response times
2. Review cache hit rate in logs
3. Check Supabase query performance
4. Consider increasing cache TTL

### Issue: Cost Limit Reached

1. Check `/api/admin/usage` for current stats
2. Increase limits if budget allows:
   ```bash
   DAILY_TOKEN_LIMIT=2000000
   MONTHLY_TOKEN_LIMIT=40000000
   ```
3. Communicate with users about temporary limit
4. Review for potential abuse

### Issue: Rate Limit Abuse

1. Check Redis for session patterns
2. Identify suspicious IPs (if logged)
3. Consider IP-based rate limiting
4. Implement CAPTCHA for repeat offenders

---

## Alternative Monitoring Solutions

### LogRocket

Good for session replay and frontend errors:
```bash
npm install logrocket
```

### Datadog

Enterprise-grade APM:
- Full-stack observability
- Custom dashboards
- AI-powered alerting

### New Relic

Alternative APM solution:
- Distributed tracing
- Browser monitoring
- Infrastructure monitoring

---

## Checklist

Before going live:

- [ ] Sentry SDK installed and configured
- [ ] Environment variables set in Vercel
- [ ] Alert rules configured
- [ ] Uptime monitoring active
- [ ] Admin usage endpoint protected
- [ ] Health endpoint accessible
- [ ] Team notified of alert channels
- [ ] Runbook documented and accessible

