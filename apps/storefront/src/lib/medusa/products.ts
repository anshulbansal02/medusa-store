import { formatStorePrice, getMedusaConfig } from "@/lib/medusa/client";

type MedusaImage = {
  url?: string;
};

type MedusaPrice = {
  amount?: number;
  currency_code?: string;
};

type MedusaVariantOption = {
  value?: string;
  option?: {
    title?: string;
  };
};

type MedusaVariant = {
  id?: string;
  title?: string;
  options?: MedusaVariantOption[];
  prices?: MedusaPrice[];
};

type MedusaMetadata = Record<string, unknown>;

type MedusaProductCategory = {
  id: string;
  name: string;
  handle?: string;
  description?: string | null;
};

type MedusaProduct = {
  id: string;
  title: string;
  handle?: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[];
  variants?: MedusaVariant[];
  categories?: MedusaProductCategory[];
  metadata?: MedusaMetadata | null;
};

type MedusaProductsResponse = {
  products?: MedusaProduct[];
};

type MedusaProductCategoriesResponse = {
  product_categories?: MedusaProductCategory[];
};

export type StorefrontProductCategory = {
  id: string;
  name: string;
  handle: string;
  description: string;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  href: string;
  price: string;
  note: string;
  image: string;
  categories: StorefrontProductCategory[];
};

export type ProductDetail = {
  id: string;
  name: string;
  handle: string;
  description: string;
  price: string;
  images: string[];
  variants: ProductDetailVariant[];
  color: string;
  sizeChart: ProductSizeChart | null;
};

export type ProductDetailVariant = {
  id: string;
  title: string;
  size: string;
  color: string;
  price: string;
};

export type ProductSizeChartColumn = {
  key: string;
  label: string;
};

export type ProductSizeChartRow = {
  size: string;
  values: Record<string, string>;
};

export type ProductSizeChart = {
  unit: string;
  note: string;
  columns: ProductSizeChartColumn[];
  rows: ProductSizeChartRow[];
};

function getProductImage(product: MedusaProduct) {
  return product.thumbnail ?? product.images?.find((image) => image.url)?.url;
}

function getProductPrice(product: MedusaProduct) {
  const variant = product.variants?.[0];
  return getVariantPrice(variant);
}

function getVariantPrice(variant: MedusaVariant | undefined) {
  const price = variant?.prices?.[0];
  const amount = price?.amount;
  const currencyCode = price?.currency_code;

  return formatStorePrice(amount, currencyCode);
}

function getVariantOption(variant: MedusaVariant, optionTitle: string) {
  return variant.options?.find(
    (option) => option.option?.title?.toLowerCase() === optionTitle,
  )?.value;
}

const sizeRank = new Map(
  ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "ONE SIZE"].map(
    (size, index) => [size, index],
  ),
);

function getSizeRank(size: string) {
  return sizeRank.get(size.trim().toUpperCase()) ?? sizeRank.size;
}

