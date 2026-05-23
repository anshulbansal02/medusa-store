import { toStorefrontProductCategory } from "@/lib/medusa/categories";
import { formatStorePrice } from "@/lib/medusa/client";
import type {
  MedusaMetadata,
  MedusaProduct,
  MedusaVariant,
  ProductDetail,
  ProductDetailSection,
  ProductDetailVariant,
  ProductSizeChartColumn,
  ProductSizeChartRow,
  StorefrontProduct,
} from "@/lib/medusa/product-types";

type StorefrontPrice = {
  formatted: string | null;
  amount: number | null;
  currencyCode: string;
};

const sizeRank = new Map(
  ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "ONE SIZE"].map(
    (size, index) => [size, index],
  ),
);

function getProductImage(product: MedusaProduct) {
  return product.thumbnail ?? product.images?.find((image) => image.url)?.url;
}

function getProductPrice(product: MedusaProduct) {
  return getVariantPriceInfo(product.variants?.[0]).formatted;
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

export function toStorefrontProduct(
  product: MedusaProduct,
): StorefrontProduct | null {
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

export function toProductDetail(product: MedusaProduct): ProductDetail | null {
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
