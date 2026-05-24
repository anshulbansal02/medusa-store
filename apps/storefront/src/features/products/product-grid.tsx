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
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4">
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
