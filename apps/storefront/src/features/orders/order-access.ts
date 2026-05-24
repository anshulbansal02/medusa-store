import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const cookiePrefix = "order_access_";
const maxAgeSeconds = 60 * 30;

type OrderAccessPayload = {
  orderId: string;
  exp: number;
};

function getOrderAccessSecret() {
  const secret = process.env.ORDER_ACCESS_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-order-access-secret";
  }

  throw new Error("ORDER_ACCESS_SECRET is required in production.");
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getOrderAccessSecret())
    .update(payload)
    .digest("base64url");
}

function cookieName(orderId: string) {
  return `${cookiePrefix}${orderId.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function createToken(payload: OrderAccessPayload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string, orderId: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<OrderAccessPayload>;

    return (
      payload.orderId === orderId &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function grantOrderAccess(orderId: string) {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;

  cookieStore.set(cookieName(orderId), createToken({ orderId, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/order-confirmation/${encodeURIComponent(orderId)}`,
    maxAge: maxAgeSeconds,
  });
}

export async function hasOrderAccess(orderId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(orderId))?.value;

  return token ? verifyToken(token, orderId) : false;
}
