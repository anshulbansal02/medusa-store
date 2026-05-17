"use server";

import { revalidatePath } from "next/cache";
import {
  type CheckoutAddressInput,
  checkoutAddressSchema,
} from "@/features/checkout/schema";
import {
  clearCurrentCart,
  getCurrentCart,
  setCartShippingMethod,
  updateCartAddress,
} from "@/lib/medusa/cart";
import {
  completeCartPayment,
  createRazorpayPaymentSession,
  type RazorpayVerificationPayload,
  verifyRazorpayPayment,
} from "@/lib/medusa/payments";

type CheckoutActionResult = {
  ok: boolean;
  message: string;
};

type RazorpayPaymentActionResult =
  | {
      ok: true;
      payment: {
        orderId: string;
        amount: number;
        currency: string;
      };
      customer: {
        name: string;
        email: string;
        phone: string;
      };
    }
  | {
      ok: false;
      message: string;
    };

type CompletePaymentActionResult =
  | {
      ok: true;
      orderId: string;
    }
  | {
      ok: false;
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
    revalidatePath("/bag");

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

export async function startRazorpayPaymentAction(): Promise<RazorpayPaymentActionResult> {
  const cart = await getCurrentCart();

  if (!cart || cart.items.length === 0) {
    return {
      ok: false,
      message: "Your bag is empty.",
    };
  }

  if (!cart.shippingAddress || !cart.selectedShippingOptionId) {
    return {
      ok: false,
      message: "Add the address and choose shipping before payment.",
    };
  }

  try {
    const payment = await createRazorpayPaymentSession(cart.id);

    return {
      ok: true,
      payment: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
      },
      customer: {
        name: [cart.shippingAddress.firstName, cart.shippingAddress.lastName]
          .filter(Boolean)
          .join(" "),
        email: cart.email,
        phone: cart.shippingAddress.phone,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Payment could not be started. Try again.",
    };
  }
}

export async function verifyAndCompleteRazorpayPaymentAction(
  payload: RazorpayVerificationPayload,
): Promise<CompletePaymentActionResult> {
  const cart = await getCurrentCart();

  if (!cart) {
    return {
      ok: false,
      message: "Your bag session has expired.",
    };
  }

  try {
    await verifyRazorpayPayment(payload);
    const orderId = await completeCartPayment(cart.id);

    await clearCurrentCart();
    revalidatePath("/checkout");
    revalidatePath("/bag");

    return {
      ok: true,
      orderId,
    };
  } catch {
    return {
      ok: false,
      message: "Payment was received but the order could not be confirmed.",
    };
  }
}

export async function selectShippingMethodAction(
  _previousState: CheckoutActionResult,
  formData: FormData,
) {
  const optionId = formData.get("option_id");

  if (typeof optionId !== "string" || optionId.length === 0) {
    return {
      ok: false,
      message: "Choose a shipping method.",
    } satisfies CheckoutActionResult;
  }

  try {
    await setCartShippingMethod(optionId);
    revalidatePath("/checkout");
    revalidatePath("/bag");

    return {
      ok: true,
      message: "Shipping method saved.",
    } satisfies CheckoutActionResult;
  } catch {
    return {
      ok: false,
      message: "Shipping method could not be saved. Try again.",
    } satisfies CheckoutActionResult;
  }
}
