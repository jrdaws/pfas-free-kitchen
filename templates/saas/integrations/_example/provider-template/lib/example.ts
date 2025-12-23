/**
 * Example Integration - Core Library
 * 
 * This file demonstrates the pattern for integration library files.
 * Copy and modify for new integrations.
 */

// ============================================================
// STEP 1: Environment Variable Validation
// ============================================================

const REQUIRED_ENV_VARS = [
  'EXAMPLE_API_KEY',
  'EXAMPLE_SECRET',
];

const missingEnvVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  throw new Error(`
Example Provider configuration missing

Required environment variables:
  ${missingEnvVars.join('\n  ')}

Get these from: https://example.com/dashboard
Add to: .env.local
  `);
}

// ============================================================
// STEP 2: Initialize SDK/Client
// ============================================================

// import ExampleSDK from 'example-sdk';
// export const client = new ExampleSDK(process.env.EXAMPLE_API_KEY!);

// For this example, we'll create a mock client
class MockClient {
  constructor(private apiKey: string) {}

  async upload(file: Buffer, options?: { folder?: string }) {
    // Simulated upload
    return {
      url: `https://example.com/files/${Date.now()}`,
      id: `file_${Date.now()}`,
    };
  }

  async delete(fileId: string) {
    return { success: true };
  }
}

export const client = new MockClient(process.env.EXAMPLE_API_KEY!);

// ============================================================
// STEP 3: Export Type-Safe Helper Functions
// ============================================================

/**
 * Upload a file to Example Provider
 */
export async function uploadFile(
  file: Buffer,
  options?: {
    folder?: string;
    filename?: string;
  }
): Promise<{ url: string; id: string }> {
  try {
    const result = await client.upload(file, options);
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload file: ${message}`);
  }
}

/**
 * Delete a file from Example Provider
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    await client.delete(fileId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete file: ${message}`);
  }
}

/**
 * Get a signed URL for temporary access
 */
export async function getSignedUrl(
  fileId: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  // Implementation would call provider API
  return `https://example.com/files/${fileId}?token=xxx&expires=${Date.now() + expiresInSeconds * 1000}`;
}

// ============================================================
// STEP 4: Export Types
// ============================================================

export interface UploadResult {
  url: string;
  id: string;
}

export interface FileMetadata {
  id: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}

