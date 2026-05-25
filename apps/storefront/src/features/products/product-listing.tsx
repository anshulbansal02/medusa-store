import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { siteContent } from "@/content/site-content";
import { ProductGrid } from "@/features/products/product-grid";
import { ProductListingFilters } from "@/features/products/product-listing-filters";
import { ProductListingLayout } from "@/features/products/product-listing-layout";
import {
  buildProductListingHref,
  filterProductListingProducts,
  getProductListingAppliedFilters,
  getProductListingSizes,
  getProductListingValues,
  type ProductListingFilterKey,
  type ProductListingSearchParams,
  productListingPriceFilterValues,
  productListingSortValues,
  sortProductListingProducts,
} from "@/features/products/product-listing-utils";
import type { StorefrontProductCategory } from "@/lib/medusa/categories";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

const content = siteContent.productListing;

const priceOptions = [
  {
    value: productListingPriceFilterValues[0],
    label: content.priceOptions.under5000,
  },
  {
    value: productListingPriceFilterValues[1],
    label: content.priceOptions.from5000To7500,
  },
  {
    value: productListingPriceFilterValues[2],
    label: content.priceOptions.from7500,
  },
];

const sortOptions = [
  { value: productListingSortValues[0], label: content.sortOptions.newest },
  { value: productListingSortValues[1], label: content.sortOptions.priceAsc },
  { value: productListingSortValues[2], label: content.sortOptions.priceDesc },
];

export type { ProductListingSearchParams };

type ProductListingProps = {
  actionPath: string;
  activeCategoryHref?: string;
  beforeControls?: ReactNode;
  categories: StorefrontProductCategory[];
  categoryMode?: "path" | "query";
  description: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  hiddenParams?: Pick<ProductListingSearchParams, "q">;
  products: StorefrontProduct[];
  searchParams?: ProductListingSearchParams;
  title: string;
};

function getAppliedFilterLabel(key: ProductListingFilterKey) {
  if (key === "size") {
    return content.appliedFilterLabels.size;
  }

  if (key === "color") {
    return content.appliedFilterLabels.color;
  }

  if (key === "price") {
    return content.appliedFilterLabels.price;
  }

  if (key === "sort") {
    return content.appliedFilterLabels.sort;
  }

  return key;
}

function getAppliedFilterValue(key: ProductListingFilterKey, value: string) {
  if (key === "price") {
    return priceOptions.find((price) => price.value === value)?.label ?? value;
  }

  if (key === "sort") {
    return sortOptions.find((option) => option.value === value)?.label ?? value;
  }

  return value;
}

