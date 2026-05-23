import type { ProviderWebhookPayload } from "@medusajs/framework/types";
import crypto from "node:crypto";

import { fromSmallestUnit } from "./money";
import type {
  RazorpayOrder,
  RazorpayPayment,
  RazorpayWebhookEvent,
} from "./types";

export function getHeader(headers: Record<string, unknown>, name: string) {
  const value = headers[name] ?? headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

export function getRawWebhookBody(
  rawData: ProviderWebhookPayload["payload"]["rawData"],
) {
  return Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData);
}

export function isWebhookSignatureValid({
  rawData,
  secret,
  signature,
}: {
  rawData: ProviderWebhookPayload["payload"]["rawData"];
  secret: string;
  signature: string;
}) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(getRawWebhookBody(rawData))
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function getWebhookEntityNotes(
  entity: RazorpayPayment | RazorpayOrder | undefined,
) {
  return entity?.notes ?? {};
}

export function getWebhookSessionId(event: RazorpayWebhookEvent) {
  const paymentNotes = getWebhookEntityNotes(event.payload?.payment?.entity);
  const orderNotes = getWebhookEntityNotes(event.payload?.order?.entity);
  const sessionId = paymentNotes.session_id ?? orderNotes.session_id;

  return typeof sessionId === "string" ? sessionId : "";
}

export function getWebhookAmount(event: RazorpayWebhookEvent) {
  const payment = event.payload?.payment?.entity;
  const order = event.payload?.order?.entity;
  const amount = payment?.amount ?? order?.amount_paid ?? order?.amount;
  const currency = payment?.currency ?? order?.currency;

  if (typeof amount !== "number" || typeof currency !== "string") {
    return null;
  }

  return fromSmallestUnit(amount, currency);
}

export function getWebhookOrderId(event: RazorpayWebhookEvent) {
  return (
    event.payload?.order?.entity?.id ??
    event.payload?.payment?.entity?.order_id ??
    ""
  );
}
