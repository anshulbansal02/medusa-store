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

type MedusaProduct = {
  id: string;
  title: string;
  handle?: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[];
  variants?: MedusaVariant[];
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
};

export type ProductDetailVariant = {
  id: string;
  title: string;
  size: string;
  color: string;
  price: string;
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
  };
}

export async function getHomeProducts(limit = 4): Promise<StorefrontProduct[]> {
  return getProducts({ limit });
}

export async function getProducts({
  limit = 24,
}: {
  limit?: number;
} = {}): Promise<StorefrontProduct[]> {
  const config = getMedusaConfig();

  if (!config) {
    return [];
  }

  const url = new URL("/store/products", config.backendUrl);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("order", "-created_at");
  url.searchParams.set(
    "fields",
    [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "*images",
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
