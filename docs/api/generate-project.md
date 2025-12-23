# Generate Project API

> **Endpoint**: `POST /api/generate/project`
>
> Generate a complete project from a natural language description using AI.

---

## Overview

This endpoint uses a multi-stage AI pipeline to transform a project description into:
- Intent analysis (understanding what you want to build)
- Architecture design (pages, components, routes)
- Code generation (actual TypeScript/React files)
- Cursor context (AI assistant configuration)

---

## Request

### Endpoint

```
POST https://dawson.dev/api/generate/project
```

### Headers

```http
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | **Yes** | Natural language description of the project (max 10,000 chars) |
| `sessionId` | string | **Yes** | Unique session identifier for rate limiting |
| `projectName` | string | No | Name for the project (default: derived from description) |
| `template` | string | No | Suggested template: `saas`, `dashboard`, `blog`, etc. |
| `vision` | string | No | Project vision statement |
| `mission` | string | No | Project mission statement |
| `inspirations` | array | No | Reference materials (URLs, images, Figma links) |
| `userApiKey` | string | No | Your Anthropic API key for unlimited access |
| `modelTier` | string | No | Quality tier: `fast`, `balanced` (default), `quality` |
| `stream` | boolean | No | Enable SSE streaming (default: `false`) |
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
  "intent": {
    "category": "saas",
    "confidence": 0.92,
    "reasoning": "User wants a subscription-based fitness app...",
    "suggestedTemplate": "saas",
    "features": ["workout logging", "progress charts", "social features"],
    "integrations": {
      "auth": "supabase",
      "payments": "stripe",
      "db": "supabase"
    },
    "complexity": "moderate",
    "keyEntities": ["User", "Workout", "Exercise", "Progress"]
  },
  "architecture": {
    "template": "saas",
    "pages": [
      {
        "path": "/",
        "name": "Home",
        "description": "Landing page with hero and features",
        "components": ["Hero", "Features", "Pricing", "Footer"],
        "layout": "default"
      },
      {
        "path": "/dashboard",
        "name": "Dashboard",
        "description": "User dashboard with workout stats",
        "components": ["DashboardNav", "WorkoutStats", "RecentWorkouts"],
        "layout": "dashboard"
      }
    ],
    "components": [
      {
        "name": "WorkoutCard",
        "type": "feature",
        "description": "Displays workout summary with exercises",
        "props": { "workout": "Workout", "onEdit": "() => void" },
        "template": "create-new"
      }
    ],
    "routes": [
      { "path": "/api/workouts", "type": "api", "method": "GET", "description": "List user workouts" },
      { "path": "/api/workouts", "type": "api", "method": "POST", "description": "Create workout" }
    ]
  },
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// Generated home page...",
      "overwrite": true
    },
    {
      "path": "app/dashboard/page.tsx",
      "content": "// Generated dashboard...",
      "overwrite": true
    },
    {
      "path": "components/WorkoutCard.tsx",
      "content": "// Generated component...",
      "overwrite": true
    }
  ],
  "integrationCode": [
    {
      "integration": "auth.supabase",
      "files": [
        { "path": "lib/supabase.ts", "content": "...", "overwrite": false }
      ]
    }
  ],
  "cursorrules": "# Project: FitTrack\n\n## Stack\n- Next.js 15...",
  "startPrompt": "# FitTrack\n\nYou are building a fitness tracking app...",
  "generatedAt": "2025-12-23T10:00:00Z",
  "seed": 1703325600000,
  "remainingDemoGenerations": 2,
  "redisEnabled": true
}
```

### Streaming Response

When `stream: true`, the endpoint returns Server-Sent Events:

```
data: {"type":"progress","stage":"intent","eventType":"start","message":"Analyzing project intent..."}
data: {"type":"progress","stage":"intent","eventType":"complete","message":"Intent analysis complete"}
data: {"type":"progress","stage":"architecture","eventType":"start","message":"Designing architecture..."}
data: {"type":"progress","stage":"architecture","eventType":"complete","message":"Architecture design complete"}
data: {"type":"progress","stage":"code","eventType":"start","message":"Generating code files..."}
data: {"type":"progress","stage":"code","eventType":"complete","message":"Code generation complete"}
data: {"type":"complete","result":{...full response...}}
```

