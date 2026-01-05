# Pricing Section Content Generation

Generate pricing tier content for a SaaS product.

## Context

**Project Name:** {{projectName}}
**Project Type:** {{projectType}}
**Description:** {{projectDescription}}
**Target Audience:** {{targetAudience}}
**Pricing Model:** {{pricingModel}} (default: "monthly/annual subscription")
**Currency:** {{currency}} (default: "USD")

## Requirements

Generate 3 pricing tiers with progressive value:

### Tier Structure

1. **Starter/Free Tier**
   - Entry-level or free
   - Limited but useful features
   - Path to upgrade

2. **Pro/Team Tier** (marked as "popular")
   - Sweet spot for most users
   - Best value proposition
   - Most compelling feature set

3. **Enterprise/Business Tier**
   - Premium offering
   - Advanced features
   - Priority support

### For Each Tier

- **Name** (1 word): Starter, Pro, Enterprise (or similar)
- **Price** (number): Monthly price
- **Interval** (string): "month" or "year"
- **Description** (10-15 words): Who this is for
- **Features** (5-8 items): Specific included features
- **CTA Text** (2-3 words): Button text
- **Popular** (boolean): Only true for middle tier

## Output Format

```json
{
  "sectionTitle": "Simple, transparent pricing",
  "sectionSubtext": "Start free, upgrade when you're ready. No hidden fees.",
  "plans": [
    {
      "name": "Starter",
      "price": 0,
      "interval": "month",
      "description": "Perfect for individuals getting started",
      "features": [
        "Up to 3 projects",
        "Basic analytics",
        "Community support",
        "1 team member"
      ],
      "ctaText": "Get Started",
      "popular": false
    },
    {
      "name": "Pro",
      "price": 29,
      "interval": "month",
      "description": "For growing teams that need more power",
      "features": [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10 team members",
        "Custom integrations",
        "API access"
      ],
      "ctaText": "Start Trial",
      "popular": true
    },
    {
      "name": "Enterprise",
      "price": 99,
      "interval": "month",
      "description": "For large organizations with custom needs",
      "features": [
        "Everything in Pro",
        "Unlimited team members",
        "SSO / SAML",
        "Dedicated support",
        "Custom contracts",
        "SLA guarantee",
        "Audit logs"
      ],
      "ctaText": "Contact Sales",
      "popular": false
    }
  ]
}
```

## Guidelines

- Price points should feel appropriate for {{projectType}}
- Feature progression should be logical
- Free tier should provide real value (not crippled)
- Enterprise should feel premium, not just "more of Pro"
- Use consistent formatting in feature lists

