import type { Metadata } from "next";

import { CheckoutPageView } from "@/features/checkout/checkout-page-view";
import { getCurrentCart, getCurrentShippingOptions } from "@/lib/medusa/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | The Label",
  description: "Add delivery details and choose shipping for your order.",
};

export default async function CheckoutPage() {
  const cart = await getCurrentCart();

  return (
    <CheckoutPageView
      cart={cart}
      shippingOptions={
        cart?.shippingAddress ? await getCurrentShippingOptions(cart) : []
      }
      razorpayPublicKey={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? null}
    />
  );
}
