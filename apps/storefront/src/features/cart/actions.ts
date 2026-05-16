"use server";

import { redirect } from "next/navigation";

import { addVariantToCart } from "@/lib/medusa/cart";

export async function addToCartAction(formData: FormData) {
  const variantId = formData.get("variant_id");

  if (typeof variantId !== "string" || variantId.length === 0) {
    throw new Error("Select a size before adding this item.");
  }

  await addVariantToCart(variantId);
  redirect("/cart");
}
