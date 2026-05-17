import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WishlistPageContent } from "@/features/wishlist/wishlist-page-content";
import { absoluteUrl } from "@/lib/config/site";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: "Wishlist | The Label",
  description: "Review the styles you saved while browsing The Label.",
  alternates: {
    canonical: absoluteUrl("/wishlist"),
  },
  openGraph: {
    title: "Wishlist | The Label",
    description: "Review the styles you saved while browsing The Label.",
    url: absoluteUrl("/wishlist"),
  },
};

export default async function WishlistPage() {
  const products = await getProducts({ limit: 100 });

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-muted-foreground text-sm">Saved styles</p>
              <h1 className="mt-3 max-w-3xl font-heading text-6xl leading-none sm:text-8xl">
                Wishlist
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              A private shortlist on this device only. Save pieces while
              browsing, then compare them before adding to bag.
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
