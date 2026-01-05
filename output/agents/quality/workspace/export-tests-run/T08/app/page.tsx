import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FeaturedProducts } from "@/components/products/FeaturedProducts";
import { Categories } from "@/components/products/Categories";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

// Mock featured products - replace with real data from your database
const featuredProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    price: 29900,
    compareAtPrice: 34900,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Minimalist Watch",
    slug: "minimalist-watch",
    price: 19900,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Accessories",
  },
  {
    id: "3",
    name: "Leather Backpack",
    slug: "leather-backpack",
    price: 14900,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    category: "Bags",
  },
  {
    id: "4",
    name: "Running Shoes",
    slug: "running-shoes",
    price: 12900,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Footwear",
  },
];

const categories = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300", count: 42 },
  { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=300", count: 28 },
  { name: "Clothing", slug: "clothing", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300", count: 156 },
  { name: "Home & Garden", slug: "home-garden", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300", count: 89 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      
      <Hero 
        title="Shop the Latest Trends"
        subtitle="Discover our curated collection of premium products. Free shipping on orders over $50."
        ctaText="Shop Now"
        ctaLink="/products"
      />
      
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Featured Products
        </h2>
        <FeaturedProducts products={featuredProducts} />
      </section>
      
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Shop by Category
          </h2>
          <Categories categories={categories} />
        </div>
      </section>
      
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          New Arrivals
        </h2>
        <ProductGrid products={featuredProducts} />
      </section>
      
      <CTA 
        title="Join Our Newsletter"
        description="Get 10% off your first order and be the first to know about new arrivals and exclusive offers."
        buttonText="Subscribe"
      />
      
      <Footer />
    </main>
  );
}

