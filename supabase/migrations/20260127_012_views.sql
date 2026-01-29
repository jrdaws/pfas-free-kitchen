-- Migration: 012_views.sql
-- Purpose: Database views for common queries

-- ============================================================
-- PUBLISHED PRODUCTS VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_published_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.primary_image_url,
  p.material_summary,
  p.coating_summary,
  p.features,
  p.published_at,
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug,
  c.id AS category_id,
  c.name AS category_name,
  c.path_slugs AS category_path,
  vs.tier,
  vs.claim_type,
  vs.scope_text,
  vs.confidence_score,
  vs.unknowns,
  vs.decision_date,
  COALESCE(array_length(vs.evidence_ids, 1), 0) AS evidence_count
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN verification_status vs ON p.id = vs.product_id
WHERE p.status = 'published';

-- ============================================================
-- REVIEW QUEUE VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_review_queue AS
SELECT 
  p.id,
  p.name,
  p.slug,
  b.name AS brand_name,
  c.name AS category_name,
  p.status,
  p.pfas_risk_flagged,
  p.requires_elevated_review,
  vs.tier,
  vs.review_lane,
  vs.review_started_at,
  p.created_at,
  p.updated_at
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN verification_status vs ON p.id = vs.product_id
WHERE p.status IN ('pending_review', 'under_review')
ORDER BY 
  p.requires_elevated_review DESC,
  p.pfas_risk_flagged DESC,
  p.created_at ASC;

-- ============================================================
-- PRODUCTS WITH COMPONENTS VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_product_components AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  p.slug AS product_slug,
  pc.id AS component_id,
  pc.name AS component_name,
  pc.food_contact,
  m.name AS material_name,
  m.slug AS material_slug,
  m.family AS material_family,
  co.name AS coating_name,
  co.slug AS coating_slug,
  co.is_fluoropolymer,
  pc.pfas_risk_flag
FROM products p
JOIN product_components pc ON p.id = pc.product_id
LEFT JOIN materials m ON pc.material_id = m.id
LEFT JOIN coatings co ON pc.coating_id = co.id
ORDER BY p.id, pc.sort_order;

-- ============================================================
-- EVIDENCE SUMMARY VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_product_evidence_summary AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  COUNT(DISTINCT pe.evidence_id) AS total_evidence_count,
  COUNT(DISTINCT CASE WHEN eo.type = 'lab_report' THEN pe.evidence_id END) AS lab_report_count,
  COUNT(DISTINCT CASE WHEN eo.type = 'brand_statement' THEN pe.evidence_id END) AS brand_statement_count,
  MIN(eo.received_at) AS oldest_evidence,
  MAX(eo.received_at) AS newest_evidence,
  MIN(eo.expires_at) FILTER (WHERE eo.expires_at IS NOT NULL) AS earliest_expiry
FROM products p
LEFT JOIN product_evidence pe ON p.id = pe.product_id
LEFT JOIN evidence_objects eo ON pe.evidence_id = eo.id AND eo.deleted_at IS NULL
GROUP BY p.id, p.name;

-- ============================================================
-- REPORTS DASHBOARD VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_reports_dashboard AS
SELECT 
  ur.id AS report_id,
  ur.issue_type,
  ur.status,
  ur.priority,
  ur.sla_deadline,
  ur.created_at AS reported_at,
  p.id AS product_id,
  p.name AS product_name,
  p.slug AS product_slug,
  b.name AS brand_name,
  vs.tier AS current_tier,
  CASE 
    WHEN ur.sla_deadline < NOW() AND ur.status = 'submitted' THEN TRUE
    ELSE FALSE
  END AS sla_breached
FROM user_reports ur
JOIN products p ON ur.product_id = p.id
JOIN brands b ON p.brand_id = b.id
LEFT JOIN verification_status vs ON p.id = vs.product_id
ORDER BY 
  CASE ur.priority 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'normal' THEN 3 
    WHEN 'low' THEN 4 
  END,
  ur.sla_deadline ASC NULLS LAST;
