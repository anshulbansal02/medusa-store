"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { ProductQuickLook } from "@/features/products/product-quick-look";
import { WishlistButton } from "@/features/wishlist/wishlist-button";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  eager = false,
}: {
  product: StorefrontProduct;
  eager?: boolean;
}) {
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const categoryName = product.categories[0]?.name;
  const content = siteContent.product.card;
  const hoverImage = product.images.find((image) => image !== product.image);

  return (
    <article className="group">
      <div className="relative">
        <Link
          href={product.href}
          className="block"
          aria-label={`${content.viewAriaLabelPrefix} ${product.name}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={`${product.name} ${content.imageAltSuffix}`}
              fill
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={cn(
                "object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none",
                hoverImage ? "group-hover:opacity-0" : "",
              )}
            />
            {hoverImage ? (
              <Image
                src={hoverImage}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover opacity-0 transition duration-500 ease-out group-hover:scale-[1.02] group-hover:opacity-100 motion-reduce:transition-none"
              />
            ) : null}
            {product.tags.length > 0 ? (
              <div className="absolute top-3 right-16 left-3 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-background/90 px-2.5 py-1 text-micro font-medium uppercase tracking-label text-foreground shadow-sm backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setQuickLookOpen(true)}
          aria-label={`${content.quickLookLabel}: ${product.name}`}
          className="absolute right-3 bottom-3 h-9 translate-y-1 rounded-none bg-background/92 px-3.5 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-background group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 motion-reduce:transition-none"
        >
          {content.quickLookLabel}
        </Button>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute top-2 right-2 opacity-100 transition sm:top-3 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 data-[saved=true]:opacity-100"
        />
      </div>

      <div className="mt-2 flex flex-col gap-1 sm:mt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <Link href={product.href} className="block min-w-0">
          <div>
            {categoryName ? (
              <p className="mb-1 text-micro uppercase tracking-label-wide text-muted-foreground">
                {categoryName}
              </p>
            ) : null}
            <h3 className="text-sm font-medium leading-snug sm:text-base">
              {product.name}
            </h3>
            {product.note ? (
              <p className="mt-1 hidden text-muted-foreground text-sm sm:block">
                {product.note}
              </p>
            ) : null}
          </div>
        </Link>
        <p className="shrink-0 text-sm font-medium">{product.price}</p>
      </div>

      <ProductQuickLook
        open={quickLookOpen}
        product={product}
        onOpenChange={setQuickLookOpen}
      />
    </article>
  );
}
