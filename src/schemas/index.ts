/**
 * PFAS-Free Kitchen Platform - Schemas
 */

export {
  EvidenceType,
  EvidenceSource,
  labReportMetadataSchema,
  brandStatementMetadataSchema,
  policyDocumentMetadataSchema,
  screenshotMetadataSchema,
  correspondenceMetadataSchema,
  getMetadataSchema,
  validateMetadata,
  safeValidateMetadata,
  calculateExpiryDate,
  isAllowedMimeType,
  validateFileConstraints,
  EVIDENCE_EXPIRY_MONTHS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type LabReportMetadata,
  type BrandStatementMetadata,
  type PolicyDocumentMetadata,
  type ScreenshotMetadata,
  type CorrespondenceMetadata,
  type EvidenceMetadata,
  type AllowedMimeType,
} from './evidence-metadata.schema';
