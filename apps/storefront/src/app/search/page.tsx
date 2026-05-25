import type { Metadata } from "next";

import { AnalyticsEventOnMount } from "@/components/analytics/ecommerce-events";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/content/site-content";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/features/products/product-listing";
import { getProductCategories } from "@/lib/medusa/categories";
import { getProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: siteContent.search.metadata.title,
  description: siteContent.search.metadata.description,
};

type SearchPageProps = {
  searchParams?: Promise<ProductListingSearchParams>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const [products, categories] = await Promise.all([
    getProducts({ limit: 100 }),
    getProductCategories(12),
  ]);
  const normalizedQuery = query.toLowerCase();
  const queryResults = normalizedQuery
    ? products.filter((product) =>
        [
          product.name,
          product.note,
          ...product.colors,
          ...product.sizes,
          ...product.categories.map((category) => category.name),
        ].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
    : products;
  const results = params?.category
    ? queryResults.filter((product) =>
        product.categories.some(
          (category) => category.handle === params.category,
        ),
      )
    : queryResults;
  const content = siteContent.search;
  const resultCountLabel =
    results.length === 1 ? content.resultSingular : content.resultPlural;
  const resultDescription = query
    ? `${results.length} ${resultCountLabel} ${content.resultForLabel} "${query}".`
    : content.latestLabel;

  return (
    <main className="min-h-screen">
      {query ? (
        <AnalyticsEventOnMount
          event="search_submitted"
          data={{
            query_length: query.length,
            result_count: results.length,
            has_category_filter: Boolean(params?.category),
          }}
        />
      ) : null}
      <SiteHeader />

      <ProductListing
        actionPath="/search"
        activeCategoryHref=""
        beforeControls={
          <form action="/search" className="flex max-w-2xl gap-3">
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
        }
        categories={categories}
        categoryMode="query"
        description={resultDescription}
        emptyActionHref="/shop"
        emptyActionLabel={content.browseAction}
        emptyDescription={content.emptyDescription}
        emptyTitle={content.emptyTitle}
        eyebrow={content.eyebrow}
        hiddenParams={query ? { q: query } : undefined}
        products={results}
        searchParams={params}
        title={content.title}
      />

      <SiteFooter />
    </main>
  );
}
