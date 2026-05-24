"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/content/site-content";
import type { StorefrontProductCategory } from "@/lib/medusa/categories";
import type { StorefrontProduct } from "@/lib/medusa/products";

type SearchDialogProps = {
  products: StorefrontProduct[];
  categories: StorefrontProductCategory[];
};

const maxVisibleProducts = 6;
const maxVisibleCategories = 5;

type SearchContent = typeof siteContent.search;

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function productMatchesQuery(product: StorefrontProduct, query: string) {
  return [
    product.name,
    product.note,
    ...product.colors,
    ...product.sizes,
    ...product.categories.map((category) => category.name),
  ].some((value) => value.toLowerCase().includes(query));
}

function getProductResults(products: StorefrontProduct[], query: string) {
  return (
    query
      ? products.filter((product) => productMatchesQuery(product, query))
      : products
  ).slice(0, maxVisibleProducts);
}

function getCategoryResults(
  categories: StorefrontProductCategory[],
  query: string,
) {
  return (
    query
      ? categories.filter((category) =>
          category.name.toLowerCase().includes(query),
        )
      : categories
  ).slice(0, maxVisibleCategories);
}

export function SearchDialog({ products, categories }: SearchDialogProps) {
  const content = siteContent.search;
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeQuery(query);
  const productResults = getProductResults(products, normalizedQuery);
  const categoryResults = getCategoryResults(categories, normalizedQuery);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={content.action}
            className="rounded-none text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Search className="size-4 stroke-icon" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent
        closeLabel="Close search"
        className="top-0 left-0 h-svh max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none border-0 bg-background p-0 sm:top-6 sm:left-1/2 sm:h-auto sm:max-h-[min(82svh,760px)] sm:max-w-4xl sm:-translate-x-1/2 sm:translate-y-0 sm:border sm:border-border"
        showCloseButton
      >
        <div className="border-border border-b px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <DialogTitle className="sr-only">{content.dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {content.dialogDescription}
          </DialogDescription>
          <div className="mb-4 max-w-xl pr-10">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <p className="mt-1 font-heading text-4xl leading-none sm:text-5xl">
              {content.title}
            </p>
          </div>
          <SearchDialogForm
            content={content}
            query={query}
            onQueryChange={setQuery}
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid min-w-0 gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
            <SearchCategoryLinks
              categories={categoryResults}
              content={content}
            />

            <div className="min-w-0">
              <div className="flex items-center justify-between gap-4 border-border border-b pb-3">
                <p className="text-muted-foreground text-sm">
                  {normalizedQuery
                    ? content.matchingLabel
                    : content.latestLabel}
                </p>
                {normalizedQuery ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                  >
                    {content.viewAllAction}
                    <ArrowRight className="size-3.5 stroke-icon" />
                  </Link>
                ) : null}
              </div>

              <SearchProductResults
                content={content}
                products={productResults}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchDialogForm({
  content,
  onQueryChange,
  query,
}: {
  content: SearchContent;
  onQueryChange: (query: string) => void;
  query: string;
}) {
  return (
    <form action="/search" className="grid gap-3 pr-10 sm:grid-cols-[1fr_auto]">
      <div className="relative min-w-0">
        <Search
          className="absolute top-1/2 left-4 size-4 -translate-y-1/2 stroke-icon text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          autoFocus
          type="search"
          name="q"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={content.dialogPlaceholder}
          className="h-12 rounded-none border-border bg-background pr-4 pl-11"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 rounded-none px-5 sm:min-w-28"
      >
        {content.action}
      </Button>
    </form>
  );
}

function SearchCategoryLinks({
  categories,
  content,
}: {
  categories: StorefrontProductCategory[];
  content: SearchContent;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <aside className="min-w-0">
      <p className="text-muted-foreground text-sm">{content.editsLabel}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.handle}`}
            prefetch={false}
            className="shrink-0 border border-border px-3 py-2 text-sm transition hover:border-foreground lg:w-full"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

function SearchProductResults({
  content,
  products,
}: {
  content: SearchContent;
  products: StorefrontProduct[];
}) {
  if (products.length === 0) {
    return <SearchEmptyState content={content} />;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {products.map((product, index) => (
        <SearchProductResult
          key={product.id}
          product={product}
          eager={index === 0}
        />
      ))}
    </div>
  );
}

function SearchProductResult({
  eager,
  product,
}: {
  eager: boolean;
  product: StorefrontProduct;
}) {
  const content = siteContent.search;

  return (
    <Link
      href={product.href}
      prefetch={false}
      className="group grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-3 border border-border p-2 transition hover:border-foreground"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={`${product.name} ${content.imageAltSuffix}`}
          fill
          preload={eager}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          sizes="72px"
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 self-center py-1">
        <p className="truncate font-medium text-sm">{product.name}</p>
        {product.note ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {product.note}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-medium">{product.price}</p>
      </div>
    </Link>
  );
}

function SearchEmptyState({ content }: { content: SearchContent }) {
  return (
    <div className="mt-4 border border-border px-4 py-6">
      <p className="font-medium text-sm">{content.emptyTitle}</p>
      <p className="mt-1 text-muted-foreground text-sm">
        {content.emptyDescription}
      </p>
      <Link
        href="/shop"
        prefetch={false}
        className="mt-4 inline-flex text-sm underline-offset-4 hover:underline"
      >
        {content.browseAction}
      </Link>
    </div>
  );
}
