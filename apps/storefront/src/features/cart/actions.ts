"use server";

import { redirect } from "next/navigation";

import { addVariantToCart } from "@/lib/medusa/cart";

export type AddToCartActionState = {
  message: string;
};

export async function addToCartAction(
  _previousState: AddToCartActionState,
  formData: FormData,
): Promise<AddToCartActionState> {
  const variantId = formData.get("variant_id");
  const quantityValue = formData.get("quantity");

  if (typeof variantId !== "string" || variantId.length === 0) {
    return {
      message: "Select a size before adding this item.",
    };
  }

  const quantity =
    typeof quantityValue === "string" ? Number.parseInt(quantityValue, 10) : 1;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
    return {
      message: "Choose a quantity between 1 and 9.",
    };
  }

  try {
    await addVariantToCart(variantId, quantity);
  } catch {
    return {
      message: "This item could not be added. Try again.",
    };
  }

  redirect("/cart");
}
