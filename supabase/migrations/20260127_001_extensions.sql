-- Migration: 001_extensions.sql
-- Purpose: Enable required PostgreSQL extensions for PFAS-Free Kitchen Platform
-- PostgreSQL 15+

-- uuid-ossp: UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto: Cryptographic functions (for hashing, etc.)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
