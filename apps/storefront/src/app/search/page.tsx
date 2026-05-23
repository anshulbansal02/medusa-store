import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/content/site-content";
import { ProductGrid } from "@/features/products/product-grid";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: siteContent.search.metadata.title,
  description: siteContent.search.metadata.description,
};

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const products = await getProducts({ limit: 48 });
  const normalizedQuery = query.toLowerCase();
  const results = normalizedQuery
    ? products.filter((product) =>
        [product.name, product.note].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
    : products;
  const content = siteContent.search;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
          </div>

          <form action="/search" className="flex max-w-2xl gap-3 py-7">
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={content.placeholder}
              className="h-12 min-w-0 flex-1 rounded-none border-border bg-background px-4"
            />
            <Button type="submit" size="lg" className="h-12 rounded-none px-6">
              {content.action}
            </Button>
          </form>

          <div className="mb-6 flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">
              {query
                ? `${results.length} ${
                    results.length === 1
                      ? content.resultSingular
                      : content.resultPlural
                  }`
                : content.latestLabel}
            </p>
            {query ? (
              <Link
                href="/search"
                prefetch={false}
                className="underline-offset-4 hover:underline"
              >
                {content.clearAction}
              </Link>
            ) : null}
          </div>

          {results.length > 0 ? (
            <ProductGrid products={results} prioritizeInitialImages />
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h2 className="font-medium">{content.emptyTitle}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                {content.emptyDescription}
              </p>
              <Link
                href="/shop"
                prefetch={false}
                className="mt-5 inline-flex text-sm underline-offset-4 hover:underline"
              >
                {content.browseAction}
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
