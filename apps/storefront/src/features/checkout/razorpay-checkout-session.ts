"use server";

import { cookies } from "next/headers";

const razorpayCheckoutCookieName = "the_label_razorpay_checkout";

type RazorpayCheckoutSession = {
  cartId: string;
  orderId: string;
};

function getRazorpayCheckoutCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 15,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function serializeRazorpayCheckout({
  cartId,
  orderId,
}: RazorpayCheckoutSession) {
  return JSON.stringify({ cartId, orderId });
}

function parseRazorpayCheckout(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "cartId" in parsed &&
      "orderId" in parsed &&
      typeof parsed.cartId === "string" &&
      typeof parsed.orderId === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function saveRazorpayCheckoutSession(
  session: RazorpayCheckoutSession,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    razorpayCheckoutCookieName,
    serializeRazorpayCheckout(session),
    getRazorpayCheckoutCookieOptions(),
  );
}

export async function getRazorpayCheckoutSession() {
  const cookieStore = await cookies();

  return parseRazorpayCheckout(
    cookieStore.get(razorpayCheckoutCookieName)?.value,
  );
}

export async function clearRazorpayCheckoutSession() {
  const cookieStore = await cookies();

  cookieStore.delete(razorpayCheckoutCookieName);
}
