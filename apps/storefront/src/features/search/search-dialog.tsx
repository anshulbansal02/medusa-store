"use client";

import { Search } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
        className="top-4 max-w-3xl translate-y-0 gap-0 rounded-none border border-border bg-background p-0 sm:top-6 sm:max-w-3xl"
        showCloseButton
      >
        <div className="border-border border-b px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <DialogTitle className="sr-only">{content.dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {content.dialogDescription}
          </DialogDescription>
          <SearchDialogForm
            content={content}
            query={query}
            onQueryChange={setQuery}
          />
        </div>

        <div className="max-h-[min(72svh,680px)] overflow-y-auto px-4 py-4 sm:px-5">
          <SearchCategoryLinks categories={categoryResults} content={content} />

          <div className={cn(categoryResults.length > 0 && "mt-6")}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                {normalizedQuery ? content.matchingLabel : content.latestLabel}
              </p>
              {normalizedQuery ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  prefetch={false}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  {content.viewAllAction}
                </Link>
              ) : null}
            </div>

            <SearchProductResults content={content} products={productResults} />
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
    <form action="/search" className="flex gap-2 pr-10">
      <Input
        autoFocus
        type="search"
        name="q"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        placeholder={content.dialogPlaceholder}
        className="h-12 rounded-none border-border bg-background px-4"
      />
      <Button type="submit" size="lg" className="h-12 rounded-none px-5">
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
    <div>
      <p className="text-muted-foreground text-sm">{content.editsLabel}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.handle}`}
            prefetch={false}
            className="border border-border px-3 py-2 text-sm transition hover:border-foreground"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
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
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <SearchProductResult key={product.id} product={product} />
      ))}
    </div>
  );
}

function SearchProductResult({ product }: { product: StorefrontProduct }) {
  return (
    <Link
      href={product.href}
      prefetch={false}
      className="group grid grid-cols-[72px_1fr] gap-3 border border-transparent p-1 transition hover:border-border"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={`${product.name} styled on a model`}
          fill
          sizes="72px"
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 py-1">
        <p className="truncate font-medium text-sm">{product.name}</p>
        {product.note ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {product.note}
          </p>
        ) : null}
        <p className="mt-2 text-sm">{product.price}</p>
      </div>
    </Link>
  );
}

function SearchEmptyState({ content }: { content: SearchContent }) {
  return (
    <div className="mt-3 border border-border px-4 py-6">
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
