import { toStorefrontProductCategory } from "@/lib/medusa/categories";
import { formatStorePrice } from "@/lib/medusa/client";
import {
  toProductCardTags,
  toProductDetailSections,
  toSizeChart,
} from "@/lib/medusa/product-metadata";
import type {
  MedusaProduct,
  MedusaVariant,
  ProductDetail,
  ProductDetailVariant,
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

function getUniqueProductOptions(product: MedusaProduct, optionTitle: string) {
  const option = product.options?.find(
    (productOption) => productOption.title?.toLowerCase() === optionTitle,
  );

  return Array.from(
    new Set(
      option?.values
        ?.map((value) => value.value?.trim())
        .filter((value): value is string => Boolean(value)) ?? [],
    ),
  );
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

export function toStorefrontProduct(
  product: MedusaProduct,
): StorefrontProduct | null {
  const images = getProductImages(product);
  const image = getProductImage(product) ?? images[0];
  const price = getVariantPriceInfo(product.variants?.[0]);
  const tags = [
    ...toProductCardTags(product.metadata),
    ...(product.variants?.flatMap((variant) =>
      toProductCardTags(variant.metadata),
    ) ?? []),
  ];

  if (!image || !price.formatted || !product.handle) {
    return null;
  }

  return {
    id: product.id,
    name: product.title,
    href: `/shop/${product.handle}`,
    price: price.formatted,
    priceAmount: price.amount,
    currencyCode: price.currencyCode,
    note: product.description?.split(".")[0] ?? "",
    image,
    images,
    tags: Array.from(new Set(tags)).slice(0, 3),
    sizes: getUniqueProductOptions(product, "size").sort((first, second) => {
      const rankDifference = getSizeRank(first) - getSizeRank(second);

      return rankDifference || first.localeCompare(second);
    }),
    colors: getUniqueProductOptions(product, "color").sort((first, second) =>
      first.localeCompare(second),
    ),
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
