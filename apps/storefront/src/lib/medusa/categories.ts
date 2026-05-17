import { medusaFetch } from "@/lib/medusa/client";

export type MedusaProductCategory = {
  id: string;
  name: string;
  handle?: string;
  description?: string | null;
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toStorefrontProductCategory(
  category: MedusaProductCategory,
): StorefrontProductCategory {
  return {
    id: category.id,
    name: category.name,
    handle: category.handle ?? slugify(category.name),
    description: category.description ?? "",
  };
}

export async function getProductCategories(
  limit = 12,
): Promise<StorefrontProductCategory[]> {
  const searchParams = new URLSearchParams({
    limit: String(limit),
  });
  const data = await medusaFetch<MedusaProductCategoriesResponse>(
    `/store/product-categories?${searchParams.toString()}`,
    { cache: "no-store" },
  );

  return (
    data?.product_categories?.map((category) =>
      toStorefrontProductCategory(category),
    ) ?? []
  );
}

export async function getCategoryByHandle(
  handle: string,
): Promise<StorefrontProductCategory | null> {
  const searchParams = new URLSearchParams({
    handle,
    limit: "1",
  });

  const data = await medusaFetch<MedusaProductCategoriesResponse>(
    `/store/product-categories?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const category = data?.product_categories?.[0];

  return category ? toStorefrontProductCategory(category) : null;
}
