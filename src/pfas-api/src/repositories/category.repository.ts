/**
 * Category repository for PFAS-Free Kitchen Platform API
 * Handles category queries with hierarchy support
 */

import { db } from '../config/database.js';
import type { CategoryRow } from '../types/database.types.js';

export interface CategoryWithCount extends CategoryRow {
  product_count: number;
}

export interface CategoryTree extends CategoryWithCount {
  children: CategoryTree[];
}

export class CategoryRepository {
  /**
   * Find all active categories
   */
  static async findAll(): Promise<CategoryWithCount[]> {
    const sql = `
      SELECT 
        c.*,
        COALESCE(pc.count, 0)::integer AS product_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) as count
        FROM products
        WHERE status = 'published'
        GROUP BY category_id
      ) pc ON c.id = pc.category_id
      WHERE c.active = true
      ORDER BY c.sort_order, c.name
    `;

    return db.query<CategoryWithCount>(sql);
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug: string): Promise<CategoryWithCount | null> {
    const sql = `
      SELECT 
        c.*,
        COALESCE(pc.count, 0)::integer AS product_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) as count
        FROM products
        WHERE status = 'published'
        GROUP BY category_id
      ) pc ON c.id = pc.category_id
      WHERE c.slug = $1 AND c.active = true
    `;

    return db.queryOne<CategoryWithCount>(sql, [slug]);
  }

  /**
   * Find category by ID
   */
  static async findById(id: string): Promise<CategoryWithCount | null> {
    const sql = `
      SELECT 
        c.*,
        COALESCE(pc.count, 0)::integer AS product_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) as count
        FROM products
        WHERE status = 'published'
        GROUP BY category_id
      ) pc ON c.id = pc.category_id
      WHERE c.id = $1 AND c.active = true
    `;

    return db.queryOne<CategoryWithCount>(sql, [id]);
  }

  /**
   * Find categories by parent ID
   */
  static async findByParentId(parentId: string | null): Promise<CategoryWithCount[]> {
    const sql = parentId
      ? `
        SELECT 
          c.*,
          COALESCE(pc.count, 0)::integer AS product_count
        FROM categories c
        LEFT JOIN (
          SELECT category_id, COUNT(*) as count
          FROM products
          WHERE status = 'published'
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.parent_id = $1 AND c.active = true
        ORDER BY c.sort_order, c.name
      `
      : `
        SELECT 
          c.*,
          COALESCE(pc.count, 0)::integer AS product_count
        FROM categories c
        LEFT JOIN (
          SELECT category_id, COUNT(*) as count
          FROM products
          WHERE status = 'published'
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.parent_id IS NULL AND c.active = true
        ORDER BY c.sort_order, c.name
      `;

    return db.query<CategoryWithCount>(sql, parentId ? [parentId] : []);
  }

  /**
   * Get product count for a category (including subcategories)
   */
  static async getProductCount(categoryId: string): Promise<number> {
    const sql = `
      WITH RECURSIVE category_tree AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT COUNT(*)::integer as count
      FROM products p
      WHERE p.category_id IN (SELECT id FROM category_tree)
        AND p.status = 'published'
    `;

    const result = await db.queryOne<{ count: number }>(sql, [categoryId]);
    return result?.count || 0;
  }

  /**
   * Build category tree structure
   */
  static async buildTree(): Promise<CategoryTree[]> {
    const allCategories = await this.findAll();
    
    // Create a map for quick lookup
    const categoryMap = new Map<string, CategoryTree>();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree structure
    const rootCategories: CategoryTree[] = [];
    
    categoryMap.forEach(category => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Sort children by sort_order
    const sortChildren = (categories: CategoryTree[]): void => {
      categories.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      categories.forEach(cat => sortChildren(cat.children));
    };

    sortChildren(rootCategories);

    return rootCategories;
  }
}
