# Shared Schemas

> **Purpose**: JSON schemas for validation across agents and components

---

## What Goes Here

### 1. Agent Settings Schemas
Validate agent `settings.json` files:

```json
// agent-settings.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "agent", "lastUpdated"],
  "properties": {
    "version": { "type": "string" },
    "agent": { "type": "string" },
    "lastUpdated": { "type": "string", "format": "date-time" }
  }
}
```

### 2. Template Schemas
Validate `template.json` files in exported projects:

```json
// template.schema.json
{
  "type": "object",
  "required": ["name", "version", "type"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "string" },
    "type": { "enum": ["saas", "landing", "dashboard"] }
  }
}
```

### 3. Integration Schemas
Validate integration configuration:

```json
// integration.schema.json
{
  "type": "object",
  "required": ["id", "provider", "category"],
  "properties": {
    "id": { "type": "string" },
    "provider": { "type": "string" },
    "category": { "enum": ["auth", "payments", "database", "ai", "storage", "email", "analytics"] }
  }
}
```

### 4. API Response Schemas
Validate API responses follow `API_CONTRACTS.md`:

```json
// api-response.schema.json
{
  "oneOf": [
    { "$ref": "#/definitions/success" },
    { "$ref": "#/definitions/error" }
  ],
  "definitions": {
    "success": {
      "type": "object",
      "required": ["success", "data"],
      "properties": {
        "success": { "const": true },
        "data": { "type": "object" }
      }
    },
    "error": {
      "type": "object",
      "required": ["success", "error"],
      "properties": {
        "success": { "const": false },
        "error": {
          "type": "object",
          "required": ["code", "message", "recovery"]
        }
      }
    }
  }
}
```

---

## Usage

### In Code (JavaScript/TypeScript)

```javascript
import Ajv from 'ajv';
import agentSchema from './output/shared/schemas/agent-settings.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(agentSchema);

if (!validate(settings)) {
  console.error('Invalid settings:', validate.errors);
}
```

### In Tests

```javascript
import { validateAgainstSchema } from '../utils/schema-validator';
import schema from '../../output/shared/schemas/api-response.schema.json';

test('API response is valid', () => {
  expect(validateAgainstSchema(response, schema)).toBe(true);
});
```

---

## Naming Convention

```
[domain]-[type].schema.json
```

Examples:
- `agent-settings.schema.json`
- `template-config.schema.json`
- `integration-manifest.schema.json`
- `api-response.schema.json`

