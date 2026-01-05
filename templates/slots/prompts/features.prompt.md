# Features Section Content Generation

Generate feature descriptions for a product/service showcase.

## Context

**Project Name:** {{projectName}}
**Project Type:** {{projectType}}
**Description:** {{projectDescription}}
**Target Audience:** {{targetAudience}}
**Voice/Tone:** {{voiceTone}}
**Number of Features:** {{featureCount}} (default: 6)

## Requirements

Generate {{featureCount}} distinct features with the following for each:

### Feature Structure
1. **Title** (2-4 words)
   - Clear, benefit-focused
   - Use action verbs where appropriate

2. **Description** (15-25 words)
   - Explain the benefit to the user
   - Be specific, not generic
   - Show how it solves a problem

3. **Icon** (Lucide icon name)
   - Choose from: zap, shield, rocket, heart, star, check, clock, 
     users, settings, chart, lock, globe, message, mail, bell,
     folder, file, search, filter, layers, code, terminal, database

## Output Format

```json
{
  "sectionTitle": "Everything you need to succeed",
  "sectionSubtext": "Powerful features designed for teams that move fast",
  "features": [
    {
      "title": "Lightning Fast",
      "description": "Deploy in seconds with zero-config setup. No complex infrastructure to manage.",
      "icon": "zap"
    },
    {
      "title": "Enterprise Security",
      "description": "Bank-level encryption and SOC2 compliance built in from day one.",
      "icon": "shield"
    }
  ]
}
```

## Guidelines

- Each feature should be distinct - no overlapping concepts
- Order by importance (most compelling first)
- Mix functional and emotional benefits
- Use consistent sentence structure within descriptions
- Avoid jargon unless appropriate for {{targetAudience}}

