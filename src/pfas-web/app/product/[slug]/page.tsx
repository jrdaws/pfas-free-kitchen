import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { 
  ProductHero, 
  ProductTabs, 
  TabPanel,
  OverviewTab,
  ComponentsTab,
  VerificationTab,
  SpecificationsTab,
  ReviewsTab,
  RelatedProducts,
  ProductNotFound,
  TrackRecentlyViewed,
} from '@/components/product';
import { LoadingSpinner, ProductDetailSkeleton } from '@/components/ui';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo';
import { fetchProduct, fetchAffiliateLinks, fetchRelatedProducts } from '@/lib';
import type { Product, AffiliateLinksResponse } from '@/lib';
import styles from './product.module.css';

interface ProductPageProps {
  params: { slug: string };
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await fetchProduct(slug);

  if (!product) {
    return <ProductNotFound slug={slug} />;
  }

  // Fetch affiliate links and related products in parallel
  const [affiliateLinks, relatedProducts] = await Promise.all([
    fetchAffiliateLinks(product.id).catch(() => null),
    fetchRelatedProducts(product.category?.id, product.id).catch(() => []),
  ]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'components', label: 'Components' },
    { id: 'verification', label: 'Verification' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews', count: 0 },
  ];

  return (
    <article className={styles.page}>
      {/* Track this product view */}
      <TrackRecentlyViewed 
        product={{
          id: product.id,
          slug: product.slug || slug,
          name: product.name,
          brandName: product.brand?.name,
          imageUrl: product.images?.[0]?.url || product.imageUrl,
          tier: product.verification?.tier,
        }}
      />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          {product.category?.path?.map((item, index) => (
            <li key={item.id || index}>
              <Link href={`/search?category=${item.slug}`}>{item.name}</Link>
            </li>
          ))}
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Product Hero */}
      <ProductHero 
        product={product} 
        affiliateLinks={affiliateLinks?.links}
      />

      {/* Tabbed Content */}
      <ProductTabs tabs={tabs} defaultTab="overview">
        <TabPanel id="overview">
          <OverviewTab product={product} />
        </TabPanel>
        <TabPanel id="components">
          <ComponentsTab product={product} />
        </TabPanel>
        <TabPanel id="verification">
          <VerificationTab product={product} />
        </TabPanel>
        <TabPanel id="specifications">
          <SpecificationsTab product={product} />
        </TabPanel>
        <TabPanel id="reviews">
          <ReviewsTab product={product} />
        </TabPanel>
      </ProductTabs>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <>
          <RelatedProducts 
            title="Similar Products" 
            products={relatedProducts}
          />
        </>
      )}

      {/* Report Issue */}
      <footer className={styles.footer}>
        <Link href={`/report?product=${product.id}`} className={styles.reportLink}>
          🚩 Report an issue with this product
        </Link>
      </footer>

      {/* Structured Data for SEO */}
      <ProductSchema product={product} />
      <BreadcrumbSchema 
        items={[
          { label: 'Home', href: '/' },
          ...(product.category?.path?.map(item => ({
            label: item.name,
            href: `/search?category=${item.slug}`,
          })) || []),
          { label: product.name },
        ]} 
      />
    </article>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <div className={styles.container}>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductContent slug={params.slug} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product = await fetchProduct(params.slug);

    if (!product) {
      return { 
        title: 'Product Not Found | PFAS-Free Kitchen',
        description: 'The product you are looking for could not be found.',
      };
    }

    const tierLabels = ['Unknown', 'Brand Statement', 'Policy Reviewed', 'Lab Tested', 'Monitored'];
    const tier = product.verification?.tier ?? 0;

    return {
      title: `${product.name} by ${product.brand?.name || 'Unknown Brand'} | PFAS-Free Kitchen`,
      description: product.description || 
        `${product.name} - ${tierLabels[tier]} PFAS-free ${product.category?.name?.toLowerCase() || 'product'}. ${product.materialSummary || ''}`,
      openGraph: {
        title: `${product.name} - PFAS-Free Kitchen`,
        description: `Verified PFAS-free: ${tierLabels[tier]}. ${product.materialSummary || ''}`,
        images: product.images?.[0]?.url || product.imageUrl ? [{ url: product.images?.[0]?.url || product.imageUrl! }] : [],
        type: 'website',
      },
    };
  } catch (error) {
    return { 
      title: 'Product | PFAS-Free Kitchen',
      description: 'View product details and PFAS verification status.',
    };
  }
}
