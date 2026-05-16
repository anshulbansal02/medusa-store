"use server";

import { revalidatePath } from "next/cache";
import {
  type CheckoutAddressInput,
  checkoutAddressSchema,
} from "@/features/checkout/schema";
import { setCartShippingMethod, updateCartAddress } from "@/lib/medusa/cart";

type CheckoutActionResult = {
  ok: boolean;
  message: string;
};

export async function saveCheckoutAddressAction(
  input: CheckoutAddressInput,
): Promise<CheckoutActionResult> {
  const result = checkoutAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
    };
  }

  try {
    await updateCartAddress(result.data);
    revalidatePath("/checkout");
    revalidatePath("/cart");

    return {
      ok: true,
      message: "Address saved.",
    };
  } catch {
    return {
      ok: false,
      message: "Address could not be saved. Try again.",
    };
  }
}

export async function selectShippingMethodAction(formData: FormData) {
  const optionId = formData.get("option_id");

  if (typeof optionId !== "string" || optionId.length === 0) {
    return;
  }

  await setCartShippingMethod(optionId);
  revalidatePath("/checkout");
  revalidatePath("/cart");
}
