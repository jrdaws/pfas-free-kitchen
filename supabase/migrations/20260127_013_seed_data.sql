-- Migration: 013_seed_data.sql
-- Purpose: Seed data for categories, materials, and coatings

-- ============================================================
-- SEED DATA: Core materials
-- ============================================================

INSERT INTO materials (id, name, slug, family, pfas_risk_default, notes) VALUES
  (uuid_generate_v4(), 'Stainless Steel', 'stainless-steel', 'Metal', FALSE, '18/10 or 18/8 typically'),
  (uuid_generate_v4(), 'Cast Iron', 'cast-iron', 'Metal', FALSE, 'Bare or enameled'),
  (uuid_generate_v4(), 'Carbon Steel', 'carbon-steel', 'Metal', FALSE, 'Requires seasoning'),
  (uuid_generate_v4(), 'Aluminum', 'aluminum', 'Metal', FALSE, 'Often anodized or coated'),
  (uuid_generate_v4(), 'Copper', 'copper', 'Metal', FALSE, 'Usually lined'),
  (uuid_generate_v4(), 'Borosilicate Glass', 'borosilicate-glass', 'Glass', FALSE, 'Pyrex-type'),
  (uuid_generate_v4(), 'Tempered Glass', 'tempered-glass', 'Glass', FALSE, 'For lids'),
  (uuid_generate_v4(), 'Ceramic', 'ceramic', 'Ceramic', FALSE, 'Stoneware/porcelain'),
  (uuid_generate_v4(), 'Silicone', 'silicone', 'Polymer', FALSE, 'Food-grade silicone'),
  (uuid_generate_v4(), 'Wood', 'wood', 'Natural', FALSE, 'Handles, utensils'),
  (uuid_generate_v4(), 'Bamboo', 'bamboo', 'Natural', FALSE, 'Handles, utensils')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Coatings
-- ============================================================

