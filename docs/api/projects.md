# Projects API

> Save and retrieve project configurations from the platform.

---

## Overview

The Projects API allows you to:
- Save project configurations for later retrieval
- Fetch saved configurations by token
- Download project manifests for CLI consumption

Projects are stored with a 30-day expiration and can be retrieved using a unique token.

---

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/save` | POST | Save a new project configuration |
| `/api/projects/{token}` | GET | Fetch project by token |
| `/api/projects/{token}/download` | GET | Download project manifest |

---

## Save Project {#save}

Save a project configuration and receive a token for later retrieval.

### Endpoint

```
POST https://dawson.dev/api/projects/save
```

### Request Body

```json
{
  "template": "saas",
  "project_name": "My App",
  "output_dir": "./my-app",
  "integrations": {
    "auth": "supabase",
    "payments": "stripe"
  },
  "env_keys": {
    "SUPABASE_URL": "https://xxx.supabase.co"
  },
  "vision": "Simplify invoicing for freelancers",
  "mission": "Save time on billing",
  "success_criteria": "100 paying users in 3 months",
  "inspirations": [
    { "type": "url", "value": "https://example.com" }
  ],
  "description": "An invoicing app for freelancers"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | string | **Yes** | Template ID: `saas`, `dashboard`, `blog`, etc. |
| `project_name` | string | **Yes** | Name for the project |
| `output_dir` | string | No | Output directory (default: `./my-app`) |
| `integrations` | object | No | Integration selections |
| `env_keys` | object | No | Pre-filled environment variables |
| `vision` | string | No | Project vision statement |
| `mission` | string | No | Project mission statement |
| `success_criteria` | string | No | Success metrics |
| `inspirations` | array | No | Reference materials |
| `description` | string | No | Natural language description |

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "token": "fast-lion-1234",
    "expiresAt": "2026-01-22T00:00:00Z",
    "pullCommand": "npx @jrdaws/framework pull fast-lion-1234",
    "url": "https://dawson.dev/configure?project=fast-lion-1234"
  },
  "meta": {
    "timestamp": "2025-12-23T10:00:00Z"
  }
}
```

### Example

```bash
curl -X POST https://dawson.dev/api/projects/save \
  -H "Content-Type: application/json" \
  -d '{
    "template": "saas",
    "project_name": "InvoiceApp",
    "integrations": {
      "auth": "supabase",
      "payments": "stripe",
      "email": "resend"
    }
  }'
```

---

## Fetch Project {#fetch}

Retrieve a saved project configuration by token.

### Endpoint

```
GET https://dawson.dev/api/projects/{token}
```

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `token` | URL path | **Yes** | Project token from save response |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "token": "fast-lion-1234",
    "template": "saas",
    "project_name": "InvoiceApp",
    "output_dir": "./invoice-app",
    "integrations": {
      "auth": "supabase",
      "payments": "stripe"
    },
    "env_keys": {},
    "vision": "Simplify invoicing",
    "mission": "Save time",
    "success_criteria": "100 users",
    "inspirations": [],
    "description": "An invoicing app",
    "created_at": "2025-12-23T10:00:00Z",
    "expires_at": "2026-01-22T00:00:00Z",
    "last_accessed_at": "2025-12-23T10:00:00Z"
  },
  "meta": {
    "timestamp": "2025-12-23T10:00:00Z"
  }
}
```

### Example

```bash
curl https://dawson.dev/api/projects/fast-lion-1234
```

---

## Download Project Manifest {#download}

Download a CLI-compatible project manifest file.

### Endpoint

```
GET https://dawson.dev/api/projects/{token}/download
```

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `token` | URL path | **Yes** | Project token |

### Response Headers

```http
Content-Type: application/json
Content-Disposition: attachment; filename="project-name-config.json"
Access-Control-Allow-Origin: *
```

### Success Response (200)

