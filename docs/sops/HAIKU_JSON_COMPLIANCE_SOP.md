# Haiku Model JSON Schema Compliance SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Handle JSON schema compliance issues with Claude Haiku model
> **Audience**: All agents working with AI code generation
> **Observation Count**: 4 occurrences

---

## Table of Contents

1. [Overview](#1-overview)
2. [Known Haiku Behaviors](#2-known-haiku-behaviors)
3. [When to Use Haiku vs Sonnet](#3-when-to-use-haiku-vs-sonnet)
4. [JSON Repair Strategy](#4-json-repair-strategy)
5. [Schema Design for Haiku](#5-schema-design-for-haiku)
6. [Validation & Fallback](#6-validation--fallback)

---

## 1. Overview

### Problem Statement

Claude Haiku (`claude-3-haiku-20240307`) is fast and cost-effective but has lower JSON schema compliance than Sonnet, causing:
- Enum values returned as booleans (`true` instead of `"supabase"`)
- Compound method names (`email,oauth` instead of `"email"`)
- Prose responses instead of JSON
- Missing required fields

### Observation Frequency

**4 occurrences** across testing sessions (2025-12-23)

### Current Mitigation

The `json-repair.ts` utility handles most cases, but patterns persist.

---

## 2. Known Haiku Behaviors

### Behavior 1: Boolean Instead of Enum

**Expected**:
```json
{ "authProvider": "supabase" }
```

**Haiku Returns**:
```json
{ "authProvider": true }
```

**Repair**: Map `true` → first enum value, `false` → `"none"`

### Behavior 2: Compound Values

**Expected**:
```json
{ "authMethods": ["email", "oauth"] }
```

**Haiku Returns**:
```json
{ "authMethods": "email,oauth" }
```

**Repair**: Split on comma, trim whitespace

### Behavior 3: Prose Instead of JSON

**Expected**:
```json
{ "name": "MyApp", "type": "saas" }
```

**Haiku Returns**:
```
Based on your requirements, I would suggest creating a SaaS application called MyApp...
```

**Repair**: Extract JSON from markdown code blocks, or fail gracefully

### Behavior 4: Missing Required Fields

**Expected**:
```json
{ "name": "MyApp", "type": "saas", "features": [] }
```

**Haiku Returns**:
```json
{ "name": "MyApp", "type": "saas" }
```

**Repair**: Add default values for missing fields

---

## 3. When to Use Haiku vs Sonnet

### Decision Matrix

| Task | Complexity | Schema Strictness | Model Choice |
|------|------------|-------------------|--------------|
| Intent analysis | Low | Medium | ✅ Haiku |
| Architecture design | Medium | Medium | ⚠️ Haiku (with repair) |
| Code generation | High | High | ❌ Sonnet only |
| Context building | Low | Low | ✅ Haiku |
| Simple prompts | Low | Low | ✅ Haiku |
| Complex JSON | High | High | ❌ Sonnet only |

### Cost-Benefit Analysis

| Model | Cost (per 1M output) | JSON Reliability | Recommendation |
|-------|---------------------|------------------|----------------|
| Haiku | $1.25 | 70-80% | Use with repair layer |
| Sonnet | $15.00 | 95-99% | Use for critical output |

### Rule of Thumb

```
If output is code OR complex nested JSON → Use Sonnet
If output is simple structured data → Use Haiku + repair
```

---

## 4. JSON Repair Strategy

### Current Implementation

Located in: `packages/ai-agent/src/utils/json-repair.ts`

```typescript
export function repairAndParseJSON(text: string): RepairResult {
  // 1. Extract JSON from markdown code blocks
  const extracted = extractJSON(text);
  
  // 2. Fix common syntax issues
  const fixed = fixSyntax(extracted);
  
  // 3. Normalize enum values
  const normalized = normalizeEnums(fixed, schemaEnums);
  
  // 4. Parse and validate
  return parseAndValidate(normalized);
}
```

### Repair Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `extractJSON()` | Get JSON from prose | `"Here's the config: {...}"` → `{...}` |
| `fixSyntax()` | Fix trailing commas, quotes | `{a: 1,}` → `{"a": 1}` |
| `normalizeEnums()` | Convert booleans/compounds | `true` → `"supabase"` |
| `addDefaults()` | Fill missing required fields | `{}` → `{"features": []}` |

### Logging Repairs

```typescript
if (repairResult.repaired) {
  console.log(`[JSON Repair] Applied: ${repairResult.repairs.join(", ")}`);
  // Log to metrics for tracking
  logRepairEvent(repairResult.repairs);
}
```

---

## 5. Schema Design for Haiku

### Best Practices

When designing schemas for Haiku consumption:

#### ✅ DO

1. **Use string enums with clear values**
   ```typescript
   authProvider: z.enum(["supabase", "clerk", "none"])
   ```

2. **Provide defaults for optional fields**
   ```typescript
   features: z.array(z.string()).default([])
   ```

3. **Keep nesting shallow** (max 2-3 levels)

4. **Use explicit examples in prompts**
   ```
   Return JSON like: {"name": "Example", "type": "saas"}
   ```

#### ❌ DON'T

1. **Avoid boolean-like enum values**
   ```typescript
   // BAD - Haiku might return true/false
   enabled: z.enum(["true", "false"])
   
   // GOOD - Clear string values
   status: z.enum(["enabled", "disabled"])
   ```

2. **Avoid complex union types**
   ```typescript
   // BAD - Too complex for Haiku
   config: z.union([StringConfig, ObjectConfig, ArrayConfig])
   
   // GOOD - Single type
   config: z.object({ value: z.string() })
   ```

3. **Avoid deeply nested optional objects**

---

## 6. Validation & Fallback

### Validation Pipeline

```typescript
async function generateWithValidation(prompt: string, schema: ZodSchema) {
  // Attempt 1: Haiku
  const haikuResult = await tryHaiku(prompt);
  
  if (haikuResult.success) {
    return haikuResult.data;
  }
  
  // Attempt 2: Haiku with repair
  const repaired = repairAndParseJSON(haikuResult.text);
  if (repaired.success) {
    console.log(`[Haiku] Repaired: ${repaired.repairs.join(", ")}`);
    return repaired.data;
  }
  
  // Attempt 3: Fallback to Sonnet
  console.warn(`[Haiku] Failed, falling back to Sonnet`);
  return await trySonnet(prompt);
}
```

### Fallback Triggers

| Condition | Action |
|-----------|--------|
| Parse error after repair | Fallback to Sonnet |
| Zod validation fails | Fallback to Sonnet |
| 3+ repair attempts | Switch to Sonnet for session |
| Critical output (code) | Always use Sonnet |

### Cost Tracking

Track when fallbacks occur to optimize model selection:

```typescript
interface FallbackEvent {
  timestamp: string;
  stage: string;
  haikuAttempts: number;
  repairsApplied: string[];
  fellBackToSonnet: boolean;
  estimatedCostSaved: number; // If Haiku succeeded
  estimatedCostAdded: number; // If Sonnet fallback needed
}
```

---

## Metrics & Monitoring

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Haiku success rate (pre-repair) | >70% | <50% |
| Haiku success rate (post-repair) | >95% | <85% |
| Fallback to Sonnet rate | <10% | >20% |
| Repair rate | <30% | >50% |

### Monitoring Commands

```bash
# Check repair metrics
cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/shared/metrics/json-repair-log.csv | tail -20

# Check fallback frequency
cd /Users/joseph.dawson/Documents/dawson-does-framework && grep "falling back to Sonnet" logs/*.log | wc -l
```

---

## Related Documents

- [AI Model Selection SOP](./AI_MODEL_SELECTION_SOP.md) - Token limits and model tiers
- [json-repair.ts](../../packages/ai-agent/src/utils/json-repair.ts) - Repair implementation

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Observer | Testing Agent | 2025-12-23 | ✅ Logged (4 occurrences) |
| Drafter | Documentation Agent | 2025-12-23 | ✅ Complete |
| Reviewer | Auditor Agent | 2025-12-23 | ✅ Approved (94/100) |

