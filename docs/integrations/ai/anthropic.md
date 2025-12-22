# Anthropic Claude Integration Setup

Complete guide to integrating Anthropic's Claude AI models into your application.

## What It Does

Anthropic Claude provides advanced AI capabilities with:

- Claude 3.5 Opus - Most capable model for complex tasks
- Claude 3.5 Sonnet - Balanced performance and speed
- Claude 3 Haiku - Fast, cost-effective model
- 200K token context window (vs GPT-4's 128K)
- Advanced reasoning and analysis
- Computer use capabilities (beta)
- Tool use for structured outputs
- Vision capabilities for image understanding
- Strong focus on safety and helpfulness

## Prerequisites

- [ ] Anthropic account ([sign up](https://console.anthropic.com))
- [ ] API key with credits
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Step-by-Step Setup

### 1. Create Anthropic Account

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **Sign up** and create account
3. Verify email address
4. Add credits at [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)

### 2. Get API Key

1. Go to [API Keys](https://console.anthropic.com/settings/keys)
2. Click **Create Key**
3. Name: "Production" or "Development"
4. Copy the key (starts with `sk-ant-`)
5. Save it securely - you won't see it again

### 3. Add to Environment

Add to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

### 4. Install Package

```bash
npm install @anthropic-ai/sdk
```

### 5. Create Anthropic Client

```typescript
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
```

### 6. Create API Route

```typescript
// app/api/ai/claude/route.ts
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: message }
      ]
    })

    return NextResponse.json({
      response: response.content[0].text
    })
  } catch (error) {
    console.error('Claude error:', error)
    return NextResponse.json(
      { error: 'AI request failed' },
      { status: 500 }
    )
  }
}
```

### 7. Create Chat Component

```typescript
'use client'

import { useState } from 'react'

export default function ClaudeChat() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/ai/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    const data = await res.json()
    setResponse(data.response)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Claude Chat</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Claude anything..."
          className="w-full p-4 border rounded-lg"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      {response && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  )
}
```

## Code Examples

### Basic Message

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ]
})

const response = message.content[0].text
```

### System Prompts

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: 'You are a helpful coding assistant specializing in TypeScript.',
  messages: [
    { role: 'user', content: 'How do I use async/await?' }
  ]
})
```

### Streaming Responses

```typescript
// app/api/ai/claude-stream/route.ts
import { anthropic } from '@/lib/anthropic'

export async function POST(req: Request) {
  const { message } = await req.json()

  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }]
  })

  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      }
    })
  )
}
```

### Tool Use (Function Calling)

```typescript
const tools = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit'
        }
      },
      required: ['location']
    }
  }
]

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  tools,
  messages: [
    { role: 'user', content: 'What\'s the weather in Tokyo?' }
  ]
})

// Check if Claude wants to use a tool
const toolUse = message.content.find(block => block.type === 'tool_use')

if (toolUse) {
  // Call your function
  const weather = await getWeather(toolUse.input.location, toolUse.input.unit)

  // Send result back to Claude
  const finalResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    tools,
    messages: [
      { role: 'user', content: 'What\'s the weather in Tokyo?' },
      { role: 'assistant', content: message.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(weather)
          }
        ]
      }
    ]
  })
}
```

### Vision (Image Understanding)

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image
          }
        },
        {
          type: 'text',
          text: 'What\'s in this image?'
        }
      ]
    }
  ]
})
```

### Multi-turn Conversation

```typescript
const messages = [
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library...' },
  { role: 'user', content: 'Can you show me an example?' }
]

const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages
})
```

### Long Context (200K tokens)

```typescript
// Claude can handle very long documents
const longDocument = await fs.readFile('large-document.txt', 'utf-8')

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048,
  messages: [
    {
      role: 'user',
      content: `Here's a document:\n\n${longDocument}\n\nPlease summarize the key points.`
    }
  ]
})
```

### Document Analysis

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048,
  system: 'You are an expert document analyzer.',
  messages: [
    {
      role: 'user',
      content: `Analyze this contract and identify potential risks:\n\n${contract}`
    }
  ]
})
```

