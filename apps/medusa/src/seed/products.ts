import { ProductStatus } from "@medusajs/framework/utils";

import {
  seedCatalog,
  seedProductSizeOptions,
  standardDressSizeChart,
} from "./catalog";

type SeedProductInput = {
  categoryIds: Map<string, string>;
  defaultSalesChannelId: string;
  shippingProfileId: string;
};

function makeSizeVariants({
  baseSku,
  color,
  price,
}: {
  baseSku: string;
  color: string;
  price: number;
}) {
  return seedProductSizeOptions.map((size) => ({
    title: `${size} / ${color}`,
    sku: `${baseSku}-${size}`,
    options: {
      Size: size,
      Color: color,
    },
    prices: [
      {
        amount: price,
        currency_code: "inr",
      },
    ],
  }));
}

function getCategoryId(categoryIds: Map<string, string>, name: string) {
  const id = categoryIds.get(name);

  if (!id) {
    throw new Error(`Missing seeded category: ${name}`);
  }

  return id;
}

export function createSeedProducts({
  categoryIds,
  defaultSalesChannelId,
  shippingProfileId,
}: SeedProductInput) {
  return seedCatalog.map((product) => ({
    title: product.title,
    category_ids: [getCategoryId(categoryIds, product.category)],
    description: product.description,
    handle: product.handle,
    metadata: {
      product_details: product.details,
      size_chart: standardDressSizeChart,
    },
    weight: product.weight,
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: shippingProfileId,
    images: product.images.map((url) => ({ url })),
    options: [
      {
        title: "Size",
        values: seedProductSizeOptions,
      },
      {
        title: "Color",
        values: [product.color],
      },
    ],
    variants: makeSizeVariants({
      baseSku: product.sku,
      color: product.color,
      price: product.price,
    }),
    sales_channels: [
      {
        id: defaultSalesChannelId,
      },
    ],
  }));
}
