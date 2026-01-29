/**
 * PFAS-Free Kitchen Platform - Storage Adapter (S3)
 * 
 * Immutable (WORM) storage for evidence artifacts using AWS S3 Object Lock.
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "2.3 Evidence Service"
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
  type GetObjectCommandOutput,
  type HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

// Environment configuration
const S3_BUCKET = process.env.S3_BUCKET || 'pfas-evidence-bucket';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_OBJECT_LOCK_MODE = (process.env.S3_OBJECT_LOCK_MODE || 'GOVERNANCE') as 'GOVERNANCE' | 'COMPLIANCE';
const S3_RETENTION_DAYS = parseInt(process.env.S3_RETENTION_DAYS || '2555', 10); // ~7 years default

/**
 * Response from S3 head object operation.
 */
export interface S3HeadResponse {
  contentType: string;
  contentLength: number;
  etag: string;
  lastModified: Date;
  metadata: Record<string, string>;
  objectLockMode?: string;
  objectLockRetainUntilDate?: Date;
}

/**
 * Upload result with URI and ETag.
 */
export interface UploadResult {
  uri: string;
  etag: string;
}

// Lazy-initialized S3 client
let s3Client: S3Client | null = null;

/**
 * Get or create S3 client instance.
 */
function getClient(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: S3_REGION,
      credentials: S3_ACCESS_KEY && S3_SECRET_KEY ? {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      } : undefined, // Use default credential chain if not provided
    });
  }
  return s3Client;
}

/**
 * Calculate retention date based on configured retention period.
 */
function calculateRetentionDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + S3_RETENTION_DAYS);
  return date;
}

/**
 * Parse S3 URI to extract bucket and key.
 */
function parseS3Uri(uri: string): { bucket: string; key: string } {
  // Format: s3://bucket-name/path/to/file
  const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid S3 URI format: ${uri}`);
  }
  return { bucket: match[1], key: match[2] };
}

/**
 * Storage adapter for S3 with WORM (Write Once Read Many) configuration.
 */
export class StorageAdapter {
  /**
   * Upload file to S3 with WORM configuration.
   * Object Lock prevents modification or deletion until retention period expires.
   * 
   * @param params - Upload parameters
   * @returns Upload result with S3 URI and ETag
   */
  static async upload(params: {
    key: string;
    body: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<UploadResult> {
    const client = getClient();
    
    const input: PutObjectCommandInput = {
      Bucket: S3_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      Metadata: params.metadata,
      // WORM configuration
      ObjectLockMode: S3_OBJECT_LOCK_MODE,
      ObjectLockRetainUntilDate: calculateRetentionDate(),
      // Prevent overwrites
      ContentMD5: undefined, // Could add for extra verification
    };
    
    const command = new PutObjectCommand(input);
    const response = await client.send(command);
    
    if (!response.ETag) {
      throw new Error('S3 upload did not return ETag');
    }
    
    return {
      uri: `s3://${S3_BUCKET}/${params.key}`,
      etag: response.ETag.replace(/"/g, ''), // Remove quotes from ETag
    };
  }

  /**
   * Get file as readable stream.
   * 
   * @param uri - S3 URI (s3://bucket/key)
   * @returns Readable stream of file contents
   */
  static async getStream(uri: string): Promise<Readable> {
    const client = getClient();
    const { bucket, key } = parseS3Uri(uri);
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const response: GetObjectCommandOutput = await client.send(command);
    
    if (!response.Body) {
      throw new Error('S3 response did not include body');
    }
    
    // AWS SDK v3 returns a web stream, convert to Node.js stream
    return response.Body as Readable;
  }

  /**
   * Check if object exists in S3.
   * 
   * @param uri - S3 URI
   * @returns true if object exists, false otherwise
   */
  static async exists(uri: string): Promise<boolean> {
    try {
      await this.headObject(uri);
      return true;
    } catch (error) {
      // NotFound error means object doesn't exist
      if ((error as Error).name === 'NotFound' || 
          (error as Error).name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get object metadata without downloading content.
   * 
   * @param uri - S3 URI
   * @returns Object metadata
   */
  static async headObject(uri: string): Promise<S3HeadResponse> {
    const client = getClient();
    const { bucket, key } = parseS3Uri(uri);
    
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const response: HeadObjectCommandOutput = await client.send(command);
    
    return {
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || 0,
      etag: response.ETag?.replace(/"/g, '') || '',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata || {},
      objectLockMode: response.ObjectLockMode,
      objectLockRetainUntilDate: response.ObjectLockRetainUntilDate,
    };
  }

  /**
   * Generate a storage key for evidence artifacts.
   * Format: evidence/{year}/{month}/{evidence_id}/{filename}
   * 
   * @param evidenceId - Unique evidence ID
   * @param filename - Original filename
   * @returns S3 key path
   */
  static generateKey(evidenceId: string, filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Sanitize filename to remove problematic characters
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
    
    return `evidence/${year}/${month}/${evidenceId}/${sanitizedFilename}`;
  }

  /**
   * Get the configured bucket name.
   */
  static getBucket(): string {
    return S3_BUCKET;
  }

  /**
   * Get retention configuration info.
   */
  static getRetentionConfig(): {
    mode: 'GOVERNANCE' | 'COMPLIANCE';
    retentionDays: number;
  } {
    return {
      mode: S3_OBJECT_LOCK_MODE,
      retentionDays: S3_RETENTION_DAYS,
    };
  }
}