---

## Examples

### Basic Generation

```bash
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A fitness tracking app where users can log workouts, track progress with charts, and connect with friends for accountability",
    "projectName": "FitTrack",
    "sessionId": "user-123-session-456"
  }'
```

### With Custom API Key (Unlimited)

```bash
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Project management tool for remote teams",
    "projectName": "TeamFlow",
    "sessionId": "user-123",
    "userApiKey": "sk-ant-api03-...",
    "modelTier": "quality"
  }'
```

### With Template and Integrations Hint

```bash
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{
    "description": "SaaS app for invoicing with Stripe subscriptions",
    "template": "saas",
    "sessionId": "user-123",
    "vision": "Simplify invoicing for freelancers",
    "mission": "Provide professional invoicing in under 5 minutes"
  }'
```

### JavaScript with Streaming

```typescript
const response = await fetch('/api/generate/project', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'A recipe sharing platform',
    projectName: 'RecipeBox',
    sessionId: crypto.randomUUID(),
    stream: true,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      
      if (event.type === 'progress') {
        console.log(`[${event.stage}] ${event.message}`);
      } else if (event.type === 'complete') {
        console.log('Generation complete!', event.result);
      }
    }
  }
}
```

### Python Example

```python
import requests
import uuid

response = requests.post(
    'https://dawson.dev/api/generate/project',
    json={
        'description': 'An e-commerce store for handmade crafts',
        'projectName': 'CraftShop',
        'sessionId': str(uuid.uuid4()),
        'modelTier': 'balanced',
    }
)

if response.status_code == 200:
    result = response.json()
    
    # Access generated files
    for file in result['files']:
        print(f"Generated: {file['path']}")
    
    # Get the .cursorrules content
    cursorrules = result['cursorrules']
    
    # Get the START_PROMPT.md content
    start_prompt = result['startPrompt']
else:
    error = response.json()
    print(f"Error: {error['message']}")
```

---

## Error Responses

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "message": "Description is required"
}
```

### Input Too Long (400)

```json
{
  "error": "Input too long",
  "message": "Description must be less than 10000 characters"
}
```

### No API Key (401)

```json
{
  "error": "No API key available",
  "message": "Please provide your Anthropic API key to generate projects."
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

### Cost Limited (503)

```json
{
  "error": "Service temporarily limited",
  "message": "The service has reached its usage limit. Please try again later or provide your own Anthropic API key.",
  "costLimited": true,
  "resetAt": "2025-12-24T00:00:00Z"
}
```

### Generation Failed (500)

```json
{
  "error": "Generation failed",
  "message": "Failed to generate project. Please try again.",
  "details": "...",  // Only in development
  "retryable": true
}
```

---

## Model Tiers

| Tier | Models Used | Approx Cost | Best For |
|------|-------------|-------------|----------|
| `fast` | Haiku everywhere | ~$0.02 | Quick iterations, testing |
| `balanced` | Haiku + Sonnet for code | ~$0.08 | **Default** - Recommended |
| `quality` | Sonnet everywhere | ~$0.18 | Complex projects |

The pipeline stages and their models per tier:

| Stage | Fast | Balanced | Quality |
|-------|------|----------|---------|
| Intent | Haiku | Haiku | Sonnet |
| Architecture | Haiku | Haiku | Sonnet |
| Code | Haiku | Sonnet | Sonnet |
| Context | Haiku | Haiku | Sonnet |

---

## Caching

Results are cached for 30 minutes when a `seed` is provided:
- Same inputs + seed = cached response (instant)
- No seed = fresh generation each time
- Cache hit returns `cached: true` in response

---

## Related

- [Preview Generation](./preview.md) - Generate HTML previews
- [Error Reference](./errors.md) - All error codes
- [API Overview](./README.md) - General API documentation

