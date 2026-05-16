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

type MedusaAddress = {
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
};

type MedusaShippingMethod = {
  amount?: number;
  shipping_option_id?: string;
};

type MedusaCart = {
  id: string;
  email?: string | null;
  currency_code?: string;
  total?: number;
  subtotal?: number;
  item_total?: number;
  shipping_total?: number;
  items?: MedusaCartLineItem[];
  shipping_address?: MedusaAddress | null;
  shipping_methods?: MedusaShippingMethod[];
};

type MedusaCartResponse = {
  cart?: MedusaCart;
};

type MedusaShippingOption = {
  id: string;
  name: string;
  amount?: number;
  calculated_price?: {
    calculated_amount?: number;
    currency_code?: string;
  };
  type?: {
    description?: string | null;
  } | null;
};

type MedusaShippingOptionsResponse = {
  shipping_options?: MedusaShippingOption[];
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
  email: string;
  total: string;
  subtotal: string;
  shippingTotal: string;
  itemCount: number;
  items: CartItem[];
  shippingAddress: StorefrontAddress | null;
  selectedShippingOptionId: string | null;
};

export type StorefrontAddress = {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
};

export type StorefrontShippingOption = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type CheckoutAddressPayload = StorefrontAddress & {
  email: string;
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

function toStorefrontAddress(address?: MedusaAddress | null) {
  if (!address?.address_1) {
    return null;
  }

  return {
    firstName: address.first_name ?? "",
    lastName: address.last_name ?? "",
    phone: address.phone ?? "",
    address1: address.address_1,
    address2: address.address_2 ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    postalCode: address.postal_code ?? "",
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
    email: cart.email ?? "",
    total: formatStorePrice(cart.total ?? 0, currencyCode) ?? "",
    subtotal:
      formatStorePrice(cart.item_total ?? cart.subtotal ?? 0, currencyCode) ??
      "",
    shippingTotal:
      formatStorePrice(cart.shipping_total ?? 0, currencyCode) ?? "",
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    items,
    shippingAddress: toStorefrontAddress(cart.shipping_address),
    selectedShippingOptionId:
      cart.shipping_methods?.[0]?.shipping_option_id ?? null,
  };
}

function toShippingOption(
  option: MedusaShippingOption,
  currencyCode = "inr",
): StorefrontShippingOption {
  const amount =
    option.calculated_price?.calculated_amount ?? option.amount ?? 0;
  const priceCurrency = option.calculated_price?.currency_code ?? currencyCode;

  return {
    id: option.id,
    name: option.name,
    description: option.type?.description ?? "",
    price: formatStorePrice(amount, priceCurrency) ?? "",
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

export async function getCurrentShippingOptions() {
  const cart = await getCurrentCart();

  if (!cart || cart.items.length === 0) {
    return [];
  }

  const data = await medusaFetch<MedusaShippingOptionsResponse>(
    `/store/shipping-options?cart_id=${cart.id}`,
    {
      cache: "no-store",
    },
  );

  return (
    data?.shipping_options?.map((option) => toShippingOption(option)) ?? []
  );
}

export async function updateCartAddress(address: CheckoutAddressPayload) {
  const cart = await getOrCreateCart();
  const medusaAddress = {
    first_name: address.firstName,
    last_name: address.lastName,
    address_1: address.address1,
    address_2: address.address2 || undefined,
    city: address.city,
    province: address.province,
    postal_code: address.postalCode,
    country_code: "in",
    phone: address.phone,
  };
  const data = await medusaFetch<MedusaCartResponse>(
    `/store/carts/${cart.id}`,
    {
      method: "POST",
      body: JSON.stringify({
        email: address.email,
        shipping_address: medusaAddress,
        billing_address: medusaAddress,
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );

  if (!data?.cart) {
    throw new Error("Address could not be saved.");
  }

  return toStorefrontCart(data.cart);
}

export async function setCartShippingMethod(optionId: string) {
  const cart = await getOrCreateCart();
  const data = await medusaFetch<MedusaCartResponse>(
    `/store/carts/${cart.id}/shipping-methods`,
    {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );

  if (!data?.cart) {
    throw new Error("Shipping method could not be saved.");
  }

  return toStorefrontCart(data.cart);
}

export async function addVariantToCart(variantId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const data = await medusaFetch<MedusaCartResponse>(
    `/store/carts/${cart.id}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
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
