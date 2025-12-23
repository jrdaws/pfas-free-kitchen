# AI Project Generation Engine

## Overview

The AI Project Generation Engine is a complete system that converts natural language descriptions into structured project architecture and code. It powers the "describe → build" workflow for the Dawson Framework.

**Created:** December 21, 2024
**Status:** ✅ Production Ready (Core Package)
**Location:** `packages/ai-agent/`

## Architecture

### Template-Based Generation

Instead of generating full code from scratch, the AI generates **parameters** that fill existing templates. This ensures:
- Consistency with framework best practices
- Higher quality output
- Faster generation (less tokens)
- Easier maintenance

### Four-Stage Pipeline

```
User Description
      ↓
1. Intent Analysis → Extract category, features, integrations
      ↓
2. Architecture Design → Generate pages, components, routes
      ↓
3. Code Generation → Create file contents matching template style
      ↓
4. Context Building → Generate .cursorrules + START_PROMPT.md
```

## Package Structure

```
packages/ai-agent/
├── dist/                      # Compiled output
│   ├── *.js                  # Compiled modules
│   ├── *.d.ts                # TypeScript definitions
│   └── prompts/              # Prompt templates (copied from src)
├── src/
│   ├── index.ts              # Main exports & convenience API
│   ├── types.ts              # Core type definitions
│   ├── intent-analyzer.ts    # Stage 1: Analyze user intent
│   ├── architecture-generator.ts  # Stage 2: Design structure
│   ├── code-generator.ts     # Stage 3: Generate files
│   ├── context-builder.ts    # Stage 4: Build Cursor context
│   ├── template-selector.ts  # Template loading & validation
│   ├── error-handler.ts      # Error mapping & retries
│   ├── prompts/              # AI prompts (markdown)
│   │   ├── intent-analysis.md
│   │   ├── architecture-design.md
│   │   ├── code-generation.md
│   │   ├── cursor-rules.md
│   │   └── start-prompt.md
│   ├── validators/           # Zod schemas
│   │   ├── intent-schema.ts
│   │   ├── architecture-schema.ts
│   │   └── code-schema.ts
│   └── utils/
│       ├── llm-client.ts     # Anthropic API wrapper
│       ├── prompt-loader.ts  # Load markdown prompts
│       └── retry-strategy.ts # Exponential backoff
├── test-output/              # Test artifacts
├── test-runner.mjs           # End-to-end test (requires API key)
├── test-mock.mjs             # Structure test (no API key needed)
├── package.json
├── tsconfig.json
└── README.md
```

## API Usage

### Quick Start

```typescript
import { generateProject } from '@dawson-framework/ai-agent';

const result = await generateProject({
  description: 'A fitness tracking app with social features',
  projectName: 'FitTrack'
});

console.log(result.intent.suggestedTemplate);  // 'saas'
console.log(result.architecture.pages.length); // Number of pages
console.log(result.code.files.length);         // Number of generated files
console.log(result.context.cursorrules);       // .cursorrules content
```

### Individual Functions

```typescript
import {
  analyzeIntent,
  generateArchitecture,
  generateCode,
  buildCursorContext
} from '@dawson-framework/ai-agent';

// Use individually for more control
const intent = await analyzeIntent({ description: '...' });
const architecture = await generateArchitecture(intent);
const code = await generateCode(architecture);
const context = await buildCursorContext({ intent, architecture, code });
```

### With Custom API Key

```typescript
const result = await generateProject(
  { description: '...' },
  'your-anthropic-api-key'
);
```

## Output Structure

### 1. Intent Analysis

```typescript
{
  category: "saas" | "landing-page" | "dashboard" | "blog" | "directory" | "ecommerce",
  confidence: 0.9,
  reasoning: "Description mentions authentication and billing",
  suggestedTemplate: "saas",
  features: ["user auth", "subscription billing", "dashboard"],
  integrations: {
    auth: "supabase",
    payments: "stripe",
    db: "supabase"
  },
  complexity: "simple" | "moderate" | "complex",
  keyEntities: ["User", "Subscription", "Payment"]
}
```

### 2. Project Architecture

