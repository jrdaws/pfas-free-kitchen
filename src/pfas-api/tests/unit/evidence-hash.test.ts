/**
 * Unit Tests: Evidence Hashing
 * Tests for SHA-256 hashing and integrity verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'crypto';

// ============================================================
// HASH UTILITIES
// ============================================================

function sha256(input: Buffer | string): string {
  return createHash('sha256').update(input).digest('hex');
}

function sha256Stream(chunks: Buffer[]): string {
  const hash = createHash('sha256');
  for (const chunk of chunks) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

// ============================================================
// MOCK EVIDENCE SERVICE
// ============================================================

interface EvidenceMetadata {
  type: 'brand_statement' | 'lab_report' | 'policy_document';
  productId: string;
  labName?: string;
}

interface UploadedEvidence {
  evidenceId: string;
  sha256Hash: string;
  artifactUrl: string;
  status: string;
}

interface StoredEvidence {
  id: string;
  sha256Hash: string;
  artifactBuffer: Buffer;
}

// In-memory storage for tests
const evidenceStore: Map<string, StoredEvidence> = new Map();
let evidenceIdCounter = 1;

class MockEvidenceService {
  static async upload(params: {
    file: Buffer;
    type: string;
    productId: string;
  }): Promise<UploadedEvidence> {
    const hash = sha256(params.file);
    const id = `ev_${evidenceIdCounter++}`;
    
    // Store with hash for integrity verification
    evidenceStore.set(id, {
      id,
      sha256Hash: hash,
      artifactBuffer: params.file,
    });
    
    return {
      evidenceId: id,
      sha256Hash: hash,
      artifactUrl: `https://storage.example.com/${id}`,
      status: 'uploaded',
    };
  }
  
  static async getArtifact(evidenceId: string): Promise<Buffer> {
    const stored = evidenceStore.get(evidenceId);
    if (!stored) {
      throw new Error('Evidence not found');
    }
    
    // Verify integrity
    const currentHash = sha256(stored.artifactBuffer);
    if (currentHash !== stored.sha256Hash) {
      throw new Error('Evidence integrity check failed');
    }
    
    return stored.artifactBuffer;
  }
  
  static async verifyIntegrity(evidenceId: string): Promise<boolean> {
    const stored = evidenceStore.get(evidenceId);
    if (!stored) {
      return false;
    }
    
    const currentHash = sha256(stored.artifactBuffer);
    return currentHash === stored.sha256Hash;
  }
  
  // For testing - allows modifying stored hash
  static _setStoredHash(evidenceId: string, newHash: string): void {
    const stored = evidenceStore.get(evidenceId);
    if (stored) {
      stored.sha256Hash = newHash;
    }
  }
  
  // For testing - allows modifying stored content
  static _tamperwithContent(evidenceId: string, newContent: Buffer): void {
    const stored = evidenceStore.get(evidenceId);
    if (stored) {
      stored.artifactBuffer = newContent;
    }
  }
}

// ============================================================
// TEST DATA
// ============================================================

const testPdfContent = 'PDF content for testing - this simulates a real PDF file';
const testPdfBuffer = Buffer.from(testPdfContent);

const testMetadata: EvidenceMetadata = {
  type: 'brand_statement',
  productId: 'prod_test_001',
};

// ============================================================
// TESTS
// ============================================================

describe('Evidence Hashing', () => {
  beforeEach(() => {
    // Clear store between tests
    evidenceStore.clear();
    evidenceIdCounter = 1;
  });

  describe('SHA-256 Hash Generation', () => {
    it('should calculate consistent SHA-256 hash', () => {
      const buffer = Buffer.from('test content');
      const hash1 = sha256(buffer);
      const hash2 = sha256(buffer);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should produce different hashes for different content', () => {
      const buffer1 = Buffer.from('content 1');
      const buffer2 = Buffer.from('content 2');
      
      const hash1 = sha256(buffer1);
      const hash2 = sha256(buffer2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce valid hex string', () => {
      const hash = sha256(Buffer.from('test'));
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle empty buffer', () => {
      const hash = sha256(Buffer.from(''));
      
      // SHA-256 of empty string is a known value
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should handle large buffers', () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a'); // 10MB
      const hash = sha256(largeBuffer);
      
      expect(hash).toHaveLength(64);
    });

    it('should handle binary content', () => {
      const binaryBuffer = Buffer.from([0x00, 0x01, 0xFF, 0xFE, 0x89, 0x50, 0x4E, 0x47]);
      const hash = sha256(binaryBuffer);
      
      expect(hash).toHaveLength(64);
    });
  });

  describe('Stream Hashing', () => {
    it('should produce same hash for chunked and non-chunked data', () => {
      const fullBuffer = Buffer.from('this is a test message for streaming');
      const chunks = [
        Buffer.from('this is '),
        Buffer.from('a test '),
        Buffer.from('message '),
        Buffer.from('for streaming'),
      ];
      
      const fullHash = sha256(fullBuffer);
      const streamHash = sha256Stream(chunks);
      
      expect(streamHash).toBe(fullHash);
    });
  });

  describe('Evidence Upload and Integrity', () => {
    it('should store hash on upload', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      expect(evidence.sha256Hash).toBeDefined();
      expect(evidence.sha256Hash).toHaveLength(64);
    });

    it('should verify integrity on retrieval', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      // Should not throw
      const retrieved = await MockEvidenceService.getArtifact(evidence.evidenceId);
      expect(retrieved).toEqual(testPdfBuffer);
    });

    it('should detect tampered evidence when hash modified', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      // Simulate tampering by changing stored hash
      MockEvidenceService._setStoredHash(evidence.evidenceId, 'tamperedhash');
      
      // Should throw on retrieval
      await expect(MockEvidenceService.getArtifact(evidence.evidenceId))
        .rejects.toThrow('integrity check failed');
    });

    it('should detect tampered evidence when content modified', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      // Simulate tampering by changing stored content
      MockEvidenceService._tamperwithContent(evidence.evidenceId, Buffer.from('tampered'));
      
      // Should throw on retrieval
      await expect(MockEvidenceService.getArtifact(evidence.evidenceId))
        .rejects.toThrow('integrity check failed');
    });

    it('should return consistent hash for same file', async () => {
      const evidence1 = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      const evidence2 = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_002',
      });
      
      expect(evidence1.sha256Hash).toBe(evidence2.sha256Hash);
    });

    it('should return different hashes for different files', async () => {
      const evidence1 = await MockEvidenceService.upload({
        file: Buffer.from('file 1 content'),
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      const evidence2 = await MockEvidenceService.upload({
        file: Buffer.from('file 2 content'),
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      expect(evidence1.sha256Hash).not.toBe(evidence2.sha256Hash);
    });
  });

  describe('Integrity Verification', () => {
    it('should pass verification for untampered evidence', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      const isValid = await MockEvidenceService.verifyIntegrity(evidence.evidenceId);
      expect(isValid).toBe(true);
    });

    it('should fail verification for tampered evidence', async () => {
      const evidence = await MockEvidenceService.upload({
        file: testPdfBuffer,
        type: 'brand_statement',
        productId: 'prod_test_001',
      });
      
      MockEvidenceService._tamperwithContent(evidence.evidenceId, Buffer.from('tampered'));
      
      const isValid = await MockEvidenceService.verifyIntegrity(evidence.evidenceId);
      expect(isValid).toBe(false);
    });

    it('should fail verification for non-existent evidence', async () => {
      const isValid = await MockEvidenceService.verifyIntegrity('ev_nonexistent');
      expect(isValid).toBe(false);
    });
  });

  describe('Known Hash Values', () => {
    it('should match known SHA-256 for test strings', () => {
      // Known test vectors
      const testCases = [
        {
          input: '',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        },
        {
          input: 'hello',
          hash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
        },
        {
          input: 'hello world',
          hash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
        },
      ];
      
      for (const { input, hash } of testCases) {
        expect(sha256(Buffer.from(input))).toBe(hash);
      }
    });
  });
});
