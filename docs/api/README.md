# API Reference

> **Version**: 1.0 | **Last Updated**: 2025-12-23
>
> Comprehensive API documentation for the Dawson Does Framework platform.

---

## Overview

The Dawson Does Framework provides a REST API for AI-powered project generation, preview rendering, and project management. All endpoints are available at `https://dawson.dev/api/`.

### Base URL

```
Production: https://dawson.dev/api
Development: http://localhost:3000/api
```

### Authentication

Most endpoints support optional authentication via your own Anthropic API key:

```bash
# Using your own API key (unlimited usage)
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{"userApiKey": "sk-ant-...", ...}'
```

Without an API key, endpoints use the platform's API key with rate limiting (3 requests/15 min for demos).

---

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`/api/generate/project`](./generate-project.md) | POST | Generate complete project from description |
| [`/api/preview/generate`](./preview.md) | POST | Generate HTML preview of a project |
| [`/api/health`](./health.md) | GET | Check service health status |
| [`/api/projects/save`](./projects.md#save) | POST | Save project configuration |
| [`/api/projects/{token}`](./projects.md#fetch) | GET | Fetch project by token |
| [`/api/projects/{token}/download`](./projects.md#download) | GET | Download project manifest |

---

## Quick Start

### 1. Generate a Project

```bash
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A fitness tracking app with workout logging and progress charts",
    "projectName": "FitTrack",
    "sessionId": "unique-session-123",
    "modelTier": "balanced"
  }'
```

### 2. Generate a Preview

```bash
curl -X POST https://dawson.dev/api/preview/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "saas",
    "description": "SaaS for fitness tracking",
    "integrations": {"auth": "supabase", "payments": "stripe"},
    "inspirations": [],
    "sessionId": "unique-session-123"
  }'
```

### 3. Check Service Health

```bash
curl https://dawson.dev/api/health
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-23T10:00:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "You've reached the demo limit.",
    "recovery": "Add your Anthropic API key for unlimited access."
  },
  "meta": {
    "timestamp": "2025-12-23T10:00:00Z"
  }
}
```

See [Error Reference](./errors.md) for all error codes.

---

## Rate Limiting

| Scenario | Limit | Reset |
|----------|-------|-------|
| Demo (no API key) | 3 requests | Every 15 minutes |
| With user API key | Unlimited | N/A |
| Platform cost limit | Varies | Daily/Monthly |

Rate limit headers:

```http
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2025-12-23T10:15:00Z
```

When rate limited, you'll receive a `429` response:

```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached the demo limit. Add your Anthropic API key for unlimited access.",
  "rateLimited": true,
  "resetAt": "2025-12-23T10:15:00Z",
  "remaining": 0
}
```

---

## Model Tiers

The AI generation endpoints support three model tiers:

| Tier | Cost | Speed | Quality | Use Case |
|------|------|-------|---------|----------|
| `fast` | ~$0.02 | Fastest | Good | Quick iterations, testing |
| `balanced` | ~$0.08 | Medium | Better | **Default** - Best value |
| `quality` | ~$0.18 | Slower | Best | Complex projects, production |

Specify tier in requests:

```json
{
  "modelTier": "balanced",
  ...
}
```

---

## Streaming

The project generation endpoint supports Server-Sent Events (SSE) for real-time progress:

```bash
curl -X POST https://dawson.dev/api/generate/project \
  -H "Content-Type: application/json" \
  -d '{"stream": true, ...}'
```

Response stream:

```
data: {"type": "progress", "stage": "intent", "message": "Analyzing..."}
data: {"type": "progress", "stage": "architecture", "message": "Designing..."}
data: {"type": "progress", "stage": "code", "message": "Generating files..."}
data: {"type": "complete", "result": {...}}
```

---

## SDKs & Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('https://dawson.dev/api/generate/project', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'A fitness tracking app',
    projectName: 'FitTrack',
    sessionId: crypto.randomUUID(),
    modelTier: 'balanced',
  }),
});

const result = await response.json();
console.log(result.files);
```

### Python

```python
import requests
import uuid

response = requests.post(
    'https://dawson.dev/api/generate/project',
    json={
        'description': 'A fitness tracking app',
        'projectName': 'FitTrack',
        'sessionId': str(uuid.uuid4()),
        'modelTier': 'balanced',
    }
)

result = response.json()
print(result['files'])
```

---

## CORS

All endpoints support CORS for browser access:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## API Endpoints Documentation

- [Generate Project](./generate-project.md) - Full project generation with AI
- [Preview Generation](./preview.md) - HTML preview rendering
- [Health Check](./health.md) - Service status monitoring
- [Projects API](./projects.md) - Save and retrieve project configurations
- [Error Reference](./errors.md) - Complete error code documentation

---

## Related Documentation

- [API Contracts](../standards/API_CONTRACTS.md) - Implementation standards
- [Quick Start Guide](../guides/QUICK_START.md) - Getting started
- [CLI Reference](../cli/README.md) - Command-line usage

---

*For implementation details, see the source code in `website/app/api/`.*

