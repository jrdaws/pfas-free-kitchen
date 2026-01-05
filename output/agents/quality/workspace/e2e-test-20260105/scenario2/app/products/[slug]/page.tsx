import { Nav } from "@/components/Nav";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";

// Mock product data - replace with real data from your database
const products: Record<string, {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  images: string[];
  category: string;
  variants?: { name: string; options: string[] }[];
  inStock: boolean;
}> = {
  "premium-wireless-headphones": {
    id: "1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    price: 29900,
    compareAtPrice: 34900,
    description: "Experience exceptional sound quality with our Premium Wireless Headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort for all-day wear.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    ],
    category: "Electronics",
    variants: [
      { name: "Color", options: ["Black", "White", "Navy"] },
    ],
    inStock: true,
  },
  "minimalist-watch": {
    id: "2",
    name: "Minimalist Watch",
    slug: "minimalist-watch",
    price: 19900,
    description: "A timeless minimalist watch with a clean design. Features sapphire crystal glass, Japanese movement, and genuine leather strap.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    ],
    category: "Accessories",
    variants: [
      { name: "Band Color", options: ["Brown", "Black", "Tan"] },
      { name: "Face Color", options: ["White", "Black"] },
    ],
    inStock: true,
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products[slug];
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = Object.values(products)
    .filter(p => p.slug !== slug && p.category === product.category)
    .slice(0, 4);
  
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery images={product.images} />
          <ProductInfo product={product} />
        </div>
        
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Related Products
            </h2>
            <RelatedProducts products={relatedProducts} />
          </section>
        )}
      </div>
      
      <Footer />
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

