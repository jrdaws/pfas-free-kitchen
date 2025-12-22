# Capabilities

Capabilities are plan-gated features in the Dawson Does Framework that control what functionality is available to users based on their subscription tier.

## Table of Contents

- [What Are Capabilities?](#what-are-capabilities)
- [Why Capabilities Exist](#why-capabilities-exist)
- [How Capabilities Work](#how-capabilities-work)
- [Plan Tiers](#plan-tiers)
- [Capability States](#capability-states)
- [Plan Compliance](#plan-compliance)
- [Capability Configuration](#capability-configuration)
- [When to Use Capabilities](#when-to-use-capabilities)
- [Examples](#examples)
- [Best Practices](#best-practices)

## What Are Capabilities?

A capability is a discrete feature or integration that can be enabled or disabled based on:
- User's plan tier (free, pro, team)
- Environment variable presence
- Manual configuration overrides
- Template support

Think of capabilities as "feature flags with business logic."

### Capability Structure

```typescript
{
  id: "auth.supabase",           // Unique identifier
  label: "Supabase Auth",        // Display name
  tier: "free",                  // Minimum required tier
  optional: true,                // Can be disabled
  group: "authentication",       // Logical grouping
  requiredEnvKeys: [             // Environment dependencies
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY"
  ]
}
```

## Why Capabilities Exist

### 1. Monetization

Capabilities enable tiered pricing:

```
Free Tier:
  ✓ Basic templates
  ✓ Core integrations (Supabase auth)
  ✗ Advanced integrations
  ✗ Team features

Pro Tier:
  ✓ All Free features
  ✓ Advanced integrations (Stripe, AI)
  ✓ Priority support
  ✗ Team collaboration

Team Tier:
  ✓ All Pro features
  ✓ Team collaboration
  ✓ Advanced automation
  ✓ Custom integrations
```

### 2. Progressive Complexity

Capabilities allow users to:
- Start simple with free tier
- Upgrade as needs grow
- Only pay for what they use

### 3. Clear Value Proposition

Each tier has clear boundaries:
- Free: Perfect for learning and prototypes
- Pro: Production-ready individual apps
- Team: Organizations and scale

### 4. Graceful Degradation

If a capability is unavailable:
- Framework continues working
- Clear error messages
- Suggestions for alternatives

## How Capabilities Work

### Capability Resolution

The framework determines if a capability is enabled through this process:

```
┌─────────────────────────────────────────┐
│ 1. Check Plan Tier                      │
│    Is user's plan >= required tier?    │
└────────────┬────────────────────────────┘
             │ YES
             ↓
┌─────────────────────────────────────────┐
│ 2. Check Feature Overrides              │
│    Is capability explicitly disabled?   │
└────────────┬────────────────────────────┘
             │ NO
             ↓
┌─────────────────────────────────────────┐
│ 3. Check Environment Variables          │
│    Are required env vars present?       │
└────────────┬────────────────────────────┘
             │ YES
             ↓
┌─────────────────────────────────────────┐
│ 4. Check Template Support               │
│    Does template support this?          │
└────────────┬────────────────────────────┘
             │ YES
             ↓
        ENABLED ✓
```

### Runtime Checking

Capabilities are checked at:

**Export Time**:
```bash
# Framework validates integrations against plan
framework export saas ./app \
  --auth supabase \    # OK on free tier
  --ai anthropic       # Requires pro tier
```

**Runtime** (in your app):
```typescript
// Check if feature is available
import { checkCapability } from '@/lib/capabilities';

if (await checkCapability('ai.anthropic')) {
  // Use AI features
} else {
  // Show upgrade prompt
}
```

**CLI Commands**:
```bash
# Check all capabilities for current project
framework capabilities .

# Output:
# {
#   "enabled": ["auth.supabase", "db.postgres"],
#   "disabled": ["ai.anthropic"],
#   "planCompliance": {
#     "compliant": true
#   }
# }
```

## Plan Tiers

### Free Tier

**Cost**: $0/month

**Capabilities**:
- ✓ All core templates (saas, blog, dashboard, etc.)
- ✓ Basic authentication (Supabase)
- ✓ Database integrations (Postgres)
- ✓ Email (SendGrid, Resend)
- ✓ Drift detection
- ✓ Plugin system
- ✓ Community support

**Limits**:
- ✗ No AI integrations
- ✗ No advanced payments (Stripe requires Pro)
- ✗ No team features
- ✗ No deployment automations

**Best For**:
- Learning the framework
- Personal projects
- Open source projects
- Prototypes and MVPs

**Example**:
```bash
# Free tier export
framework export saas ./my-app \
  --auth supabase \
  --db postgres \
  --email resend
```

### Pro Tier

**Cost**: $29/month (example)

**Capabilities**:
- ✓ All Free features
- ✓ AI integrations (Anthropic, OpenAI)
- ✓ Payment processing (Stripe)
- ✓ Advanced analytics (PostHog, Mixpanel)
- ✓ Deployment automation (Vercel, Railway)
- ✓ Priority support
- ✓ Custom domain documentation

**Limits**:
- ✗ No team collaboration features
- ✗ No multi-project orchestration
- ✗ Single user only

**Best For**:
- Production SaaS applications
- Revenue-generating products
- Professional developers
- Client projects

**Example**:
```bash
# Pro tier export with advanced features
framework export saas ./my-saas \
  --auth supabase \
  --payments stripe \
  --ai anthropic \
  --analytics posthog \
  --deploy vercel
```

### Team Tier

**Cost**: $99/month (example)

**Capabilities**:
- ✓ All Pro features
- ✓ Team collaboration
- ✓ Multi-project management
- ✓ Custom integrations
- ✓ Advanced automation
- ✓ Dedicated support
- ✓ SLA guarantees

**Best For**:
- Development agencies
- Enterprise teams
- Multi-project organizations
- Custom requirements

**Example**:
```bash
# Team tier with collaboration
framework export saas ./team-project \
  --auth supabase \
  --payments stripe \
  --ai anthropic \
  --collaboration team \
  --automation advanced
```

## Capability States

A capability can be in one of these states:

### Enabled

The capability is active and can be used.

**Conditions**:
- Plan tier is sufficient
- Required env vars are set
- Not explicitly disabled
- Template supports it

**Behavior**:
```bash
$ framework capabilities .
{
  "enabled": [
    "auth.supabase"
  ]
}
```

### Disabled - Missing Environment

Required environment variables are not set.

**Conditions**:
- Plan allows it
- Template supports it
- But env vars missing

**Behavior**:
```bash
$ framework capabilities .
{
  "disabled": [
    {
      "id": "auth.supabase",
      "reason": "missing env: SUPABASE_URL, SUPABASE_ANON_KEY"
    }
  ]
}
```

**Resolution**:
```bash
# Set required env vars
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_ANON_KEY="eyJxxx..."

# Now capability is enabled
framework capabilities .
```

### Disabled - Plan Restriction

User's plan doesn't include this capability.

**Conditions**:
- User on free tier
- Capability requires pro/team

**Behavior**:
```bash
$ framework export saas ./app --ai anthropic
❌ Plan compliance violation:
   ai.anthropic requires pro tier (you have: free)

To resolve: upgrade to pro plan
```

**Resolution**:
```bash
# Upgrade plan (in web platform)
# Then capability becomes available
```

### Disabled - Manual Override

User explicitly disabled in config.

**Conditions**:
- Manually set to false in `.dd/config.json`

**Configuration**:
```json
{
  "plan": "pro",
  "featureOverrides": {
    "ai.anthropic": false
  }
}
```

**Behavior**:
```bash
$ framework capabilities .
{
  "disabled": [
    {
      "id": "ai.anthropic",
      "reason": "disabled in config"
    }
  ]
}
```

**Resolution**:
```bash
# Enable via CLI
framework toggle ai.anthropic on .

# Or edit .dd/config.json manually
```

### Disabled - Template Unsupported

Template doesn't support this capability.

**Conditions**:
- Capability exists in framework
- But template hasn't implemented it

**Behavior**:
```bash
$ framework export blog ./app --payments stripe
❌ Template validation error:
   blog template does not support payments integrations

Supported templates for payments: saas, dashboard
```

## Plan Compliance

The framework enforces plan compliance to prevent unauthorized feature use.

### Compliance Checking

Happens at multiple points:

**1. Export Time**:
```bash
framework export saas ./app --ai anthropic
# Checks if plan allows ai.anthropic
```

**2. Runtime**:
```typescript
// In your application
if (await checkCapability('ai.anthropic')) {
  // Use feature
}
```

**3. CLI Commands**:
```bash
framework capabilities .
# Shows compliance status
```

### Compliance Violations

When a violation is detected:

```bash
$ framework capabilities .

⚠️  WARNING: 2 plan compliance violations detected!
   - ai.anthropic requires pro tier (you have: free)
   - payments.stripe requires pro tier (you have: free)

To resolve: upgrade to pro plan or disable these capabilities
```

### Handling Violations

**Option 1: Upgrade Plan**
```bash
# Visit web platform to upgrade
open https://dawsondoes.dev/pricing

# After upgrade, capabilities are available
```

**Option 2: Disable Features**
```bash
# Disable violating capabilities
framework toggle ai.anthropic off .
framework toggle payments.stripe off .
```

**Option 3: Accept Limitations**
```bash
# Continue with free tier features only
# Remove advanced integrations from code
```

## Capability Configuration

### Project Configuration

Each project has a `.dd/config.json`:

```json
{
  "plan": "pro",
  "featureOverrides": {
    "ai.anthropic": true,
    "payments.stripe": true,
    "analytics.posthog": false
  }
}
```

### Field Descriptions

**plan**: `string`
- User's current subscription tier
- Values: `"free"`, `"pro"`, `"team"`
- Determines base available features

**featureOverrides**: `Record<string, boolean>`
- Manual enable/disable per capability
- Overrides env-based detection
- Useful for testing and development

### Configuration Commands

**View Current Config**:
```bash
cat .dd/config.json
```

**Toggle Capability**:
```bash
# Enable
framework toggle ai.anthropic on .

# Disable
framework toggle ai.anthropic off .
```

**Check All Capabilities**:
```bash
framework capabilities .
```

**Show Capability Phrases**:
```bash
# Human-readable list
framework phrases .
```

## When to Use Capabilities

### Use Capabilities When:

**1. Monetizing Features**
```typescript
// Premium AI feature
if (await checkCapability('ai.anthropic')) {
  const result = await generateWithAI(prompt);
} else {
  showUpgradePrompt('AI features require Pro plan');
}
```

**2. Gating Complex Integrations**
```typescript
// Stripe requires Pro tier
if (userPlan >= 'pro') {
  await setupStripeIntegration();
}
```

**3. Managing Team Features**
```typescript
// Team collaboration
if (await checkCapability('collaboration.team')) {
  await enableRealtimeCollaboration();
}
```

### Don't Use Capabilities For:

**1. Core Framework Features**
- Template export (always free)
- Drift detection (always available)
- Git integration (always works)

**2. Simple Configuration**
- Use environment variables instead
- Simpler and more standard

**3. Feature Flags**
- Use dedicated feature flag system
- Capabilities are for billing tiers

## Examples

### Example 1: Free Tier Project

```bash
# Export with free tier features
framework export saas ./free-app \
  --auth supabase \
  --db postgres \
  --email resend

# Check capabilities
framework capabilities ./free-app

# Output:
# {
#   "plan": "free",
#   "enabled": [
#     "auth.supabase",
#     "db.postgres",
#     "email.resend"
#   ],
#   "disabled": [],
#   "planCompliance": {
#     "compliant": true
#   }
# }
```

### Example 2: Pro Tier with AI

```bash
# Export with Pro features
framework export saas ./pro-app \
  --auth supabase \
  --payments stripe \
  --ai anthropic

# Check capabilities
framework capabilities ./pro-app

# Output:
# {
#   "plan": "pro",
#   "enabled": [
#     "auth.supabase",
#     "payments.stripe",
#     "ai.anthropic"
#   ],
#   "disabled": [],
#   "planCompliance": {
#     "compliant": true
#   }
# }
```

### Example 3: Plan Violation

```bash
# Try to use Pro feature on Free plan
framework export saas ./app --ai anthropic

# Output:
# ❌ Plan compliance violation:
#    ai.anthropic requires pro tier (you have: free)
#
# To resolve: upgrade to pro plan or remove --ai flag
```

### Example 4: Manual Override

```json
// .dd/config.json
{
  "plan": "pro",
  "featureOverrides": {
    "ai.anthropic": false  // Disable even though plan allows
  }
}
```

```bash
$ framework capabilities .
{
  "disabled": [
    {
      "id": "ai.anthropic",
      "reason": "disabled in config"
    }
  ]
}
```

### Example 5: Environment-Based

```bash
# Without Supabase env vars
$ framework capabilities .
{
  "disabled": [
    {
      "id": "auth.supabase",
      "reason": "missing env: SUPABASE_URL, SUPABASE_ANON_KEY"
    }
  ]
}

# Set env vars
$ export SUPABASE_URL="https://xxx.supabase.co"
$ export SUPABASE_ANON_KEY="xxx"

# Now enabled
$ framework capabilities .
{
  "enabled": ["auth.supabase"]
}
```

## Best Practices

### 1. Start with Free Tier

Begin projects with free tier features:
```bash
# Start simple
framework export saas ./mvp \
  --auth supabase \
  --db postgres
```

Upgrade when you need advanced features:
```bash
# Add payments when ready to charge
framework export saas ./mvp-v2 \
  --auth supabase \
  --db postgres \
  --payments stripe  # Now on Pro plan
```

### 2. Check Capabilities Early

Validate capabilities before using features:
```typescript
// Check before importing expensive dependencies
if (await checkCapability('ai.anthropic')) {
  const { Anthropic } = await import('@anthropic-ai/sdk');
  // Use AI features
}
```

### 3. Provide Upgrade Paths

Give users clear next steps:
```typescript
function showAIFeature() {
  if (!hasCapability('ai.anthropic')) {
    return (
      <UpgradePrompt
        feature="AI Assistant"
        requiredTier="pro"
        currentTier={userTier}
      />
    );
  }

  return <AIAssistant />;
}
```

### 4. Use Environment Variables

Prefer env vars over hardcoded checks:
```typescript
// Good: Check capability (respects plan + env)
if (await checkCapability('ai.anthropic')) {
  // ...
}

// Bad: Hardcode plan check
if (userPlan === 'pro') {
  // Doesn't respect env vars or overrides
}
```

### 5. Document Requirements

Make capability requirements clear:
```typescript
/**
 * Generate AI content
 *
 * @requires capability:ai.anthropic (Pro tier)
 * @requires env:ANTHROPIC_API_KEY
 */
export async function generateContent(prompt: string) {
  // ...
}
```

### 6. Handle Gracefully

Degrade gracefully when capabilities unavailable:
```typescript
async function analyzeText(text: string) {
  if (await checkCapability('ai.anthropic')) {
    return aiAnalysis(text);
  }

  // Fallback to simpler analysis
  return basicAnalysis(text);
}
```

### 7. Test All Tiers

Test your app on each tier:
```bash
# Test free tier
export PLAN_TIER=free
npm test

# Test pro tier
export PLAN_TIER=pro
npm test

# Test team tier
export PLAN_TIER=team
npm test
```

## Related Concepts

- **[Templates](./templates.md)**: Templates declare supported capabilities
- **[Integrations](./integrations.md)**: Most integrations are capabilities
- **[Plan Compliance](./capabilities.md#plan-compliance)**: Enforcement mechanism
- **[Configuration](../guides/configuration.md)**: How to configure capabilities

## Next Steps

- Learn about [Integrations](./integrations.md)
- Read the [Configuration Guide](../guides/configuration.md)
- Understand [Plan Tiers](../guides/pricing.md)
- Check [Capability Reference](../api/capabilities.md)

---

**Previous**: [Templates](./templates.md)
**Next**: [Integrations](./integrations.md)
