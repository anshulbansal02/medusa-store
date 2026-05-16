import { cookies } from "next/headers";

import { formatStorePrice, medusaFetch } from "@/lib/medusa/client";

const cartCookieName = "the_label_cart_id";

type MedusaRegion = {
  id: string;
};

type MedusaRegionsResponse = {
  regions?: MedusaRegion[];
};

type MedusaCartLineItem = {
  id: string;
  thumbnail?: string | null;
  product_title?: string | null;
  product_handle?: string | null;
  variant_title?: string | null;
  quantity?: number;
  unit_price?: number;
  total?: number;
};

type MedusaCart = {
  id: string;
  currency_code?: string;
  total?: number;
  subtotal?: number;
  items?: MedusaCartLineItem[];
};

type MedusaCartResponse = {
  cart?: MedusaCart;
};

export type CartItem = {
  id: string;
  name: string;
  href: string;
  variant: string;
  quantity: number;
  unitPrice: string;
  total: string;
  image: string | null;
};

export type StorefrontCart = {
  id: string;
  total: string;
  subtotal: string;
  itemCount: number;
  items: CartItem[];
};

function getCartCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function toStorefrontCart(cart: MedusaCart): StorefrontCart {
  const currencyCode = cart.currency_code ?? "inr";
  const items =
    cart.items?.map((item) => {
      const quantity = item.quantity ?? 0;
      const unitAmount = item.unit_price ?? 0;
      const totalAmount = item.total ?? unitAmount * quantity;
      const handle = item.product_handle ?? "";

      return {
        id: item.id,
        name: item.product_title ?? "Product",
        href: handle ? `/shop/${handle}` : "/shop",
        variant: item.variant_title ?? "",
        quantity,
        unitPrice: formatStorePrice(unitAmount, currencyCode) ?? "",
        total: formatStorePrice(totalAmount, currencyCode) ?? "",
        image: item.thumbnail ?? null,
      };
    }) ?? [];

  return {
    id: cart.id,
    total: formatStorePrice(cart.total ?? 0, currencyCode) ?? "",
    subtotal: formatStorePrice(cart.subtotal ?? 0, currencyCode) ?? "",
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    items,
  };
}

async function getCartById(cartId: string) {
  const data = await medusaFetch<MedusaCartResponse>(`/store/carts/${cartId}`, {
    cache: "no-store",
  });

  return data?.cart ? toStorefrontCart(data.cart) : null;
}

async function getDefaultRegionId() {
  const data = await medusaFetch<MedusaRegionsResponse>("/store/regions", {
    cache: "no-store",
  });

  return data?.regions?.[0]?.id ?? null;
}

async function createCart() {
  const regionId = await getDefaultRegionId();

  if (!regionId) {
    throw new Error("Medusa region is not available.");
  }

  const data = await medusaFetch<MedusaCartResponse>("/store/carts", {
    method: "POST",
    body: JSON.stringify({ region_id: regionId }),
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
  });

  if (!data?.cart) {
    throw new Error("Cart could not be created.");
  }

  return toStorefrontCart(data.cart);
}

async function getOrCreateCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(cartCookieName)?.value;

  if (cartId) {
    const cart = await getCartById(cartId);

    if (cart) {
      return cart;
    }
  }

  const cart = await createCart();
  cookieStore.set(cartCookieName, cart.id, getCartCookieOptions());

  return cart;
}

export async function getCurrentCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(cartCookieName)?.value;

  if (!cartId) {
    return null;
  }

  return getCartById(cartId);
}

export async function getCartItemCount() {
  const cart = await getCurrentCart();

  return cart?.itemCount ?? 0;
}

export async function addVariantToCart(variantId: string) {
  const cart = await getOrCreateCart();
  const data = await medusaFetch<MedusaCartResponse>(
    `/store/carts/${cart.id}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );

  if (!data?.cart) {
    throw new Error("Product could not be added to cart.");
  }

  return toStorefrontCart(data.cart);
}
