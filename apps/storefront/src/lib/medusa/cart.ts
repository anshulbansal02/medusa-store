import { cookies } from "next/headers";

import { toShippingOption, toStorefrontCart } from "@/lib/medusa/cart-mappers";
import type {
  CheckoutAddressPayload,
  MedusaCartParentResponse,
  MedusaCartResponse,
  MedusaShippingOptionsResponse,
  StorefrontCart,
} from "@/lib/medusa/cart-types";
import { medusaDelete, medusaFetch, medusaPostJson } from "@/lib/medusa/client";
import { getDefaultRegionId } from "@/lib/medusa/regions";

const cartCookieName = "the_label_cart_id";

export type {
  CartItem,
  CheckoutAddressPayload,
  StorefrontAddress,
  StorefrontCart,
  StorefrontShippingOption,
} from "@/lib/medusa/cart-types";

function getCartCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

async function getCartById(cartId: string) {
  const data = await medusaFetch<MedusaCartResponse>(`/store/carts/${cartId}`, {
    cache: "no-store",
  });

  return data?.cart ? toStorefrontCart(data.cart) : null;
}

async function createCart() {
  const regionId = await getDefaultRegionId();

  if (!regionId) {
    throw new Error("Medusa region is not available.");
  }

  const data = await medusaPostJson<MedusaCartResponse>("/store/carts", {
    region_id: regionId,
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

async function requireCurrentCart(errorMessage: string) {
  const cart = await getCurrentCart();

  if (!cart) {
    throw new Error(errorMessage);
  }

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

export async function clearCurrentCart() {
  const cookieStore = await cookies();

  cookieStore.delete(cartCookieName);
}

export async function getCartItemCount() {
  const cart = await getCurrentCart();

  return cart?.itemCount ?? 0;
}

export async function getCurrentShippingOptions(
  cart: StorefrontCart | null = null,
) {
  const currentCart = cart ?? (await getCurrentCart());

  if (!currentCart || currentCart.items.length === 0) {
    return [];
  }

  const data = await medusaFetch<MedusaShippingOptionsResponse>(
    `/store/shipping-options?cart_id=${currentCart.id}`,
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
  const data = await medusaPostJson<MedusaCartResponse>(
    `/store/carts/${cart.id}`,
    {
      email: address.email,
      shipping_address: medusaAddress,
      billing_address: medusaAddress,
    },
  );

  if (!data?.cart) {
    throw new Error("Address could not be saved.");
  }

  return toStorefrontCart(data.cart);
}

export async function setCartShippingMethod(optionId: string) {
  const cart = await requireCurrentCart("Cart is not available.");
  const data = await medusaPostJson<MedusaCartResponse>(
    `/store/carts/${cart.id}/shipping-methods`,
    { option_id: optionId },
  );

  if (!data?.cart) {
    throw new Error("Shipping method could not be saved.");
  }

  return toStorefrontCart(data.cart);
}

export async function addVariantToCart(variantId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const data = await medusaPostJson<MedusaCartResponse>(
    `/store/carts/${cart.id}/line-items`,
    { variant_id: variantId, quantity },
  );

  if (!data?.cart) {
    throw new Error("Product could not be added to cart.");
  }

  return toStorefrontCart(data.cart);
}

export async function updateCartLineItem(lineItemId: string, quantity: number) {
  const cart = await requireCurrentCart("Cart is not available.");
  const data = await medusaPostJson<MedusaCartResponse>(
    `/store/carts/${cart.id}/line-items/${lineItemId}`,
    { quantity },
  );

  if (!data?.cart) {
    throw new Error("Bag item could not be updated.");
  }

  return toStorefrontCart(data.cart);
}

export async function removeCartLineItem(lineItemId: string) {
  const cart = await requireCurrentCart("Cart is not available.");
  const data = await medusaDelete<MedusaCartParentResponse>(
    `/store/carts/${cart.id}/line-items/${lineItemId}`,
  );

  if (!data?.parent) {
    throw new Error("Bag item could not be removed.");
  }

  return toStorefrontCart(data.parent);
}
