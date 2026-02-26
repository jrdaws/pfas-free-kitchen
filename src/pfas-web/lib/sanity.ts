import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { Product, Brand, Category, VerificationTier } from './types';
import { generateAmazonLink } from './affiliate';

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
};

export const sanityClient = createClient(config);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getSanityProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && status == "published"] {
    _id,
    name,
    "slug": slug.current,
    description,
    images[] {
      asset->,
      alt,
      isPrimary
    },
    brand-> {
      _id,
      name,
      "slug": slug.current
    },
    category-> {
      _id,
      name,
      "slug": slug.current,
      parentCategory-> {
        _id,
        name,
        "slug": slug.current
      }
    },
    materialSummary,
    coatingSummary,
    verificationTier,
    claimType,
    verificationRationale,
    evidenceCount,
    decisionDate,
    components,
    features,
    amazonAsin,
    amazonPrice,
    amazonInStock,
    otherRetailers
  }`;

  const sanityProducts = await sanityClient.fetch(query);
  
  return sanityProducts.map((p: any) => transformSanityProduct(p));
}

export async function getSanityProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug && status == "published"][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    images[] {
      asset->,
      alt,
      isPrimary
    },
    brand-> {
      _id,
      name,
      "slug": slug.current
    },
    category-> {
      _id,
      name,
      "slug": slug.current,
      parentCategory-> {
        _id,
        name,
        "slug": slug.current
      }
    },
    materialSummary,
    coatingSummary,
    verificationTier,
    claimType,
    verificationRationale,
    evidenceCount,
    decisionDate,
    components,
    features,
    amazonAsin,
    amazonPrice,
    amazonInStock,
    otherRetailers
  }`;

  const sanityProduct = await sanityClient.fetch(query, { slug });
  
  if (!sanityProduct) return null;
  
  return transformSanityProduct(sanityProduct);
}

export async function getSanityBrands(): Promise<Brand[]> {
  const query = `*[_type == "brand"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    logo
  }`;

  const brands = await sanityClient.fetch(query);
  
  return brands.map((b: any) => ({
    id: b._id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logo ? urlFor(b.logo).width(200).url() : undefined,
  }));
}

export async function getSanityCategories(): Promise<Category[]> {
  const query = `*[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    parentCategory-> {
      _id,
      name,
      "slug": slug.current
    }
  }`;

  const categories = await sanityClient.fetch(query);
  
  return categories.map((c: any) => ({
    id: c._id,
    name: c.name,
    slug: c.slug,
    path: c.parentCategory 
      ? [
          { id: c.parentCategory._id, name: c.parentCategory.name, slug: c.parentCategory.slug },
          { id: c._id, name: c.name, slug: c.slug },
        ]
      : [{ id: c._id, name: c.name, slug: c.slug }],
  }));
}

function transformSanityProduct(p: any): Product {
  const imageUrl = p.images?.[0]?.asset 
    ? urlFor(p.images[0]).width(600).url() 
    : '/placeholders/products/container-placeholder.svg';

  const categoryPath = p.category?.parentCategory
    ? [
        { id: p.category.parentCategory._id, name: p.category.parentCategory.name, slug: p.category.parentCategory.slug },
        { id: p.category._id, name: p.category.name, slug: p.category.slug },
      ]
    : [{ id: p.category?._id || '', name: p.category?.name || '', slug: p.category?.slug || '' }];

  const retailers = [];
  
  if (p.amazonAsin) {
    retailers.push({
      id: `${p._id}-amazon`,
      retailer: { id: 'amazon', name: 'Amazon', logoUrl: '/images/retailers/amazon.svg' },
      url: generateAmazonLink(p.amazonAsin),
      price: p.amazonPrice,
      currency: 'USD',
      inStock: p.amazonInStock ?? true,
    });
  }

  if (p.otherRetailers) {
    p.otherRetailers.forEach((r: any, index: number) => {
      retailers.push({
        id: `${p._id}-other-${index}`,
        retailer: { id: r.retailerName.toLowerCase().replace(/\s+/g, '-'), name: r.retailerName },
        url: r.url,
        price: r.price,
        currency: 'USD',
        inStock: r.inStock ?? true,
      });
    });
  }

  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl,
    images: p.images?.map((img: any) => ({
      url: img.asset ? urlFor(img).width(600).url() : imageUrl,
      alt: img.alt || p.name,
      isPrimary: img.isPrimary,
    })) || [{ url: imageUrl, alt: p.name, isPrimary: true }],
    brand: {
      id: p.brand?._id || '',
      name: p.brand?.name || 'Unknown Brand',
      slug: p.brand?.slug || 'unknown',
    },
    category: {
      id: p.category?._id || '',
      name: p.category?.name || 'Uncategorized',
      slug: p.category?.slug || 'uncategorized',
      path: categoryPath,
    },
    materialSummary: p.materialSummary,
    coatingSummary: p.coatingSummary,
    verification: {
      tier: (p.verificationTier || 0) as VerificationTier,
      claimType: p.claimType,
      rationale: p.verificationRationale,
      unknowns: [],
      hasEvidence: (p.evidenceCount || 0) > 0,
      evidenceCount: p.evidenceCount || 0,
      decisionDate: p.decisionDate,
    },
    components: p.components?.map((c: any, index: number) => ({
      id: `${p._id}-component-${index}`,
      role: c.role,
      roleLabel: c.roleLabel,
      material: c.material ? { id: c.material.toLowerCase().replace(/\s+/g, '-'), name: c.material, slug: c.material.toLowerCase().replace(/\s+/g, '-') } : undefined,
      pfasStatus: c.pfasStatus || 'unknown',
    })) || [],
    retailers,
    features: p.features,
  };
}

export const sanityEnabled = !!config.projectId && config.projectId !== '';
