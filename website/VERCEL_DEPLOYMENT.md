# Vercel Deployment Guide

## Overview

This guide covers deploying the dawson-does-framework configurator to Vercel with AI Preview functionality powered by Anthropic's Claude Sonnet 4.

---

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Anthropic API Key** - Get from https://console.anthropic.com
3. **Upstash Redis** (Optional) - For distributed rate limiting: https://upstash.com
4. **GitHub Repository** - Push your code to GitHub

---

## Quick Deploy (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dawson-does-framework)

**Required Environment Variables:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key

**Optional (For Production Rate Limiting):**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST Token

---

## Manual Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy from CLI

```bash
cd website
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your personal account or team
- **Link to existing project?** No (first time) or Yes (updating)
- **Project name?** `dawson-framework-configurator` (or your choice)
- **Directory?** `./` (current directory)
- **Override settings?** No

### 4. Set Environment Variables

**Via CLI:**
```bash
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

# Optional: For production rate limiting
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...`
   - **Environment:** Production, Preview, Development (all)
5. (Optional) Add Upstash Redis variables

### 5. Deploy to Production

```bash
vercel --prod
```

---

## Rate Limiting Architecture

### Current Implementation

**Development (In-Memory):**
- Simple Map-based session tracking
- Works for local development
- Resets on server restart
- ⚠️ **Does NOT work in Vercel serverless**

**Production (Upstash Redis):**
- Distributed session tracking across serverless invocations
- Persistent rate limiting
- Free tier: 10,000 commands/day
- Automatic fallback to per-invocation limits if Redis unavailable

### Option A: Free Tier (No Redis)

**Configuration:**
- Don't add Upstash environment variables
- Rate limiting falls back to per-invocation mode
- Each user gets 5 generations total (not per session)
- Simpler setup, less accurate tracking

**Pros:**
- ✅ Zero additional cost
- ✅ Simple setup
- ✅ No external dependencies

**Cons:**
- ⚠️ Less accurate rate limiting
- ⚠️ Users can bypass by clearing cookies
- ⚠️ No shared state across regions

### Option B: Production Tier (With Redis)

**Setup Upstash Redis:**

1. **Create Account:** https://upstash.com
2. **Create Redis Database:**
   - Select **Global** for multi-region
   - Select **Free** tier (10k commands/day)
3. **Get Credentials:**
   - Copy **UPSTASH_REDIS_REST_URL**
   - Copy **UPSTASH_REDIS_REST_TOKEN**
4. **Add to Vercel:**
   - Paste into environment variables

**Pros:**
- ✅ Accurate distributed rate limiting
- ✅ Persistent session tracking
- ✅ Scalable to multiple regions
- ✅ Free tier available

**Cons:**
- ⚠️ Additional service dependency
- ⚠️ 10k command/day limit on free tier

**Recommended:** Use Redis for production deployments.

---

## Environment Variables Reference

### Required

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `ANTHROPIC_API_KEY` | API key for AI preview generation | `sk-ant-api03-...` | https://console.anthropic.com |

### Optional (Production Rate Limiting)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://us1-...upstash.io` | Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | `AXXXaGciOiJIUzI1...` | Upstash dashboard |

### Optional (Observability)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `VERCEL_ANALYTICS_ID` | Vercel Analytics tracking | Auto-generated | Vercel dashboard |

---

## Cost Management

### Anthropic API Costs

**Model:** claude-sonnet-4-20250514

**Pricing (as of Dec 2024):**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

**Average Preview Generation:**
- Input tokens: ~2,000 (prompt + context)
- Output tokens: ~2,000 (HTML response)
- **Cost per generation:** ~$0.036

**Demo Mode Budget (5 generations per user):**
- 100 users: $18
- 1,000 users: $180
- 10,000 users: $1,800

### Budget Safeguards

**1. Rate Limiting**
- Demo mode: 5 generations per session
- Prevents abuse and runaway costs

**2. Max Tokens Limit**
- Set to 4,096 tokens per response
- Prevents unexpectedly large generations

**3. User API Keys**
- Encourage users to use their own keys
- Zero cost to your project for power users

**4. Monitoring**
- Check Anthropic dashboard regularly
- Set up billing alerts

**5. Upstash Redis Limits**
- Free tier: 10,000 commands/day
- Each rate limit check = 2 commands (GET + SETEX)
- ~5,000 users/day on free tier

---

## Deployment Checklist

### Pre-Deployment

- [ ] Push code to GitHub
- [ ] Get Anthropic API key
- [ ] (Optional) Set up Upstash Redis
- [ ] Review cost estimates
- [ ] Set budget alerts in Anthropic console

### Deployment

- [ ] Create Vercel project
- [ ] Add environment variables
- [ ] Deploy to preview environment first
- [ ] Test preview generation
- [ ] Test rate limiting
- [ ] Test with user API key
- [ ] Deploy to production

### Post-Deployment

- [ ] Test complete 8-step flow
- [ ] Verify AI preview works
- [ ] Check rate limiting
- [ ] Test error states
- [ ] Monitor costs for first 24 hours
- [ ] Set up monitoring/alerts

---

## Testing in Production

### 1. Test Demo Mode (No User API Key)

**URL:** `https://your-domain.vercel.app/configure`

**Steps:**
1. Complete Steps 1-5
2. At Step 6, click "Generate Preview"
3. Verify preview generates (10-30 seconds)
4. Check viewport controls work
5. Regenerate 4 more times
6. Verify 6th attempt shows rate limit error
7. Verify "Add API Key" prompt appears

**Expected Errors:**
- After 5 generations: "Demo limit reached"
- Clear call-to-action to add API key

### 2. Test User API Key Mode

