import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import productsData from "@/data/products.json";

const Category = () => {
  const { category } = useParams();
  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1);

  const filteredProducts =
    category === "all"
      ? productsData
      : productsData.filter(
          (p) => p.category.toLowerCase() === category?.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
        <p className="text-muted-foreground mb-8">
          {filteredProducts.length} products found
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