```typescript
{
  template: "saas",
  pages: [
    {
      path: "/",
      name: "Home",
      description: "Landing page with hero and features",
      components: ["Hero", "Features", "Pricing"],
      layout: "default"
    }
  ],
  components: [
    {
      name: "Hero",
      type: "ui",
      description: "Hero section",
      template: "use-existing"  // From template
    },
    {
      name: "CustomFeature",
      type: "feature",
      description: "Business-specific logic",
      props: { title: "string", data: "any" },
      template: "create-new"  // AI generates this
    }
  ],
  routes: [
    {
      path: "/api/tasks",
      type: "api",
      method: "GET",
      description: "Fetch user tasks"
    }
  ],
  integrations: { /* validated integrations */ }
}
```

### 3. Generated Code

```typescript
{
  files: [
    {
      path: "app/dashboard/page.tsx",
      content: "// Full TypeScript/React code",
      overwrite: false
    },
    {
      path: "components/CustomFeature.tsx",
      content: "// Component implementation",
      overwrite: false
    }
  ],
  integrationCode: [
    {
      integration: "auth.supabase",
      files: [/* integration-specific files */]
    }
  ]
}
```

### 4. Cursor Context

```typescript
{
  cursorrules: "# Project rules and patterns...",
  startPrompt: "# Getting started guide..."
}
```

## Website Integration

### API Route

**Location:** `website/app/api/generate/project/route.ts`

**Endpoint:** `POST /api/generate/project`

**Request:**
```json
{
  "description": "A fitness tracking app",
  "projectName": "FitTrack",
  "template": "saas",  // optional
  "vision": "...",     // optional
  "mission": "...",    // optional
  "inspirations": [],  // optional
  "userApiKey": "...", // optional
  "sessionId": "user-123",
  "seed": 12345        // optional, for deterministic output
}
```

**Response:**
```json
{
  "success": true,
  "intent": { /* ... */ },
  "architecture": { /* ... */ },
  "files": [ /* ... */ ],
  "integrationCode": [ /* ... */ ],
  "cursorrules": "...",
  "startPrompt": "...",
  "generatedAt": "2024-12-21T...",
  "seed": 12345,
  "cached": false,
  "remainingDemoGenerations": 4,
  "redisEnabled": true
}
```

### Frontend Component

**Location:** `website/app/components/configurator/ProjectGenerator.tsx`

**Features:**
- Real-time generation progress
- Project summary display (pages, components, routes)
- ZIP download with all files
- Error handling with user-friendly messages
- Rate limiting awareness
- API key management

**Usage in Configurator:**
```typescript
// In Step 6 of configurator
<ProjectGenerator
  template={template}
  integrations={integrations}
  inspirations={inspirations}
  description={description}
/>
```

### Client Library

**Location:** `website/lib/project-generator.ts`

```typescript
import { generateProject } from '@/lib/project-generator';

const result = await generateProject({
  description: '...',
  projectName: 'MyApp',
  sessionId: getUserId()
});

if (result.success) {
  // Create ZIP and download
} else {
  // Handle error
}
```

## Key Features

### 1. Deterministic Output
- **Temperature:** 0 for intent/architecture/code
- **Temperature:** 0.3 for Cursor context (slightly creative)
- Same input → same output (when using seed)

### 2. Zod Validation
All AI outputs validated with TypeScript schemas:
- IntentSchema
- ArchitectureSchema
- CodeSchema

Invalid outputs trigger automatic retry.

### 3. Error Handling
```typescript
try {
  const result = await generateProject(input);
} catch (error) {
  if (error instanceof AIAgentError) {
    console.log(error.code);      // 'anthropic_429'
    console.log(error.retryable);  // true
    console.log(error.context);    // { status: 429 }
  }
}
```

**Error Codes:**
- `anthropic_401`: Invalid API key
- `anthropic_429`: Rate limit exceeded (retryable)
- `anthropic_500`: API error (retryable)
- `validation_error`: Invalid AI output (retryable)
- `unknown_error`: Unexpected error

### 4. Retry Strategy
- **Max Retries:** 3
- **Backoff:** Exponential (1s, 2s, 4s)
- **Retryable Errors:** 429, 500, validation failures
- **Non-Retryable:** 401, 400, unknown errors

### 5. Caching
- **TTL:** 30 minutes
- **Key:** SHA-256 hash of request parameters
- **Size Limit:** 100 entries (LRU eviction)
- **Works with:** Deterministic requests (with seed)

### 6. Rate Limiting
- **Demo Mode:** 5 generations per 24 hours per session
- **With API Key:** Unlimited
- **Storage:** Redis (fallback to in-memory)
- **Tracking:** By session ID

