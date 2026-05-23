import { ProductCard } from "@/features/products/product-card";
import type { StorefrontProduct } from "@/lib/medusa/products";

const initialProductGridImageCount = 4;

function shouldPrioritizeProductGridImage(index: number) {
  return index < initialProductGridImageCount;
}

export function ProductGrid({
  prioritizeInitialImages = false,
  products,
}: {
  prioritizeInitialImages?: boolean;
  products: StorefrontProduct[];
}) {
  return (
    <div className="grid gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          eager={
            prioritizeInitialImages && shouldPrioritizeProductGridImage(index)
          }
        />
      ))}
    </div>
  );
}
