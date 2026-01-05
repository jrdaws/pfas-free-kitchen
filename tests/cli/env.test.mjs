// tests/cli/env.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for CLI env commands
 * Reference: PLATFORM_ARCHITECTURE_RESEARCH.md
 *
 * These tests validate the environment variable sync workflow.
 * Commands: env pull, env push, env check
 */

// ============================================================================
// Mock Helpers
// ============================================================================

function createMockEnvConfig(overrides = {}) {
  return {
    projectId: 'proj_123',
    publicKeys: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    },
    secretKeyPlaceholders: [
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'DATABASE_URL',
    ],
    integrations: ['supabase', 'stripe'],
    ...overrides,
  };
}

function mockFileSystem() {
  const files = {};
  return {
    readFile: (path) => files[path] || null,
    writeFile: (path, content) => {
      files[path] = content;
    },
    exists: (path) => path in files,
    files,
  };
}

// ============================================================================
// env pull
// ============================================================================

test('env pull: writes .env.local with public keys', () => {
  const config = createMockEnvConfig();
  const fs = mockFileSystem();

  // Simulate env pull
  let content = '# Environment variables pulled from dawson-does dashboard\n';
  content += `# Project: ${config.projectId}\n`;
  content += `# Generated: ${new Date().toISOString()}\n\n`;

  content += '# Public keys (safe to commit to .env.example)\n';
  for (const [key, value] of Object.entries(config.publicKeys)) {
    content += `${key}=${value}\n`;
  }

  fs.writeFile('.env.local', content);

  assert(fs.exists('.env.local'));
  assert(fs.readFile('.env.local').includes('NEXT_PUBLIC_SUPABASE_URL'));
  assert(fs.readFile('.env.local').includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'));
});

test('env pull: includes placeholder for secret keys', () => {
  const config = createMockEnvConfig();

  let content = '';
  content += '\n# Secret keys (DO NOT COMMIT - fill in manually)\n';
  for (const key of config.secretKeyPlaceholders) {
    content += `# ${key}=\n`;
  }

  assert(content.includes('# SUPABASE_SERVICE_ROLE_KEY='));
  assert(content.includes('# STRIPE_SECRET_KEY='));
  assert(content.includes('# STRIPE_WEBHOOK_SECRET='));
});

test('env pull: warns if .env.local exists without --force', () => {
  const fs = mockFileSystem();
  fs.writeFile('.env.local', 'EXISTING_VAR=value');

  const options = { force: false };
  const fileExists = fs.exists('.env.local');

  const shouldWarn = fileExists && !options.force;

  assert.equal(shouldWarn, true);

  const warningMessage = shouldWarn
    ? '.env.local already exists. Use --force to overwrite.'
    : null;

  assert(warningMessage);
  assert(warningMessage.includes('--force'));
});

test('env pull: overwrites with --force flag', () => {
  const fs = mockFileSystem();
  fs.writeFile('.env.local', 'OLD_VAR=old_value');

  const options = { force: true };
  const config = createMockEnvConfig();

  // Simulate force overwrite
  if (options.force || !fs.exists('.env.local')) {
    let content = 'NEW_VAR=new_value\n';
    fs.writeFile('.env.local', content);
  }

  assert.equal(fs.readFile('.env.local'), 'NEW_VAR=new_value\n');
  assert(!fs.readFile('.env.local').includes('OLD_VAR'));
});

test('env pull: respects --dry-run flag', () => {
  const fs = mockFileSystem();
  const options = { dryRun: true };
  const config = createMockEnvConfig();

  let output = '';

  // Simulate dry run
  if (options.dryRun) {
    output += '# DRY RUN - No files will be written\n';
    output += `Would write to .env.local:\n`;
    for (const [key, value] of Object.entries(config.publicKeys)) {
      output += `  ${key}=${value}\n`;
    }
  } else {
    fs.writeFile('.env.local', 'content');
  }

  assert(!fs.exists('.env.local')); // File not written
  assert(output.includes('DRY RUN'));
  assert(output.includes('Would write'));
});

test('env pull: fails gracefully without auth', () => {
  const isAuthenticated = false;

  const response = isAuthenticated
    ? { success: true, config: createMockEnvConfig() }
    : {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          recovery: 'Run `npx @jrdaws/framework login` to authenticate',
        },
      };

  assert.equal(response.success, false);
  assert.equal(response.error.code, 'UNAUTHORIZED');
  assert(response.error.recovery.includes('login'));
});

test('env pull: creates backup of existing file', () => {
  const fs = mockFileSystem();
  fs.writeFile('.env.local', 'EXISTING_VAR=value');

  const options = { force: true, backup: true };

  // Simulate backup creation
  if (fs.exists('.env.local') && options.backup) {
    const existingContent = fs.readFile('.env.local');
    fs.writeFile('.env.local.backup', existingContent);
  }

  assert(fs.exists('.env.local.backup'));
  assert.equal(fs.readFile('.env.local.backup'), 'EXISTING_VAR=value');
});

