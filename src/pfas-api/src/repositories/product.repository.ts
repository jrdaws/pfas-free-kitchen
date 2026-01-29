/**
 * Product repository for PFAS-Free Kitchen Platform API
 * Handles product queries with filtering, faceting, and relations
 */

import { db } from '../config/database.js';
import type { 
  ProductRow, 
  ProductComponentRow, 
  BrandRow, 
  CategoryRow, 
  RetailerRow,
  VerificationStatusRow,
  EvidenceObjectRow,
} from '../types/database.types.js';
import { ComponentRepository, type ComponentWithRelations } from './component.repository.js';

export interface ProductWithRelations extends ProductRow {
  brand: BrandRow;
  category: CategoryRow;
  components: ComponentWithRelations[];
  retailers: RetailerRow[];
  verification?: VerificationStatusRow;
  evidence?: EvidenceObjectRow[];
}

export interface ProductQueryOptions {
  categoryId?: string;
  brandId?: string;
  tiers?: number[];
  materials?: string[];
  coatingTypes?: string[];
  foodContactSurfaces?: string[];
  inductionCompatible?: boolean;
  ovenSafeMinTemp?: number;
  retailerId?: string;
  status?: string[];
  page: number;
  limit: number;
  sort: string;
}

export interface FacetItem {
  value: string | number;
  label: string;
  count: number;
}

export interface FacetCounts {
  tier: FacetItem[];
  material: FacetItem[];
  coating_type: FacetItem[];
  induction_compatible: FacetItem[];
  retailer: FacetItem[];
}

type SortOption = 'tier_desc' | 'tier_asc' | 'name_asc' | 'name_desc' | 'newest';

const SORT_CLAUSES: Record<SortOption, string> = {
  tier_desc: 'COALESCE(vs.tier::integer, 0) DESC, p.name ASC',
  tier_asc: 'COALESCE(vs.tier::integer, 0) ASC, p.name ASC',
  name_asc: 'p.name ASC',
  name_desc: 'p.name DESC',
  newest: 'p.published_at DESC NULLS LAST, p.created_at DESC',
};

const TIER_LABELS: Record<number, string> = {
  0: 'Unknown',
  1: 'Brand Statement',
  2: 'Policy Reviewed',
  3: 'Lab Tested',
  4: 'Monitored',
};

