import { Nav } from "@/components/Nav";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Footer } from "@/components/Footer";

// Mock products - replace with real data from your database
const allProducts = [
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
  {
    id: "5",
    name: "Smart Speaker",
    slug: "smart-speaker",
    price: 9900,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400",
    category: "Electronics",
  },
  {
    id: "6",
    name: "Sunglasses",
    slug: "sunglasses",
    price: 8900,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    category: "Accessories",
  },
];

const categories = ["All", "Electronics", "Accessories", "Bags", "Footwear"];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0">
            <ProductFilters categories={categories} />
          </aside>
          
          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">All Products</h1>
              <p className="text-muted-foreground">{allProducts.length} products</p>
            </div>
            
            <ProductGrid products={allProducts} />
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

