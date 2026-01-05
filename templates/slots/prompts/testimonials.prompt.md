# Testimonials Content Generation

Generate realistic customer testimonials for social proof.

## Context

**Project Name:** {{projectName}}
**Project Type:** {{projectType}}
**Description:** {{projectDescription}}
**Target Audience:** {{targetAudience}}
**Industry Focus:** {{industryFocus}} (optional)
**Number of Testimonials:** {{testimonialCount}} (default: 3)

## Requirements

Generate {{testimonialCount}} distinct testimonials with variety in:
- Company size (startup, SMB, enterprise)
- Role/title
- Specific benefit highlighted
- Quote length and style

### Testimonial Structure

1. **Quote** (25-50 words)
   - Specific, not generic praise
   - Mention a concrete result or feeling
   - Sound natural, not marketing-speak
   - Include numbers when appropriate

2. **Author Name**
   - Realistic first and last name
   - Diverse names representing different backgrounds

3. **Role/Title**
   - Appropriate for {{targetAudience}}
   - Mix of levels (IC, manager, executive)

4. **Company**
   - Realistic company name
   - Mix of known-style and unique names

5. **Avatar** (optional)
   - Placeholder URL pattern

6. **Rating** (optional, 1-5)
   - Mostly 5s with occasional 4s for authenticity

## Output Format

```json
{
  "sectionTitle": "Loved by teams everywhere",
  "testimonials": [
    {
      "quote": "We cut our deployment time by 80% after switching to {{projectName}}. Our team can now ship features in hours instead of days.",
      "author": "Sarah Chen",
      "role": "VP of Engineering",
      "company": "TechCorp",
      "avatar": "/images/avatars/avatar-1.jpg",
      "rating": 5
    },
    {
      "quote": "Finally, a tool that actually understands developer workflows. The integration was seamless and support is incredible.",
      "author": "Marcus Johnson",
      "role": "Senior Developer",
      "company": "StartupXYZ",
      "avatar": "/images/avatars/avatar-2.jpg",
      "rating": 5
    }
  ]
}
```

## Guidelines

- Avoid superlatives without substance ("best ever", "amazing")
- Include specific benefits or metrics when possible
- Vary quote lengths for visual interest
- Make roles relevant to {{targetAudience}}
- Sound authentic - real people don't speak in taglines

