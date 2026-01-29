import type { Product } from '@/lib/types';

interface ProductSchemaProps {
  product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const tierLabels = ['Unknown', 'Brand Statement', 'Policy Reviewed', 'Lab Tested', 'Monitored'];
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Verified PFAS-free kitchen product`,
    image: product.images?.[0]?.url || product.imageUrl,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand.name,
    } : undefined,
    category: product.category?.path?.map(p => p.name).join(' > ') || product.category?.name,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'PFAS Verification Tier',
        value: tierLabels[product.verification?.tier ?? 0],
      },
      {
        '@type': 'PropertyValue',
        name: 'Material',
        value: product.materialSummary || 'Not specified',
      },
      {
        '@type': 'PropertyValue',
        name: 'Coating',
        value: product.coatingSummary || 'None',
      },
    ],
    // Note: No price per Amazon TOS - affiliate links only
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
