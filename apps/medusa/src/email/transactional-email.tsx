import type { ReactNode } from "react";
import { render, toPlainText } from "react-email";

import {
  CustomerOrderPlacedEmail,
  getOrderNumber,
  type OrderPlacedEmailData,
  OwnerOrderPlacedEmail,
} from "./templates/order-placed";
import { getEmailConfig } from "../config/env";

export type TransactionalEmailContent = {
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  replyTo?: string | string[];
  tags?: TransactionalEmailTag[];
};

type TransactionalEmailInput = {
  template?: string;
  data?: Record<string, unknown> | null;
};

type TransactionalEmailTag = {
  name: string;
  value: string;
};

const orderPlacedTemplate = "order-placed";
const ownerOrderPlacedTemplate = "owner-order-placed";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isOrderPlacedEmailData(value: unknown): value is OrderPlacedEmailData {
  return isRecord(value);
}

function getSiteUrl() {
  const siteUrl = getEmailConfig().storefrontUrl;

  if (!siteUrl) {
    return null;
  }

  return siteUrl.replace(/\/+$/, "");
}

function getOrderUrl(order: OrderPlacedEmailData) {
  const siteUrl = getSiteUrl();

  if (!siteUrl || !order.id) {
    return null;
  }

  return `${siteUrl}/order-confirmation/${order.id}`;
}

function getReplyTo() {
  return getEmailConfig().replyTo;
}

function toTagValue(value: string | number | null | undefined) {
  const tagValue = String(value ?? "unknown")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 256);

  return tagValue || "unknown";
}

function createOrderMetadata({
  order,
  audience,
  template,
}: {
  order: OrderPlacedEmailData;
  audience: "customer" | "owner";
  template: string;
}) {
  const orderNumber = getOrderNumber(order);

  return {
    headers: {
      "X-Entity-Ref-ID": order.id ?? String(orderNumber ?? "unknown"),
      "X-The-Label-Template": template,
    },
    tags: [
      { name: "template", value: template },
      { name: "audience", value: audience },
      { name: "order_id", value: toTagValue(order.id) },
      { name: "currency", value: toTagValue(order.currency_code ?? "inr") },
    ],
  };
}

function formatPrice(amount?: number | null, currencyCode = "inr") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

async function renderEmail(node: ReactNode) {
  const html = await render(node);

  return {
    html,
    text: toPlainText(html),
  };
}

async function buildOrderPlacedEmail(
  order: OrderPlacedEmailData,
): Promise<TransactionalEmailContent> {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? `Your The Label order ${orderNumber} is confirmed`
    : "Your The Label order is confirmed";
  const { html, text } = await renderEmail(
    <CustomerOrderPlacedEmail order={order} orderUrl={getOrderUrl(order)} />,
  );

  return {
    subject,
    html,
    text:
      text ||
      `Thank you for your order${orderNumber ? ` ${orderNumber}` : ""}. Total: ${formatPrice(order.total, currencyCode)}.`,
    replyTo: getReplyTo(),
    ...createOrderMetadata({
      order,
      audience: "customer",
      template: orderPlacedTemplate,
    }),
  };
}

async function buildOwnerOrderPlacedEmail(
  order: OrderPlacedEmailData,
): Promise<TransactionalEmailContent> {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? `New The Label order ${orderNumber}`
    : "New The Label order";
  const { html, text } = await renderEmail(
    <OwnerOrderPlacedEmail order={order} />,
  );

  return {
    subject,
    html,
    text:
      text ||
      `New order${orderNumber ? ` ${orderNumber}` : ""} for ${formatPrice(order.total, currencyCode)} from ${order.email ?? "guest customer"}.`,
    replyTo: getReplyTo(),
    ...createOrderMetadata({
      order,
      audience: "owner",
      template: ownerOrderPlacedTemplate,
    }),
  };
}

export async function renderTransactionalEmail({
  template,
  data,
}: TransactionalEmailInput): Promise<TransactionalEmailContent | null> {
  const order = data?.order;

  if (!isOrderPlacedEmailData(order)) {
    return null;
  }

  if (template === ownerOrderPlacedTemplate) {
    return buildOwnerOrderPlacedEmail(order);
  }

  if (template === orderPlacedTemplate) {
    return buildOrderPlacedEmail(order);
  }

  return null;
}
