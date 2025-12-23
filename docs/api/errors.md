# Error Reference

> **Version**: 1.0 | **Last Updated**: 2025-12-23
>
> Complete reference for all API error codes and recovery guidance.

---

## Error Response Format

All API errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "recovery": "Actionable recovery guidance"
  },
  "meta": {
    "timestamp": "2025-12-23T10:00:00Z"
  }
}
```

Some endpoints use a simplified format:

```json
{
  "error": "Error type",
  "message": "Human-readable message",
  "details": {}
}
```

---

## Error Codes by Category

### Client Errors (4xx)

#### Validation Errors (400)

| Error | Message | Recovery |
|-------|---------|----------|
| `Validation failed` | Description is required | Provide the description field in your request body |
| `Validation failed` | Session ID is required | Provide a unique sessionId for rate limiting |
| `Validation failed` | Template is required | Specify a template: saas, dashboard, blog, etc. |
| `Input too long` | Description must be less than 10000 characters | Shorten your description to under 10,000 characters |
| `MISSING_FIELD` | Token is required | Provide a valid project token in the URL path |
| `INVALID_INPUT` | Field value is invalid | Check field format and try again |

**Example:**

```json
{
  "error": "Validation failed",
  "message": "Description is required"
}
```

---

#### Authentication Errors (401)

| Error | Message | Recovery |
|-------|---------|----------|
| `No API key available` | Please provide your Anthropic API key | Add `userApiKey` to your request or configure platform API key |
| `Invalid API key` | The API key provided is invalid | Get a valid key from https://console.anthropic.com |

**Example:**

```json
{
  "error": "Invalid API key",
  "message": "The API key provided is invalid. Please check your key and try again.",
  "details": "Get a valid key from https://console.anthropic.com"
}
```

---

#### Not Found Errors (404)

| Error | Message | Recovery |
|-------|---------|----------|
| `TOKEN_NOT_FOUND` | Project with token "xyz" not found | Verify the token is correct. If the project expired (after 30 days), create a new one |

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Project with token \"invalid-123\" not found",
    "recovery": "Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure"
  }
}
```

---

#### Gone Errors (410)

| Error | Message | Recovery |
|-------|---------|----------|
| `TOKEN_EXPIRED` | Project token has expired | Create a new project configuration at https://dawson.dev/configure |

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Project token has expired",
    "details": {
      "expiredAt": "2025-11-22T00:00:00Z"
    },
    "recovery": "Create a new project configuration at https://dawson.dev/configure"
  }
}
```

---

#### Rate Limit Errors (429)

| Error | Message | Recovery |
|-------|---------|----------|
| `Rate limit exceeded` | You've reached the demo limit | Add your Anthropic API key for unlimited access |
| `Anthropic rate limit exceeded` | Too many requests to Claude API | Wait a few moments before retrying |
| `RATE_LIMITED` | Request rate exceeded | Wait until resetAt time or add your API key |

**Example (Demo Rate Limit):**

```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached the demo limit. Add your Anthropic API key for unlimited access.",
  "rateLimited": true,
  "resetAt": "2025-12-23T10:15:00Z",
  "remaining": 0
}
```

**Example (Anthropic Rate Limit):**

```json
{
  "error": "Anthropic rate limit exceeded",
  "message": "Too many requests to Claude API. Please try again in a few moments."
}
```

---

### Server Errors (5xx)

#### Internal Server Error (500)

| Error | Message | Recovery |
|-------|---------|----------|
| `Generation failed` | Failed to generate project/preview | Try again. If issue persists, contact support |
| `DATABASE_ERROR` | Database query failed | Try again in a few moments |
| `INTERNAL_ERROR` | Unexpected server error | Try again. If issue persists, contact support |

**Example:**

```json
{
  "error": "Generation failed",
  "message": "Failed to generate project. Please try again.",
  "retryable": true
}
```

**Development Mode Response:**

```json
{
  "error": "Generation failed",
  "message": "Failed to generate project. Please try again.",
  "details": "Error parsing JSON response from Claude",
  "stack": "Error: ...\n    at generateCode (code-generator.ts:42)\n    ..."
}
```

---

#### Service Unavailable (503)

| Error | Message | Recovery |
|-------|---------|----------|
| `Service temporarily limited` | The service has reached its usage limit | Try again later or provide your own API key |
| `Service temporarily unavailable` | Claude API is temporarily unavailable | Wait a few moments and retry |
| `SERVICE_UNAVAILABLE` | Platform is under maintenance | Check status page and try again later |

**Example (Cost Limit):**

```json
{
  "error": "Service temporarily limited",
  "message": "The service has reached its usage limit. Please try again later or provide your own Anthropic API key.",
  "costLimited": true,
  "resetAt": "2025-12-24T00:00:00Z"
}
```

**Example (Claude API):**

```json
{
  "error": "Service temporarily unavailable",
  "message": "Claude API is temporarily unavailable. Please try again in a few moments."
}
```

---

## Error Handling Best Practices

### JavaScript/TypeScript

```typescript
async function generateProject(description: string) {
  try {
    const response = await fetch('/api/generate/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        sessionId: crypto.randomUUID(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error types
      switch (response.status) {
        case 400:
          throw new Error(`Validation error: ${data.message}`);
        case 401:
          throw new Error('Please provide a valid API key');
        case 429:
          if (data.rateLimited) {
            const resetTime = new Date(data.resetAt);
            throw new Error(`Rate limited. Try again after ${resetTime.toLocaleTimeString()}`);
          }
          throw new Error('Too many requests. Please wait.');
        case 503:
          if (data.costLimited) {
            throw new Error('Service limit reached. Try with your own API key.');
          }
          throw new Error('Service temporarily unavailable');
        default:
          throw new Error(data.message || 'Unknown error');
      }
    }

    return data;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}
```

### Python

```python
import requests

def generate_project(description: str, session_id: str) -> dict:
    response = requests.post(
        'https://dawson.dev/api/generate/project',
        json={
            'description': description,
            'sessionId': session_id,
        }
    )
    
    data = response.json()
    
    if not response.ok:
        error = data.get('error', 'Unknown error')
        message = data.get('message', '')
        
        if response.status_code == 400:
            raise ValueError(f"Validation error: {message}")
        elif response.status_code == 401:
            raise PermissionError("Invalid or missing API key")
        elif response.status_code == 429:
            reset_at = data.get('resetAt', 'soon')
            raise Exception(f"Rate limited. Resets at: {reset_at}")
        elif response.status_code == 503:
            raise Exception("Service temporarily unavailable")
        else:
            raise Exception(f"API error: {error} - {message}")
    
    return data
```

---

## Retry Strategy

### Retryable Errors

| Status | Retry? | Wait Time |
|--------|--------|-----------|
| 429 (Rate Limited) | Yes | Use `resetAt` or exponential backoff |
| 500 (Server Error) | Yes | Start at 1s, max 30s |
| 503 (Unavailable) | Yes | Start at 5s, max 60s |
| 400 (Bad Request) | No | Fix input and retry |
| 401 (Unauthorized) | No | Fix API key |
| 404 (Not Found) | No | Resource doesn't exist |

### Exponential Backoff Example

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = [429, 500, 503].includes(error.status);
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Related

- [API Overview](./README.md) - General API documentation
- [API Contracts](../standards/API_CONTRACTS.md) - Implementation standards
- [Generate Project](./generate-project.md) - Project generation API
- [Preview Generation](./preview.md) - Preview API

