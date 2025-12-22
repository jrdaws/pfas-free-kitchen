// tests/cli/cursorrules.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  generateCursorRules,
  generateStartPrompt,
} from '../../src/dd/cursorrules.mjs'
import { createMockProject } from '../utils/fixtures.mjs'

test('generateCursorRules: includes project name in header', () => {
  const project = createMockProject({
    project_name: 'My Awesome App',
    template: 'saas',
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('# Cursor Rules for My Awesome App'))
  assert(rules.includes('Template: saas'))
})

test('generateCursorRules: includes vision when provided', () => {
  const project = createMockProject({
    vision: 'Build the best SaaS product',
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Vision'))
  assert(rules.includes('Build the best SaaS product'))
})

test('generateCursorRules: includes mission when provided', () => {
  const project = createMockProject({
    mission: 'Help entrepreneurs succeed',
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Mission'))
  assert(rules.includes('Help entrepreneurs succeed'))
})

test('generateCursorRules: includes description when provided', () => {
  const project = createMockProject({
    description: 'A platform for freelancers',
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Description'))
  assert(rules.includes('A platform for freelancers'))
})

test('generateCursorRules: includes success criteria when provided', () => {
  const project = createMockProject({
    success_criteria: '10k users in 6 months',
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Success Criteria'))
  assert(rules.includes('10k users in 6 months'))
})

test('generateCursorRules: includes tech stack section', () => {
  const project = createMockProject({
    template: 'saas',
    integrations: {
      auth: 'supabase',
      payments: 'stripe',
    },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('## Tech Stack'))
  assert(rules.includes('Framework'))
  assert(rules.includes('Next.js'))
  assert(rules.includes('TypeScript'))
  assert(rules.includes('Tailwind CSS'))
})

test('generateCursorRules: includes Supabase auth in tech stack', () => {
  const project = createMockProject({
    integrations: { auth: 'supabase' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('Auth'))
  assert(rules.includes('Supabase Auth'))
  assert(rules.includes('Database'))
  assert(rules.includes('PostgreSQL'))
})

test('generateCursorRules: includes Clerk auth in tech stack', () => {
  const project = createMockProject({
    integrations: { auth: 'clerk' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('Auth'))
  assert(rules.includes('Clerk'))
})

test('generateCursorRules: includes Stripe payments in tech stack', () => {
  const project = createMockProject({
    integrations: { payments: 'stripe' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('Payments'))
  assert(rules.includes('Stripe'))
})

test('generateCursorRules: includes AI provider in tech stack', () => {
  const project = createMockProject({
    integrations: { ai: 'anthropic' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('AI'))
  assert(rules.includes('Anthropic Claude'))
})

test('generateCursorRules: includes development guidelines', () => {
  const project = createMockProject()
  const rules = generateCursorRules(project)

  assert(rules.includes('## Development Guidelines'))
  assert(rules.includes('### Code Style'))
  assert(rules.includes('### File Organization'))
})

test('generateCursorRules: includes integration guidelines for Supabase', () => {
  const project = createMockProject({
    integrations: { auth: 'supabase' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Integration Guidelines'))
  assert(rules.includes('Supabase client'))
  assert(rules.includes('Protect routes'))
})

test('generateCursorRules: includes integration guidelines for Stripe', () => {
  const project = createMockProject({
    integrations: { payments: 'stripe' },
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('### Integration Guidelines'))
  assert(rules.includes('Stripe webhooks'))
  assert(rules.includes('subscription status'))
})

test('generateCursorRules: includes inspirations when provided', () => {
  const project = createMockProject({
    inspirations: [
      { type: 'website', value: 'https://example.com' },
      { type: 'feature', value: 'Notion-like editor' },
    ],
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('## Reference Inspirations'))
  assert(rules.includes('[website] https://example.com'))
  assert(rules.includes('[feature] Notion-like editor'))
})

test('generateCursorRules: minimal project without optional fields', () => {
  const project = createMockProject({
    project_name: 'Minimal App',
    template: 'blog',
    integrations: {},
  })
  const rules = generateCursorRules(project)

  assert(rules.includes('# Cursor Rules for Minimal App'))
  assert(rules.includes('Template: blog'))
  assert(rules.includes('## Tech Stack'))
  assert(rules.includes('## Development Guidelines'))
})

// START_PROMPT tests

test('generateStartPrompt: includes project name in header', () => {
  const project = createMockProject({
    project_name: 'My Awesome App',
  })
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('# Start Prompt: My Awesome App'))
})

test('generateStartPrompt: includes project overview', () => {
  const project = createMockProject({
    description: 'A platform for freelancers',
    template: 'saas',
  })
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('## Project Overview'))
  assert(prompt.includes('A platform for freelancers'))
  assert(prompt.includes('**Template:** saas'))
})

test('generateStartPrompt: uses vision when description not provided', () => {
  const project = createMockProject({
    vision: 'Build the best freelance platform',
    template: 'saas',
  })
  delete project.description
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('Build the best freelance platform'))
})

test('generateStartPrompt: includes integrations list', () => {
  const project = createMockProject({
    integrations: {
      auth: 'supabase',
      payments: 'stripe',
      email: 'resend',
    },
  })
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('**Integrations:**'))
  assert(prompt.includes('auth: supabase'))
  assert(prompt.includes('payments: stripe'))
  assert(prompt.includes('email: resend'))
})

test('generateStartPrompt: includes getting started section', () => {
  const project = createMockProject({
    vision: 'Build amazing software',
    mission: 'Help developers',
    success_criteria: '1000 happy users',
  })
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('## Getting Started'))
  assert(prompt.includes('**Vision:** Build amazing software'))
  assert(prompt.includes('**Mission:** Help developers'))
  assert(prompt.includes('**Success Criteria:** 1000 happy users'))
})

test('generateStartPrompt: includes action items', () => {
  const project = createMockProject()
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('Please help me:'))
  assert(prompt.includes('Review the current project structure'))
  assert(prompt.includes('Identify what needs to be configured'))
  assert(prompt.includes('Suggest first steps'))
})

test('generateStartPrompt: includes inspirations when provided', () => {
  const project = createMockProject({
    inspirations: [
      { type: 'website', value: 'https://stripe.com' },
      { type: 'feature', value: 'Real-time collaboration' },
    ],
  })
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('## Reference Inspirations'))
  assert(prompt.includes('[website] https://stripe.com'))
  assert(prompt.includes('[feature] Real-time collaboration'))
})

test('generateStartPrompt: includes generated by footer', () => {
  const project = createMockProject()
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('*Generated by `framework pull`'))
  assert(prompt.includes('.cursorrules'))
})

test('generateStartPrompt: minimal project without optional fields', () => {
  const project = createMockProject({
    project_name: 'Minimal App',
    template: 'blog',
  })
  delete project.vision
  delete project.mission
  delete project.success_criteria
  delete project.description
  delete project.inspirations
  const prompt = generateStartPrompt(project)

  assert(prompt.includes('# Start Prompt: Minimal App'))
  assert(prompt.includes('**Template:** blog'))
  assert(prompt.includes('## Getting Started'))
})
