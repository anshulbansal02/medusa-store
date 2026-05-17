import {
  getCategoryByHandle,
  type MedusaProductCategory,
  type StorefrontProductCategory,
  toStorefrontProductCategory,
} from "@/lib/medusa/categories";
import { formatStorePrice, medusaFetch } from "@/lib/medusa/client";
import { getDefaultRegionId } from "@/lib/medusa/regions";

type MedusaImage = {
  url?: string;
};

type MedusaPrice = {
  calculated_amount?: number;
  currency_code?: string;
};

type StorefrontPrice = {
  formatted: string | null;
  amount: number | null;
  currencyCode: string;
};

type MedusaLegacyPrice = {
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
  calculated_price?: MedusaPrice | null;
  prices?: MedusaLegacyPrice[];
};

type MedusaMetadata = Record<string, unknown>;

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
  priceAmount: number | null;
  currencyCode: string;
  images: string[];
  variants: ProductDetailVariant[];
  color: string;
  categories: StorefrontProductCategory[];
  detailSections: ProductDetailSection[];
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

export type ProductDetailSection = {
  key: string;
  title: string;
  text: string;
};

function getProductImage(product: MedusaProduct) {
  return product.thumbnail ?? product.images?.find((image) => image.url)?.url;
}

function getProductPrice(product: MedusaProduct) {
  const variant = product.variants?.[0];
  return getVariantPriceInfo(variant).formatted;
}

function getVariantPriceInfo(variant: MedusaVariant | undefined) {
  const price = variant?.calculated_price;
  const amount = price?.calculated_amount ?? variant?.prices?.[0]?.amount;
  const currencyCode =
    price?.currency_code ?? variant?.prices?.[0]?.currency_code;

  return {
    formatted: formatStorePrice(amount, currencyCode),
    amount: typeof amount === "number" ? amount : null,
    currencyCode: currencyCode ?? "",
  } satisfies StorefrontPrice;
}

function getVariantPrice(variant: MedusaVariant | undefined) {
  return getVariantPriceInfo(variant).formatted;
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

function toProductDetailSections(
  metadata: MedusaMetadata | null | undefined,
): ProductDetailSection[] {
  const details =
    isRecord(metadata?.product_details) || isRecord(metadata?.details)
      ? (metadata.product_details ?? metadata.details)
      : null;

  if (!isRecord(details)) {
    return [];
  }

  const customSections = Array.isArray(details.sections)
    ? details.sections
        .map((section) => {
          if (!isRecord(section)) {
            return null;
          }

          const title = readText(section.title);
          const text = readText(section.text);
          const key = readText(section.key) || slugifyDetailTitle(title);

          if (!key || !title || !text) {
            return null;
          }

          return { key, title, text };
        })
        .filter((section): section is ProductDetailSection => Boolean(section))
    : [];

  if (customSections.length > 0) {
    return customSections;
  }

  return [
    { key: "fabric", title: "Fabric", text: readText(details.fabric) },
    { key: "fit", title: "Fit", text: readText(details.fit) },
    { key: "care", title: "Care", text: readText(details.care) },
    { key: "model", title: "Model", text: readText(details.model) },
    {
      key: "measurements",
      title: "Measurements",
      text: readText(details.measurements),
    },
  ].filter((section) => section.text);
}

function slugifyDetailTitle(title: string) {
  return title
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
      product.categories?.map((category) =>
        toStorefrontProductCategory(category),
      ) ?? [],
  };
}

function toProductDetail(product: MedusaProduct): ProductDetail | null {
  const images = getProductImages(product);
  const price = getVariantPriceInfo(product.variants?.[0]);

  if (!product.handle || !price.formatted || images.length === 0) {
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
    price: price.formatted,
    priceAmount: price.amount,
    currencyCode: price.currencyCode,
    images,
    variants,
    color: variants.find((variant) => variant.color)?.color ?? "",
    categories:
      product.categories?.map((category) =>
        toStorefrontProductCategory(category),
      ) ?? [],
    detailSections: toProductDetailSections(product.metadata),
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
  const regionId = await getDefaultRegionId();

  if (!regionId) {
    return [];
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    order: "-created_at",
    region_id: regionId,
  });
  if (categoryId) {
    searchParams.set("category_id", categoryId);
  }
  searchParams.set(
    "fields",
    [
      "*variants.calculated_price",
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "*images",
      "*categories",
      "*variants",
    ].join(","),
  );

  const data = await medusaFetch<MedusaProductsResponse>(
    `/store/products?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const products =
    data?.products?.reduce<StorefrontProduct[]>((result, product) => {
      const storefrontProduct = toStorefrontProduct(product);

      if (storefrontProduct) {
        result.push(storefrontProduct);
      }

      return result;
    }, []) ?? [];

  return products.slice(0, limit);
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
  const regionId = await getDefaultRegionId();

  if (!regionId) {
    return null;
  }

  const searchParams = new URLSearchParams({
    handle,
    limit: "1",
    region_id: regionId,
  });
  searchParams.set(
    "fields",
    [
      "*variants.calculated_price",
      "id",
      "title",
      "handle",
      "description",
      "metadata",
      "thumbnail",
      "*options",
      "*images",
      "*categories",
      "*variants",
      "*variants.options",
    ].join(","),
  );

  const data = await medusaFetch<MedusaProductsResponse>(
    `/store/products?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const product = data?.products?.[0];

  return product ? toProductDetail(product) : null;
}

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4,
): Promise<StorefrontProduct[]> {
  const categoryId = product.categories[0]?.id;
  const categoryProducts = categoryId
    ? await getProducts({
        categoryId,
        limit: limit + 1,
      })
    : [];
  const relatedProducts = categoryProducts
    .filter((relatedProduct) => relatedProduct.id !== product.id)
    .slice(0, limit);

  if (relatedProducts.length >= limit) {
    return relatedProducts;
  }

  const latestProducts = await getProducts({ limit: limit + 1 });
  const existingIds = new Set([
    product.id,
    ...relatedProducts.map((relatedProduct) => relatedProduct.id),
  ]);
  const fallbackProducts = latestProducts.filter(
    (latestProduct) => !existingIds.has(latestProduct.id),
  );

  return [...relatedProducts, ...fallbackProducts].slice(0, limit);
}
