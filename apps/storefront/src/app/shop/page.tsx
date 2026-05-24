import type { Metadata } from "next";

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
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ limit: 100 }),
    getProductCategories(12),
  ]);
  const content = siteContent.shop;

  return (
    <main className="min-h-screen">
      <SiteHeader />

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
