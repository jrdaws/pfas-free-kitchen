# Preview Generation API

> **Endpoint**: `POST /api/preview/generate`
>
> Generate an HTML preview mockup for a project configuration.

---

## Overview

This endpoint generates a visual HTML preview of what a project will look like. It's useful for:
- Previewing template + integration combinations
- Exploring design ideas before generating full code
- Quick visual iterations

The preview is a self-contained HTML document with embedded CSS and JavaScript.

---

## Request

### Endpoint

```
POST https://dawson.dev/api/preview/generate
```

### Headers

```http
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | string | **Yes** | Template type: `saas`, `dashboard`, `blog`, etc. |
| `sessionId` | string | **Yes** | Unique session identifier for rate limiting |
| `description` | string | No | Natural language description of the project |
| `projectName` | string | No | Name for the project |
| `integrations` | object | No | Integration selections (e.g., `{auth: "supabase"}`) |
| `inspirations` | array | No | Reference materials (URLs, images, Figma links) |
| `vision` | string | No | Project vision statement |
| `mission` | string | No | Project mission statement |
| `userApiKey` | string | No | Your Anthropic API key for unlimited access |
| `seed` | number | No | Deterministic generation seed (enables caching) |

### Inspiration Object

```typescript
{
  type: "url" | "image" | "figma",
  value: string,  // URL or data URI
  preview?: string  // Optional preview image
}
```

---

## Response

### Success Response (200)

```json
{
  "success": true,
  "html": "<!DOCTYPE html><html>...</html>",
  "components": ["Nav", "Hero", "Features", "Pricing", "Footer"],
  "generatedAt": "2025-12-23T10:00:00Z",
  "seed": 1703325600000,
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 1800
  },
  "remainingDemoGenerations": 2,
  "redisEnabled": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether generation succeeded |
| `html` | string | Complete HTML document for preview |
| `components` | string[] | Detected component names in the preview |
| `generatedAt` | string | ISO 8601 timestamp |
| `seed` | number | Seed used for this generation |
| `cached` | boolean | Whether result was served from cache |
| `usage` | object | Token usage statistics |
| `remainingDemoGenerations` | number | Remaining demo requests (null if using own key) |
| `redisEnabled` | boolean | Whether Redis rate limiting is active |

---

## Examples

### Basic Preview

```bash
curl -X POST https://dawson.dev/api/preview/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "saas",
    "sessionId": "user-123-session-456",
    "description": "A fitness tracking app with workout logging",
    "integrations": {
      "auth": "supabase",
      "payments": "stripe"
    },
    "inspirations": []
  }'
```

### With Vision and Mission

```bash
curl -X POST https://dawson.dev/api/preview/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "saas",
    "sessionId": "user-123",
    "projectName": "FitTrack",
    "description": "Fitness app for tracking workouts",
    "vision": "Make fitness accessible to everyone",
    "mission": "Help people build healthy habits",
    "integrations": {
      "auth": "clerk",
      "payments": "stripe",
      "analytics": "posthog"
    },
    "inspirations": []
  }'
```

### With Inspirations

```bash
curl -X POST https://dawson.dev/api/preview/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "dashboard",
    "sessionId": "user-123",
    "description": "Analytics dashboard for SaaS metrics",
    "integrations": {"auth": "supabase"},
    "inspirations": [
      {"type": "url", "value": "https://example.com/dashboard"},
      {"type": "image", "value": "data:image/png;base64,..."}
    ]
  }'
```

### JavaScript Example

```typescript
const response = await fetch('/api/preview/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: 'saas',
    sessionId: crypto.randomUUID(),
    description: 'A recipe sharing platform',
    projectName: 'RecipeBox',
    integrations: { auth: 'supabase', email: 'resend' },
    inspirations: [],
  }),
});

const result = await response.json();

if (result.success) {
  // Render the preview in an iframe
  const iframe = document.getElementById('preview-iframe');
  iframe.srcdoc = result.html;
  
  console.log('Components detected:', result.components);
}
```

### Python Example

```python
import requests
import uuid

response = requests.post(
    'https://dawson.dev/api/preview/generate',
    json={
        'template': 'blog',
        'sessionId': str(uuid.uuid4()),
        'description': 'Tech blog with code snippets',
        'projectName': 'DevBlog',
        'integrations': {
            'email': 'resend'
        },
        'inspirations': []
    }
)

if response.status_code == 200:
    result = response.json()
    
    # Save HTML to file
    with open('preview.html', 'w') as f:
        f.write(result['html'])
    
    print(f"Preview saved! Components: {result['components']}")
else:
    print(f"Error: {response.json()['message']}")
```

---

## Template Types

| Template | Description | Key Sections Generated |
|----------|-------------|------------------------|
| `saas` | SaaS application | Hero, Features, Pricing, Dashboard |
| `dashboard` | Admin dashboard | Sidebar, Metrics, Charts, Data Tables |
| `blog` | Content blog | Post List, Post View, Categories, Newsletter |
| `ecommerce` | Online store | Products, Cart, Checkout, Account |
| `directory` | Listing site | Search, Filters, Listings, Detail View |
| `api-backend` | API documentation | Endpoints, Authentication, Examples |

---

## Preview Features

Generated previews include:

1. **Multi-page Navigation**: 3-5 navigable pages with JavaScript switching
2. **Terminal Aesthetic**: Dark theme with matrix green (#00ff41) and cyan (#00d9ff)
3. **Integration UI**: Visual elements for selected integrations (login buttons, pricing cards)
4. **Responsive Design**: Mobile-friendly layouts
5. **Smooth Transitions**: CSS animations between pages

---

## Error Responses

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "message": "Template is required"
}
```

### Input Too Long (400)

```json
{
  "error": "Input too long",
  "message": "Description must be less than 10000 characters"
}
```

### Invalid API Key (401)

```json
{
  "error": "Invalid API key",
  "message": "The API key provided is invalid. Please check your key and try again.",
  "details": "Get a valid key from https://console.anthropic.com"
}
```

### Rate Limited (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached the demo limit. Add your Anthropic API key for unlimited access.",
  "rateLimited": true,
  "resetAt": "2025-12-23T10:15:00Z",
  "remaining": 0
}
```

### Anthropic Rate Limited (429)

```json
{
  "error": "Anthropic rate limit exceeded",
  "message": "Too many requests to Claude API. Please try again in a few moments."
}
```

### Service Unavailable (503)

```json
{
  "error": "Service temporarily unavailable",
  "message": "Claude API is temporarily unavailable. Please try again in a few moments."
}
```

### Generation Failed (500)

```json
{
  "error": "Generation failed",
  "message": "Failed to generate preview. Please try again.",
  "details": "..."  // Only in development
}
```

---

## Caching

Previews are cached for 30 minutes when a `seed` is provided:

- Same inputs + seed = cached response (instant, `cached: true`)
- No seed = uses `temperature: 0.3` for varied outputs
- With seed = uses `temperature: 0` for deterministic output

Cache size is limited to 100 entries; older entries are cleaned up automatically.

---

## Performance

| Metric | Typical Value |
|--------|---------------|
| Response Time | 3-5 seconds |
| HTML Size | 10-30 KB |
| Model Used | Claude 3 Haiku |
| Max Output Tokens | 2000 |

---

## Related

- [Generate Project](./generate-project.md) - Full code generation
- [Error Reference](./errors.md) - All error codes
- [API Overview](./README.md) - General API documentation

