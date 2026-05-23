"use server";

import { revalidatePath } from "next/cache";

import { siteContent } from "@/content/site-content";
import {
  clearRazorpayCheckoutSession,
  getRazorpayCheckoutSession,
  saveRazorpayCheckoutSession,
} from "@/features/checkout/razorpay-checkout-session";
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

const content = siteContent.checkout;

function revalidateCheckoutViews() {
  revalidatePath("/checkout");
  revalidatePath("/bag");
}

export async function saveCheckoutAddressAction(
  input: CheckoutAddressInput,
): Promise<CheckoutActionResult> {
  const result = checkoutAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message: content.addressFormMessages.validationError,
    };
  }

  try {
    await updateCartAddress(result.data);
    revalidateCheckoutViews();

    return {
      ok: true,
      message: content.addressFormMessages.saved,
    };
  } catch {
    return {
      ok: false,
      message: content.addressFormMessages.error,
    };
  }
}

export async function startRazorpayPaymentAction(): Promise<RazorpayPaymentActionResult> {
  const cart = await getCurrentCart();

  if (!cart || cart.items.length === 0) {
    return {
      ok: false,
      message: content.payment.emptyBag,
    };
  }

  if (!cart.shippingAddress || !cart.selectedShippingOptionId) {
    return {
      ok: false,
      message: content.payment.detailsMissing,
    };
  }

  try {
    const payment = await createRazorpayPaymentSession(cart.id);

    await saveRazorpayCheckoutSession({
      cartId: cart.id,
      orderId: payment.orderId,
    });

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
      message: content.payment.startError,
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
      message: content.payment.expiredSession,
    };
  }

  try {
    const expectedCheckout = await getRazorpayCheckoutSession();

    if (
      !expectedCheckout ||
      expectedCheckout.cartId !== cart.id ||
      expectedCheckout.orderId !== payload.razorpay_order_id
    ) {
      return {
        ok: false,
        message: content.payment.sessionMismatch,
      };
    }

    await verifyRazorpayPayment(payload);
    const orderId = await completeCartPayment(cart.id);

    await clearRazorpayCheckoutSession();
    await clearCurrentCart();
    revalidateCheckoutViews();

    return {
      ok: true,
      orderId,
    };
  } catch {
    return {
      ok: false,
      message: content.payment.confirmationError,
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
      message: content.shippingForm.chooseMethodMessage,
    } satisfies CheckoutActionResult;
  }

  try {
    await setCartShippingMethod(optionId);
    revalidateCheckoutViews();

    return {
      ok: true,
      message: content.shippingForm.savedMessage,
    } satisfies CheckoutActionResult;
  } catch {
    return {
      ok: false,
      message: content.shippingForm.errorMessage,
    } satisfies CheckoutActionResult;
  }
}