INSERT INTO coatings (id, name, slug, type, is_fluoropolymer, pfas_risk_default, marketing_terms, notes) VALUES
  (uuid_generate_v4(), 'None (Uncoated)', 'none', 'none', FALSE, FALSE, ARRAY['uncoated', 'bare'], 'No coating applied'),
  (uuid_generate_v4(), 'PTFE (Teflon)', 'ptfe', 'fluoropolymer', TRUE, TRUE, ARRAY['Teflon', 'PTFE', 'nonstick'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'FEP', 'fep', 'fluoropolymer', TRUE, TRUE, ARRAY['FEP'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'PFA', 'pfa', 'fluoropolymer', TRUE, TRUE, ARRAY['PFA'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'Ceramic Sol-Gel', 'ceramic-sol-gel', 'ceramic_sol_gel', FALSE, FALSE, ARRAY['ceramic nonstick', 'ceramic coating'], 'Requires verification - chemistry varies'),
  (uuid_generate_v4(), 'Enamel', 'enamel', 'enamel', FALSE, FALSE, ARRAY['enamel', 'porcelain enamel', 'vitreous enamel'], 'Glass-based coating'),
  (uuid_generate_v4(), 'Seasoning', 'seasoning', 'seasoning', FALSE, FALSE, ARRAY['pre-seasoned', 'seasoned'], 'Polymerized oil layer'),
  (uuid_generate_v4(), 'Anodized', 'anodized', 'anodized', FALSE, FALSE, ARRAY['hard-anodized', 'anodized'], 'Electrochemical oxidation'),
  (uuid_generate_v4(), 'Unknown', 'unknown', 'unknown', FALSE, TRUE, ARRAY[]::VARCHAR[], 'Coating type not determined')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Top-level Categories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cookware', 'cookware', NULL, ARRAY['cookware'], 1),
  ('22222222-2222-2222-2222-222222222222', 'Bakeware', 'bakeware', NULL, ARRAY['bakeware'], 2),
  ('33333333-3333-3333-3333-333333333333', 'Storage', 'storage', NULL, ARRAY['storage'], 3),
  ('44444444-4444-4444-4444-444444444444', 'Utensils & Tools', 'utensils-tools', NULL, ARRAY['utensils-tools'], 4),
  ('55555555-5555-5555-5555-555555555555', 'Appliance Accessories', 'appliance-accessories', NULL, ARRAY['appliance-accessories'], 5)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Cookware subcategories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Skillets & Frying Pans', 'skillets-frying-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'skillets-frying-pans'], 1),
  (uuid_generate_v4(), 'Saucepans', 'saucepans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'saucepans'], 2),
  (uuid_generate_v4(), 'Stock Pots & Dutch Ovens', 'stock-pots-dutch-ovens', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'stock-pots-dutch-ovens'], 3),
  (uuid_generate_v4(), 'Sauté Pans', 'saute-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'saute-pans'], 4),
  (uuid_generate_v4(), 'Woks', 'woks', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'woks'], 5),
  (uuid_generate_v4(), 'Griddles & Grill Pans', 'griddles-grill-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'griddles-grill-pans'], 6)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Bakeware subcategories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Sheet Pans & Baking Sheets', 'sheet-pans-baking-sheets', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'sheet-pans-baking-sheets'], 1),
  (uuid_generate_v4(), 'Cake Pans', 'cake-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'cake-pans'], 2),
  (uuid_generate_v4(), 'Muffin & Cupcake Pans', 'muffin-cupcake-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'muffin-cupcake-pans'], 3),
  (uuid_generate_v4(), 'Loaf Pans', 'loaf-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'loaf-pans'], 4),
  (uuid_generate_v4(), 'Baking Dishes', 'baking-dishes', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'baking-dishes'], 5)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Storage subcategories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Glass Containers', 'glass-containers', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'glass-containers'], 1),
  (uuid_generate_v4(), 'Stainless Containers', 'stainless-containers', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'stainless-containers'], 2),
  (uuid_generate_v4(), 'Silicone Bags & Wraps', 'silicone-bags-wraps', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'silicone-bags-wraps'], 3),
  (uuid_generate_v4(), 'Lunch Boxes', 'lunch-boxes', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'lunch-boxes'], 4)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Utensils subcategories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Spatulas & Turners', 'spatulas-turners', '44444444-4444-4444-4444-444444444444', ARRAY['utensils-tools', 'spatulas-turners'], 1),
  (uuid_generate_v4(), 'Spoons & Ladles', 'spoons-ladles', '44444444-4444-4444-4444-444444444444', ARRAY['utensils-tools', 'spoons-ladles'], 2),
  (uuid_generate_v4(), 'Tongs', 'tongs', '44444444-4444-4444-4444-444444444444', ARRAY['utensils-tools', 'tongs'], 3),
  (uuid_generate_v4(), 'Whisks', 'whisks', '44444444-4444-4444-4444-444444444444', ARRAY['utensils-tools', 'whisks'], 4),
  (uuid_generate_v4(), 'Cutting Boards', 'cutting-boards', '44444444-4444-4444-4444-444444444444', ARRAY['utensils-tools', 'cutting-boards'], 5)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Appliance Accessories subcategories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Air Fryer Accessories', 'air-fryer-accessories', '55555555-5555-5555-5555-555555555555', ARRAY['appliance-accessories', 'air-fryer-accessories'], 1),
  (uuid_generate_v4(), 'Instant Pot Accessories', 'instant-pot-accessories', '55555555-5555-5555-5555-555555555555', ARRAY['appliance-accessories', 'instant-pot-accessories'], 2),
  (uuid_generate_v4(), 'Blender Accessories', 'blender-accessories', '55555555-5555-5555-5555-555555555555', ARRAY['appliance-accessories', 'blender-accessories'], 3)
ON CONFLICT (parent_id, slug) DO NOTHING;
