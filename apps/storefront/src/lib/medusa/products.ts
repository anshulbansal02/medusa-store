type MedusaImage = {
  url?: string;
};

type MedusaPrice = {
  amount?: number;
  currency_code?: string;
};

type MedusaVariant = {
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

export type HomeProduct = {
  id: string;
  name: string;
  href: string;
  price: string;
  note: string;
  image: string;
};

const medusaBackendUrl =
  process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const medusaPublishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

function isConfigured(value: string | undefined): value is string {
  return typeof value === "string" && !value.includes("replace_me");
}

function getMedusaConfig() {
  const backendUrl = medusaBackendUrl;
  const publishableKey = medusaPublishableKey;

  if (!isConfigured(backendUrl) || !isConfigured(publishableKey)) {
    return null;
  }

  return { backendUrl, publishableKey };
}

function getProductImage(product: MedusaProduct) {
  return product.thumbnail ?? product.images?.find((image) => image.url)?.url;
}

function getProductPrice(product: MedusaProduct) {
  const variant = product.variants?.[0];
  const price = variant?.prices?.[0];
  const amount = price?.amount;
  const currencyCode = price?.currency_code;

  if (typeof amount !== "number" || !currencyCode) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

function toHomeProduct(product: MedusaProduct): HomeProduct | null {
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

export async function getHomeProducts(limit = 4): Promise<HomeProduct[]> {
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
      data.products?.reduce<HomeProduct[]>((result, product) => {
        const homeProduct = toHomeProduct(product);

        if (homeProduct) {
          result.push(homeProduct);
        }

        return result;
      }, []) ?? [];

    return products.slice(0, limit);
  } catch {
    return [];
  }
}
