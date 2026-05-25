import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/features/products/product-listing";
import { absoluteUrl } from "@/lib/config/site";
import { getProductCategories } from "@/lib/medusa/categories";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: siteContent.shop.metadata.title,
  description: siteContent.shop.metadata.description,
  alternates: {
    canonical: absoluteUrl("/shop"),
  },
  openGraph: {
    title: siteContent.shop.metadata.title,
    description: siteContent.shop.metadata.description,
    url: absoluteUrl("/shop"),
    type: "website",
  },
};

type ShopPageProps = {
  searchParams?: Promise<ProductListingSearchParams>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const content = siteContent.shop;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <Suspense fallback={<ShopContentFallback />}>
        <ShopContent searchParams={searchParams} />
      </Suspense>

      <section className="border-border border-y px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-5 text-sm md:grid-cols-3">
          {content.valueStrip.map((item) => (
            <p key={item.title}>
              <span className="font-medium">{item.title}</span> {item.text}
            </p>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

async function ShopContent({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ limit: 100 }),
    getProductCategories(12),
  ]);
  const content = siteContent.shop;

  return (
    <ProductListing
      actionPath="/shop"
      activeCategoryHref="/shop"
      categories={categories}
      description={content.description}
      emptyDescription={content.emptyDescription}
      emptyTitle={content.emptyTitle}
      eyebrow={content.eyebrow}
      products={products}
      searchParams={params}
      title={content.title}
    />
  );
}

function ShopContentFallback() {
  const content = siteContent.shop;

  return (
    <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 border-border border-b pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
            <div className="mt-5 h-4 w-80 max-w-full bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-28 bg-muted" />
            <div className="h-11 w-36 bg-muted" />
          </div>
        </div>

        <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item}>
              <div className="aspect-[4/5] bg-muted" />
              <div className="mt-4 h-4 w-3/4 bg-muted" />
              <div className="mt-3 h-3 w-1/3 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
