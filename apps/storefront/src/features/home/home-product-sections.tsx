import Link from "next/link";

import type { ProductSectionProps } from "@/features/home/home-section-types";
import { ProductCard } from "@/features/products/product-card";
import { ProductGrid } from "@/features/products/product-grid";

export function NewArrivalsSection({ content, products }: ProductSectionProps) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="nf-reveal mb-8 flex flex-col justify-between gap-5 border-border border-b pb-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-heading text-5xl leading-none sm:text-6xl">
              {content.newArrivals.title}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              {content.newArrivals.description}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            {content.newArrivals.action}
          </Link>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="border border-border px-5 py-8 sm:px-8">
            <h3 className="text-base font-medium">
              {content.newArrivals.emptyTitle}
            </h3>
            <p className="mt-2 max-w-xl text-muted-foreground text-sm">
              {content.newArrivals.emptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function OccasionEditSection({
  content,
  products,
}: ProductSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-border border-y px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div className="nf-reveal">
          <h2 className="font-heading text-5xl leading-none sm:text-7xl">
            {content.occasionEdit.title}
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            {content.occasionEdit.description}
          </p>
          <Link
            href="/shop/occasion-edit"
            className="mt-7 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            {content.occasionEdit.action}
          </Link>
        </div>

        <div className="nf-reveal-soft nf-delay-1 grid gap-4 sm:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
