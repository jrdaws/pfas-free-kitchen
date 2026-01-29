/**
 * Audit log repository for PFAS-Free Kitchen Platform API
 * STUB: Implement database queries in production
 */

import type { AuditLogRow } from '../types/database.types.js';
import { NotImplementedError } from '../errors/AppError.js';

export interface CreateAuditLogInput {
  actorType: 'system' | 'admin' | 'api' | 'scheduler';
  actorId?: string;
  actorIpHash?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

export interface AuditLogQueryOptions {
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export class AuditRepository {
  /**
   * Create audit log entry
   * TODO: Implement in w6-audit-service
   */
  static async create(input: CreateAuditLogInput): Promise<AuditLogRow> {
    throw new NotImplementedError('AuditRepository.create');
  }

  /**
   * Find audit log entries with filters
   * TODO: Implement in w6-audit-service
   */
  static async findMany(options: AuditLogQueryOptions): Promise<{ entries: AuditLogRow[]; total: number }> {
    throw new NotImplementedError('AuditRepository.findMany');
  }

  /**
   * Find audit log for entity
   * TODO: Implement in w6-audit-service
   */
  static async findByEntity(entityType: string, entityId: string): Promise<AuditLogRow[]> {
    throw new NotImplementedError('AuditRepository.findByEntity');
  }

  /**
   * Find audit log by actor
   * TODO: Implement in w6-audit-service
   */
  static async findByActor(actorId: string, limit?: number): Promise<AuditLogRow[]> {
    throw new NotImplementedError('AuditRepository.findByActor');
  }
}