export class ProductRepository {
  /**
   * Find products with filters, pagination, and facets
   */
  static async findMany(options: ProductQueryOptions): Promise<{ products: ProductWithRelations[]; total: number }> {
    const {
      categoryId,
      brandId,
      tiers,
      materials,
      coatingTypes,
      inductionCompatible,
      ovenSafeMinTemp,
      retailerId,
      status = ['published'],
      page,
      limit,
      sort = 'tier_desc',
    } = options;

    // Build WHERE clauses and params
    const whereClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Status filter
    if (status.length > 0) {
      whereClauses.push(`p.status = ANY($${paramIndex})`);
      params.push(status);
      paramIndex++;
    }

    // Category filter
    if (categoryId) {
      whereClauses.push(`p.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    // Brand filter
    if (brandId) {
      whereClauses.push(`p.brand_id = $${paramIndex}`);
      params.push(brandId);
      paramIndex++;
    }

    // Tier filter
    if (tiers && tiers.length > 0) {
      whereClauses.push(`COALESCE(vs.tier::integer, 0) = ANY($${paramIndex})`);
      params.push(tiers);
      paramIndex++;
    }

    // Material filter (check food-contact components)
    if (materials && materials.length > 0) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM product_components pc
          JOIN materials m ON pc.material_id = m.id
          WHERE pc.product_id = p.id 
            AND pc.food_contact = true
            AND m.slug = ANY($${paramIndex})
        )
      `);
      params.push(materials);
      paramIndex++;
    }

    // Coating type filter
    if (coatingTypes && coatingTypes.length > 0) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM product_components pc
          JOIN coatings c ON pc.coating_id = c.id
          WHERE pc.product_id = p.id 
            AND pc.food_contact = true
            AND c.type = ANY($${paramIndex})
        )
      `);
      params.push(coatingTypes);
      paramIndex++;
    }

    // Induction compatible filter
    if (inductionCompatible !== undefined) {
      whereClauses.push(`(p.features->>'induction_compatible')::boolean = $${paramIndex}`);
      params.push(inductionCompatible);
      paramIndex++;
    }

    // Oven safe min temp filter
    if (ovenSafeMinTemp !== undefined) {
      whereClauses.push(`(p.features->>'oven_safe_temp_f')::integer >= $${paramIndex}`);
      params.push(ovenSafeMinTemp);
      paramIndex++;
    }

    // Retailer filter
    if (retailerId) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM product_retailer_links prl
          WHERE prl.product_id = p.id 
            AND prl.retailer_id = $${paramIndex}
            AND prl.active = true
        )
      `);
      params.push(retailerId);
      paramIndex++;
    }

    const whereClause = whereClauses.length > 0 
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    const sortClause = SORT_CLAUSES[sort as SortOption] || SORT_CLAUSES.tier_desc;
    const offset = (page - 1) * limit;

    // Count query
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      ${whereClause}
    `;

    // Main query
    const sql = `
      SELECT DISTINCT ON (${sortClause.split(',')[0]}, p.id)
        p.*,
        b.id AS "b_id",
        b.name AS "b_name",
        b.slug AS "b_slug",
        b.website AS "b_website",
        b.country AS "b_country",
        b.logo_url AS "b_logo_url",
        b.pfas_policy_url AS "b_pfas_policy_url",
        b.pfas_policy_summary AS "b_pfas_policy_summary",
        b.created_at AS "b_created_at",
        b.updated_at AS "b_updated_at",
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.parent_id AS "c_parent_id",
        c.path_slugs AS "c_path_slugs",
        c.description AS "c_description",
        c.sort_order AS "c_sort_order",
        c.active AS "c_active",
        c.created_at AS "c_created_at",
        c.updated_at AS "c_updated_at",
        vs.id AS "vs_id",
        vs.tier AS "vs_tier",
        vs.claim_type AS "vs_claim_type",
        vs.scope_text AS "vs_scope_text",
        vs.scope_component_ids AS "vs_scope_component_ids",
        vs.confidence_score AS "vs_confidence_score",
        vs.unknowns AS "vs_unknowns",
        vs.decision_date AS "vs_decision_date",
        vs.reviewer_id AS "vs_reviewer_id",
        vs.rationale AS "vs_rationale",
        vs.evidence_ids AS "vs_evidence_ids",
        vs.next_review_due AS "vs_next_review_due",
        vs.review_started_at AS "vs_review_started_at",
        vs.review_lane AS "vs_review_lane",
        vs.created_at AS "vs_created_at",
        vs.updated_at AS "vs_updated_at"
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      ${whereClause}
      ORDER BY ${sortClause}, p.id
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const [countResult, rows] = await Promise.all([
      db.queryOne<{ count: string }>(countSql, params.slice(0, -2)),
      db.query<Record<string, unknown>>(sql, params),
    ]);

    const total = countResult ? parseInt(countResult.count, 10) : 0;

    // Map rows and fetch retailers for each product
    const products = await Promise.all(
      rows.map(async (row) => {
        const product = this.mapRowToProductWithRelations(row);
        product.retailers = await this.getRetailersForProduct(product.id);
        product.components = await ComponentRepository.findByProductId(product.id);
        return product;
      })
    );

    return { products, total };
  }

  /**
   * Find product by ID or slug
   */
  static async findById(idOrSlug: string): Promise<ProductWithRelations | null> {
    // Try UUID first, then slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const sql = `
      SELECT 
        p.*,
        b.id AS "b_id",
        b.name AS "b_name",
        b.slug AS "b_slug",
        b.website AS "b_website",
        b.country AS "b_country",
        b.logo_url AS "b_logo_url",
        b.pfas_policy_url AS "b_pfas_policy_url",
        b.pfas_policy_summary AS "b_pfas_policy_summary",
        b.created_at AS "b_created_at",
        b.updated_at AS "b_updated_at",
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.parent_id AS "c_parent_id",
        c.path_slugs AS "c_path_slugs",
        c.description AS "c_description",
        c.sort_order AS "c_sort_order",
        c.active AS "c_active",
        c.created_at AS "c_created_at",
        c.updated_at AS "c_updated_at",
        vs.id AS "vs_id",
        vs.tier AS "vs_tier",
        vs.claim_type AS "vs_claim_type",
        vs.scope_text AS "vs_scope_text",
        vs.scope_component_ids AS "vs_scope_component_ids",
        vs.confidence_score AS "vs_confidence_score",
        vs.unknowns AS "vs_unknowns",
        vs.decision_date AS "vs_decision_date",
        vs.reviewer_id AS "vs_reviewer_id",
        vs.rationale AS "vs_rationale",
        vs.evidence_ids AS "vs_evidence_ids",
        vs.next_review_due AS "vs_next_review_due",
        vs.review_started_at AS "vs_review_started_at",
        vs.review_lane AS "vs_review_lane",
        vs.created_at AS "vs_created_at",
        vs.updated_at AS "vs_updated_at"
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'}
    `;

    const row = await db.queryOne<Record<string, unknown>>(sql, [idOrSlug]);
    if (!row) return null;

    const product = this.mapRowToProductWithRelations(row);
    
    // Fetch relations
    const [retailers, components, evidence] = await Promise.all([
      this.getRetailersForProduct(product.id),
      ComponentRepository.findByProductId(product.id),
      this.getEvidenceForProduct(product.id),
    ]);

    product.retailers = retailers;
    product.components = components;
    product.evidence = evidence;

    return product;
  }

  /**
   * Find multiple products by IDs
   */
  static async findByIds(ids: string[]): Promise<ProductWithRelations[]> {
    if (ids.length === 0) return [];

    const sql = `
      SELECT 
        p.*,
        b.id AS "b_id",
        b.name AS "b_name",
        b.slug AS "b_slug",
        b.website AS "b_website",
        b.country AS "b_country",
        b.logo_url AS "b_logo_url",
        b.pfas_policy_url AS "b_pfas_policy_url",
        b.pfas_policy_summary AS "b_pfas_policy_summary",
        b.created_at AS "b_created_at",
        b.updated_at AS "b_updated_at",
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.parent_id AS "c_parent_id",
        c.path_slugs AS "c_path_slugs",
        c.description AS "c_description",
        c.sort_order AS "c_sort_order",
        c.active AS "c_active",
        c.created_at AS "c_created_at",
        c.updated_at AS "c_updated_at",
        vs.id AS "vs_id",
        vs.tier AS "vs_tier",
        vs.claim_type AS "vs_claim_type",
        vs.scope_text AS "vs_scope_text",
        vs.scope_component_ids AS "vs_scope_component_ids",
        vs.confidence_score AS "vs_confidence_score",
        vs.unknowns AS "vs_unknowns",
        vs.decision_date AS "vs_decision_date",
        vs.reviewer_id AS "vs_reviewer_id",
        vs.rationale AS "vs_rationale",
        vs.evidence_ids AS "vs_evidence_ids",
        vs.next_review_due AS "vs_next_review_due",
        vs.review_started_at AS "vs_review_started_at",
        vs.review_lane AS "vs_review_lane",
        vs.created_at AS "vs_created_at",
        vs.updated_at AS "vs_updated_at"
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      WHERE p.id = ANY($1)
    `;

    const rows = await db.query<Record<string, unknown>>(sql, [ids]);
    
    return Promise.all(
      rows.map(async (row) => {
        const product = this.mapRowToProductWithRelations(row);
        const [retailers, components] = await Promise.all([
          this.getRetailersForProduct(product.id),
          ComponentRepository.findByProductId(product.id),
        ]);
        product.retailers = retailers;
        product.components = components;
        return product;
      })
    );
  }

  /**
   * Find products in review queue
   */
  static async findReviewQueue(options: {
    status?: string;
    reviewLane?: string;
    page: number;
    limit: number;
  }): Promise<{ products: ProductWithRelations[]; total: number }> {
    const whereClauses = ["p.status IN ('pending_review', 'under_review')"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (options.status) {
      whereClauses.push(`p.status = $${paramIndex}`);
      params.push(options.status);
      paramIndex++;
    }

    if (options.reviewLane) {
      whereClauses.push(`vs.review_lane = $${paramIndex}`);
      params.push(options.reviewLane);
      paramIndex++;
    }

    const whereClause = 'WHERE ' + whereClauses.join(' AND ');
    const offset = (options.page - 1) * options.limit;

    const countSql = `
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      ${whereClause}
    `;

    const sql = `
      SELECT 
        p.*,
        b.id AS "b_id",
        b.name AS "b_name",
        b.slug AS "b_slug",
        b.website AS "b_website",
        b.country AS "b_country",
        b.logo_url AS "b_logo_url",
        b.pfas_policy_url AS "b_pfas_policy_url",
        b.pfas_policy_summary AS "b_pfas_policy_summary",
        b.created_at AS "b_created_at",
        b.updated_at AS "b_updated_at",
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.parent_id AS "c_parent_id",
        c.path_slugs AS "c_path_slugs",
        c.description AS "c_description",
        c.sort_order AS "c_sort_order",
        c.active AS "c_active",
        c.created_at AS "c_created_at",
        c.updated_at AS "c_updated_at",
        vs.id AS "vs_id",
        vs.tier AS "vs_tier",
        vs.claim_type AS "vs_claim_type",
        vs.scope_text AS "vs_scope_text",
        vs.scope_component_ids AS "vs_scope_component_ids",
        vs.confidence_score AS "vs_confidence_score",
        vs.unknowns AS "vs_unknowns",
        vs.decision_date AS "vs_decision_date",
        vs.reviewer_id AS "vs_reviewer_id",
        vs.rationale AS "vs_rationale",
        vs.evidence_ids AS "vs_evidence_ids",
        vs.next_review_due AS "vs_next_review_due",
        vs.review_started_at AS "vs_review_started_at",
        vs.review_lane AS "vs_review_lane",
        vs.created_at AS "vs_created_at",
        vs.updated_at AS "vs_updated_at"
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      ${whereClause}
      ORDER BY p.requires_elevated_review DESC, p.pfas_risk_flagged DESC, p.created_at ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(options.limit, offset);

    const [countResult, rows] = await Promise.all([
      db.queryOne<{ count: string }>(countSql, params.slice(0, -2)),
      db.query<Record<string, unknown>>(sql, params),
    ]);

    const total = countResult ? parseInt(countResult.count, 10) : 0;
    const products = rows.map(row => this.mapRowToProductWithRelations(row));

    return { products, total };
  }

  /**
   * Update product status
   */
  static async updateStatus(productId: string, status: string): Promise<ProductRow> {
    const sql = `
      UPDATE products 
      SET status = $2, 
          published_at = CASE WHEN $2 = 'published' THEN NOW() ELSE published_at END
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.queryOne<ProductRow>(sql, [productId, status]);
    if (!result) {
      throw new Error(`Product ${productId} not found`);
    }
    return result;
  }

  /**
   * Get facet counts for filtering
   */
  static async getFacetCounts(baseFilters: Partial<ProductQueryOptions>): Promise<FacetCounts> {
    const { status = ['published'] } = baseFilters;
    
    // Base WHERE clause
    const baseWhere = status.length > 0 
      ? `WHERE p.status = ANY($1)`
      : '';
    const baseParams = status.length > 0 ? [status] : [];

    // Tier facets
    const tierSql = `
      SELECT 
        COALESCE(vs.tier::integer, 0) as value,
        COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN verification_status vs ON p.id = vs.product_id
      ${baseWhere}
      GROUP BY COALESCE(vs.tier::integer, 0)
      ORDER BY value
    `;

    // Material facets (food-contact only)
    const materialSql = `
      SELECT 
        m.slug as value,
        m.name as label,
        COUNT(DISTINCT p.id) as count
      FROM products p
      JOIN product_components pc ON p.id = pc.product_id AND pc.food_contact = true
      JOIN materials m ON pc.material_id = m.id
      ${baseWhere}
      GROUP BY m.slug, m.name
      ORDER BY count DESC
    `;

    // Coating type facets
    const coatingTypeSql = `
      SELECT 
        COALESCE(c.type, 'none') as value,
        COUNT(DISTINCT p.id) as count
      FROM products p
      JOIN product_components pc ON p.id = pc.product_id AND pc.food_contact = true
      LEFT JOIN coatings c ON pc.coating_id = c.id
      ${baseWhere}
      GROUP BY COALESCE(c.type, 'none')
      ORDER BY count DESC
    `;

    // Induction compatible facet
    const inductionSql = `
      SELECT 
        (p.features->>'induction_compatible')::boolean as value,
        COUNT(DISTINCT p.id) as count
      FROM products p
      ${baseWhere}
      GROUP BY (p.features->>'induction_compatible')::boolean
    `;

    // Retailer facets
    const retailerSql = `
      SELECT 
        r.id as value,
        r.name as label,
        COUNT(DISTINCT p.id) as count
      FROM products p
      JOIN product_retailer_links prl ON p.id = prl.product_id AND prl.active = true
      JOIN retailers r ON prl.retailer_id = r.id
      ${baseWhere}
      GROUP BY r.id, r.name
      ORDER BY count DESC
    `;

    const [tierRows, materialRows, coatingTypeRows, inductionRows, retailerRows] = await Promise.all([
      db.query<{ value: number; count: string }>(tierSql, baseParams),
      db.query<{ value: string; label: string; count: string }>(materialSql, baseParams),
      db.query<{ value: string; count: string }>(coatingTypeSql, baseParams),
      db.query<{ value: boolean | null; count: string }>(inductionSql, baseParams),
      db.query<{ value: string; label: string; count: string }>(retailerSql, baseParams),
    ]);

    return {
      tier: tierRows.map(r => ({
        value: r.value,
        label: TIER_LABELS[r.value] || 'Unknown',
        count: parseInt(r.count, 10),
      })),
      material: materialRows.map(r => ({
        value: r.value,
        label: r.label,
        count: parseInt(r.count, 10),
      })),
      coating_type: coatingTypeRows.map(r => ({
        value: r.value,
        label: r.value === 'none' ? 'Uncoated' : r.value.replace(/_/g, ' '),
        count: parseInt(r.count, 10),
      })),
      induction_compatible: inductionRows
        .filter(r => r.value !== null)
        .map(r => ({
          value: r.value ? 'true' : 'false',
          label: r.value ? 'Yes' : 'No',
          count: parseInt(r.count, 10),
        })),
      retailer: retailerRows.map(r => ({
        value: r.value,
        label: r.label,
        count: parseInt(r.count, 10),
      })),
    };
  }

  /**
   * Get retailers for a product
   */
  private static async getRetailersForProduct(productId: string): Promise<RetailerRow[]> {
    const sql = `
      SELECT DISTINCT r.*
      FROM retailers r
      JOIN product_retailer_links prl ON r.id = prl.retailer_id
      WHERE prl.product_id = $1 AND prl.active = true AND r.active = true
      ORDER BY r.priority, r.name
    `;

    return db.query<RetailerRow>(sql, [productId]);
  }

  /**
   * Get evidence for a product
   */
  private static async getEvidenceForProduct(productId: string): Promise<EvidenceObjectRow[]> {
    const sql = `
      SELECT eo.*
      FROM evidence_objects eo
      JOIN product_evidence pe ON eo.id = pe.evidence_id
      WHERE pe.product_id = $1 AND eo.deleted_at IS NULL
      ORDER BY eo.received_at DESC
    `;

    return db.query<EvidenceObjectRow>(sql, [productId]);
  }

  /**
   * Map raw database row to ProductWithRelations
   */
  private static mapRowToProductWithRelations(row: Record<string, unknown>): ProductWithRelations {
    const brand: BrandRow = {
      id: row.b_id as string,
      name: row.b_name as string,
      slug: row.b_slug as string,
      website: row.b_website as string | null,
      country: row.b_country as string | null,
      logo_url: row.b_logo_url as string | null,
      pfas_policy_url: row.b_pfas_policy_url as string | null,
      pfas_policy_summary: row.b_pfas_policy_summary as string | null,
      created_at: row.b_created_at as Date,
      updated_at: row.b_updated_at as Date,
    };

    const category: CategoryRow = {
      id: row.c_id as string,
      name: row.c_name as string,
      slug: row.c_slug as string,
      parent_id: row.c_parent_id as string | null,
      path_slugs: row.c_path_slugs as string[],
      description: row.c_description as string | null,
      sort_order: row.c_sort_order as number,
      active: row.c_active as boolean,
      created_at: row.c_created_at as Date,
      updated_at: row.c_updated_at as Date,
    };

    const verification: VerificationStatusRow | undefined = row.vs_id ? {
      id: row.vs_id as string,
      product_id: row.id as string,
      tier: row.vs_tier as string,
      claim_type: row.vs_claim_type as string | null,
      scope_text: row.vs_scope_text as string | null,
      scope_component_ids: row.vs_scope_component_ids as string[] | null,
      confidence_score: row.vs_confidence_score as number | null,
      unknowns: row.vs_unknowns as string[] | null,
      decision_date: row.vs_decision_date as Date | null,
      reviewer_id: row.vs_reviewer_id as string | null,
      rationale: row.vs_rationale as string | null,
      evidence_ids: row.vs_evidence_ids as string[] | null,
      next_review_due: row.vs_next_review_due as Date | null,
      review_started_at: row.vs_review_started_at as Date | null,
      review_lane: row.vs_review_lane as string | null,
      created_at: row.vs_created_at as Date,
      updated_at: row.vs_updated_at as Date,
    } : undefined;

    return {
      id: row.id as string,
      brand_id: row.brand_id as string,
      category_id: row.category_id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string | null,
      primary_image_url: row.primary_image_url as string | null,
      status: row.status as string,
      material_summary: row.material_summary as string | null,
      coating_summary: row.coating_summary as string | null,
      features: row.features as Record<string, unknown>,
      gtin: row.gtin as string | null,
      mpn: row.mpn as string | null,
      pfas_risk_flagged: row.pfas_risk_flagged as boolean,
      requires_elevated_review: row.requires_elevated_review as boolean,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      published_at: row.published_at as Date | null,
      brand,
      category,
      components: [],
      retailers: [],
      verification,
    };
  }
}