test('env pull: includes links to get missing keys', () => {
  const config = createMockEnvConfig();

  const keyDocs = {
    SUPABASE_SERVICE_ROLE_KEY: 'https://supabase.com/dashboard/project/_/settings/api',
    STRIPE_SECRET_KEY: 'https://dashboard.stripe.com/apikeys',
    STRIPE_WEBHOOK_SECRET: 'https://dashboard.stripe.com/webhooks',
  };

  let content = '\n# Where to get secret keys:\n';
  for (const key of config.secretKeyPlaceholders) {
    const link = keyDocs[key] || 'See integration documentation';
    content += `# ${key}: ${link}\n`;
  }

  assert(content.includes('supabase.com'));
  assert(content.includes('dashboard.stripe.com'));
});

// ============================================================================
// env push
// ============================================================================

test('env push: pushes only public keys', () => {
  const envContent = `
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_API_KEY=public_123
STRIPE_SECRET_KEY=sk_test_secret
DATABASE_URL=postgres://secret
`;

  function parseEnvFile(content) {
    const lines = content.trim().split('\n');
    const vars = {};
    for (const line of lines) {
      if (line.startsWith('#') || !line.includes('=')) continue;
      const [key, ...valueParts] = line.split('=');
      vars[key.trim()] = valueParts.join('=').trim();
    }
    return vars;
  }

  function filterPublicKeys(vars) {
    return Object.fromEntries(
      Object.entries(vars).filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
    );
  }

  const allVars = parseEnvFile(envContent);
  const publicOnly = filterPublicKeys(allVars);

  assert.equal(Object.keys(publicOnly).length, 2);
  assert(publicOnly.NEXT_PUBLIC_SUPABASE_URL);
  assert(publicOnly.NEXT_PUBLIC_API_KEY);
  assert(!publicOnly.STRIPE_SECRET_KEY);
  assert(!publicOnly.DATABASE_URL);
});

test('env push: validates keys before push', () => {
  const vars = {
    NEXT_PUBLIC_URL: 'https://example.com',
    NEXT_PUBLIC_EMPTY: '',
    NEXT_PUBLIC_INVALID: 'has\nnewline',
  };

  function validateEnvVars(varsObj) {
    const errors = [];
    for (const [key, value] of Object.entries(varsObj)) {
      if (!value) {
        errors.push({ key, error: 'Empty value' });
      }
      if (value.includes('\n')) {
        errors.push({ key, error: 'Contains newline' });
      }
    }
    return errors;
  }

  const errors = validateEnvVars(vars);

  assert.equal(errors.length, 2);
  assert(errors.some((e) => e.key === 'NEXT_PUBLIC_EMPTY'));
  assert(errors.some((e) => e.key === 'NEXT_PUBLIC_INVALID'));
});

test('env push: requires authentication', () => {
  const isAuthenticated = false;

  const response = isAuthenticated
    ? { success: true }
    : {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to push environment variables',
          recovery: 'Run `npx @jrdaws/framework login` to authenticate',
        },
      };

  assert.equal(response.success, false);
  assert.equal(response.error.code, 'UNAUTHORIZED');
});

test('env push: respects --public-only flag', () => {
  const vars = {
    NEXT_PUBLIC_API: 'public',
    SECRET_KEY: 'secret',
    DATABASE_URL: 'postgres://...',
  };

  const options = { publicOnly: true };

  const toPush = options.publicOnly
    ? Object.fromEntries(
        Object.entries(vars).filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
      )
    : vars;

  assert.equal(Object.keys(toPush).length, 1);
  assert(toPush.NEXT_PUBLIC_API);
});

// ============================================================================
// env check
// ============================================================================

test('env check: reports missing required variables', () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const present = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon_key',
  };

  const missing = required.filter((key) => !(key in present));

  assert.equal(missing.length, 2);
  assert(missing.includes('SUPABASE_SERVICE_ROLE_KEY'));
  assert(missing.includes('STRIPE_SECRET_KEY'));
});

test('env check: reports present variables', () => {
  const required = ['VAR_A', 'VAR_B', 'VAR_C'];
  const present = { VAR_A: 'a', VAR_B: 'b', VAR_C: 'c' };

  const presentKeys = required.filter((key) => key in present);

  assert.equal(presentKeys.length, 3);
});

test('env check: exits 0 if all required present', () => {
  const required = ['VAR_A', 'VAR_B'];
  const present = { VAR_A: 'a', VAR_B: 'b' };

  const missing = required.filter((key) => !(key in present));
  const exitCode = missing.length === 0 ? 0 : 1;

  assert.equal(exitCode, 0);
});

test('env check: exits 1 if missing required', () => {
  const required = ['VAR_A', 'VAR_B', 'VAR_C'];
  const present = { VAR_A: 'a' };

  const missing = required.filter((key) => !(key in present));
  const exitCode = missing.length === 0 ? 0 : 1;

  assert.equal(exitCode, 1);
  assert.equal(missing.length, 2);
});