export function ProductListing({
  actionPath,
  activeCategoryHref = "/shop",
  beforeControls,
  categories,
  categoryMode = "path",
  description,
  emptyActionHref,
  emptyActionLabel,
  emptyDescription,
  emptyTitle,
  eyebrow,
  hiddenParams,
  products,
  searchParams,
  title,
}: ProductListingProps) {
  const sizes = getProductListingSizes(products);
  const colors = getProductListingValues(products, (product) => product.colors);
  const filteredProducts = sortProductListingProducts(
    filterProductListingProducts(products, searchParams),
    searchParams,
  );
  const appliedFilters = getProductListingAppliedFilters(searchParams);
  const activeCategory = categories.find((category) =>
    categoryMode === "query"
      ? category.handle === searchParams?.category
      : `/shop/${category.handle}` === activeCategoryHref,
  );
  const activeCategoryValue =
    categoryMode === "query"
      ? buildProductListingHref(actionPath, searchParams, {
          category: searchParams?.category ?? null,
        })
      : activeCategoryHref;
  const activeCategoryFilter =
    activeCategory &&
    (categoryMode === "query" || activeCategoryHref !== "/shop")
      ? {
          href:
            categoryMode === "query"
              ? buildProductListingHref(actionPath, searchParams, {
                  category: null,
                })
              : buildProductListingHref("/shop", searchParams, {}),
          label: activeCategory.name,
        }
      : null;
  const activeFilterCount =
    appliedFilters.length + (activeCategoryFilter ? 1 : 0);
  const clearFiltersHref = hiddenParams?.q
    ? buildProductListingHref(actionPath, hiddenParams, {})
    : categoryMode === "path"
      ? "/shop"
      : actionPath;
  const categoryLinks = [
    {
      href:
        categoryMode === "query"
          ? buildProductListingHref(actionPath, searchParams, {
              category: null,
            })
          : "/shop",
      label: content.allCategoryLabel,
    },
    ...categories.map((category) => ({
      href:
        categoryMode === "query"
          ? buildProductListingHref(actionPath, searchParams, {
              category: category.handle,
            })
          : `/shop/${category.handle}`,
      label: category.name,
    })),
  ];

  return (
    <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-7 border-border border-b pb-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-muted-foreground text-sm">{eyebrow}</p>
            <h1 className="mt-3 max-w-3xl font-heading text-5xl leading-none sm:text-7xl">
              {title}
            </h1>
          </div>
          <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
            {description}
          </p>
        </div>

        <div className="grid gap-5 py-5">
          {beforeControls}
          <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden border-border border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
            <nav
              aria-label={content.categoryNavigationLabel}
              className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto"
            >
              {categoryLinks.map((item) => {
                const active = item.href === activeCategoryValue;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 border px-4 py-2 text-sm transition",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <p className="text-muted-foreground text-sm">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? content.countSingular
                : content.countPlural}
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <fieldset className="flex flex-wrap items-center gap-2 text-sm">
              <legend className="sr-only">
                {content.selectedFiltersLabel}
              </legend>
              {activeCategoryFilter ? (
                <Link
                  href={activeCategoryFilter.href}
                  className="nf-reveal-soft inline-flex items-center gap-2 border border-border px-3 py-1.5 text-muted-foreground transition hover:border-foreground hover:text-foreground"
                >
                  <span>{activeCategoryFilter.label}</span>
                  <X className="size-3 stroke-icon" aria-hidden="true" />
                </Link>
              ) : null}
              {appliedFilters.map((filter) => (
                <Link
                  key={filter.key}
                  href={buildProductListingHref(actionPath, searchParams, {
                    [filter.key]: null,
                  })}
                  className="nf-reveal-soft inline-flex items-center gap-2 border border-border px-3 py-1.5 text-muted-foreground transition hover:border-foreground hover:text-foreground"
                >
                  <span>
                    {getAppliedFilterLabel(filter.key)}:{" "}
                    {getAppliedFilterValue(filter.key, filter.value)}
                  </span>
                  <X className="size-3 stroke-icon" aria-hidden="true" />
                </Link>
              ))}
              <Link
                href={clearFiltersHref}
                className="px-2 py-1.5 underline-offset-4 hover:underline"
              >
                {content.clearFiltersLabel}
              </Link>
            </fieldset>
          ) : null}
        </div>

        <ProductListingLayout
          activeFilterCount={activeFilterCount}
          desktopFilters={
            <ProductListingFilters
              actionPath={actionPath}
              clearHref={clearFiltersHref}
              colors={colors}
              priceOptions={priceOptions}
              searchParams={searchParams}
              sizes={sizes}
              sortOptions={sortOptions}
            />
          }
          mobileFilters={
            <ProductListingFilters
              actionPath={actionPath}
              clearHref={clearFiltersHref}
              colors={colors}
              priceOptions={priceOptions}
              searchParams={searchParams}
              sizes={sizes}
              sortOptions={sortOptions}
            />
          }
        >
          <div className="pt-3">
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                prioritizeInitialImages
              />
            ) : (
              <div className="border border-border px-5 py-8 sm:px-8">
                <h2 className="text-base font-medium">{emptyTitle}</h2>
                <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                  {emptyDescription}
                </p>
                {emptyActionHref && emptyActionLabel ? (
                  <Link
                    href={emptyActionHref}
                    className="mt-5 inline-flex text-sm underline-offset-4 hover:underline"
                  >
                    {emptyActionLabel}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </ProductListingLayout>
      </div>
    </section>
  );
}