## Testing

### Mock Test (No API Key Required)

```bash
cd packages/ai-agent
node test-mock.mjs
```

**Tests:**
- ✅ Package imports correctly
- ✅ All exports available
- ✅ Prompt files load successfully
- ✅ Output structure validates
- ✅ File generation works

**Output:** `test-output-mock/`

### End-to-End Test (Requires API Key)

```bash
export ANTHROPIC_API_KEY=your_key_here
cd packages/ai-agent
node test-runner.mjs
```

**Tests:**
- ✅ Full generation pipeline
- ✅ Real AI API calls
- ✅ Intent analysis accuracy
- ✅ Architecture generation
- ✅ Code generation
- ✅ Cursor context building

**Output:** `test-output/`

### Build Test

```bash
cd packages/ai-agent
npm run build
```

Validates:
- TypeScript compilation
- Prompt file copying
- Package exports

## Model Configuration

### Primary Model
- **Name:** `claude-sonnet-4-20250514`
- **Provider:** Anthropic
- **SDK Version:** `@anthropic-ai/sdk@0.32.1`

### Token Limits
- **Intent Analysis:** 2,048 tokens
- **Architecture:** 4,096 tokens
- **Code Generation:** 12,000 tokens (increased from 8,192 to prevent truncation)
- **Cursor Context:** 4,096 tokens

### Token Tracking (Added 2025-12-22)

The package now includes built-in token usage tracking. After each generation, usage is logged:

```
[AI Agent] Generation complete:
  Intent       :  538 in /  233 out (Sonnet)
  Architecture :  995 in / 1489 out (Sonnet)
  Code         : 4301 in / 7236 out (Sonnet)
  Context      : 1793 in / 1536 out (Sonnet)
  ────────────────────────────────────────
  Total: 7627 in / 10494 out | Est. cost: $0.18
```

**Token Tracker API:**
```typescript
import { TokenTracker, getGlobalTracker, resetGlobalTracker } from '@dawson-framework/ai-agent';

// Get session summary
const tracker = getGlobalTracker();
const summary = tracker.getSessionTotal();
console.log(`Total cost: $${summary.estimatedCost}`);

// Reset for new session
resetGlobalTracker();
```

### Verified Cost Estimates (2025-12-22)

*Based on actual E2E test with TodoApp project (~100 words description)*

| Stage | Input Tokens | Output Tokens | Model | Est. Cost |
|-------|-------------|---------------|-------|-----------|
| Intent | 538 | 233 | Sonnet | $0.005 |
| Architecture | 995 | 1,489 | Sonnet | $0.025 |
| Code | 4,301 | 7,236 | Sonnet | $0.12 |
| Context | 1,793 | 1,536 | Sonnet | $0.03 |
| **Total** | **7,627** | **10,494** | - | **$0.18** |

**Pricing (Claude Sonnet 4):**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

*Actual costs depend on project complexity and description length. Simpler projects cost less.*

### Prompt Token Usage (After Optimization)

*Prompts optimized on 2025-12-22 with 32% token reduction.*

| Prompt File | Before | After | Reduction |
|-------------|--------|-------|-----------|
| intent-analysis.md | ~663 tokens | ~449 tokens | -32% |
| architecture-design.md | ~681 tokens | ~493 tokens | -28% |
| code-generation.md | ~959 tokens | ~453 tokens | -53% |
| cursor-rules.md | ~839 tokens | ~640 tokens | -24% |
| start-prompt.md | ~1,100 tokens | ~847 tokens | -23% |
| **Total Prompts** | **~4,242 tokens** | **~2,884 tokens** | **-32%** |

## Prompts

All prompts are stored as markdown files in `src/prompts/` and can be edited without touching code.

### Variable Substitution

Prompts support simple variable substitution:

```markdown
# Template: {template}
# Description: {description}
```

Variables replaced at runtime:
```typescript
await prompts.load('intent-analysis', {
  description: userInput
});
```

### Prompt Engineering Principles

1. **Clear Task Definition** - Explicit instructions for AI
2. **Structured Output** - Request JSON, not prose
3. **Examples** - Show desired format
4. **Constraints** - Limit creativity where needed
5. **Context** - Provide template info, patterns

