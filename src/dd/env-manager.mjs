/**
 * Environment Manager
 * 
 * Handles environment variable syncing between cloud dashboard and local .env files.
 * Security-first: Secret keys are NEVER stored in cloud, only placeholders.
 */

import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auth token storage locations
const AUTH_PATHS = [
  path.join(os.homedir(), '.frameworkrc'),
  path.join(os.homedir(), '.config', 'framework', 'auth.json'),
]

// Known secret key patterns - NEVER store these in cloud
const SECRET_KEY_PATTERNS = [
  /^SUPABASE_SERVICE_ROLE_KEY$/,
  /^STRIPE_SECRET_KEY$/,
  /^STRIPE_WEBHOOK_SECRET$/,
  /^DATABASE_URL$/,
  /^DIRECT_URL$/,
  /^JWT_SECRET$/,
  /^NEXTAUTH_SECRET$/,
  /^OPENAI_API_KEY$/,
  /^ANTHROPIC_API_KEY$/,
  /_SECRET$/,
  /_SECRET_KEY$/,
  /_PRIVATE_KEY$/,
  /^PRIVATE_/,
]

// Known public key patterns - safe to store in cloud
const PUBLIC_KEY_PATTERNS = [
  /^NEXT_PUBLIC_/,
  /^VITE_/,
  /^REACT_APP_/,
  /_PUBLISHABLE_KEY$/,
  /_PUBLIC_KEY$/,
  /_ANON_KEY$/,
  /_PROJECT_ID$/,
  /_PROJECT_URL$/,
]

// Documentation links for getting API keys
const KEY_DOCS = {
  'SUPABASE_SERVICE_ROLE_KEY': 'https://supabase.com/dashboard/project/_/settings/api',
  'NEXT_PUBLIC_SUPABASE_URL': 'https://supabase.com/dashboard/project/_/settings/api',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'https://supabase.com/dashboard/project/_/settings/api',
  'STRIPE_SECRET_KEY': 'https://dashboard.stripe.com/apikeys',
  'STRIPE_PUBLISHABLE_KEY': 'https://dashboard.stripe.com/apikeys',
  'STRIPE_WEBHOOK_SECRET': 'https://dashboard.stripe.com/webhooks',
  'OPENAI_API_KEY': 'https://platform.openai.com/api-keys',
  'ANTHROPIC_API_KEY': 'https://console.anthropic.com/account/keys',
  'RESEND_API_KEY': 'https://resend.com/api-keys',
  'POSTHOG_API_KEY': 'https://app.posthog.com/settings/project',
  'NEXT_PUBLIC_POSTHOG_KEY': 'https://app.posthog.com/settings/project',
  'CLERK_SECRET_KEY': 'https://dashboard.clerk.com/last-active?path=api-keys',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'https://dashboard.clerk.com/last-active?path=api-keys',
}

/**
 * Check if a key is a secret (should not be stored in cloud)
 */
export function isSecretKey(keyName) {
  return SECRET_KEY_PATTERNS.some(pattern => pattern.test(keyName))
}

/**
 * Check if a key is public (safe to store in cloud)
 */
export function isPublicKey(keyName) {
  return PUBLIC_KEY_PATTERNS.some(pattern => pattern.test(keyName))
}

/**
 * Get documentation link for a key
 */
export function getKeyDocLink(keyName) {
  return KEY_DOCS[keyName] || null
}

/**
 * Load auth token from storage
 */
export async function loadAuthToken() {
  for (const authPath of AUTH_PATHS) {
    try {
      if (await fs.pathExists(authPath)) {
        const content = await fs.readFile(authPath, 'utf8')
        
        // Try JSON format first
        try {
          const json = JSON.parse(content)
          if (json.token) return json
          if (json.accessToken) return { token: json.accessToken, ...json }
        } catch {
          // Try simple token format
          const token = content.trim()
          if (token && !token.startsWith('{')) {
            return { token }
          }
        }
      }
    } catch {
      // Continue to next path
    }
  }
  return null
}

/**
 * Save auth token to storage
 */
export async function saveAuthToken(authData) {
  const authPath = path.join(os.homedir(), '.config', 'framework', 'auth.json')
  await fs.ensureDir(path.dirname(authPath))
  await fs.writeFile(authPath, JSON.stringify(authData, null, 2), 'utf8')
  // Make file readable only by owner
  try {
    await fs.chmod(authPath, 0o600)
  } catch {
    // Ignore chmod errors on Windows
  }
  return authPath
}

/**
 * Clear auth token
 */
