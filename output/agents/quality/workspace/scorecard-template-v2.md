# Export Validation Scorecard Template v2.0

> **Version**: 2.0 | **Updated**: 2026-01-04
> **Purpose**: Standardized scoring for post-P0-fix export validation
> **Quality Agent**: Use this template for all future export validations

---

## Instructions

1. Copy this template for each export validation
2. Fill in `{{PLACEHOLDERS}}` with actual values
3. Check each item and calculate scores
4. Generate final grade

---

# Export Scorecard: {{PROJECT_NAME}}

```
╔════════════════════════════════════════════════════════════════════╗
║                    EXPORT VALIDATION SCORECARD v2.0                ║
║                      {{PROJECT_NAME}}                               ║
║                      {{EXPORT_DATE}}                                ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   OVERALL GRADE:  {{GRADE}}  ({{SCORE}}/100)                       ║
║   BUILD STATUS:   {{BUILD_STATUS}}                                  ║
║   PRODUCTION READY: {{PRODUCTION_READY}}                            ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Section 1: Base Component Verification (25 points max)

### P0 Required Components Checklist

| Component | Present? | Size | Score |
|-----------|:--------:|------|:-----:|
| components/Nav.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/Hero.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/FeatureCards.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/PricingTable.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/Testimonials.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/FAQ.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/CTA.tsx | ☐/☑ | {{BYTES}} | /3 |
| components/Footer.tsx | ☐/☑ | {{BYTES}} | /4 |

**Section Score**: {{BASE_COMPONENTS_SCORE}}/25

### Validation Commands
```bash
# Run in extracted project directory
ls -la components/*.tsx 2>/dev/null | wc -l
# Expected: 8+ base components

for f in Nav Hero FeatureCards PricingTable Testimonials FAQ CTA Footer; do
  [ -f "components/$f.tsx" ] && echo "✅ $f.tsx" || echo "❌ $f.tsx MISSING"
done
```

---

## Section 2: Integration File Verification (30 points max)

### Integration Files Checklist

For each selected integration, verify required files exist:

#### Auth Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **Supabase** | lib/supabase/client.ts | ☐/☑ | /1 |
| | lib/supabase/server.ts | ☐/☑ | /1 |
| | lib/supabase/index.ts | ☐/☑ | /1 |
| | middleware.ts | ☐/☑ | /1 |
| | app/login/page.tsx | ☐/☑ | /1 |
| | components/auth/*.tsx | ☐/☑ | /1 |
| **Clerk** | middleware.ts | ☐/☑ | /1 |
| | app/sign-in/[[...sign-in]]/page.tsx | ☐/☑ | /1 |
| | app/sign-up/[[...sign-up]]/page.tsx | ☐/☑ | /1 |

**Auth Score**: {{AUTH_SCORE}}/6

#### Payments Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **Stripe** | lib/stripe.ts | ☐/☑ | /1 |
| | app/api/stripe/checkout/route.ts | ☐/☑ | /1 |
| | app/api/stripe/portal/route.ts | ☐/☑ | /1 |
| | app/api/stripe/webhook/route.ts | ☐/☑ | /1 |
| | components/pricing/*.tsx | ☐/☑ | /1 |

**Payments Score**: {{PAYMENTS_SCORE}}/5

#### Email Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **Resend** | lib/resend.ts | ☐/☑ | /1 |
| | app/api/email/send/route.ts | ☐/☑ | /1 |
| | emails/*.tsx | ☐/☑ | /1 |

**Email Score**: {{EMAIL_SCORE}}/3

#### Analytics Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **PostHog** | lib/posthog.ts | ☐/☑ | /1 |
| | components/analytics/posthog-provider.tsx | ☐/☑ | /1 |
| | components/analytics/use-posthog.tsx | ☐/☑ | /1 |

**Analytics Score**: {{ANALYTICS_SCORE}}/3

#### AI Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **OpenAI** | lib/openai.ts | ☐/☑ | /1 |
| | app/api/ai/chat/route.ts | ☐/☑ | /1 |
| | components/ai/chat-interface.tsx | ☐/☑ | /1 |
| **Anthropic** | lib/anthropic.ts | ☐/☑ | /1 |
| | app/api/ai/claude/route.ts | ☐/☑ | /1 |
| | components/ai/claude-chat.tsx | ☐/☑ | /1 |

**AI Score**: {{AI_SCORE}}/3

#### Storage Integration
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **UploadThing** | lib/uploadthing.ts | ☐/☑ | /1 |
| | app/api/uploadthing/core.ts | ☐/☑ | /1 |
| | app/api/uploadthing/route.ts | ☐/☑ | /1 |
| **R2/S3** | lib/storage/r2.ts | ☐/☑ | /1 |
| | app/api/storage/upload/route.ts | ☐/☑ | /1 |

**Storage Score**: {{STORAGE_SCORE}}/3

#### Other Integrations
| Provider | Files Required | Present? | Score |
|----------|---------------|:--------:|:-----:|
| **Algolia** | lib/algolia.ts | ☐/☑ | /1 |
| | components/search/*.tsx | ☐/☑ | /1 |
| **Sentry** | sentry.client.config.ts | ☐/☑ | /1 |
| | sentry.server.config.ts | ☐/☑ | /1 |
| **Sanity** | lib/sanity.ts | ☐/☑ | /1 |
| | sanity.config.ts | ☐/☑ | /1 |

**Other Score**: {{OTHER_SCORE}}/6

### Integration Coverage Calculation

```
Selected Integrations: {{SELECTED_COUNT}}
Generated Integrations: {{GENERATED_COUNT}}
Coverage: {{COVERAGE_PERCENT}}%

Integration Section Score = (Generated / Selected) × 30
```

**Section Score**: {{INTEGRATION_SCORE}}/30

---

## Section 3: Build Success Tracking (25 points max)

### Build Pipeline Results

| Step | Command | Status | Duration | Score |
|------|---------|:------:|----------|:-----:|
| **Dependencies** | `npm install` | ☐ PASS / ☐ FAIL | {{DURATION}} | /5 |
| **TypeScript** | `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | {{DURATION}} | /5 |
| **Lint** | `npm run lint` | ☐ PASS / ☐ FAIL | {{DURATION}} | /5 |
| **Build** | `npm run build` | ☐ PASS / ☐ FAIL | {{DURATION}} | /10 |

**Section Score**: {{BUILD_SCORE}}/25

### Error Log (if any)

```
{{ERROR_LOG}}
```

### Error Classification

| Error Type | Count | Severity |
|------------|:-----:|----------|
| Module not found | {{COUNT}} | Critical |
| Type errors | {{COUNT}} | High |
| Lint warnings | {{COUNT}} | Low |
| Deprecated warnings | {{COUNT}} | Info |

### Build Validation Commands
```bash
# Full validation sequence
npm install 2>&1 | tee install.log
echo "Install exit code: $?"

npm run build 2>&1 | tee build.log
echo "Build exit code: $?"

# Check for specific errors
grep -c "Module not found" build.log || echo "0"
grep -c "Type error" build.log || echo "0"
```

---

## Section 4: Environment Variable Validation (10 points max)

### .env.local.example Verification

| Variable | Required By | Present? | Score |
|----------|-------------|:--------:|:-----:|
| **NEXT_PUBLIC_SUPABASE_URL** | Supabase Auth | ☐/☑ | /1 |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Supabase Auth | ☐/☑ | /1 |
| **SUPABASE_SERVICE_ROLE_KEY** | Supabase Auth | ☐/☑ | /0.5 |
| **STRIPE_SECRET_KEY** | Stripe | ☐/☑ | /1 |
| **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** | Stripe | ☐/☑ | /1 |
| **STRIPE_WEBHOOK_SECRET** | Stripe | ☐/☑ | /0.5 |
| **RESEND_API_KEY** | Resend | ☐/☑ | /1 |
| **NEXT_PUBLIC_POSTHOG_KEY** | PostHog | ☐/☑ | /1 |
| **NEXT_PUBLIC_POSTHOG_HOST** | PostHog | ☐/☑ | /0.5 |
| **OPENAI_API_KEY** | OpenAI | ☐/☑ | /1 |
| **ANTHROPIC_API_KEY** | Anthropic | ☐/☑ | /1 |
| **UPLOADTHING_SECRET** | UploadThing | ☐/☑ | /0.5 |

### Env Var Calculation

```
Required Env Vars: {{REQUIRED_COUNT}}
Present Env Vars: {{PRESENT_COUNT}}
Coverage: {{ENV_COVERAGE}}%
```

**Section Score**: {{ENV_SCORE}}/10

### Validation Commands
```bash
# Check .env.local.example exists
[ -f ".env.local.example" ] && echo "✅ .env.local.example exists" || echo "❌ MISSING"

# Count env vars
grep -c "=" .env.local.example 2>/dev/null || echo "0"

# Validate no hardcoded secrets
grep -E "(sk_|pk_|apikey=)" .env.local.example && echo "⚠️ POSSIBLE HARDCODED KEY" || echo "✅ No hardcoded keys"
```

---

## Section 5: Configuration Capture (10 points max)

### Manifest Verification

| Item | Location | Status | Score |
|------|----------|:------:|:-----:|
| Template type | .dd/template-manifest.json | ☐/☑ | /2 |
| Version info | .dd/template-manifest.json | ☐/☑ | /1 |
| Generated timestamp | .dd/template-manifest.json | ☐/☑ | /1 |
| Integrations list | .dd/template-manifest.json | ☐/☑ | /2 |
| Vision captured | .dd/vision.md | ☐/☑ | /2 |
| README accurate | README.md | ☐/☑ | /2 |

**Section Score**: {{CONFIG_SCORE}}/10

### Validation Commands
```bash
# Check .dd directory
[ -d ".dd" ] && echo "✅ .dd/ exists" || echo "❌ .dd/ MISSING"

# Validate JSON
cat .dd/template-manifest.json | python3 -m json.tool > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"

# Check vision captured
[ -f ".dd/vision.md" ] && wc -l .dd/vision.md || echo "❌ No vision"
```

---

## Final Score Calculation

```
┌─────────────────────────────────────────────────┐
│  SCORE BREAKDOWN                                │
├─────────────────────────────────────────────────┤
│  Base Components:    {{BASE_SCORE}}/25          │
│  Integrations:       {{INT_SCORE}}/30           │
│  Build Success:      {{BUILD_SCORE}}/25         │
│  Env Variables:      {{ENV_SCORE}}/10           │
│  Configuration:      {{CONFIG_SCORE}}/10        │
├─────────────────────────────────────────────────┤
│  TOTAL:              {{TOTAL}}/100              │
└─────────────────────────────────────────────────┘
```

### Grade Scale

| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | ✅ Production Ready |
| 80-89 | B | ✅ Ready with minor issues |
| 70-79 | C | ⚠️ Needs attention |
| 60-69 | D | ❌ Significant issues |
| 0-59 | F | ❌ Not usable |

### Pass/Fail Criteria

**Automatic FAIL conditions** (regardless of score):
- [ ] `npm run build` fails
- [ ] Any P0 component missing
- [ ] No .dd/template-manifest.json
- [ ] package.json is invalid JSON

**Automatic PASS requirements**:
- [x] All 8 base components present
- [x] Build succeeds with 0 errors
- [x] All selected integrations have files
- [x] .env.local.example is complete

---

## Comparison Section (Post-Fix Validation)

### Before vs After P0 Fixes

| Metric | Before Fix | After Fix | Delta |
|--------|:----------:|:---------:|:-----:|
| Base Components | {{BEFORE}}/8 | {{AFTER}}/8 | {{DELTA}} |
| Build Status | ❌ FAIL | {{STATUS}} | {{CHANGE}} |
| Integration Coverage | {{BEFORE}}% | {{AFTER}}% | {{DELTA}}% |
| Overall Score | {{BEFORE}}/100 | {{AFTER}}/100 | +{{DELTA}} |

---

## Quick Validation Script

Save as `validate-export.sh` and run in extracted project:

```bash
#!/bin/bash
# Export Validation Script v2.0

echo "═══════════════════════════════════════════"
echo "  EXPORT VALIDATION - $(basename $(pwd))"
echo "═══════════════════════════════════════════"

# Section 1: Base Components
echo ""
echo "📦 BASE COMPONENTS"
BASE_COUNT=0
for c in Nav Hero FeatureCards PricingTable Testimonials FAQ CTA Footer; do
  if [ -f "components/$c.tsx" ]; then
    echo "  ✅ $c.tsx"
    ((BASE_COUNT++))
  else
    echo "  ❌ $c.tsx MISSING"
  fi
done
echo "  Score: $BASE_COUNT/8"

# Section 2: Build Test
echo ""
echo "🔨 BUILD TEST"
if npm install --silent 2>/dev/null; then
  echo "  ✅ npm install passed"
  INSTALL_PASS=1
else
  echo "  ❌ npm install failed"
  INSTALL_PASS=0
fi

if npm run build --silent 2>/dev/null; then
  echo "  ✅ npm run build passed"
  BUILD_PASS=1
else
  echo "  ❌ npm run build failed"
  BUILD_PASS=0
fi

# Section 3: Env Vars
echo ""
echo "🔑 ENV VARIABLES"
if [ -f ".env.local.example" ]; then
  ENV_COUNT=$(grep -c "=" .env.local.example)
  echo "  ✅ .env.local.example exists ($ENV_COUNT vars)"
else
  echo "  ❌ .env.local.example MISSING"
  ENV_COUNT=0
fi

# Section 4: Config
echo ""
echo "📋 CONFIGURATION"
[ -f ".dd/template-manifest.json" ] && echo "  ✅ Manifest exists" || echo "  ❌ Manifest MISSING"
[ -f ".dd/vision.md" ] && echo "  ✅ Vision captured" || echo "  ❌ Vision MISSING"
[ -f "README.md" ] && echo "  ✅ README exists" || echo "  ❌ README MISSING"

# Final
echo ""
echo "═══════════════════════════════════════════"
if [ $BUILD_PASS -eq 1 ] && [ $BASE_COUNT -eq 8 ]; then
  echo "  ✅ VALIDATION PASSED"
else
  echo "  ❌ VALIDATION FAILED"
fi
echo "═══════════════════════════════════════════"
```

---

## Template Usage Notes

1. **Copy this template** for each new export validation
2. **Run validation script** in extracted project directory
3. **Fill in scores** based on actual results
4. **Calculate totals** and assign grade
5. **Save report** to `export-scorecard-{projectname}.md`

---

*Template v2.0 | Quality Agent | 2026-01-04*

