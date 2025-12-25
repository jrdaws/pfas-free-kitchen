# Vercel Deployment Execution Checklist

> **Estimated Time**: ~15 minutes
> **Last Verified**: 2025-12-24
> **Prerequisites**: Vercel account, GitHub access, Supabase project, Anthropic API key

---

## ⬜ Pre-Deployment (5 min)

- [ ] **1. Pull latest code**
  ```bash
  git pull origin main
  ```

- [ ] **2. Run tests**
  ```bash
  npm test
  ```

- [ ] **3. Verify build locally**
  ```bash
  cd website && npm run build
  ```

- [ ] **4. Check no secrets in code**
  ```bash
  grep -r "sk-ant-" website/app --include="*.ts" --include="*.tsx"
  # Should return nothing
  ```

---

## ⬜ Environment Variables

Gather these values before deployment:

| Variable | Required | Where to Get |
|----------|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API → URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Settings → API → anon key |
| `ANTHROPIC_API_KEY` | ✅ | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your production URL (e.g., `https://dawson.dev`) |
| `UPSTASH_REDIS_REST_URL` | ⚠️ Recommended | [upstash.com](https://upstash.com) → Redis → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ Recommended | Same location as URL |
| `ADMIN_API_KEY` | Optional | Generate: `openssl rand -hex 32` |
| `DAILY_TOKEN_LIMIT` | Optional | Default: `1000000` |
| `MONTHLY_TOKEN_LIMIT` | Optional | Default: `20000000` |

---

## ⬜ Deployment (5 min)

### First-Time Deployment

- [ ] **5. Log into Vercel**
  - Go to [vercel.com/dashboard](https://vercel.com/dashboard)

- [ ] **6. Import repository**
  - Click "Add New..." → "Project"
  - Select `dawson-does-framework` repository

- [ ] **7. Configure project**
  | Setting | Value |
  |---------|-------|
  | Root Directory | `website` |
  | Framework Preset | Next.js |
  | Node.js Version | 20.x |

- [ ] **8. Add environment variables**
  - Click "Environment Variables"
  - Add all variables from table above
  - Ensure scopes: Production ✅, Preview ✅

- [ ] **9. Deploy**
  - Click "Deploy"
  - Wait for build (~2-3 minutes)

### Subsequent Deployments

```bash
# Automatic on push to main
git push origin main

# Or manual:
cd website && npx vercel --prod
```

---

## ⬜ Post-Deployment Verification (5 min)

- [ ] **10. Health check**
  ```bash
  curl https://your-site.vercel.app/api/health
  # Expected: {"status":"healthy",...}
  ```

- [ ] **11. Homepage loads**
  - Open your production URL
  - Verify page loads in < 3 seconds
  - Check browser console for errors

- [ ] **12. Configurator flow**
  - Navigate to `/configure`
  - Select a template
  - Toggle integrations
  - Verify all steps work

- [ ] **13. AI generation (optional)**
  - Click "Generate Project" (uses your budget)
  - Verify progress bar works
  - Verify ZIP download works

- [ ] **14. Rate limiting active**
  - Check health endpoint shows Redis "up" or "degraded" (not "down")

---

## ⬜ Domain Configuration (If needed)

- [ ] **15. Add custom domain**
  - Vercel Dashboard → Project → Settings → Domains
  - Add your domain

- [ ] **16. Configure DNS**
  - Add CNAME: `your-subdomain` → `cname.vercel-dns.com`
  - Or A record: `76.76.21.21`

- [ ] **17. Wait for SSL**
  - Certificate provisioned automatically (~5 min)
  - Verify HTTPS works

---

## 🔄 Rollback Procedure

If issues occur after deployment:

### Quick Rollback (Recommended)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### CLI Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Emergency Rollback

```bash
git revert HEAD
git push origin main
```

---

## ✅ Deployment Complete!

### Quick Smoke Test Commands

```bash
# Health check
curl https://your-site.vercel.app/api/health | jq '.status'

# Response time
time curl -s https://your-site.vercel.app > /dev/null
```

### Monitoring Checklist

- [ ] Set up Vercel Analytics (Settings → Analytics)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Add Sentry for error tracking (optional)

---

## Related Documentation

- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md) - Comprehensive reference
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Health API](../api/health.md) - Health endpoint details

---

*Checklist Version: 1.0 | Governance Version: 2.3*

