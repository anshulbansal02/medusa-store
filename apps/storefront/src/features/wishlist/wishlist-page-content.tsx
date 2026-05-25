"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { ProductGrid } from "@/features/products/product-grid";
import { useWishlistStore } from "@/features/wishlist/wishlist-store";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type WishlistPageContentProps = {
  products: StorefrontProduct[];
};

const skeletonIds = [
  "wishlist-skeleton-1",
  "wishlist-skeleton-2",
  "wishlist-skeleton-3",
  "wishlist-skeleton-4",
];

export function WishlistPageContent({ products }: WishlistPageContentProps) {
  const content = siteContent.wishlist;
  const productIds = useWishlistStore((state) => state.productIds);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const savedProducts = products.filter((product) =>
    productIds.includes(product.id),
  );

  if (!hasHydrated) {
    return (
      <div className="grid gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
        {skeletonIds.map((id) => (
          <div key={id} aria-hidden="true">
            <div className="aspect-[4/5] bg-muted" />
            <div className="mt-3 h-4 w-2/3 bg-muted" />
            <div className="mt-2 h-4 w-1/3 bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (savedProducts.length === 0) {
    return (
      <div className="border border-border px-5 py-8 sm:px-8">
        <h2 className="text-base font-medium">{content.emptyTitle}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground text-sm">
          {content.emptyDescription}
        </p>
        <Link
          href="/shop"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 h-11 rounded-none px-6",
          )}
        >
          {content.browseAction}
        </Link>
      </div>
    );
  }

  return <ProductGrid products={savedProducts} />;
}
