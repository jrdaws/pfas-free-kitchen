# OpenAI Integration Setup

Complete guide to integrating OpenAI GPT-4 and other models into your application.

## What It Does

OpenAI provides access to state-of-the-art AI models:

- GPT-4 and GPT-4 Turbo for advanced text generation
- GPT-3.5 Turbo for fast, cost-effective completions
- DALL-E 3 for image generation
- Whisper for speech-to-text
- Text embeddings for semantic search
- Function calling for structured outputs
- Vision API for image understanding
- Assistants API for stateful conversations
- Fine-tuning for custom models

## Prerequisites

- [ ] OpenAI account ([sign up](https://platform.openai.com))
- [ ] API key with billing set up
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
OPENAI_API_KEY=sk-xxx
```

## Step-by-Step Setup

### 1. Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click **Sign up** and create account
3. Verify email address
4. Set up billing at [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
5. Add payment method (credit card required)

### 2. Get API Key

1. Go to [API keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Name: "Production" or "Development"
4. Copy the key (starts with `sk-`)
5. **Important:** Save it now - you won't see it again!

### 3. Add to Environment

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-xxx
```

**Security:** Never commit API keys to Git.

### 4. Install Package

```bash
npm install openai
```

### 5. Create OpenAI Client

```typescript
// lib/openai.ts
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

### 6. Create API Route

```typescript
// app/api/ai/chat/route.ts
import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ]
    })

    return NextResponse.json({
      response: completion.choices[0].message.content
    })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'AI request failed' },
      { status: 500 }
    )
  }
}
```

### 7. Create Chat Component

```typescript
// app/ai-chat/page.tsx
'use client'

import { useState } from 'react'

export default function AIChat() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/ai/chat', {
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
      <h1 className="text-3xl font-bold mb-8">AI Chat</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full p-4 border rounded-lg"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
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

### Basic Chat Completion

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is React?' }
  ],
  temperature: 0.7,
  max_tokens: 500
})

const answer = completion.choices[0].message.content
```

### Streaming Responses

```typescript
// app/api/ai/stream/route.ts
import { openai } from '@/lib/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export async function POST(req: Request) {
  const { message } = await req.json()

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: message }],
    stream: true
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
```

Client component for streaming:

```typescript
'use client'

import { useChat } from 'ai/react'

export default function StreamingChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai/stream'
  })

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

### Function Calling

```typescript
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get the current weather in a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city name'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit']
          }
        },
        required: ['location']
      }
    }
  }
]

const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: 'What\'s the weather in San Francisco?' }],
  tools
})

const toolCall = completion.choices[0].message.tool_calls?.[0]

if (toolCall?.function.name === 'get_weather') {
  const args = JSON.parse(toolCall.function.arguments)
  const weather = await getWeather(args.location, args.unit)

  // Send result back to GPT
  const finalResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'user', content: 'What\'s the weather in San Francisco?' },
      completion.choices[0].message,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(weather)
      }
    ],
    tools
  })
}
```

### Image Generation (DALL-E 3)

```typescript
// app/api/ai/image/route.ts
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1024',
    quality: 'hd',
    n: 1
  })

  return Response.json({ url: image.data[0].url })
}
```

### Vision API

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What\'s in this image?' },
        {
          type: 'image_url',
          image_url: {
            url: 'https://example.com/image.jpg'
          }
        }
      ]
    }
  ],
  max_tokens: 300
})
```

### Text Embeddings

```typescript
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Your text to embed'
})

const vector = embedding.data[0].embedding // Array of 1536 numbers

// Store in database for semantic search
await supabase.from('documents').insert({
  content: 'Your text',
  embedding: vector
})

// Later: Search by similarity
const searchEmbedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'search query'
})

const { data: results } = await supabase.rpc('match_documents', {
  query_embedding: searchEmbedding.data[0].embedding,
  match_threshold: 0.7,
  match_count: 5
})
```

### Speech-to-Text (Whisper)

```typescript
// app/api/ai/transcribe/route.ts
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en', // Optional
    response_format: 'json'
  })

  return Response.json({ text: transcription.text })
}
```

### Text-to-Speech

```typescript
const speech = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: 'Hello! This is a text-to-speech example.'
})

