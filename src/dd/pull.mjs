// src/dd/pull.mjs
/**
 * Core pull logic for fetching projects from the web platform
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Parse pull command flags from argv array
 * @param {string[]} args - Rest of argv after token and optional output-dir
 * @returns {object} Parsed flags
 */
export function parsePullFlags(args) {
  const flags = {
    dryRun: false,
    cursor: false,
    open: false,
    force: false,
    dev: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--cursor') {
      flags.cursor = true;
    } else if (arg === '--open') {
      flags.open = true;
    } else if (arg === '--force') {
      flags.force = true;
    } else if (arg === '--dev') {
      flags.dev = true;
    }
  }

  return flags;
}

/**
 * Get the API base URL
 * @param {boolean} dev - Whether to use dev URL
 * @returns {string} API base URL
 */
export function getApiUrl(dev = false) {
  if (process.env.DD_API_URL) {
    return process.env.DD_API_URL;
  }
  if (dev || process.env.NODE_ENV === 'development') {
    return 'http://localhost:3002';
  }
  return 'https://dawson.dev';
}

/**
 * Fetch project from API
 * @param {string} token - Project token
 * @param {string} apiUrl - API base URL
 * @returns {Promise<{success: boolean, project?: object, error?: string, recovery?: string, status?: number}>}
 */
