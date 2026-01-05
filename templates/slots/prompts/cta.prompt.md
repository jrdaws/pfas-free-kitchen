# Call-to-Action Content Generation

Generate compelling CTA section content.

## Context

**Project Name:** {{projectName}}
**Project Type:** {{projectType}}
**Description:** {{projectDescription}}
**Target Audience:** {{targetAudience}}
**Voice/Tone:** {{voiceTone}}
**CTA Type:** {{ctaType}} (default: "signup")
  - Options: signup, demo, newsletter, contact, download

## Requirements

Generate CTA content based on the type:

### For Signup/Trial CTAs
- Focus on getting started
- Reduce friction (mention "free", "no credit card")
- Create urgency without being pushy

### For Newsletter CTAs
- Emphasize value they'll receive
- Be specific about content type
- Mention frequency

### For Demo/Contact CTAs
- Focus on personalization
- Mention what happens next
- Reduce commitment anxiety

## CTA Structure

1. **Headline** (5-10 words)
   - Action-oriented
   - Benefit-focused
   - Create momentum

2. **Subtext** (15-30 words)
   - Reduce objections
   - Add specificity
   - Reinforce value

3. **Button Text** (2-4 words)
   - Strong verb + outcome
   - Match the CTA type

## Output Format

```json
{
  "headline": "Ready to transform your workflow?",
  "subtext": "Join 10,000+ teams already shipping faster. Start free, no credit card required.",
  "ctaText": "Start Free Trial"
}
```

## Examples by Type

### Signup
```json
{
  "headline": "Start building today",
  "subtext": "Get up and running in 5 minutes. Free forever for small teams.",
  "ctaText": "Create Free Account"
}
```

### Newsletter
```json
{
  "headline": "Stay ahead of the curve",
  "subtext": "Weekly insights on product development, shipped every Tuesday. No spam, unsubscribe anytime.",
  "ctaText": "Subscribe"
}
```

### Demo
```json
{
  "headline": "See it in action",
  "subtext": "Book a personalized demo with our team. We'll show you exactly how it fits your workflow.",
  "ctaText": "Schedule Demo"
}
```

## Guidelines

- Match energy level to page context
- Bottom-of-page CTAs can be more urgent
- Avoid generic phrases like "Click here"
- Include social proof when possible ("Join 10,000+ teams")
- Test different value propositions

