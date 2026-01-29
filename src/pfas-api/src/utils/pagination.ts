/**
 * Pagination utilities for PFAS-Free Kitchen Platform API
 */

import type { PaginationMeta } from '../types/api.types.js';

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  totalCount: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Validate page number against total
 */
export function validatePage(page: number, totalPages: number): number {
  if (page < 1) return 1;
  if (totalPages > 0 && page > totalPages) return totalPages;
  return page;
}

/**
 * Create paginated response wrapper
 */
export function paginate<T>(
  data: T[],
  totalCount: number,
  input: PaginationInput
): PaginationResult<T> {
  return {
    data,
    pagination: calculatePagination(input.page, input.limit, totalCount),
  };
}
