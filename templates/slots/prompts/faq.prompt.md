# FAQ Section Content Generation

Generate frequently asked questions and answers.

## Context

**Project Name:** {{projectName}}
**Project Type:** {{projectType}}
**Description:** {{projectDescription}}
**Target Audience:** {{targetAudience}}
**Page Context:** {{pageContext}} (e.g., "pricing", "landing", "product")
**Number of FAQs:** {{faqCount}} (default: 5)

## Requirements

Generate {{faqCount}} FAQs covering common concerns:

### Question Categories to Cover

1. **Getting Started**
   - How to begin, onboarding, first steps

2. **Pricing/Billing** (if applicable)
   - Payment methods, refunds, plan changes

3. **Features/Capabilities**
   - What it does, limitations, integrations

4. **Security/Privacy**
   - Data handling, compliance, safety

5. **Support/Help**
   - How to get help, response times

### FAQ Structure

1. **Question** (5-15 words)
   - Natural question format (start with How, What, Can, Is, Do)
   - Address real concerns, not softballs
   - Specific to {{projectType}}

2. **Answer** (30-75 words)
   - Clear and direct
   - Start with the answer, then explain
   - Include links/CTAs where appropriate
   - Avoid jargon

## Output Format

```json
{
  "sectionTitle": "Frequently Asked Questions",
  "sectionSubtext": "Everything you need to know. Can't find an answer? Contact our support team.",
  "faqs": [
    {
      "question": "How long does it take to get started?",
      "answer": "Most teams are up and running within 15 minutes. Simply sign up, connect your existing tools, and you're ready to go. We offer guided onboarding for enterprise customers who need additional support."
    },
    {
      "question": "Can I cancel my subscription at any time?",
      "answer": "Yes, you can cancel at any time with no penalties. Your access continues until the end of your billing period, and we'll never charge you again. We also offer prorated refunds for annual plans."
    }
  ]
}
```

## Guidelines

- Order by importance/frequency of the question
- Don't be defensive - address concerns directly
- Include at least one question about pricing/value
- Include at least one about data/security
- Avoid questions that nobody actually asks
- Match the {{voiceTone}} in answers

