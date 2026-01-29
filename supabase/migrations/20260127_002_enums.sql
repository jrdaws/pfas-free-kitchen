-- Migration: 002_enums.sql
-- Purpose: Define all enum types for PFAS-Free Kitchen Platform

-- Verification tier (0-4 trust levels)
DO $$ BEGIN
  CREATE TYPE verification_tier AS ENUM ('0', '1', '2', '3', '4');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Claim type (A, B, C classification)
DO $$ BEGIN
  CREATE TYPE claim_type AS ENUM ('A', 'B', 'C');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Evidence type
DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM (
    'lab_report', 
    'brand_statement', 
    'policy_document', 
    'screenshot', 
    'correspondence'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Evidence source
DO $$ BEGIN
  CREATE TYPE evidence_source AS ENUM (
    'brand_submission', 
    'retailer', 
    'user_report', 
    'internal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Product status
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM (
    'draft', 
    'pending_review', 
    'under_review', 
    'published', 
    'suspended', 
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Report status
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'submitted', 
    'under_review', 
    'resolved', 
    'dismissed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Report priority
DO $$ BEGIN
  CREATE TYPE report_priority AS ENUM ('low', 'normal', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Report issue type
DO $$ BEGIN
  CREATE TYPE report_issue_type AS ENUM (
    'suspected_pfas',
    'materials_changed',
    'listing_mismatch',
    'counterfeit_risk',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
