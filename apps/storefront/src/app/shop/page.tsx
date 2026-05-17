import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ProductCard } from "@/features/products/product-card";
import { absoluteUrl } from "@/lib/config/site";
import { getProductCategories } from "@/lib/medusa/categories";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: "Shop New Arrivals | The Label",
  description:
    "Shop premium western occasion wear, dresses, co-ords, and statement tops for India.",
  alternates: {
    canonical: absoluteUrl("/shop"),
  },
  openGraph: {
    title: "Shop New Arrivals | The Label",
    description:
      "Shop premium western occasion wear, dresses, co-ords, and statement tops for India.",
    url: absoluteUrl("/shop"),
    type: "website",
  },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 24 }),
    getProductCategories(12),
  ]);
  const categoryLinks = [
    { href: "/shop", label: "All" },
    ...categories.map((category) => ({
      href: `/shop/${category.handle}`,
      label: category.name,
    })),
  ];

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                New arrivals
              </p>
              <h1 className="mt-3 max-w-3xl font-heading text-6xl leading-none sm:text-8xl">
                Shop the edit.
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              Dresses, co-ords, and sharper tops for dinners, wedding functions,
              launches, and weekends that need more polish.
            </p>
          </div>

          <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
            <nav
              aria-label="Shop categories"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
            >
              {categoryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="shrink-0 border border-border px-4 py-2 text-sm transition hover:border-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="text-muted-foreground text-sm">
              {products.length} styles
            </p>
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
              <h2 className="text-base font-medium">
                Products are not available yet.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                Start Medusa with a publishable key and published products to
                populate the shop.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-border border-y px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-5 text-sm md:grid-cols-3">
          <p>
            <span className="font-medium">Size notes close by.</span> Product
            pages will keep fit and measurements near size selection.
          </p>
          <p>
            <span className="font-medium">Prepaid checkout.</span> Razorpay
            integration is planned for the checkout phase.
          </p>
          <p>
            <span className="font-medium">India shipping.</span> Dispatch and
            return details stay visible before purchase.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
