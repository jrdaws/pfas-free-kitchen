/**
 * PFAS-Free Kitchen Platform - Evidence Metadata Schemas
 * 
 * Zod validation schemas for evidence type-specific metadata.
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "2.3 Evidence Service"
 */

import { z } from 'zod';

/**
 * Evidence types supported by the platform.
 */
export const EvidenceType = z.enum([
  'lab_report',
  'brand_statement',
  'policy_document',
  'screenshot',
  'correspondence',
]);
export type EvidenceType = z.infer<typeof EvidenceType>;

/**
 * Evidence source types.
 */
export const EvidenceSource = z.enum([
  'brand_submission',
  'retailer',
  'user_report',
  'internal',
]);
export type EvidenceSource = z.infer<typeof EvidenceSource>;

/**
 * Lab report metadata schema.
 * Contains testing methodology, detection limits, and sample scope.
 */
export const labReportMetadataSchema = z.object({
  // Lab identification
  lab_name: z.string().min(1, 'Lab name is required'),
  accreditation: z.string().optional(),
  
  // Testing methodology
  method: z.string().min(1, 'Method description is required'),
  method_reference: z.string().optional(), // e.g., "EPA 533"
  
  // Analyte information
  analyte_list_ref: z.string().optional(), // Reference to panel definition
  analyte_count: z.number().int().positive().optional(),
  
  // Detection limits (critical for interpretation)
  lod_ng_g: z.number().positive('LOD must be positive'), // Limit of Detection
  loq_ng_g: z.number().positive('LOQ must be positive'), // Limit of Quantification
  
  // Sample scope
  sample_scope: z.object({
    units: z.number().int().positive('At least 1 unit must be tested'),
    lots: z.number().int().positive('At least 1 lot must be tested'),
    component_ids: z.array(z.string()).min(1, 'At least one component must be specified'),
  }),
  
  // Dates
  collection_date: z.string().datetime({ message: 'Invalid collection date format' }),
  report_date: z.string().datetime({ message: 'Invalid report date format' }),
  
  // Results
  result_summary: z.string().min(1, 'Result summary is required'),
});
export type LabReportMetadata = z.infer<typeof labReportMetadataSchema>;

/**
 * Brand statement metadata schema.
 * Contains the official statement text and signatory.
 */
export const brandStatementMetadataSchema = z.object({
  statement_text: z.string().min(10, 'Statement must be at least 10 characters'),
  statement_date: z.string().datetime({ message: 'Invalid statement date format' }),
  signatory: z.string().optional(), // e.g., "VP of Quality"
});
export type BrandStatementMetadata = z.infer<typeof brandStatementMetadataSchema>;

/**
 * Policy document metadata schema.
 * For detailed PFAS policies and technical specifications.
 */
export const policyDocumentMetadataSchema = z.object({
  document_title: z.string().min(1, 'Document title is required'),
  document_date: z.string().datetime({ message: 'Invalid document date format' }),
  document_version: z.string().optional(),
  summary: z.string().optional(),
  covers_all_products: z.boolean().default(false),
  covered_product_lines: z.array(z.string()).optional(),
});
export type PolicyDocumentMetadata = z.infer<typeof policyDocumentMetadataSchema>;

/**
 * Screenshot metadata schema.
 * For captured webpage evidence.
 */
export const screenshotMetadataSchema = z.object({
  source_url: z.string().url('Invalid URL format'),
  captured_at: z.string().datetime({ message: 'Invalid capture date format' }),
  description: z.string().min(1, 'Description is required'),
  page_title: z.string().optional(),
  captured_by: z.string().optional(), // Admin user who captured
});
export type ScreenshotMetadata = z.infer<typeof screenshotMetadataSchema>;

/**
 * Correspondence metadata schema.
 * For email exchanges and official communications.
 */
export const correspondenceMetadataSchema = z.object({
  correspondence_type: z.enum(['email', 'letter', 'form_response', 'other']),
  correspondent_name: z.string().optional(),
  correspondent_title: z.string().optional(),
  correspondent_company: z.string().optional(),
  correspondence_date: z.string().datetime({ message: 'Invalid correspondence date format' }),
  subject: z.string().min(1, 'Subject is required'),
  summary: z.string().optional(),
});
export type CorrespondenceMetadata = z.infer<typeof correspondenceMetadataSchema>;

/**
 * Union type for all metadata schemas.
 */
export type EvidenceMetadata =
  | LabReportMetadata
  | BrandStatementMetadata
  | PolicyDocumentMetadata
  | ScreenshotMetadata
  | CorrespondenceMetadata;

/**
 * Get the appropriate schema for a given evidence type.
 */
export function getMetadataSchema(type: EvidenceType): z.ZodSchema {
  switch (type) {
    case 'lab_report':
      return labReportMetadataSchema;
    case 'brand_statement':
      return brandStatementMetadataSchema;
    case 'policy_document':
      return policyDocumentMetadataSchema;
    case 'screenshot':
      return screenshotMetadataSchema;
    case 'correspondence':
      return correspondenceMetadataSchema;
    default:
      throw new Error(`Unknown evidence type: ${type}`);
  }
}

/**
 * Validate metadata for a given evidence type.
 * 
 * @param type - Evidence type
 * @param metadata - Metadata to validate
 * @returns Validated metadata or throws validation error
 */
export function validateMetadata<T extends EvidenceType>(
  type: T,
  metadata: unknown
): EvidenceMetadata {
  const schema = getMetadataSchema(type);
  return schema.parse(metadata);
}

/**
 * Safe validation that returns result object instead of throwing.
 */
export function safeValidateMetadata<T extends EvidenceType>(
  type: T,
  metadata: unknown
): { success: true; data: EvidenceMetadata } | { success: false; error: z.ZodError } {
  const schema = getMetadataSchema(type);
  const result = schema.safeParse(metadata);
  
  if (result.success) {
    return { success: true, data: result.data as EvidenceMetadata };
  }
  
  return { success: false, error: result.error };
}

/**
 * Evidence expiry periods by type (in months).
 */
export const EVIDENCE_EXPIRY_MONTHS: Record<EvidenceType, number> = {
  lab_report: 24,
  brand_statement: 12,
  policy_document: 12,
  screenshot: 6,
  correspondence: 12,
};

/**
 * Calculate expiry date for evidence.
 * 
 * @param type - Evidence type
 * @param fromDate - Date to calculate from (defaults to now)
 * @returns Expiry date
 */
export function calculateExpiryDate(type: EvidenceType, fromDate?: Date): Date {
  const months = EVIDENCE_EXPIRY_MONTHS[type];
  const date = fromDate ? new Date(fromDate) : new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Allowed MIME types for evidence uploads.
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const;
export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * Check if MIME type is allowed.
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Maximum file size in bytes (10MB).
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validate file constraints.
 */
export function validateFileConstraints(
  size: number,
  mimeType: string
): { valid: true } | { valid: false; error: string } {
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 10MB`,
    };
  }
  
  if (!isAllowedMimeType(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: PDF, PNG, JPEG`,
    };
  }
  
  return { valid: true };
}
