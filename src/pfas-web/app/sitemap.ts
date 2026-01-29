import { MetadataRoute } from 'next';

const SITE_URL = 'https://pfasfreekitchen.com';

// In production, this would fetch from the API
async function getAllProductSlugs(): Promise<string[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.API_BASE_URL}/products/slugs`);
  // return response.json();
  
  // Placeholder slugs for development
  return [
    'lodge-cast-iron-skillet-10',
    'all-clad-d3-stainless-fry-pan',
    'le-creuset-signature-dutch-oven',
    'made-in-carbon-steel-frying-pan',
    'demeyere-industry5-saucepan',
    'staub-cast-iron-cocotte',
  ];
}

// In production, this would fetch from the API
async function getAllCategorySlugs(): Promise<string[]> {
  // TODO: Replace with actual API call
  return [
    'skillets',
    'dutch-ovens',
    'saucepans',
    'bakeware',
    'food-storage',
    'utensils',
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productSlugs = await getAllProductSlugs();
  const categorySlugs = await getAllCategorySlugs();
  
  const productUrls = productSlugs.map(slug => ({
    url: `${SITE_URL}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const categoryUrls = categorySlugs.map(slug => ({
    url: `${SITE_URL}/search?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/learn/what-is-pfas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/learn/how-we-verify`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/learn/buyers-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/disclosure`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  
  return [...staticPages, ...categoryUrls, ...productUrls];
}
