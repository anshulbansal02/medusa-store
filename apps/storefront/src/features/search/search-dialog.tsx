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
import type { StorefrontProductCategory } from "@/lib/medusa/categories";
import type { StorefrontProduct } from "@/lib/medusa/products";

type SearchDialogProps = {
  products: StorefrontProduct[];
  categories: StorefrontProductCategory[];
};

const maxVisibleProducts = 6;

export function SearchDialog({ products, categories }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const productResults = normalizedQuery
    ? products
        .filter((product) =>
          [
            product.name,
            product.note,
            ...product.categories.map((category) => category.name),
          ].some((value) => value.toLowerCase().includes(normalizedQuery)),
        )
        .slice(0, maxVisibleProducts)
    : products.slice(0, maxVisibleProducts);
  const categoryResults = normalizedQuery
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      )
    : categories.slice(0, 5);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Search"
            className="rounded-none text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Search className="size-4 stroke-[1.6]" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent
        className="top-4 max-w-3xl translate-y-0 gap-0 rounded-none border border-border bg-background p-0 sm:top-6 sm:max-w-3xl"
        showCloseButton
      >
        <div className="border-border border-b px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <DialogDescription className="sr-only">
            Search product names, categories, colors, and product notes.
          </DialogDescription>
          <form action="/search" className="flex gap-2 pr-10">
            <Input
              autoFocus
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search dresses, co-ords, colors"
              className="h-12 rounded-none border-border bg-background px-4"
            />
            <Button type="submit" size="lg" className="h-12 rounded-none px-5">
              Search
            </Button>
          </form>
        </div>

        <div className="max-h-[min(72svh,680px)] overflow-y-auto px-4 py-4 sm:px-5">
          {categoryResults.length > 0 ? (
            <div>
              <p className="text-muted-foreground text-sm">Edits</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryResults.map((category) => (
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
          ) : null}

          <div className={categoryResults.length > 0 ? "mt-6" : ""}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                {normalizedQuery ? "Matching styles" : "Latest styles"}
              </p>
              {normalizedQuery ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  prefetch={false}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  View all
                </Link>
              ) : null}
            </div>

            {productResults.length > 0 ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {productResults.map((product) => (
                  <Link
                    key={product.id}
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
                      <p className="truncate font-medium text-sm">
                        {product.name}
                      </p>
                      {product.note ? (
                        <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                          {product.note}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm">{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3 border border-border px-4 py-6">
                <p className="font-medium text-sm">No styles found.</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Try a broader search or browse the current edit.
                </p>
                <Link
                  href="/shop"
                  prefetch={false}
                  className="mt-4 inline-flex text-sm underline-offset-4 hover:underline"
                >
                  Browse shop
                </Link>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
