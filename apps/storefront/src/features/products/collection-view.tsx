import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import { ProductCard } from "@/features/products/product-card";
import type { StorefrontProductCategory } from "@/lib/medusa/categories";
import type { StorefrontProduct } from "@/lib/medusa/products";

type CollectionViewProps = {
  category: StorefrontProductCategory;
  products: StorefrontProduct[];
};

export function CollectionView({ category, products }: CollectionViewProps) {
  const content = siteContent.collection;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-muted-foreground text-sm">{category.name}</p>
              <h1 className="mt-3 max-w-3xl font-heading text-6xl leading-none sm:text-8xl">
                {category.name}
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              {category.description || content.fallbackDescription}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-6">
            <p className="text-muted-foreground text-sm">
              {products.length} {content.countLabel}
            </p>
            <Link
              href="/shop"
              prefetch={false}
              className="text-sm underline-offset-4 hover:underline"
            >
              {content.allProductsAction}
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  eager={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h2 className="text-base font-medium">{content.emptyTitle}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                {content.emptyDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
