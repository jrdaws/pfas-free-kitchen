// tests/cli/pull-api-mock.test.mjs
/**
 * Comprehensive API mocking tests for the pull command
 * Tests various API response scenarios and edge cases
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchProject } from '../../src/dd/pull.mjs'

// Mock HTTP responses for different scenarios
const mockResponses = {
  success: {
    ok: true,
    status: 200,
    json: async () => ({
      project: {
        token: 'test-token-123',
        template: 'saas',
        project_name: 'my-test-app',
        output_dir: './my-test-app',
        integrations: {
          auth: 'supabase',
          payments: 'stripe',
          email: 'resend',
        },
        env_keys: {
          CUSTOM_KEY: 'test-value',
        },
        vision: 'Build an amazing SaaS app',
        mission: 'Help users succeed',
        description: 'A production-ready SaaS application',
        success_criteria: 'Launch in 30 days',
        inspirations: [
          { type: 'app', value: 'Linear' },
          { type: 'design', value: 'Tailwind UI' },
        ],
      },
    }),
  },

  notFound: {
    ok: false,
    status: 404,
    json: async () => ({
      error: 'Project not found',
      message: 'No project exists with token: invalid-token',
    }),
  },

  unauthorized: {
    ok: false,
    status: 401,
    json: async () => ({
      error: 'Unauthorized',
      message: 'Invalid API credentials',
    }),
  },

  serverError: {
    ok: false,
    status: 500,
    json: async () => ({
      error: 'Internal Server Error',
      message: 'Something went wrong on our end',
    }),
  },

  rateLimit: {
    ok: false,
    status: 429,
    json: async () => ({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
    }),
  },

  malformedJson: {
    ok: true,
    status: 200,
    json: async () => {
      throw new Error('Invalid JSON')
    },
  },
}

test('API Mock: successful project fetch with full data', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.success

  const result = await fetchProject('test-token-123', 'https://dawson.dev')

  assert.equal(result.success, true)
  assert.equal(result.project.token, 'test-token-123')
  assert.equal(result.project.template, 'saas')
  assert.equal(result.project.project_name, 'my-test-app')
  assert.equal(result.project.integrations.auth, 'supabase')
  assert.equal(result.project.integrations.payments, 'stripe')
  assert.equal(result.project.vision, 'Build an amazing SaaS app')

  global.fetch = originalFetch
})

test('API Mock: 404 not found error', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.notFound

  const result = await fetchProject('invalid-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert.equal(result.status, 404)
  assert(result.error) // Error message should exist

  global.fetch = originalFetch
})

test('API Mock: 401 unauthorized error', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.unauthorized

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert.equal(result.status, 401)

  global.fetch = originalFetch
})

test('API Mock: 500 server error', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.serverError

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert.equal(result.status, 500)

  global.fetch = originalFetch
})

test('API Mock: 429 rate limit error', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.rateLimit

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert.equal(result.status, 429)

  global.fetch = originalFetch
})

test('API Mock: network timeout', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    throw new Error('Network timeout')
  }

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert(result.error.includes('timeout') || result.error.includes('Network'))

  global.fetch = originalFetch
})

test('API Mock: connection refused', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => {
    throw new Error('ECONNREFUSED')
  }

  const result = await fetchProject('test-token', 'http://localhost:9999')

  assert.equal(result.success, false)
  assert(result.error.includes('ECONNREFUSED'))

  global.fetch = originalFetch
})

test('API Mock: malformed JSON response', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => mockResponses.malformedJson

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)

  global.fetch = originalFetch
})

test('API Mock: successful fetch with minimal data', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      project: {
        token: 'minimal-token',
        template: 'blog',
        project_name: 'my-blog',
        integrations: {},
        env_keys: {},
      },
    }),
  })

  const result = await fetchProject('minimal-token', 'https://dawson.dev')

  assert.equal(result.success, true)
  assert.equal(result.project.template, 'blog')
  assert.equal(result.project.project_name, 'my-blog')
  assert.deepEqual(result.project.integrations, {})

  global.fetch = originalFetch
})

test('API Mock: successful fetch with multiple integrations', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      project: {
        token: 'full-stack-token',
        template: 'saas',
        project_name: 'full-stack-app',
        integrations: {
          auth: 'supabase',
          payments: 'stripe',
          email: 'resend',
          db: 'supabase',
          ai: 'anthropic',
          analytics: 'posthog',
          storage: 's3',
        },
        env_keys: {
          OPENAI_API_KEY: '',
          STRIPE_SECRET_KEY: '',
          SUPABASE_URL: '',
        },
      },
    }),
  })

  const result = await fetchProject('full-stack-token', 'https://dawson.dev')

  assert.equal(result.success, true)
  assert.equal(Object.keys(result.project.integrations).length, 7)
  assert.equal(result.project.integrations.auth, 'supabase')
  assert.equal(result.project.integrations.ai, 'anthropic')

  global.fetch = originalFetch
})

test('API Mock: API returns unexpected status code', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: false,
    status: 418, // I'm a teapot
    json: async () => ({ error: 'Unexpected error' }),
  })

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, false)
  assert.equal(result.status, 418)

  global.fetch = originalFetch
})

test('API Mock: response with empty project object', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      project: null,
    }),
  })

  const result = await fetchProject('test-token', 'https://dawson.dev')

  assert.equal(result.success, true)
  assert.equal(result.project, null)

  global.fetch = originalFetch
})

test('API Mock: concurrent requests', async () => {
  const originalFetch = global.fetch
  let requestCount = 0

  global.fetch = async () => {
    requestCount++
    await new Promise((resolve) => setTimeout(resolve, 50))
    return mockResponses.success
  }

  const promises = [
    fetchProject('token-1', 'https://dawson.dev'),
    fetchProject('token-2', 'https://dawson.dev'),
    fetchProject('token-3', 'https://dawson.dev'),
  ]

  const results = await Promise.all(promises)

  assert.equal(results.length, 3)
  assert.equal(requestCount, 3)
  results.forEach((result) => {
    assert.equal(result.success, true)
  })

  global.fetch = originalFetch
})
