# AI Integrations

Add AI-powered features to your application with OpenAI or Anthropic.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **OpenAI** | GPT-4, DALL-E, embeddings | Most popular, extensive ecosystem, function calling | [Guide →](openai.md) |
| **Anthropic** | Claude models | Advanced reasoning, long context, computer use | [Guide →](anthropic.md) |

## Provider Comparison

### OpenAI

✅ **Models:** GPT-4, GPT-4 Turbo, GPT-3.5
✅ **Strengths:** Image generation (DALL-E), embeddings, large ecosystem
✅ **Best for:** Chat, content generation, image creation
✅ **Pricing:** $0.01-$0.06 per 1K tokens
✅ **Context:** Up to 128K tokens

### Anthropic (Claude)

✅ **Models:** Claude 3.5 Opus, Sonnet, Haiku
✅ **Strengths:** Long context (200K tokens), advanced reasoning, safety
✅ **Best for:** Analysis, research, coding, computer use
✅ **Pricing:** $0.003-$0.075 per 1K tokens
✅ **Context:** Up to 200K tokens

## Quick Start

### OpenAI Setup

```bash
# Install
npm install openai

# Add key
echo "OPENAI_API_KEY=sk-xxx" >> .env.local

# Use
import OpenAI from 'openai'
const openai = new OpenAI()

const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: 'Hello!' }]
})
```

### Anthropic Setup

```bash
# Install
npm install @anthropic-ai/sdk

# Add key
echo "ANTHROPIC_API_KEY=sk-ant-xxx" >> .env.local

# Use
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic()

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
})
```

## Common Use Cases

### Chat Completion

Build chatbots and conversational interfaces:

```typescript
// Chat with context
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing' }
  ]
})
```

### Content Generation

Generate blog posts, product descriptions, emails:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: 'Write a product description for a wireless keyboard'
  }]
})

const description = completion.choices[0].message.content
```

### Code Generation

Generate and explain code:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: 'Write a React component for a todo list'
  }]
})
```

### Text Analysis

Analyze sentiment, extract keywords, summarize:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: `Analyze the sentiment of this review: "${review}"`
  }]
})
```

### Image Generation (OpenAI)

Create images with DALL-E:

```typescript
const image = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'A serene lake at sunset with mountains',
  size: '1024x1024',
  quality: 'hd'
})
```

### Embeddings (OpenAI)

Create vector embeddings for semantic search:

```typescript
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Your text here'
})

// Store in vector database (Supabase pgvector, Pinecone, etc.)
```

## Integration Patterns

### API Route Pattern

```typescript
// app/api/ai/chat/route.ts
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI()

export async function POST(req: Request) {
  const { message } = await req.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }]
  })

  return NextResponse.json({
    response: completion.choices[0].message.content
  })
}
```

### Streaming Responses

```typescript
// Stream AI responses for better UX
export async function POST(req: Request) {
  const { message } = await req.json()

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
    stream: true
  })

  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(encoder.encode(text))
        }
        controller.close()
      }
    })
  )
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m') // 10 requests per minute
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Continue with AI request...
}
```

### Usage Tracking

```typescript
// Track token usage for billing
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: message }]
})

const usage = completion.usage
console.log('Tokens used:', usage.total_tokens)

// Store in database for billing
await supabase.from('ai_usage').insert({
  user_id: session.user.id,
  model: 'gpt-4',
  prompt_tokens: usage.prompt_tokens,
  completion_tokens: usage.completion_tokens,
  total_tokens: usage.total_tokens
})
```

## Security Best Practices

### 1. Never Expose API Keys

```typescript
// ❌ Don't do this
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY // Wrong!
})

// ✅ Do this (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Not exposed to client
})
```

### 2. Validate User Input

```typescript
export async function POST(req: Request) {
  const { message } = await req.json()

  // Validate input
  if (!message || message.length > 1000) {
    return NextResponse.json(
      { error: 'Invalid message' },
      { status: 400 }
    )
  }

  // Continue...
}
```

### 3. Implement Rate Limiting

```typescript
// Limit requests per user
const userLimit = await ratelimit.limit(`user:${userId}`)
if (!userLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  )
}
```

### 4. Monitor Costs

```typescript
// Set max tokens to control costs
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: message }],
  max_tokens: 500 // Limit response length
})
```

## Model Selection Guide

### When to Use GPT-4 (OpenAI)

- Complex reasoning tasks
- Code generation
- Creative writing
- Instruction following

### When to Use GPT-3.5 (OpenAI)

- Simple completions
- High-volume requests
- Cost-sensitive applications
- Fast responses needed

### When to Use Claude Opus (Anthropic)

- Deep analysis
- Long documents (200K context)
- Research tasks
- Complex reasoning

### When to Use Claude Sonnet (Anthropic)

- Balanced performance/cost
- Most common use cases
- Production applications

### When to Use Claude Haiku (Anthropic)

- Fast responses
- Simple tasks
- High-volume requests
- Cost optimization

## Cost Optimization

### 1. Cache System Prompts

```typescript
// Reuse system prompts
const SYSTEM_PROMPT = 'You are a helpful assistant.'

// Don't regenerate for each request
```

### 2. Use Appropriate Models

```typescript
// Use cheaper models for simple tasks
const model = isComplexTask ? 'gpt-4' : 'gpt-3.5-turbo'
```

### 3. Limit Token Usage

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages,
  max_tokens: 150 // Control output length
})
```

### 4. Implement Caching

```typescript
// Cache common responses
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

const cacheKey = `ai:${hash(message)}`
const cached = await redis.get(cacheKey)

if (cached) {
  return cached
}

const response = await openai.chat.completions.create({...})
await redis.setex(cacheKey, 3600, response) // Cache for 1 hour
```

## Common Issues

### API Key Errors

**Symptom:** "Invalid API key"

**Solution:**
1. Check key is correct in `.env.local`
2. Ensure key starts with `sk-` (OpenAI) or `sk-ant-` (Anthropic)
3. Verify key has correct permissions
4. Restart dev server after changing environment variables

### Rate Limiting

**Symptom:** "Rate limit exceeded"

**Solution:**
1. Implement exponential backoff
2. Use rate limiting on your API
3. Upgrade API tier if needed
4. Cache responses to reduce requests

### Context Length Errors

**Symptom:** "Context length exceeded"

**Solution:**
1. Reduce input/output size
2. Use models with larger context (Claude for 200K)
3. Implement conversation truncation
4. Summarize older messages

## Next Steps

- [OpenAI Setup Guide](openai.md) - Complete OpenAI integration
- [Anthropic Setup Guide](anthropic.md) - Complete Claude integration
- [Database Integration](../database/supabase.md) - Store AI conversations
- [Authentication](../auth/supabase.md) - Protect AI endpoints

## Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com)
- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/api)