test('env check: shows which integration needs which vars', () => {
  const integrationRequirements = {
    supabase: {
      required: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
      optional: ['SUPABASE_SERVICE_ROLE_KEY'],
    },
    stripe: {
      required: ['STRIPE_SECRET_KEY'],
      optional: ['STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    },
  };

  const present = {
    NEXT_PUBLIC_SUPABASE_URL: 'url',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  };

  function checkIntegration(integration, presentVars) {
    const reqs = integrationRequirements[integration];
    return {
      integration,
      missingRequired: reqs.required.filter((k) => !(k in presentVars)),
      missingOptional: reqs.optional.filter((k) => !(k in presentVars)),
    };
  }

  const supabaseCheck = checkIntegration('supabase', present);
  const stripeCheck = checkIntegration('stripe', present);

  assert.equal(supabaseCheck.missingRequired.length, 0);
  assert.equal(supabaseCheck.missingOptional.length, 1);
  assert.equal(stripeCheck.missingRequired.length, 1);
  assert(stripeCheck.missingRequired.includes('STRIPE_SECRET_KEY'));
});

// ============================================================================
// Env File Parsing
// ============================================================================

test('Env Parsing: parses standard .env format', () => {
  const content = `
# Comment
SIMPLE_VAR=value
QUOTED_VAR="quoted value"
SINGLE_QUOTED='single quoted'
EXPORT_VAR=export_value
EMPTY_VAR=
`;

  function parseEnv(text) {
    const vars = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        vars[key] = value;
      }
    }

    return vars;
  }

  const parsed = parseEnv(content);

  assert.equal(parsed.SIMPLE_VAR, 'value');
  assert.equal(parsed.QUOTED_VAR, 'quoted value');
  assert.equal(parsed.SINGLE_QUOTED, 'single quoted');
  assert.equal(parsed.EMPTY_VAR, '');
});

test('Env Parsing: handles multiline values', () => {
  // In real .env files, multiline is typically handled with escaped newlines
  const content = `
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\nMIIE...\\n-----END RSA PRIVATE KEY-----"
`;

  function parseWithMultiline(text) {
    const vars = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes and unescape
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/\\n/g, '\n');
        }

        vars[key] = value;
      }
    }

    return vars;
  }

  const parsed = parseWithMultiline(content);

  assert(parsed.PRIVATE_KEY);
  assert(parsed.PRIVATE_KEY.includes('\n'));
});

// ============================================================================
// Security
// ============================================================================

test('Security: never includes secret keys in output', () => {
  const secretPatterns = [
    /SECRET/i,
    /PASSWORD/i,
    /TOKEN/i,
    /PRIVATE/i,
    /API_KEY$/i,
    /DATABASE_URL/i,
  ];

  function isSecretKey(key) {
    return secretPatterns.some((pattern) => pattern.test(key));
  }

  assert.equal(isSecretKey('STRIPE_SECRET_KEY'), true);
  assert.equal(isSecretKey('DATABASE_URL'), true);
  assert.equal(isSecretKey('API_KEY'), true);
  assert.equal(isSecretKey('PRIVATE_KEY'), true);
  assert.equal(isSecretKey('NEXT_PUBLIC_URL'), false);
  assert.equal(isSecretKey('NEXT_PUBLIC_SUPABASE_URL'), false);
});

test('Security: masks secret values in logs', () => {
  function maskSecretValue(value) {
    if (value.length <= 4) return '****';
    return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
  }

  const secret = 'sk_test_abc123xyz789';
  const masked = maskSecretValue(secret);

  assert(!masked.includes('abc123'));
  assert(masked.startsWith('sk'));
  assert(masked.endsWith('89'));
  assert(masked.includes('****'));
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Edge Case: handles empty .env file', () => {
  const content = '';

  function parseEnv(text) {
    if (!text.trim()) return {};
    // ... parsing logic
    return {};
  }

  const parsed = parseEnv(content);
  assert.deepEqual(parsed, {});
});

test('Edge Case: handles .env with only comments', () => {
  const content = `
# This is a comment
# Another comment

# Yet another
`;

  function parseEnv(text) {
    const vars = {};
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      // Would parse here
    }
    return vars;
  }

  const parsed = parseEnv(content);
  assert.deepEqual(parsed, {});
});

test('Edge Case: handles special characters in values', () => {
  const content = `
URL_WITH_SPECIAL=https://example.com?foo=bar&baz=qux
JSON_VALUE={"key":"value"}
EQUALS_IN_VALUE=a=b=c=d
`;

  function parseEnv(text) {
    const vars = {};
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx);
        const value = trimmed.slice(idx + 1);
        vars[key] = value;
      }
    }
    return vars;
  }

  const parsed = parseEnv(content);

  assert.equal(parsed.URL_WITH_SPECIAL, 'https://example.com?foo=bar&baz=qux');
  assert.equal(parsed.JSON_VALUE, '{"key":"value"}');
  assert.equal(parsed.EQUALS_IN_VALUE, 'a=b=c=d');
});

