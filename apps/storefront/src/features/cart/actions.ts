"use server";

import {
  addVariantToCart,
  removeCartLineItem,
  type StorefrontCart,
  updateCartLineItem,
} from "@/lib/medusa/cart";

export type AddedBagItem = {
  name: string;
  href: string;
  variant: string;
  quantity: number;
  total: string;
  image: string | null;
};

export type AddToCartActionState = {
  status: "idle" | "success" | "error";
  message: string;
  cart: StorefrontCart | null;
  addedItem: AddedBagItem | null;
};

export async function addToCartAction(
  formData: FormData,
): Promise<AddToCartActionState> {
  const variantId = formData.get("variant_id");
  const variantTitle = formData.get("variant_title");
  const quantityValue = formData.get("quantity");

  if (typeof variantId !== "string" || variantId.length === 0) {
    return {
      status: "error",
      message: "Select a size before adding this item.",
      cart: null,
      addedItem: null,
    };
  }

  const quantity =
    typeof quantityValue === "string" ? Number.parseInt(quantityValue, 10) : 1;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
    return {
      status: "error",
      message: "Choose a quantity between 1 and 9.",
      cart: null,
      addedItem: null,
    };
  }

  try {
    const cart = await addVariantToCart(variantId, quantity);
    const addedItem =
      cart.items.find((item) => item.variantId === variantId) ??
      (typeof variantTitle === "string"
        ? cart.items.find((item) => item.variant === variantTitle)
        : null) ??
      cart.items.at(-1);

    return {
      status: "success",
      message: "Added to bag.",
      cart,
      addedItem: addedItem
        ? {
            name: addedItem.name,
            href: addedItem.href,
            variant: addedItem.variant,
            quantity,
            total: addedItem.unitPrice,
            image: addedItem.image,
          }
        : null,
    };
  } catch {
    return {
      status: "error",
      message: "This item could not be added. Try again.",
      cart: null,
      addedItem: null,
    };
  }
}

export async function updateBagLineAction(
  lineItemId: string,
  quantity: number,
) {
  if (
    !lineItemId ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 9
  ) {
    throw new Error("Choose a quantity between 1 and 9.");
  }

  return updateCartLineItem(lineItemId, quantity);
}

export async function removeBagLineAction(lineItemId: string) {
  if (!lineItemId) {
    throw new Error("Bag item is missing.");
  }

  return removeCartLineItem(lineItemId);
}
