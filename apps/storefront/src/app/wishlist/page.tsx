import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import { WishlistPageContent } from "@/features/wishlist/wishlist-page-content";
import { absoluteUrl } from "@/lib/config/site";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: siteContent.wishlist.metadata.title,
  description: siteContent.wishlist.metadata.description,
  alternates: {
    canonical: absoluteUrl("/wishlist"),
  },
  openGraph: {
    title: siteContent.wishlist.metadata.title,
    description: siteContent.wishlist.metadata.description,
    url: absoluteUrl("/wishlist"),
  },
};

export default async function WishlistPage() {
  const products = await getProducts({ limit: 100 });
  const content = siteContent.wishlist;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl font-heading text-6xl leading-none sm:text-8xl">
                {content.title}
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              {content.description}
            </p>
          </div>

          <div className="py-8">
            <WishlistPageContent products={products} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