### Code Review

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048,
  system: 'You are an expert code reviewer.',
  messages: [
    {
      role: 'user',
      content: `Review this code for bugs and improvements:\n\n\`\`\`typescript\n${code}\n\`\`\``
    }
  ]
})
```

## Model Selection

### Claude 3.5 Opus

**Best for:** Most complex tasks

```typescript
model: 'claude-3-5-opus-20250229'
```

- **Context:** 200K tokens
- **Cost:** $15 input / $75 output per 1M tokens
- **Use for:** Research, analysis, complex reasoning
- **Speed:** Slower but most capable

### Claude 3.5 Sonnet (Recommended)

**Best for:** Most use cases

```typescript
model: 'claude-3-5-sonnet-20241022'
```

- **Context:** 200K tokens
- **Cost:** $3 input / $15 output per 1M tokens
- **Use for:** Chat, content generation, coding
- **Speed:** Balanced

### Claude 3 Haiku

**Best for:** Fast responses

```typescript
model: 'claude-3-haiku-20240307'
```

- **Context:** 200K tokens
- **Cost:** $0.25 input / $1.25 output per 1M tokens
- **Use for:** Simple tasks, high volume
- **Speed:** Fastest

## Production Best Practices

### Error Handling

```typescript
try {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userMessage }]
  })

  return message.content[0].text
} catch (error: any) {
  if (error.status === 429) {
    // Rate limit - implement backoff
    console.log('Rate limited, retrying...')
  } else if (error.status === 400) {
    // Invalid request
    console.error('Invalid request:', error.message)
  } else {
    console.error('Unexpected error:', error)
  }
  throw error
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m')
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Process request...
}
```

### Usage Tracking

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: userMessage }]
})

// Track usage
await supabase.from('ai_usage').insert({
  user_id: userId,
  model: 'claude-3-5-sonnet',
  input_tokens: message.usage.input_tokens,
  output_tokens: message.usage.output_tokens,
  cost: calculateCost(message.usage, 'claude-3-5-sonnet')
})
```

### Cost Calculation

```typescript
function calculateCost(usage: any, model: string) {
  const prices = {
    'claude-3-5-opus': { input: 15, output: 75 },
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 }
  }

  const price = prices[model]
  const inputCost = (usage.input_tokens / 1_000_000) * price.input
  const outputCost = (usage.output_tokens / 1_000_000) * price.output

  return inputCost + outputCost
}
```

## Testing

```typescript
import { anthropic } from '@/lib/anthropic'

describe('Claude', () => {
  it('should create message', async () => {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "test passed"' }]
    })

    expect(message.content[0].text).toContain('test passed')
  })
})
```

## Common Issues

### Rate Limit Errors

**Symptom:** 429 Too Many Requests

**Solutions:**
1. Implement exponential backoff
2. Reduce request frequency
3. Cache responses
4. Use Haiku for high-volume requests

### Context Too Long

**Symptom:** "prompt is too long"

**Solutions:**
1. Reduce input length
2. Lower `max_tokens`
3. Summarize earlier conversation
4. Already using 200K context (largest available)

## Production Checklist

- [ ] API key secured (not in Git)
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Usage tracking configured
- [ ] Cost monitoring active
- [ ] Input validation added
- [ ] Authentication required
- [ ] Logging for debugging
- [ ] Caching for common requests

## Next Steps

- [OpenAI Integration](openai.md) - Add GPT models
- [Database Integration](../database/supabase.md) - Store conversations
- [Authentication](../auth/supabase.md) - Protect endpoints
- [Anthropic Documentation](https://docs.anthropic.com) - Official docs

## Resources

- [Anthropic Documentation](https://docs.anthropic.com)
- [API Reference](https://docs.anthropic.com/claude/reference)
- [Model Pricing](https://www.anthropic.com/api)
- [Claude Guide](https://docs.anthropic.com/claude/docs)
