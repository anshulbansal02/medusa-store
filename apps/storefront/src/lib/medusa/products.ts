import "server-only";

import { getCategoryByHandle } from "@/lib/medusa/categories";
import { medusaFetch } from "@/lib/medusa/client";
import {
  toProductDetail,
  toStorefrontProduct,
} from "@/lib/medusa/product-mappers";
import type {
  MedusaProductsResponse,
  ProductDetail,
  StorefrontProduct,
} from "@/lib/medusa/product-types";
import { getDefaultRegionId } from "@/lib/medusa/regions";

export type {
  ProductDetail,
  ProductDetailSection,
  ProductDetailVariant,
  ProductSizeChart,
  ProductSizeChartColumn,
  ProductSizeChartRow,
  StorefrontProduct,
} from "@/lib/medusa/product-types";

const productListFields = [
  "*variants.calculated_price",
  "id",
  "title",
  "handle",
  "description",
  "thumbnail",
  "*images",
  "*categories",
  "*variants",
].join(",");

const productDetailFields = [
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
].join(",");

function buildProductsPath(searchParams: URLSearchParams) {
  return `/store/products?${searchParams.toString()}`;
}

async function fetchProducts(searchParams: URLSearchParams) {
  return medusaFetch<MedusaProductsResponse>(buildProductsPath(searchParams), {
    cache: "no-store",
  });
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
  searchParams.set("fields", productListFields);

  const data = await fetchProducts(searchParams);
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
  searchParams.set("fields", productDetailFields);

  const data = await fetchProducts(searchParams);
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