```json
{
  "version": "1.0.0",
  "token": "fast-lion-1234",
  "template": "saas",
  "project_name": "InvoiceApp",
  "output_dir": "./invoice-app",
  "created_at": "2025-12-23T10:00:00Z",
  "expires_at": "2026-01-22T00:00:00Z",
  "config": {
    "integrations": {
      "auth": "supabase",
      "payments": "stripe"
    },
    "env_keys": {},
    "vision": "Simplify invoicing",
    "mission": "Save time",
    "success_criteria": "100 users",
    "inspirations": [],
    "description": "An invoicing app"
  },
  "files": {
    "base": ["app/page.tsx", "app/layout.tsx", "..."],
    "integrations": ["integrations/auth/supabase/...", "..."],
    "total": 45
  },
  "cli": {
    "pullCommand": "npx @jrdaws/framework pull fast-lion-1234",
    "templatePath": "templates/saas"
  }
}
```

### Example

```bash
# Download and save to file
curl -o project-config.json \
  https://dawson.dev/api/projects/fast-lion-1234/download
```

---

## Error Responses

### Missing Required Field (400)

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELD",
    "message": "Template is required",
    "details": { "field": "template" },
    "recovery": "Provide template in the request body"
  }
}
```

### Token Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Project with token \"invalid-123\" not found",
    "recovery": "Verify the token is correct. If the project expired, create a new one."
  }
}
```

### Token Expired (410)

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Project token has expired",
    "details": { "expiredAt": "2025-11-22T00:00:00Z" },
    "recovery": "Create a new project configuration at https://dawson.dev/configure"
  }
}
```

### Rate Limited (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": { "resetAt": "2025-12-23T10:15:00Z" },
    "recovery": "Wait a few minutes before trying again"
  }
}
```

---

## JavaScript Examples

### Save and Pull Workflow

```typescript
// 1. Save project configuration
const saveResponse = await fetch('/api/projects/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: 'saas',
    project_name: 'MyApp',
    integrations: {
      auth: 'supabase',
      payments: 'stripe',
    },
  }),
});

const { data } = await saveResponse.json();
console.log('Pull command:', data.pullCommand);
// npx @jrdaws/framework pull fast-lion-1234

// 2. Later: Fetch the configuration
const fetchResponse = await fetch(`/api/projects/${data.token}`);
const project = await fetchResponse.json();
console.log('Project:', project.data.project_name);
```

### Download Manifest

```typescript
const downloadManifest = async (token: string) => {
  const response = await fetch(`/api/projects/${token}/download`);
  
  if (!response.ok) {
    throw new Error('Failed to download manifest');
  }
  
  const manifest = await response.json();
  
  // Save to file (Node.js)
  const fs = require('fs');
  fs.writeFileSync(
    `${manifest.project_name}-config.json`,
    JSON.stringify(manifest, null, 2)
  );
  
  return manifest;
};
```

---

## Python Examples

### Save Project

```python
import requests

response = requests.post(
    'https://dawson.dev/api/projects/save',
    json={
        'template': 'saas',
        'project_name': 'MyApp',
        'integrations': {
            'auth': 'supabase',
            'payments': 'stripe',
        },
    }
)

data = response.json()
print(f"Token: {data['data']['token']}")
print(f"Pull: {data['data']['pullCommand']}")
```

### Fetch Project

```python
import requests

token = "fast-lion-1234"
response = requests.get(f'https://dawson.dev/api/projects/{token}')

if response.status_code == 200:
    project = response.json()['data']
    print(f"Project: {project['project_name']}")
    print(f"Template: {project['template']}")
    print(f"Integrations: {project['integrations']}")
elif response.status_code == 404:
    print("Project not found")
elif response.status_code == 410:
    print("Project expired")
```

---

## CLI Integration

The CLI uses these endpoints internally:

```bash
# This command calls GET /api/projects/{token}/download
npx @jrdaws/framework pull fast-lion-1234

# Then uses the manifest to scaffold the project locally
```

---

## Token Format

Tokens are human-readable strings in the format:

```
{adjective}-{noun}-{number}
```

Examples:
- `fast-lion-1234`
- `swift-eagle-5678`
- `quiet-fox-9012`

Tokens are:
- Unique across all projects
- Case-insensitive for lookup
- Valid for 30 days from creation

---

## Related

- [API Overview](./README.md) - General API documentation
- [Error Reference](./errors.md) - All error codes
- [CLI Pull Command](../cli/pull.md) - Using tokens with CLI

