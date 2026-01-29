/**
 * Catalog service for PFAS-Free Kitchen Platform API
 * Handles product listing, detail views, comparison, and categories
 */

import type {
  ProductListResponse,
  ProductDetailResponse,
  CompareResponse,
  CategoriesResponse,
  ListProductsParams,
  FacetGroup,
} from '../types/api.types.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import { ProductRepository, type FacetCounts } from '../repositories/product.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import {
  toProductListItem,
  toProductDetail,
  toCompareProductItem,
  computeProductDifferences,
  toCategoryListItem,
} from '../transformers/product.transformer.js';

export class CatalogService {
  /**
   * List products with filtering and pagination
   * Returns products with verification data and facet counts
   */
  static async listProducts(params: ListProductsParams): Promise<ProductListResponse> {
    const {
      page = 1,
      limit = 24,
      sort = 'tier_desc',
      categoryId,
      brandId,
      tier,
      material,
      coatingType,
      inductionCompatible,
      ovenSafeMinTemp,
      retailerId,
    } = params;

    // Validate pagination
    if (page < 1) {
      throw new ValidationError('Page must be at least 1', 'page');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100', 'limit');
    }

    // Fetch products with filters
    const { products, total } = await ProductRepository.findMany({
      categoryId,
      brandId,
      tiers: tier,
      materials: material,
      coatingTypes: coatingType,
      inductionCompatible,
      ovenSafeMinTemp,
      retailerId,
      status: ['published'],
      page,
      limit,
      sort,
    });

    // Get facet counts
    const facetCounts = await ProductRepository.getFacetCounts({ status: ['published'] });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(p => toProductListItem(p)),
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      facets: this.formatFacets(facetCounts),
    };
  }

  /**
   * Get product details by ID or slug
   * Includes components, verification, evidence, and retailers
   */
  static async getProduct(productId: string): Promise<ProductDetailResponse> {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    // Only return published products on public endpoint
    if (product.status !== 'published') {
      throw new NotFoundError('Product', productId);
    }

    return {
      data: toProductDetail(product),
    };
  }

  /**
   * Compare multiple products (2-4)
   * Returns comparison data with differences highlighted
   */
  static async compareProducts(productIds: string[]): Promise<CompareResponse> {
    if (productIds.length < 2) {
      throw new ValidationError('At least 2 products required for comparison', 'ids');
    }
    if (productIds.length > 4) {
      throw new ValidationError('Maximum 4 products can be compared', 'ids');
    }

    // Validate uniqueness
    const uniqueIds = [...new Set(productIds)];
    if (uniqueIds.length !== productIds.length) {
      throw new ValidationError('Duplicate product IDs are not allowed', 'ids');
    }

    // Fetch all products in parallel
    const products = await ProductRepository.findByIds(uniqueIds);

    // Check all products found
    if (products.length !== uniqueIds.length) {
      const foundIds = new Set(products.map(p => p.id));
      const missingId = uniqueIds.find(id => !foundIds.has(id));
      throw new NotFoundError('Product', missingId);
    }

    // Check all products are published
    const unpublishedProduct = products.find(p => p.status !== 'published');
    if (unpublishedProduct) {
      throw new NotFoundError('Product', unpublishedProduct.id);
    }

    // Transform to comparison items
    const compareItems = products.map(p => toCompareProductItem(p));

    // Compute differences
    const differences = computeProductDifferences(compareItems);

    return {
      data: {
        products: compareItems,
        differences,
      },
    };
  }

  /**
   * List categories with hierarchy
   * Returns tree structure with product counts
   */
  static async listCategories(): Promise<CategoriesResponse> {
    const categoryTree = await CategoryRepository.buildTree();

    return {
      data: categoryTree.map(c => toCategoryListItem(c)),
    };
  }

  /**
   * Get category by slug with subcategories
   */
  static async getCategory(slug: string): Promise<CategoriesResponse> {
    const category = await CategoryRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundError('Category', slug);
    }

    // Get children
    const children = await CategoryRepository.findByParentId(category.id);

    return {
      data: [{
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parent_id || undefined,
        productCount: category.product_count,
        children: children.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentId: c.parent_id || undefined,
          productCount: c.product_count,
          children: [],
        })),
      }],
    };
  }

  /**
   * Format facet counts to API response format
   */
  private static formatFacets(facetCounts: FacetCounts): FacetGroup {
    return {
      tier: facetCounts.tier.map(f => ({
        value: f.value,
        label: f.label,
        count: f.count,
      })),
      material: facetCounts.material.map(f => ({
        value: f.value,
        label: f.label,
        count: f.count,
      })),
      coating_type: facetCounts.coating_type.map(f => ({
        value: f.value,
        label: f.label,
        count: f.count,
      })),
      induction_compatible: facetCounts.induction_compatible.map(f => ({
        value: f.value,
        label: f.label,
        count: f.count,
      })),
      retailer: facetCounts.retailer.map(f => ({
        value: f.value,
        label: f.label,
        count: f.count,
      })),
    };
  }
}
