import type { StorefrontProduct } from "@/lib/medusa/products";

export const productListingPriceFilterValues = [
  "under-5000",
  "5000-7500",
  "7500-plus",
] as const;

export const productListingSortValues = [
  "newest",
  "price-asc",
  "price-desc",
] as const;

export type ProductListingPriceFilter =
  (typeof productListingPriceFilterValues)[number];

export type ProductListingSort = (typeof productListingSortValues)[number];

export type ProductListingSearchParams = {
  category?: string;
  color?: string;
  price?: string;
  q?: string;
  size?: string;
  sort?: string;
};

export type ProductListingFilterKey = Exclude<
  keyof ProductListingSearchParams,
  "category" | "q"
>;

export type ProductListingAppliedFilter = {
  key: ProductListingFilterKey;
  value: string;
};

const sizeRank = new Map(
  ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "ONE SIZE"].map(
    (size, index) => [size, index],
  ),
);

function getSelectedValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function getSizeRank(size: string) {
  return sizeRank.get(size.trim().toUpperCase()) ?? sizeRank.size;
}

function getProductPriceAmount(product: StorefrontProduct) {
  return product.priceAmount ?? Number.POSITIVE_INFINITY;
}

function isPriceFilter(value: string): value is ProductListingPriceFilter {
  return productListingPriceFilterValues.includes(
    value as ProductListingPriceFilter,
  );
}

function productMatchesPrice(product: StorefrontProduct, price: string) {
  const amount = product.priceAmount;

  if (amount === null || !isPriceFilter(price)) {
    return false;
  }

  if (price === "under-5000") {
    return amount < 5000;
  }

  if (price === "5000-7500") {
    return amount >= 5000 && amount <= 7500;
  }

  return amount > 7500;
}

export function filterProductListingProducts(
  products: StorefrontProduct[],
  searchParams: ProductListingSearchParams | undefined,
) {
  const selectedSize = getSelectedValue(searchParams?.size);
  const selectedCategory = getSelectedValue(searchParams?.category);
  const selectedColor = getSelectedValue(searchParams?.color);
  const selectedPrice = getSelectedValue(searchParams?.price);

  return products.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.categories.some(
          (category) => category.handle === selectedCategory,
        )
      : true;
    const matchesSize = selectedSize
      ? product.sizes.some((size) => size === selectedSize)
      : true;
    const matchesColor = selectedColor
      ? product.colors.some((color) => color === selectedColor)
      : true;
    const matchesPrice = selectedPrice
      ? productMatchesPrice(product, selectedPrice)
      : true;

    return matchesCategory && matchesSize && matchesColor && matchesPrice;
  });
}

export function sortProductListingProducts(
  products: StorefrontProduct[],
  searchParams: ProductListingSearchParams | undefined,
) {
  const sort = getSelectedValue(searchParams?.sort) ?? "newest";

  if (sort === "price-asc") {
    return [...products].sort(
      (first, second) =>
        getProductPriceAmount(first) - getProductPriceAmount(second),
    );
  }

  if (sort === "price-desc") {
    return [...products].sort(
      (first, second) =>
        getProductPriceAmount(second) - getProductPriceAmount(first),
    );
  }

  return products;
}

export function getProductListingValues(
  products: StorefrontProduct[],
  getValues: (product: StorefrontProduct) => string[],
) {
  return Array.from(new Set(products.flatMap(getValues))).sort(
    (first, second) => first.localeCompare(second),
  );
}

export function getProductListingSizes(products: StorefrontProduct[]) {
  return Array.from(new Set(products.flatMap((product) => product.sizes))).sort(
    (first, second) => {
      const rankDifference = getSizeRank(first) - getSizeRank(second);

      return rankDifference || first.localeCompare(second);
    },
  );
}

export function buildProductListingHref(
  actionPath: string,
  searchParams: ProductListingSearchParams | undefined,
  updates: Partial<Record<keyof ProductListingSearchParams, string | null>>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }

  const query = params.toString();

  return query ? `${actionPath}?${query}` : actionPath;
}

export function getProductListingAppliedFilters(
  searchParams: ProductListingSearchParams | undefined,
) {
  const filters: ProductListingAppliedFilter[] = [];
  const selectedSize = getSelectedValue(searchParams?.size);
  const selectedColor = getSelectedValue(searchParams?.color);
  const selectedPrice = getSelectedValue(searchParams?.price);
  const selectedSort = getSelectedValue(searchParams?.sort);

  if (selectedSize) {
    filters.push({ key: "size", value: selectedSize });
  }

  if (selectedColor) {
    filters.push({ key: "color", value: selectedColor });
  }

  if (selectedPrice) {
    filters.push({ key: "price", value: selectedPrice });
  }

  if (selectedSort && selectedSort !== "newest") {
    filters.push({ key: "sort", value: selectedSort });
  }

  return filters;
}