export async function fetchProject(token, apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/projects/${token}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // New API format: error is nested with code, message, and recovery
      if (errorData.error && errorData.error.message) {
        return {
          success: false,
          error: errorData.error.message,
          recovery: errorData.error.recovery,
          status: response.status,
        };
      }

      // Fallback for unexpected error format
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();

    // New API format: project data is nested under 'data' key
    return {
      success: true,
      project: data.data || data.project, // Support both new and old formats for transition
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate .env.example content from project env_keys and integrations
 * @param {object} project - Project configuration
 * @returns {string} - Content for .env.example file
 */
export function generateEnvExample(project) {
  const lines = [];
  
  lines.push('# Environment Variables');
  lines.push('# Copy this file to .env.local and fill in your values');
  lines.push(`# Generated from: framework pull ${project.token}`);
  lines.push('');

  // Core app vars
  lines.push('# App Configuration');
  lines.push('NEXT_PUBLIC_APP_URL=http://localhost:3000');
  lines.push('');

  // Add env_keys from project if provided
  if (project.env_keys && Object.keys(project.env_keys).length > 0) {
    lines.push('# Project-specific keys');
    for (const [key, value] of Object.entries(project.env_keys)) {
      lines.push(`${key}=${value || ''}`);
    }
    lines.push('');
  }

  // Add integration-specific env vars
  const integrations = project.integrations || {};

  if (integrations.auth === 'supabase') {
    lines.push('# Supabase');
    lines.push('NEXT_PUBLIC_SUPABASE_URL=');
    lines.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
    lines.push('SUPABASE_SERVICE_ROLE_KEY=');
    lines.push('');
  } else if (integrations.auth === 'clerk') {
    lines.push('# Clerk');
    lines.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=');
    lines.push('CLERK_SECRET_KEY=');
    lines.push('');
  } else if (integrations.auth === 'nextauth') {
    lines.push('# NextAuth');
    lines.push('NEXTAUTH_URL=http://localhost:3000');
    lines.push('NEXTAUTH_SECRET=');
    lines.push('');
  }

  if (integrations.payments === 'stripe') {
    lines.push('# Stripe');
    lines.push('STRIPE_SECRET_KEY=');
    lines.push('STRIPE_WEBHOOK_SECRET=');
    lines.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=');
    lines.push('');
  } else if (integrations.payments === 'lemon-squeezy') {
    lines.push('# Lemon Squeezy');
    lines.push('LEMON_SQUEEZY_API_KEY=');
    lines.push('LEMON_SQUEEZY_WEBHOOK_SECRET=');
    lines.push('LEMON_SQUEEZY_STORE_ID=');
    lines.push('');
  } else if (integrations.payments === 'paddle') {
    lines.push('# Paddle');
    lines.push('PADDLE_API_KEY=');
    lines.push('PADDLE_WEBHOOK_SECRET=');
    lines.push('PADDLE_SELLER_ID=');
    lines.push('');
  }

  if (integrations.email === 'resend') {
    lines.push('# Resend');
    lines.push('RESEND_API_KEY=');
    lines.push('');
  } else if (integrations.email === 'sendgrid') {
    lines.push('# SendGrid');
    lines.push('SENDGRID_API_KEY=');
    lines.push('');
  } else if (integrations.email === 'postmark') {
    lines.push('# Postmark');
    lines.push('POSTMARK_API_KEY=');
    lines.push('');
  }

  if (integrations.ai === 'openai') {
    lines.push('# OpenAI');
    lines.push('OPENAI_API_KEY=');
    lines.push('');
  } else if (integrations.ai === 'anthropic') {
    lines.push('# Anthropic');
    lines.push('ANTHROPIC_API_KEY=');
    lines.push('');
  }

  if (integrations.analytics === 'posthog') {
    lines.push('# PostHog');
    lines.push('NEXT_PUBLIC_POSTHOG_KEY=');
    lines.push('NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com');
    lines.push('');
  } else if (integrations.analytics === 'plausible') {
    lines.push('# Plausible');
    lines.push('NEXT_PUBLIC_PLAUSIBLE_DOMAIN=');
    lines.push('');
  } else if (integrations.analytics === 'mixpanel') {
    lines.push('# Mixpanel');
    lines.push('NEXT_PUBLIC_MIXPANEL_TOKEN=');
    lines.push('');
  }

  if (integrations.storage === 'supabase') {
    // Already covered by auth=supabase
    if (integrations.auth !== 'supabase') {
      lines.push('# Supabase Storage');
      lines.push('NEXT_PUBLIC_SUPABASE_URL=');
      lines.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
      lines.push('SUPABASE_SERVICE_ROLE_KEY=');
      lines.push('');
    }
  } else if (integrations.storage === 'cloudflare') {
    lines.push('# Cloudflare R2');
    lines.push('CLOUDFLARE_ACCOUNT_ID=');
    lines.push('CLOUDFLARE_R2_ACCESS_KEY_ID=');
    lines.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY=');
    lines.push('CLOUDFLARE_R2_BUCKET_NAME=');
    lines.push('');
  } else if (integrations.storage === 's3') {
    lines.push('# AWS S3');
    lines.push('AWS_ACCESS_KEY_ID=');
    lines.push('AWS_SECRET_ACCESS_KEY=');
    lines.push('AWS_S3_BUCKET_NAME=');
    lines.push('AWS_REGION=us-east-1');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate context.json content from project
 * @param {object} project - Project configuration
 * @returns {object} - Context object
 */
export function generateContext(project) {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project: {
      name: project.project_name,
      template: project.template,
      token: project.token,
    },
    context: {
      vision: project.vision || null,
      mission: project.mission || null,
      description: project.description || null,
      successCriteria: project.success_criteria || null,
      inspirations: project.inspirations || [],
    },
    integrations: project.integrations || {},
    pullSource: {
      pulledAt: new Date().toISOString(),
      apiUrl: process.env.DD_API_URL || 'https://dawson.dev',
    },
  };
}

/**
 * Open a directory in Cursor
 * @param {string} dir - Directory path
 * @returns {boolean} - Whether the command succeeded
 */
export function openInCursor(dir) {
  // Try 'cursor' command first (macOS with CLI installed)
  let result = spawnSync('cursor', [dir], { stdio: 'inherit' });
  
  if (result.status === 0) {
    return true;
  }

  // Try 'code' command (VS Code / Cursor on some systems)
  result = spawnSync('code', [dir], { stdio: 'inherit' });
  
  if (result.status === 0) {
    return true;
  }

  // Try macOS open command with Cursor app
  if (process.platform === 'darwin') {
    result = spawnSync('open', ['-a', 'Cursor', dir], { stdio: 'inherit' });
    if (result.status === 0) {
      return true;
    }
  }

  return false;
}

/**
 * Format integrations for display
 * @param {object} integrations - Integrations object
 * @returns {string} - Formatted string
 */
export function formatIntegrations(integrations) {
  if (!integrations) return 'none';
  
  const active = Object.entries(integrations)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`);
  
  return active.length > 0 ? active.join(', ') : 'none';
}

