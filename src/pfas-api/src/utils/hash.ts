/**
 * Hash utilities for PFAS-Free Kitchen Platform API
 */

import { createHash } from 'crypto';

/**
 * Generate SHA-256 hash of data
 */
export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate hash for user agent anonymization
 */
export function hashUserAgent(userAgent: string): string {
  return sha256(userAgent).substring(0, 16);
}

/**
 * Generate hash for IP address anonymization
 */
export function hashIp(ip: string): string {
  return sha256(ip).substring(0, 16);
}

/**
 * Verify SHA-256 hash matches data
 */
export function verifySha256(data: string | Buffer, expectedHash: string): boolean {
  return sha256(data) === expectedHash;
}
