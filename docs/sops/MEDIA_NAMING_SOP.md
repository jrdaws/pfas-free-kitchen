# Media Asset Naming SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Establish consistent naming conventions for generated media assets
> **Audience**: Research Agent, Media Agent, Quality Agent, Template Agent
> **Observation Count**: 1 occurrence (proactive SOP)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Naming Convention](#2-naming-convention)
3. [File Organization](#3-file-organization)
4. [Metadata Requirements](#4-metadata-requirements)
5. [Examples](#5-examples)

---

## 1. Overview

### Purpose

Consistent media naming enables:
- Easy asset identification
- Automated organization
- Version tracking
- Cross-project reuse

### Scope

Applies to ALL generated media:
- Hero images
- Product photos
- Icons
- Backgrounds
- Illustrations
- Logos

---

## 2. Naming Convention

### Format

```
{category}-{descriptor}-{variant}-{size}.{ext}
```

### Components

| Component | Required | Format | Example |
|-----------|----------|--------|---------|
| `category` | ✅ | lowercase, hyphenated | `hero`, `product`, `icon` |
| `descriptor` | ✅ | lowercase, hyphenated | `dashboard-preview`, `user-avatar` |
| `variant` | ⚠️ Optional | lowercase | `dark`, `light`, `hover` |
| `size` | ⚠️ Optional | WxH or preset | `1200x630`, `sm`, `lg` |
| `ext` | ✅ | lowercase | `png`, `jpg`, `webp`, `svg` |

### Categories

| Category | Use Case | Example |
|----------|----------|---------|
| `hero` | Main page headers | `hero-landing-dark-1920x1080.png` |
| `product` | Product screenshots | `product-dashboard-light.png` |
| `icon` | UI icons | `icon-settings-24.svg` |
| `bg` | Background images | `bg-gradient-purple.png` |
| `avatar` | User/team photos | `avatar-team-ceo.jpg` |
| `logo` | Brand logos | `logo-primary-dark.svg` |
| `illustration` | Custom illustrations | `illustration-onboarding-step1.png` |
| `og` | Open Graph images | `og-homepage-1200x630.png` |

---

## 3. File Organization

### Project Assets

```
public/
├── images/
│   ├── hero/
│   │   ├── hero-landing-dark-1920x1080.png
│   │   └── hero-landing-light-1920x1080.png
│   ├── product/
│   │   ├── product-dashboard-preview.png
│   │   └── product-feature-analytics.png
│   ├── icons/
│   │   └── (SVG icons)
│   ├── og/
│   │   └── og-homepage-1200x630.png
│   └── team/
│       └── avatar-team-founder.jpg
└── favicon.ico
```

### Media Pipeline Output

```
output/shared/media/
├── media-agent/outbox/
│   └── approved/
│       ├── PROJECT-myapp/
│       │   ├── hero-landing-dark-1920x1080.png
│       │   └── manifest.json
│       └── TEMPLATE-saas/
│           └── ...
└── quality-agent/inbox/
    └── pending-review/
        └── ...
```

### Manifest File

Every asset batch MUST include a `manifest.json`:

```json
{
  "project": "myapp",
  "generated": "2025-12-23T15:30:00Z",
  "generator": "stable-diffusion-xl",
  "assets": [
    {
      "file": "hero-landing-dark-1920x1080.png",
      "category": "hero",
      "prompt": "Modern SaaS dashboard...",
      "dimensions": { "width": 1920, "height": 1080 },
      "format": "png",
      "size": "2.4MB"
    }
  ]
}
```

---

## 4. Metadata Requirements

### Required Metadata

Every asset MUST have:

| Field | Description | Example |
|-------|-------------|---------|
| `category` | Asset type | `hero` |
| `prompt` | Generation prompt | `"Modern dashboard..."` |
| `generator` | AI model used | `stable-diffusion-xl` |
| `dimensions` | Width x Height | `1920x1080` |
| `format` | File extension | `png` |

### Optional Metadata

| Field | Description | Example |
|-------|-------------|---------|
| `variant` | Theme variant | `dark` |
| `version` | Asset version | `2` |
| `approved_by` | Quality Agent | `QUA Agent 2025-12-23` |
| `cost` | Generation cost | `$0.02` |

---

## 5. Examples

### ✅ Good Names

```
hero-landing-dark-1920x1080.png
product-dashboard-analytics-light.png
icon-menu-hamburger-24.svg
bg-gradient-purple-to-blue.png
og-blog-article-1200x630.png
avatar-team-cto-256.jpg
logo-primary-white.svg
illustration-empty-state-no-data.png
```

### ❌ Bad Names

```
image1.png                    # No descriptor
Dashboard Screenshot.png      # Spaces, caps
hero.png                      # Too generic
final_v2_FINAL.png           # Version chaos
IMG_20231223.jpg             # Camera default
```

### Renaming Script

```bash
# Rename legacy files
cd /Users/joseph.dawson/Documents/dawson-does-framework

# Example: Rename "Dashboard Screenshot.png" → "product-dashboard-main.png"
for f in public/images/*.png; do
  # Convert to lowercase, replace spaces with hyphens
  new_name=$(echo "$f" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  mv "$f" "$new_name"
done
```

---

## Validation

### Check Naming Compliance

```bash
# Find non-compliant files
cd /Users/joseph.dawson/Documents/dawson-does-framework && find public/images -type f \( -name "* *" -o -name "*[A-Z]*" \) 2>/dev/null && echo "⚠️ Non-compliant files found" || echo "✅ All files compliant"
```

### Pre-Commit Hook

```bash
# Add to .git/hooks/pre-commit
for file in $(git diff --cached --name-only | grep -E "^public/images/"); do
  if echo "$file" | grep -qE "[A-Z ]"; then
    echo "❌ Invalid media name: $file"
    echo "   Use lowercase with hyphens, no spaces"
    exit 1
  fi
done
```

---

## Related Documents

- [Media Pipeline](../../output/shared/media/MEDIA_PIPELINE.md)
- [Photorealistic Prompt Guide](../../output/shared/media/shared/PHOTOREALISTIC_PROMPT_GUIDE.md)
- [Quality Agent Role](../../prompts/agents/roles/media-pipeline/QUALITY_AGENT.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation (proactive SOP) |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Observer | Quality Agent | 2025-12-23 | ✅ Logged (1 occurrence) |
| Drafter | Documentation Agent | 2025-12-23 | ✅ Complete |
| Reviewer | Auditor Agent | 2025-12-23 | ✅ Approved (94/100) |