## Deployment Considerations

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Package Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.32.1",
  "zod": "^4.2.1"
}
```

### Build Process

```bash
# Install
npm install

# Build (compiles TypeScript + copies prompts)
npm run build

# Output: dist/
```

### Integration Checklist

- [ ] Install package: `npm install @dawson-framework/ai-agent`
- [ ] Set API key: `ANTHROPIC_API_KEY`
- [ ] Create API route (optional, for web)
- [ ] Import and use `generateProject()`
- [ ] Handle errors appropriately
- [ ] Implement rate limiting (if needed)
- [ ] Add caching (if needed)

## Troubleshooting

### "Cannot find module" Error

**Cause:** ESM import paths missing `.js` extension

**Fix:** Run build with prompt copying:
```bash
npm run build
find dist -name "*.js" -exec sed -i '' 's/from "\.\([^"]*\)"/from ".\1.js"/g' {} \;
```

### "Invalid AI output" Error

**Cause:** AI returned invalid JSON or failed validation

**Action:** Error is automatically retried (up to 3 times)

If persists, check:
- Prompt clarity
- Model availability
- Token limits

### "Rate limit exceeded" Error

**Cause:** Too many requests to Anthropic API

**Fix:**
- Wait and retry (automatically handled)
- Use user-provided API key
- Implement request queuing

### Prompts Not Found

**Cause:** Prompt files not copied to `dist/`

**Fix:**
```bash
npm run copy-prompts
```

## Future Enhancements

### Planned Features
- [ ] Multi-template support (combine templates)
- [ ] Custom component library learning
- [ ] Incremental generation (add to existing project)
- [ ] Context-aware refinement
- [ ] Integration test generation
- [ ] Database migration generation
- [ ] API documentation generation

### Performance Optimizations
- [x] Token usage tracking and cost estimation (Added 2025-12-22)
- [ ] Parallel API calls for independent stages
- [ ] Prompt caching
- [ ] Streaming responses
- [ ] Progressive file generation

### Model Tier Optimization (Tested 2025-12-22)

**Finding:** Claude Haiku is NOT recommended for schema-constrained tasks.

**Testing Summary:**
| Stage | Haiku Result | Sonnet Result |
|-------|-------------|---------------|
| Intent Analysis | ❌ Invalid enum values | ✅ Reliable |
| Architecture | ❌ Invalid schema values | ✅ Reliable |
| Code Generation | N/A (kept on Sonnet) | ✅ Works |
| Context Building | N/A (kept on Sonnet) | ✅ Works |

**Issues with Haiku:**
1. Returns template names with descriptions: `"saas(auth+db)"` instead of `"saas"`
2. Invalid enum values (categories, HTTP methods, layout types)
3. Complex prop structures not matching schema
4. Retry logic exhausted due to consistent failures

**Recommendation:** Use Sonnet for all stages. Cost savings from Haiku are negated by retry overhead and validation failures.

### Quality Improvements
- [ ] Few-shot examples in prompts
- [ ] Confidence thresholds
- [ ] Human-in-the-loop validation
- [ ] A/B testing for prompts

## Success Metrics

### Functional (All Passing ✅)
- ✅ analyzeIntent returns structured data
- ✅ generateArchitecture returns valid structure
- ✅ generateCode returns file contents
- ✅ buildCursorContext returns Cursor files
- ✅ Error handling works gracefully
- ✅ Results are deterministic
- ✅ Prompts load from markdown files

### Integration (Complete ✅)
- ✅ Package builds successfully
- ✅ Website API route created
- ✅ Frontend component implemented
- ✅ ZIP download works
- ✅ Rate limiting integrated
- ✅ Caching implemented

### Quality (Validated ✅)
- ✅ TypeScript strict mode passes
- ✅ Zod validation enforces contracts
- ✅ Mock tests pass
- ✅ Package exports correctly
- ✅ ESM compatibility verified

## Resources

- **Package:** `/packages/ai-agent/`
- **API Route:** `/website/app/api/generate/project/route.ts`
- **Component:** `/website/app/components/configurator/ProjectGenerator.tsx`
- **Tests:** `/packages/ai-agent/test-*.mjs`
- **Documentation:** This file

## Support

For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Check error messages and retry logic
4. Consult Anthropic API docs for API-specific issues

---

**Built with:** TypeScript, Zod, Anthropic Claude Sonnet 4
**License:** MIT
**Version:** 0.1.0
