import type { ReactNode } from "react";
import { render, toPlainText } from "react-email";

import {
  CustomerOrderPlacedEmail,
  getOrderNumber,
  type OrderPlacedEmailData,
  OwnerOrderPlacedEmail,
} from "./templates/order-placed";
import {
  UserInvitedEmail,
  type UserInvitedEmailData,
} from "./templates/user-invited";
import { transactionalEmailTemplates } from "./template-ids";
import { getEmailConfig } from "../config/env";
import { emailContent } from "./email-content";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isOrderPlacedEmailData(value: unknown): value is OrderPlacedEmailData {
  return isRecord(value);
}

function isUserInvitedEmailData(value: unknown): value is UserInvitedEmailData {
  return (
    isRecord(value) &&
    typeof value.invite_url === "string" &&
    value.invite_url.length > 0
  );
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

function createUserInvitedMetadata() {
  return {
    headers: {
      "X-Entity-Ref-ID": "admin-invite",
      "X-The-Label-Template": transactionalEmailTemplates.userInvited,
    },
    tags: [
      { name: "template", value: transactionalEmailTemplates.userInvited },
      { name: "audience", value: "admin" },
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

function interpolateEmailText(
  template: string,
  values: Record<string, string>,
) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
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
    ? interpolateEmailText(emailContent.orderPlaced.customer.subjectWithOrder, {
        orderNumber,
      })
    : emailContent.orderPlaced.customer.subjectFallback;
  const { html, text } = await renderEmail(
    <CustomerOrderPlacedEmail order={order} orderUrl={getOrderUrl(order)} />,
  );
  const textFallback = interpolateEmailText(
    emailContent.orderPlaced.customer.textFallback,
    {
      orderNumber: orderNumber ? ` ${orderNumber}` : "",
      orderTotal: formatPrice(order.total, currencyCode),
    },
  );

  return {
    subject,
    html,
    text: text || textFallback,
    replyTo: getReplyTo(),
    ...createOrderMetadata({
      order,
      audience: "customer",
      template: transactionalEmailTemplates.orderPlaced,
    }),
  };
}

async function buildOwnerOrderPlacedEmail(
  order: OrderPlacedEmailData,
): Promise<TransactionalEmailContent> {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? interpolateEmailText(emailContent.orderPlaced.owner.subjectWithOrder, {
        orderNumber,
      })
    : emailContent.orderPlaced.owner.subjectFallback;
  const { html, text } = await renderEmail(
    <OwnerOrderPlacedEmail order={order} />,
  );
  const textFallback = interpolateEmailText(
    emailContent.orderPlaced.owner.textFallback,
    {
      orderNumber: orderNumber ? ` ${orderNumber}` : "",
      orderTotal: formatPrice(order.total, currencyCode),
      customerEmail: order.email ?? emailContent.orderPlaced.owner.guestCustomer,
    },
  );

  return {
    subject,
    html,
    text: text || textFallback,
    replyTo: getReplyTo(),
    ...createOrderMetadata({
      order,
      audience: "owner",
      template: transactionalEmailTemplates.ownerOrderPlaced,
    }),
  };
}

async function buildUserInvitedEmail(
  invite: UserInvitedEmailData,
): Promise<TransactionalEmailContent> {
  const inviteUrl = invite.invite_url!;
  const { html, text } = await renderEmail(
    <UserInvitedEmail inviteUrl={inviteUrl} email={invite.email} />,
  );
  const textFallback = interpolateEmailText(
    emailContent.userInvited.textFallback,
    {
      inviteUrl,
    },
  );

  return {
    subject: emailContent.userInvited.subject,
    html,
    text: text || textFallback,
    replyTo: getReplyTo(),
    ...createUserInvitedMetadata(),
  };
}

export async function renderTransactionalEmail({
  template,
  data,
}: TransactionalEmailInput): Promise<TransactionalEmailContent | null> {
  if (
    template === transactionalEmailTemplates.userInvited &&
    isUserInvitedEmailData(data)
  ) {
    return buildUserInvitedEmail(data);
  }

  const order = data?.order;

  if (!isOrderPlacedEmailData(order)) {
    return null;
  }

  if (template === transactionalEmailTemplates.ownerOrderPlaced) {
    return buildOwnerOrderPlacedEmail(order);
  }

  if (template === transactionalEmailTemplates.orderPlaced) {
    return buildOrderPlacedEmail(order);
  }

  return null;
}