**Steps:**
1. Click "Add API key for unlimited generations"
2. Enter your Anthropic API key
3. Generate preview
4. Verify unlimited generations work
5. Check no rate limit counter

**Expected:**
- No rate limit errors
- Unlimited generations
- Key stored in localStorage only

### 3. Test Error States

**Invalid API Key:**
1. Enter fake key: `sk-ant-invalid`
2. Try to generate
3. Should show: "Invalid API key" with retry option

**Network Failure:**
1. Disconnect internet (or use browser dev tools)
2. Try to generate
3. Should show: "Failed to generate preview. Please try again."

**Rate Limit (Demo Mode):**
1. Use demo mode, generate 5 previews
2. 6th attempt should show upgrade message
3. Should offer API key input

### 4. Test All Templates

Generate previews for each template:
- [ ] SaaS Starter
- [ ] E-commerce
- [ ] Blog
- [ ] Dashboard
- [ ] API Backend
- [ ] Directory

Verify terminal aesthetic is consistent across all.

---

## Monitoring & Observability

### Vercel Analytics

**Enable in Dashboard:**
1. Go to project settings
2. Navigate to **Analytics**
3. Enable Web Analytics (free)

**Metrics to Watch:**
- Page views for `/configure`
- Conversion rate (Step 1 → Step 8)
- Preview generation success rate
- API errors (4xx, 5xx)

### Anthropic Usage Dashboard

**Monitor at:** https://console.anthropic.com/settings/usage

**Key Metrics:**
- Daily API requests
- Token usage (input/output)
- Cost per day
- Error rate

**Set Alerts:**
- Daily spend > $50
- Error rate > 10%
- Token usage spike

### Upstash Monitoring (If Using Redis)

**Dashboard:** https://console.upstash.com

**Key Metrics:**
- Commands per day (stay under 10k for free tier)
- Latency (should be <50ms)
- Error rate

---

## Troubleshooting

### Issue: "Module not found" error

**Cause:** Missing dependencies
**Fix:**
```bash
cd website
npm install
vercel --prod
```

### Issue: Preview generation fails with 500 error

**Cause:** Missing `ANTHROPIC_API_KEY`
**Fix:**
1. Check environment variables in Vercel dashboard
2. Ensure key is valid and has credits
3. Redeploy after adding

### Issue: Rate limiting not working

**Cause:** No Redis configured
**Fix:**
1. Set up Upstash Redis
2. Add environment variables
3. Redeploy

**Or accept per-invocation limits:**
- Edit `route.ts` to use fallback mode
- Less accurate but works without Redis

### Issue: High costs

**Cause:** Many preview generations
**Solution:**
1. Review Anthropic dashboard
2. Check rate limiting is working
3. Consider lowering demo limit
4. Encourage user API keys more prominently

### Issue: Previews look broken

**Cause:** CSP or iframe restrictions
**Fix:**
- Check browser console for errors
- Verify iframe sandbox attribute
- Check Vercel headers in `next.config.js`

---

## Security Considerations

### API Key Storage

**✅ Correct:**
- User API keys stored in localStorage only
- Never sent to your server
- Only sent directly to Anthropic API

**❌ Never:**
- Store user keys in database
- Log user keys to console
- Send user keys to analytics

### Rate Limiting

**Without Redis:**
- Users can bypass by clearing cookies
- Consider this acceptable for demo mode
- Encourage moving to own API key

**With Redis:**
- Track by session ID (random)
- Don't track by IP (privacy concern)
- Clear old sessions after 24 hours

### Content Security Policy

Ensure Vercel headers allow:
- Iframe rendering (for preview)
- Anthropic API calls
- Tailwind CDN (in generated HTML)

---

## Scaling Considerations

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited serverless invocations
- 100 GB-hours compute

**Upstash Redis:**
- 10,000 commands/day
- 256 MB storage
- 1 region

**Anthropic:**
- Pay-as-you-go pricing
- No free tier

### When to Upgrade

**Vercel Pro ($20/mo):**
- When bandwidth > 100 GB/mo
- Need faster builds
- Want staging environments

**Upstash Standard ($10/mo):**
- When > 10k commands/day
- Need multi-region
- Want higher storage

**Cost Optimization:**
- Encourage user API keys prominently
- Cache identical prompts (same inputs)
- Monitor usage weekly

---

## Domain Configuration

### Custom Domain

**Add in Vercel Dashboard:**
1. Go to **Settings** → **Domains**
2. Add domain: `configure.dawsonframework.com`
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

**Recommended Structure:**
- Main site: `dawsonframework.com`
- Configurator: `configure.dawsonframework.com`
- Docs: `docs.dawsonframework.com`

---

## Success Metrics

### Week 1 Targets

- [ ] 0 deployment errors
- [ ] < 5 API errors per day
- [ ] > 80% preview generation success rate
- [ ] API costs < $50

### Month 1 Targets

- [ ] 100+ users generate previews
- [ ] 10+ users add their own API keys
- [ ] 50% of users complete all 8 steps
- [ ] API costs stable and predictable

---

## Support & Resources

**Vercel Documentation:**
- https://vercel.com/docs

**Anthropic API Documentation:**
- https://docs.anthropic.com

**Upstash Documentation:**
- https://docs.upstash.com

**Issues & Feedback:**
- GitHub: https://github.com/anthropics/claude-code/issues

---

## Quick Reference Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Remove deployment
vercel remove [deployment-url]
```

---

## Deployment Complete! 🎉

**Your configurator is live at:**
```
https://your-project.vercel.app/configure
```

**Next Steps:**
1. Share the URL with users
2. Monitor costs and usage
3. Gather feedback
4. Iterate on prompts based on results

**Questions?** Check the troubleshooting section or open an issue.
