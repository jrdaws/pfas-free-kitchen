# AI Model Selection & Token Limit Handling SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Prevent code generation failures from token limit truncation
> **Audience**: All agents working with AI code generation
> **Approved By**: Auditor Agent (Score: 85/100)
> **Drafted By**: Documentation Agent

---

## Table of Contents

1. [Overview](#1-overview)
2. [Model Specifications](#2-model-specifications)
3. [Token Limits by Stage](#3-token-limits-by-stage)
4. [Tier Selection](#4-tier-selection)
5. [Pre-Generation Size Estimation](#5-pre-generation-size-estimation)
6. [Chunked Generation Protocol](#6-chunked-generation-protocol)
7. [Truncation Detection & Recovery](#7-truncation-detection--recovery)
8. [Monitoring & Alerts](#8-monitoring--alerts)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

### Problem Statement

AI code generation frequently truncates output when token limits are insufficient, causing:
- Code generation failures for complex projects
- Retry exhaustion wasting API credits ($0.12-0.15 per failed attempt)
- Incomplete JSON outputs requiring manual intervention

### Observation Frequency

**5+ occurrences** across multiple testing sessions (2025-12-23)

**Source**: `output/media-pipeline/quality-agent/workspace/sop-opportunities.md`

---

## 2. Model Specifications

### Available Models

| Model | ID | Input Cost | Output Cost | Reliability | Use Case |
|-------|-----|------------|-------------|-------------|----------|
| **Haiku** | `claude-3-haiku-20240307` | $0.25/1M | $1.25/1M | Medium | Fast, simple tasks |
| **Sonnet** | `claude-sonnet-4-20250514` | $3.00/1M | $15.00/1M | High | Complex code generation |

### Key Characteristics

| Model | JSON Schema Compliance | Max Context | Recommended For |
|-------|----------------------|-------------|-----------------|
| Haiku | Requires JSON repair | 200K | Intent analysis, simple prompts |
| Sonnet | Excellent | 200K | Code generation, architecture |

### Cost Comparison (per project)

| Tier | Estimated Cost | Speed | Quality |
|------|---------------|-------|---------|
| Fast (all Haiku) | $0.02-0.04 | ⚡ Fastest | ⚠️ May need repairs |
| Balanced | $0.08-0.12 | 🔄 Medium | ✅ Good |
| Quality (all Sonnet) | $0.15-0.25 | 🐢 Slowest | ✅ Best |

---

## 3. Token Limits by Stage

### Current Implementation

Located in: `packages/ai-agent/src/code-generator.ts`

```typescript
// Current token limits per stage
const TOKEN_LIMITS = {
  intent: 2048,      // Intent analysis (simple JSON)
  architecture: 4096, // Architecture design (moderate JSON)
  code: 4096,        // Code generation (large JSON with files)
  context: 4096,     // Cursor context (two markdown files)
};
```

### Recommended Token Limits

| Stage | Current | Recommended | Rationale |
|-------|---------|-------------|-----------|
| Intent | 2048 | 2048 | ✅ Sufficient for intent JSON |
| Architecture | 4096 | 4096 | ✅ Sufficient for architecture |
| Code | 4096 | **Dynamic** | ⚠️ Often truncates, see Section 6 |
| Context | 4096 | 4096 | ✅ Sufficient for .cursorrules + START_PROMPT |

### Token-to-Output Estimation

| Output Size | Estimated Tokens | Safe Token Limit |
|-------------|------------------|------------------|
| 1-3 files | 1,500-2,500 | 4,096 |
| 4-6 files | 2,500-4,000 | 4,096 |
| 7-10 files | 4,000-6,500 | 8,192 |
| 11+ files | 6,500+ | 16,384+ |

---

## 4. Tier Selection

### Tier Definitions

Located in: `packages/ai-agent/src/index.ts`

```typescript
export const MODEL_TIERS = {
  fast: {
    intent: "claude-3-haiku-20240307",
    architecture: "claude-3-haiku-20240307",
    code: "claude-3-haiku-20240307",      // ⚠️ May struggle with complex code
    context: "claude-3-haiku-20240307",
  },
  balanced: {
    intent: "claude-3-haiku-20240307",
    architecture: "claude-3-haiku-20240307",
    code: "claude-sonnet-4-20250514",      // ✅ Sonnet for code quality
    context: "claude-3-haiku-20240307",
  },
  quality: {
    intent: "claude-sonnet-4-20250514",
    architecture: "claude-sonnet-4-20250514",
    code: "claude-sonnet-4-20250514",
    context: "claude-sonnet-4-20250514",
  },
};
```

### Selection Criteria

| Scenario | Recommended Tier | Reason |
|----------|-----------------|--------|
| Quick prototype | `fast` | Speed over quality, use JSON repair |
| Standard project | `balanced` | Cost-effective with reliable code |
| Complex/critical | `quality` | Maximum reliability |
| Production deploy | `quality` | Worth the extra cost |

### Usage Example

```typescript
// Using tier in generateProject
const result = await generateProject(
  { description: '...', projectName: 'MyApp' },
  { modelTier: 'balanced' }  // or 'fast' | 'quality'
);
```

---

## 5. Pre-Generation Size Estimation

### Why Estimate?

Before calling the AI, estimate output size to:
1. Select appropriate token limit
2. Decide if chunking is needed
3. Avoid wasted API calls on truncation

### Estimation Formula

```typescript
function estimateOutputTokens(architecture: ProjectArchitecture): number {
  // Base tokens per component type
  const TOKENS_PER = {
    page: 800,           // Full page with components
    component: 400,      // Reusable component
    apiRoute: 300,       // API route handler
    utilFile: 200,       // Utility/helper file
    configFile: 150,     // Config/env file
    schemaFile: 250,     // Database/type schema
    layoutFile: 500,     // Layout with navigation
  };

  let estimate = 500; // Base JSON overhead

  // Count from architecture
  estimate += (architecture.pages?.length || 0) * TOKENS_PER.page;
  estimate += (architecture.components?.length || 0) * TOKENS_PER.component;
  estimate += (architecture.apiRoutes?.length || 0) * TOKENS_PER.apiRoute;
  
  // Add buffer for complexity
  const complexityMultiplier = 
    architecture.integrations?.length > 2 ? 1.3 :
    architecture.integrations?.length > 0 ? 1.15 : 1.0;

  return Math.ceil(estimate * complexityMultiplier);
}
```

### Token Limit Selection

```typescript
function selectTokenLimit(estimatedTokens: number): number {
  if (estimatedTokens <= 3000) return 4096;
  if (estimatedTokens <= 6000) return 8192;
  if (estimatedTokens <= 12000) return 16384;
  return 32768; // Maximum for complex projects
}
```

---

## 6. Chunked Generation Protocol

### When to Chunk

**Threshold**: Projects with more than **6 core files** (pages + API routes)

### Chunking Strategy

Instead of generating all code in one call, split into logical chunks:

```typescript
// Chunking by layer
const CHUNK_STRATEGY = {
  foundation: ['layout', 'config', 'types', 'schemas'],
  core: ['pages', 'apiRoutes'],
  components: ['components'],
  integration: ['integrationCode'],
};
```

### Implementation Example

```typescript
async function generateCodeChunked(
  architecture: ProjectArchitecture,
  options: CodeOptions
): Promise<GeneratedCode> {
  const allFiles: FileDefinition[] = [];
  
  // Chunk 1: Foundation (layout, config, types)
  const foundation = await generateChunk(architecture, 'foundation', options);
  allFiles.push(...foundation.files);
  
  // Chunk 2: Core pages and API routes
  const core = await generateChunk(architecture, 'core', options);
  allFiles.push(...core.files);
  
  // Chunk 3: Components (if many)
  if ((architecture.components?.length || 0) > 4) {
    const components = await generateChunk(architecture, 'components', options);
    allFiles.push(...components.files);
  }
  
  return { files: allFiles, integrationCode: [] };
}
```

### Chunk Token Limits

| Chunk Type | Max Items | Token Limit | Expected Files |
|------------|-----------|-------------|----------------|
| Foundation | All | 4,096 | 3-5 files |
| Core | 6 per chunk | 8,192 | 4-6 files |
| Components | 5 per chunk | 4,096 | 3-5 files |

---

## 7. Truncation Detection & Recovery

### Detection Signs

1. **JSON Parse Failure**: Incomplete JSON (missing closing brackets)
2. **Missing Fields**: Validated object missing expected properties
3. **Truncated Content**: File content ends mid-line

### Detection Code

```typescript
function detectTruncation(response: string): TruncationResult {
  // Check for incomplete JSON
  const bracketBalance = (response.match(/{/g)?.length || 0) - 
                         (response.match(/}/g)?.length || 0);
  
  if (bracketBalance > 0) {
    return { truncated: true, reason: 'incomplete_json', missing: bracketBalance };
  }
  
  // Check for cut-off patterns
  if (response.endsWith('...') || response.endsWith('\"')) {
    return { truncated: true, reason: 'mid_content_cutoff' };
  }
  
  return { truncated: false };
}
```

### Recovery Strategy

```typescript
async function recoverFromTruncation(
  response: string,
  architecture: ProjectArchitecture,
  options: CodeOptions
): Promise<GeneratedCode> {
  // Strategy 1: Increase token limit and retry
  const newLimit = options.maxTokens ? options.maxTokens * 2 : 8192;
  console.warn(`[Recovery] Truncation detected, retrying with ${newLimit} tokens`);
  
  // Strategy 2: If still failing, switch to chunked generation
  if (newLimit > 16384) {
    console.warn(`[Recovery] Token limit maxed, switching to chunked generation`);
    return generateCodeChunked(architecture, options);
  }
  
  // Retry with higher limit
  return generateCode(architecture, undefined, { ...options, maxTokens: newLimit });
}
```

### Automatic Fallback Chain

```
4096 tokens → truncation → 8192 tokens → truncation → 16384 tokens → chunked mode
```

---

## 8. Monitoring & Alerts

### Token Usage Tracking

The framework includes built-in token tracking via `TokenTracker`:

```typescript
import { getGlobalTracker } from "@jrdaws/ai-agent";

// After generation
const tracker = getGlobalTracker();
const summary = tracker.getSummary();

console.log(`Input tokens: ${summary.totalInputTokens}`);
console.log(`Output tokens: ${summary.totalOutputTokens}`);
console.log(`Estimated cost: $${summary.estimatedCost.toFixed(4)}`);
```

### Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| Truncation rate | >5% | >15% |
| Cost per project | >$0.20 | >$0.50 |
| Retry rate | >10% | >25% |
| JSON repair rate | >20% | >40% |

### Logging Truncation Events

```typescript
// Log to output/shared/metrics/truncation-log.csv
function logTruncation(event: TruncationEvent) {
  const line = [
    new Date().toISOString(),
    event.stage,
    event.model,
    event.tokenLimit,
    event.estimatedNeeded,
    event.recovered ? 'yes' : 'no',
    event.finalLimit,
  ].join(',');
  
  appendFileSync('output/shared/metrics/truncation-log.csv', line + '\n');
}
```

### Alert Triggers

1. **3+ truncations in 1 hour**: Review token limit settings
2. **Cost per project >$0.30**: Review model tier selection
3. **JSON repair rate >30%**: Consider upgrading to `balanced` tier

---

## 9. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `JSON parse error` | Truncated output | Increase `maxTokens` or use chunking |
| `ZodError: missing fields` | Incomplete generation | Check token limit, verify architecture size |
| High API costs | Using `quality` tier unnecessarily | Switch to `balanced` for non-critical |
| Slow generation | Complex project | Enable streaming, use `fast` tier |
| Inconsistent output | Haiku reliability | Switch to Sonnet for that stage |

### Debug Commands

```bash
# Check recent token usage
cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/shared/metrics/token-usage.csv | tail -10

# Check truncation events
cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/shared/metrics/truncation-log.csv | tail -10

# Verify model configuration
cd /Users/joseph.dawson/Documents/dawson-does-framework && grep -A5 "MODEL_TIERS" packages/ai-agent/src/index.ts
```

### Escalation Path

1. **Self-service**: Adjust `maxTokens` or `modelTier`
2. **Testing Agent**: Run validation suite for code generation
3. **Platform Agent**: Review and optimize token usage patterns
4. **Bug Report**: Create P2 bug if truncation rate >15% persists

---

## Related Documents

- [Prompt Standards](../standards/PROMPT_STANDARDS.md) - Token-optimized prompt writing
- [API Contracts](../standards/API_CONTRACTS.md) - Response format standards
- [SOP Opportunities Log](../../output/media-pipeline/quality-agent/workspace/sop-opportunities.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation from approved proposal |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Proposer | Testing Agent | 2025-12-23 | ✅ Submitted |
| Logger | Quality Agent | 2025-12-23 | ✅ Logged (5+ occurrences) |
| Reviewer | Auditor Agent | 2025-12-23 | ✅ Approved (85/100) |
| Drafter | Documentation Agent | 2025-12-23 | ✅ Complete |
| Final Sign-off | Auditor Agent | Pending | ⏳ Awaiting |

---

*This SOP addresses the token truncation pattern observed across 5+ testing sessions. Implementation of pre-generation estimation and automatic fallback will significantly reduce failed generations and wasted API credits.*