export async function clearAuthToken() {
  for (const authPath of AUTH_PATHS) {
    try {
      if (await fs.pathExists(authPath)) {
        await fs.remove(authPath)
      }
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Find project configuration file
 */
export async function findProjectConfig(cwd = process.cwd()) {
  const configPaths = [
    path.join(cwd, '.frameworkrc'),
    path.join(cwd, '.dd', 'project.json'),
    path.join(cwd, '.dd', 'pull-metadata.json'),
    path.join(cwd, '.dd', 'template-manifest.json'),
  ]
  
  for (const configPath of configPaths) {
    try {
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf8')
        return JSON.parse(content)
      }
    } catch {
      // Continue to next path
    }
  }
  return null
}

/**
 * Fetch project env vars from cloud API
 */
export async function fetchProjectEnvVars(projectId, authToken, options = {}) {
  const { apiBase = 'https://dawson-does-framework.vercel.app' } = options
  
  const response = await fetch(`${apiBase}/api/projects/${projectId}/env`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Failed to fetch env vars: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Parse an existing .env file
 */
export async function parseEnvFile(filePath) {
  if (!await fs.pathExists(filePath)) {
    return {}
  }
  
  const content = await fs.readFile(filePath, 'utf8')
  const vars = {}
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) {
      let value = match[2]
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      vars[match[1]] = value
    }
  }
  
  return vars
}

/**
 * Generate .env.local content
 */
export function generateEnvContent(envVars, options = {}) {
  const { projectName = 'Unknown Project', includeSecrets = true } = options
  const timestamp = new Date().toISOString()
  
  let content = `# Generated by @jrdaws/framework env pull
# Project: ${projectName}
# Generated: ${timestamp}
# 
# ⚠️  IMPORTANT: Secret keys are placeholders only - add manually
#     Never commit this file to version control

`

  // Group by category
  const groups = {
    supabase: [],
    clerk: [],
    stripe: [],
    ai: [],
    analytics: [],
    email: [],
    app: [],
    other: [],
  }
  
  for (const [key, value] of Object.entries(envVars)) {
    const isSecret = isSecretKey(key)
    const displayValue = isSecret ? '' : value
    const entry = { key, value: displayValue, isSecret }
    
    if (key.includes('SUPABASE')) groups.supabase.push(entry)
    else if (key.includes('CLERK')) groups.clerk.push(entry)
    else if (key.includes('STRIPE')) groups.stripe.push(entry)
    else if (key.includes('OPENAI') || key.includes('ANTHROPIC')) groups.ai.push(entry)
    else if (key.includes('POSTHOG') || key.includes('ANALYTICS')) groups.analytics.push(entry)
    else if (key.includes('RESEND') || key.includes('EMAIL')) groups.email.push(entry)
    else if (key.includes('APP') || key.includes('SITE')) groups.app.push(entry)
    else groups.other.push(entry)
  }
  
  const groupLabels = {
    supabase: 'Supabase Configuration',
    clerk: 'Clerk Authentication',
    stripe: 'Stripe Payments',
    ai: 'AI Provider Keys',
    analytics: 'Analytics',
    email: 'Email Service',
    app: 'App Configuration',
    other: 'Other Variables',
  }
  
  for (const [groupId, entries] of Object.entries(groups)) {
    if (entries.length === 0) continue
    
    content += `# ${groupLabels[groupId]}\n`
    
    for (const { key, value, isSecret } of entries) {
      if (isSecret && includeSecrets) {
        const docLink = getKeyDocLink(key)
        if (docLink) {
          content += `# Get your key: ${docLink}\n`
        }
        content += `${key}=\n`
      } else if (!isSecret) {
        content += `${key}=${value}\n`
      }
    }
    
    content += '\n'
  }
  
  return content.trim() + '\n'
}

/**
 * Check if .env.local is gitignored
 */
export async function isEnvFileGitignored(cwd = process.cwd()) {
  const gitignorePath = path.join(cwd, '.gitignore')
  
  if (!await fs.pathExists(gitignorePath)) {
    return false
  }
  
  const content = await fs.readFile(gitignorePath, 'utf8')
  const lines = content.split('\n').map(l => l.trim())
  
  return lines.some(line => 
    line === '.env.local' || 
    line === '.env*.local' ||
    line === '*.local' ||
    line === '.env*'
  )
}

/**
 * Check if running in CI environment
 */
export function isCI() {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS
  )
}

/**
 * Get missing required env vars
 */
export async function getMissingEnvVars(requiredVars, cwd = process.cwd()) {
  const envLocalPath = path.join(cwd, '.env.local')
  const currentVars = await parseEnvFile(envLocalPath)
  
  const missing = []
  const present = []
  const empty = []
  
  for (const varName of requiredVars) {
    if (!(varName in currentVars)) {
      missing.push(varName)
    } else if (!currentVars[varName]) {
      empty.push(varName)
    } else {
      present.push(varName)
    }
  }
  
  return { missing, present, empty }
}

/**
 * Get all required env vars for integrations
 */
export function getRequiredVarsForIntegrations(integrations) {
  const vars = new Set()
  
  // App basics
  vars.add('NEXT_PUBLIC_APP_URL')
  
  if (integrations.auth === 'supabase' || integrations.db === 'supabase') {
    vars.add('NEXT_PUBLIC_SUPABASE_URL')
    vars.add('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    vars.add('SUPABASE_SERVICE_ROLE_KEY')
  }
  
  if (integrations.auth === 'clerk') {
    vars.add('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
    vars.add('CLERK_SECRET_KEY')
  }
  
  if (integrations.payments === 'stripe') {
    vars.add('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
    vars.add('STRIPE_SECRET_KEY')
    vars.add('STRIPE_WEBHOOK_SECRET')
  }
  
  if (integrations.ai === 'openai') {
    vars.add('OPENAI_API_KEY')
  }
  
  if (integrations.ai === 'anthropic') {
    vars.add('ANTHROPIC_API_KEY')
  }
  
  if (integrations.email === 'resend') {
    vars.add('RESEND_API_KEY')
  }
  
  if (integrations.analytics === 'posthog') {
    vars.add('NEXT_PUBLIC_POSTHOG_KEY')
    vars.add('POSTHOG_API_KEY')
  }
  
  return Array.from(vars)
}

