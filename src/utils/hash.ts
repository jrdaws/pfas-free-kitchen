/**
 * PFAS-Free Kitchen Platform - Hash Utilities
 * 
 * SHA-256 hash functions for evidence integrity verification.
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "2.3 Evidence Service"
 */

import { createHash } from 'crypto';
import type { Readable } from 'stream';

/**
 * Calculate SHA-256 hash of a buffer.
 * Returns lowercase hex string (64 characters).
 * 
 * @param buffer - The data to hash
 * @returns SHA-256 hash as hex string
 */
export function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculate SHA-256 hash of a readable stream.
 * Useful for hashing large files without loading into memory.
 * 
 * @param stream - Readable stream to hash
 * @returns Promise resolving to SHA-256 hash as hex string
 */
export async function sha256Stream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    
    stream.on('data', (chunk: Buffer) => {
      hash.update(chunk);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Verify buffer against expected hash.
 * Uses timing-safe comparison to prevent timing attacks.
 * 
 * @param buffer - The data to verify
 * @param expectedHash - The expected SHA-256 hash (hex string)
 * @returns true if hash matches, false otherwise
 */
export function verifyHash(buffer: Buffer, expectedHash: string): boolean {
  const computedHash = sha256(buffer);
  
  // Normalize both hashes to lowercase for comparison
  const normalizedExpected = expectedHash.toLowerCase();
  const normalizedComputed = computedHash.toLowerCase();
  
  // Length check first
  if (normalizedExpected.length !== normalizedComputed.length) {
    return false;
  }
  
  // Timing-safe comparison
  const expectedBuffer = Buffer.from(normalizedExpected, 'hex');
  const computedBuffer = Buffer.from(normalizedComputed, 'hex');
  
  return timingSafeEqual(expectedBuffer, computedBuffer);
}

/**
 * Timing-safe buffer comparison to prevent timing attacks.
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

/**
 * Convert a stream to a buffer.
 * Useful when full buffer is needed for both hashing and storage.
 * 
 * @param stream - Readable stream to buffer
 * @param maxSize - Maximum size in bytes (throws if exceeded)
 * @returns Promise resolving to buffer
 */
export async function streamToBuffer(stream: Readable, maxSize?: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalSize = 0;
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      
      if (maxSize && totalSize > maxSize) {
        stream.destroy();
        reject(new Error(`Stream exceeded maximum size of ${maxSize} bytes`));
        return;
      }
      
      chunks.push(chunk);
    });
    
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Calculate hash and return both buffer and hash.
 * Efficient single-pass operation for upload workflows.
 * 
 * @param stream - Readable stream
 * @param maxSize - Maximum size in bytes
 * @returns Promise resolving to buffer and hash
 */
export async function bufferAndHash(
  stream: Readable,
  maxSize?: number
): Promise<{ buffer: Buffer; hash: string }> {
  const chunks: Buffer[] = [];
  const hash = createHash('sha256');
  let totalSize = 0;
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      
      if (maxSize && totalSize > maxSize) {
        stream.destroy();
        reject(new Error(`Stream exceeded maximum size of ${maxSize} bytes`));
        return;
      }
      
      chunks.push(chunk);
      hash.update(chunk);
    });
    
    stream.on('end', () => {
      resolve({
        buffer: Buffer.concat(chunks),
        hash: hash.digest('hex'),
      });
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
}
