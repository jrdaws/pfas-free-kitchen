import test from 'node:test';
import assert from 'node:assert/strict';
import {
  integrationMetadataSchema,
  templateIntegrationSchema,
  integrationFlagsSchema,
  manifestIntegrationsSchema
} from '../../src/dd/integration-schema.mjs';

test('integrationMetadataSchema: validates valid metadata', () => {
  const validMetadata = {
    provider: 'supabase',
    type: 'auth',
    version: '1.0.0',
  };

  const result = integrationMetadataSchema.safeParse(validMetadata);
  assert(result.success);
});

test('integrationMetadataSchema: validates with description', () => {
  const validMetadata = {
    provider: 'supabase',
    type: 'auth',
    version: '1.0.0',
    description: 'Supabase auth integration',
  };

  const result = integrationMetadataSchema.safeParse(validMetadata);
  assert(result.success);
});

test('integrationMetadataSchema: validates with envVars', () => {
  const validMetadata = {
    provider: 'supabase',
    type: 'auth',
    version: '1.0.0',
    envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
  };

  const result = integrationMetadataSchema.safeParse(validMetadata);
  assert(result.success);
});

test('integrationMetadataSchema: rejects invalid type', () => {
  const invalidMetadata = {
    provider: 'supabase',
    type: 'invalid-type',
    version: '1.0.0',
  };

  const result = integrationMetadataSchema.safeParse(invalidMetadata);
  assert(!result.success);
});

test('integrationMetadataSchema: rejects invalid version format', () => {
  const invalidMetadata = {
    provider: 'supabase',
    type: 'auth',
    version: '1.0', // Missing patch version
  };

  const result = integrationMetadataSchema.safeParse(invalidMetadata);
  assert(!result.success);
});

test('templateIntegrationSchema: validates empty schema', () => {
  const emptySchema = {};
  const result = templateIntegrationSchema.safeParse(emptySchema);
  assert(result.success);
});

test('templateIntegrationSchema: validates with supported integrations', () => {
  const schema = {
    supportedIntegrations: {
      auth: ['supabase', 'clerk'],
      payments: ['stripe'],
    },
  };

  const result = templateIntegrationSchema.safeParse(schema);
  assert(result.success);
});

test('templateIntegrationSchema: validates with default integrations', () => {
  const schema = {
    defaultIntegrations: {
      auth: 'supabase',
      payments: 'stripe',
    },
  };

  const result = templateIntegrationSchema.safeParse(schema);
  assert(result.success);
});

test('integrationFlagsSchema: validates empty flags', () => {
  const emptyFlags = {};
  const result = integrationFlagsSchema.safeParse(emptyFlags);
  assert(result.success);
});

test('integrationFlagsSchema: validates with auth flag', () => {
  const flags = { auth: 'supabase' };
  const result = integrationFlagsSchema.safeParse(flags);
  assert(result.success);
});

test('integrationFlagsSchema: validates with multiple flags', () => {
  const flags = {
    auth: 'supabase',
    payments: 'stripe',
    db: 'postgres',
  };

  const result = integrationFlagsSchema.safeParse(flags);
  assert(result.success);
});

test('manifestIntegrationsSchema: validates empty manifest', () => {
  const emptyManifest = {};
  const result = manifestIntegrationsSchema.safeParse(emptyManifest);
  assert(result.success);
});

test('manifestIntegrationsSchema: validates with applied integrations', () => {
  const manifest = {
    appliedIntegrations: [
      {
        type: 'auth',
        provider: 'supabase',
        version: '1.0.0',
        appliedAt: '2024-01-01T00:00:00Z',
      },
    ],
  };

  const result = manifestIntegrationsSchema.safeParse(manifest);
  assert(result.success);
});

test('manifestIntegrationsSchema: rejects invalid integration type', () => {
  const manifest = {
    appliedIntegrations: [
      {
        type: 'invalid',
        provider: 'supabase',
        version: '1.0.0',
        appliedAt: '2024-01-01T00:00:00Z',
      },
    ],
  };

  const result = manifestIntegrationsSchema.safeParse(manifest);
  assert(!result.success);
});