function getProductImages(product: MedusaProduct) {
  const images = [
    product.thumbnail,
    ...(product.images?.map((image) => image.url) ?? []),
  ].filter((image): image is string => Boolean(image));

  return Array.from(new Set(images));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function toSizeChart(metadata: MedusaMetadata | null | undefined) {
  if (!isRecord(metadata?.size_chart)) {
    return null;
  }

  const sizeChart = metadata.size_chart;
  const columnsValue = sizeChart.columns;
  const rowsValue = sizeChart.rows;

  if (!Array.isArray(columnsValue) || !Array.isArray(rowsValue)) {
    return null;
  }

  const columns = columnsValue
    .map((column) => {
      if (!isRecord(column)) {
        return null;
      }

      const key = readText(column.key);
      const label = readText(column.label);

      if (!key || !label) {
        return null;
      }

      return { key, label };
    })
    .filter((column): column is ProductSizeChartColumn => Boolean(column));

  if (columns.length === 0) {
    return null;
  }

  const rows = rowsValue
    .map((row) => {
      if (!isRecord(row) || !isRecord(row.values)) {
        return null;
      }

      const rowValues = row.values;
      const size = readText(row.size);

      if (!size) {
        return null;
      }

      const values = columns.reduce<Record<string, string>>(
        (result, column) => {
          result[column.key] = readText(rowValues[column.key]);

          return result;
        },
        {},
      );

      if (!Object.values(values).some(Boolean)) {
        return null;
      }

      return { size, values };
    })
    .filter((row): row is ProductSizeChartRow => Boolean(row));

  if (rows.length === 0) {
    return null;
  }

  return {
    unit: readText(sizeChart.unit),
    note: readText(sizeChart.note),
    columns,
    rows,
  };
}

function toCategory(
  category: MedusaProductCategory,
): StorefrontProductCategory {
  return {
    id: category.id,
    name: category.name,
    handle: category.handle ?? slugify(category.name),
    description: category.description ?? "",
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toStorefrontProduct(product: MedusaProduct): StorefrontProduct | null {
  const image = getProductImage(product);
  const price = getProductPrice(product);

  if (!image || !price || !product.handle) {
    return null;
  }

  return {
    id: product.id,
    name: product.title,
    href: `/shop/${product.handle}`,
    price,
    note: product.description?.split(".")[0] ?? "",
    image,
    categories:
      product.categories?.map((category) => toCategory(category)) ?? [],
  };
}

function toProductDetail(product: MedusaProduct): ProductDetail | null {
  const images = getProductImages(product);
  const price = getProductPrice(product);

  if (!product.handle || !price || images.length === 0) {
    return null;
  }

  const variants =
    product.variants
      ?.map((variant) => {
        const variantPrice = getVariantPrice(variant);
        const size = getVariantOption(variant, "size");
        const color = getVariantOption(variant, "color");

        if (!variant.id || !variant.title || !variantPrice || !size) {
          return null;
        }

        return {
          id: variant.id,
          title: variant.title,
          size,
          color: color ?? "",
          price: variantPrice,
        };
      })
      .filter((variant): variant is ProductDetailVariant => Boolean(variant))
      .sort((first, second) => {
        const rankDifference =
          getSizeRank(first.size) - getSizeRank(second.size);

        return rankDifference || first.size.localeCompare(second.size);
      }) ?? [];

  return {
    id: product.id,
    name: product.title,
    handle: product.handle,
    description: product.description ?? "",
    price,
    images,
    variants,
    color: variants.find((variant) => variant.color)?.color ?? "",
    sizeChart: toSizeChart(product.metadata),
  };
}

export async function getHomeProducts(limit = 4): Promise<StorefrontProduct[]> {
  return getProducts({ limit });
}

export async function getProducts({
  limit = 24,
  categoryId,
}: {
  limit?: number;
  categoryId?: string;
} = {}): Promise<StorefrontProduct[]> {
  const config = getMedusaConfig();

  if (!config) {
    return [];
  }

  const url = new URL("/store/products", config.backendUrl);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("order", "-created_at");
  if (categoryId) {
    url.searchParams.set("category_id", categoryId);
  }
  url.searchParams.set(
    "fields",
    [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "*images",
      "*categories",
      "*variants",
      "*variants.prices",
    ].join(","),
  );

  try {
    const response = await fetch(url, {
      headers: {
        "x-publishable-api-key": config.publishableKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as MedusaProductsResponse;
    const products =
      data.products?.reduce<StorefrontProduct[]>((result, product) => {
        const storefrontProduct = toStorefrontProduct(product);

        if (storefrontProduct) {
          result.push(storefrontProduct);
        }

        return result;
      }, []) ?? [];

    return products.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getCategoryByHandle(
  handle: string,
): Promise<StorefrontProductCategory | null> {
  const config = getMedusaConfig();

  if (!config) {
    return null;
  }

  const url = new URL("/store/product-categories", config.backendUrl);
  url.searchParams.set("handle", handle);
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: {
        "x-publishable-api-key": config.publishableKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MedusaProductCategoriesResponse;
    const category = data.product_categories?.[0];

    return category ? toCategory(category) : null;
  } catch {
    return null;
  }
}

export async function getProductsByCategoryHandle({
  handle,
  limit = 24,
}: {
  handle: string;
  limit?: number;
}) {
  const category = await getCategoryByHandle(handle);

  if (!category) {
    return {
      category: null,
      products: [],
    };
  }

  return {
    category,
    products: await getProducts({ categoryId: category.id, limit }),
  };
}

export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const config = getMedusaConfig();

  if (!config) {
    return null;
  }

  const url = new URL("/store/products", config.backendUrl);
  url.searchParams.set("handle", handle);
  url.searchParams.set("limit", "1");
  url.searchParams.set(
    "fields",
    [
      "id",
      "title",
      "handle",
      "description",
      "metadata",
      "thumbnail",
      "*options",
      "*images",
      "*variants",
      "*variants.options",
      "*variants.prices",
    ].join(","),
  );

  try {
    const response = await fetch(url, {
      headers: {
        "x-publishable-api-key": config.publishableKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MedusaProductsResponse;
    const product = data.products?.[0];

    return product ? toProductDetail(product) : null;
  } catch {
    return null;
  }
}
