import { Navbar } from "@/components/Navbar";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingBasket, Laptop, Shirt, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import productsData from "@/data/products.json";
import { Link } from "react-router-dom";
const categories = [{
  name: "Groceries",
  icon: ShoppingBasket,
  itemCount: 3
}, {
  name: "Electronics",
  icon: Laptop,
  itemCount: 3
}, {
  name: "Fashion",
  icon: Shirt,
  itemCount: 3
}, {
  name: "Home",
  icon: Home,
  itemCount: 3
}];
const Index = () => {
  const featuredProducts = productsData.slice(0, 8);
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="relative h-[400px] bg-gradient-to-r from-primary to-primary-hover overflow-hidden">
        <div className="container h-full flex items-center px-4">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">Welcome to Ecommercehub</h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Discover amazing products at unbeatable prices. Shop from thousands of items across multiple categories.
            </p>
            <Link to="/category/electronics">
              <Button size="lg" variant="secondary" className="animate-scale-in">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop" alt="Shopping" className="h-full w-full object-cover" />
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(category => <CategoryCard key={category.name} name={category.name} icon={category.icon} itemCount={category.itemCount} />)}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/category/all">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">About ShopHub</h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop destination for all your shopping needs. Quality products at the best prices.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {categories.map(cat => <li key={cat.name}>
                    <Link to={`/category/${cat.name.toLowerCase()}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <p className="text-sm text-muted-foreground">
                Stay connected on social media for updates and offers.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 ShopHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;