const buffer = Buffer.from(await speech.arrayBuffer())
// Save or stream the audio
```

### Content Moderation

```typescript
const moderation = await openai.moderations.create({
  input: userContent
})

if (moderation.results[0].flagged) {
  console.log('Content flagged:', moderation.results[0].categories)
  // Handle inappropriate content
}
```

### Multi-turn Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful coding assistant.' },
  { role: 'user', content: 'How do I create a React component?' },
  { role: 'assistant', content: 'To create a React component...' },
  { role: 'user', content: 'Can you show me an example with TypeScript?' }
]

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages
})
```

## Production Best Practices

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
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Process request...
}
```

### Error Handling

```typescript
export async function POST(req: Request) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }]
    })

    return Response.json({ response: completion.choices[0].message.content })
  } catch (error: any) {
    console.error('OpenAI error:', error)

    if (error.status === 429) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    if (error.status === 401) {
      return Response.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    return Response.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
```

### Usage Tracking

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: message }],
  user: userId // Track usage per user
})

// Log usage for billing
const usage = completion.usage
await supabase.from('ai_usage').insert({
  user_id: userId,
  model: 'gpt-4',
  prompt_tokens: usage.prompt_tokens,
  completion_tokens: usage.completion_tokens,
  total_tokens: usage.total_tokens,
  cost: calculateCost(usage, 'gpt-4')
})
```

### Cost Calculation

```typescript
function calculateCost(usage: any, model: string) {
  const prices = {
    'gpt-4-turbo-preview': {
      input: 0.01,  // per 1K tokens
      output: 0.03
    },
    'gpt-3.5-turbo': {
      input: 0.0005,
      output: 0.0015
    }
  }

  const price = prices[model]
  const inputCost = (usage.prompt_tokens / 1000) * price.input
  const outputCost = (usage.completion_tokens / 1000) * price.output

  return inputCost + outputCost
}
```

## Testing

### Test Basic Completion

```typescript
import { openai } from '@/lib/openai'

describe('OpenAI', () => {
  it('should complete chat', async () => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test passed"' }],
      max_tokens: 10
    })

    expect(completion.choices[0].message.content).toContain('test passed')
  })

  it('should handle errors', async () => {
    const invalidClient = new OpenAI({ apiKey: 'invalid' })

    await expect(
      invalidClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }]
      })
    ).rejects.toThrow()
  })
})
```

## Common Issues

### Rate Limit Errors

**Symptom:** "Rate limit reached"

**Solutions:**
1. Implement exponential backoff
2. Upgrade to higher tier
3. Cache responses
4. Use GPT-3.5 for high-volume requests

### Context Length Errors

**Symptom:** "This model's maximum context length is X tokens"

**Solutions:**
1. Reduce input message length
2. Set lower `max_tokens`
3. Truncate conversation history
4. Use GPT-4 Turbo (128K context)

### API Key Errors

**Symptom:** "Incorrect API key provided"

**Solutions:**
1. Check API key in `.env.local`
2. Ensure key starts with `sk-`
3. Verify billing is set up
4. Regenerate key if compromised

## Production Checklist

- [ ] API key stored securely (not in Git)
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Usage tracking configured
- [ ] Cost monitoring set up
- [ ] Content moderation for user input
- [ ] Caching for common requests
- [ ] Authentication required for endpoints
- [ ] Logging for debugging
- [ ] Backup API key ready

## Next Steps

- [Anthropic Integration](anthropic.md) - Add Claude models
- [Database Integration](../database/supabase.md) - Store conversations
- [Authentication](../auth/supabase.md) - Protect AI endpoints
- [OpenAI Documentation](https://platform.openai.com/docs) - Official docs

## Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Model Pricing](https://openai.com/pricing)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Safety Guidelines](https://platform.openai.com/docs/guides/safety-best-practices)
