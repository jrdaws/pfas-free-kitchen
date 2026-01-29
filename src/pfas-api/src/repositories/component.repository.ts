/**
 * Component repository for PFAS-Free Kitchen Platform API
 * Handles product component queries with material/coating joins
 */

import { db } from '../config/database.js';
import type { ProductComponentRow, MaterialRow, CoatingRow } from '../types/database.types.js';

export interface ComponentWithRelations extends ProductComponentRow {
  material: MaterialRow | null;
  coating: CoatingRow | null;
}

export class ComponentRepository {
  /**
   * Find all components for a product
   */
  static async findByProductId(productId: string): Promise<ComponentWithRelations[]> {
    const sql = `
      SELECT 
        pc.id,
        pc.product_id,
        pc.name,
        pc.food_contact,
        pc.material_id,
        pc.coating_id,
        pc.pfas_risk_flag,
        pc.notes,
        pc.sort_order,
        pc.created_at,
        pc.updated_at,
        -- Material fields
        m.id AS "m_id",
        m.name AS "m_name",
        m.slug AS "m_slug",
        m.family AS "m_family",
        m.pfas_risk_default AS "m_pfas_risk_default",
        m.notes AS "m_notes",
        m.created_at AS "m_created_at",
        -- Coating fields
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.type AS "c_type",
        c.is_fluoropolymer AS "c_is_fluoropolymer",
        c.pfas_risk_default AS "c_pfas_risk_default",
        c.marketing_terms AS "c_marketing_terms",
        c.notes AS "c_notes",
        c.created_at AS "c_created_at"
      FROM product_components pc
      LEFT JOIN materials m ON pc.material_id = m.id
      LEFT JOIN coatings c ON pc.coating_id = c.id
      WHERE pc.product_id = $1
      ORDER BY pc.sort_order, pc.name
    `;

    const rows = await db.query<Record<string, unknown>>(sql, [productId]);
    return rows.map(row => this.mapRowToComponentWithRelations(row));
  }

  /**
   * Find food-contact components for a product
   */
  static async findFoodContactByProductId(productId: string): Promise<ComponentWithRelations[]> {
    const sql = `
      SELECT 
        pc.id,
        pc.product_id,
        pc.name,
        pc.food_contact,
        pc.material_id,
        pc.coating_id,
        pc.pfas_risk_flag,
        pc.notes,
        pc.sort_order,
        pc.created_at,
        pc.updated_at,
        -- Material fields
        m.id AS "m_id",
        m.name AS "m_name",
        m.slug AS "m_slug",
        m.family AS "m_family",
        m.pfas_risk_default AS "m_pfas_risk_default",
        m.notes AS "m_notes",
        m.created_at AS "m_created_at",
        -- Coating fields
        c.id AS "c_id",
        c.name AS "c_name",
        c.slug AS "c_slug",
        c.type AS "c_type",
        c.is_fluoropolymer AS "c_is_fluoropolymer",
        c.pfas_risk_default AS "c_pfas_risk_default",
        c.marketing_terms AS "c_marketing_terms",
        c.notes AS "c_notes",
        c.created_at AS "c_created_at"
      FROM product_components pc
      LEFT JOIN materials m ON pc.material_id = m.id
      LEFT JOIN coatings c ON pc.coating_id = c.id
      WHERE pc.product_id = $1 AND pc.food_contact = true
      ORDER BY pc.sort_order, pc.name
    `;

    const rows = await db.query<Record<string, unknown>>(sql, [productId]);
    return rows.map(row => this.mapRowToComponentWithRelations(row));
  }

  /**
   * Map raw row to component with relations
   */
  private static mapRowToComponentWithRelations(row: Record<string, unknown>): ComponentWithRelations {
    const component: ProductComponentRow = {
      id: row.id as string,
      product_id: row.product_id as string,
      name: row.name as string,
      food_contact: row.food_contact as boolean,
      material_id: row.material_id as string | null,
      coating_id: row.coating_id as string | null,
      pfas_risk_flag: row.pfas_risk_flag as boolean,
      notes: row.notes as string | null,
      sort_order: row.sort_order as number,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
    };

    const material: MaterialRow | null = row.m_id ? {
      id: row.m_id as string,
      name: row.m_name as string,
      slug: row.m_slug as string,
      family: row.m_family as string | null,
      pfas_risk_default: row.m_pfas_risk_default as boolean,
      notes: row.m_notes as string | null,
      created_at: row.m_created_at as Date,
    } : null;

    const coating: CoatingRow | null = row.c_id ? {
      id: row.c_id as string,
      name: row.c_name as string,
      slug: row.c_slug as string,
      type: row.c_type as string | null,
      is_fluoropolymer: row.c_is_fluoropolymer as boolean,
      pfas_risk_default: row.c_pfas_risk_default as boolean,
      marketing_terms: row.c_marketing_terms as string[] | null,
      notes: row.c_notes as string | null,
      created_at: row.c_created_at as Date,
    } : null;

    return {
      ...component,
      material,
      coating,
    };
  }
}
