import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/features/wishlist/wishlist-button";
import type { StorefrontProduct } from "@/lib/medusa/products";

export function ProductCard({
  product,
  eager = false,
}: {
  product: StorefrontProduct;
  eager?: boolean;
}) {
  const categoryName = product.categories[0]?.name;

  return (
    <article className="group">
      <div className="relative">
        <Link
          href={product.href}
          prefetch={false}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={`${product.name} styled on a model`}
              fill
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute right-3 bottom-3 bg-background/92 px-3 py-1.5 text-xs opacity-0 transition group-hover:opacity-100">
              View details
            </span>
          </div>
        </Link>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute top-3 right-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        />
      </div>

      <Link href={product.href} prefetch={false} className="block">
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            {categoryName ? (
              <p className="mb-1 text-micro uppercase tracking-[0.12em] text-muted-foreground">
                {categoryName}
              </p>
            ) : null}
            <h3 className="text-base font-medium leading-snug">
              {product.name}
            </h3>
            {product.note ? (
              <p className="mt-1 text-muted-foreground text-sm">
                {product.note}
              </p>
            ) : null}
          </div>
          <p className="text-sm font-medium">{product.price}</p>
        </div>
      </Link>
    </article>
  );
}
