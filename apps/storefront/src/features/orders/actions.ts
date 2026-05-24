"use server";

import { siteContent } from "@/content/site-content";
import { grantOrderAccess } from "@/features/orders/order-access";
import {
  type OrderLookupInput,
  orderLookupSchema,
} from "@/features/orders/schema";
import { getOrderById } from "@/lib/medusa/orders";

type OrderLookupResult =
  | {
      ok: true;
      orderId: string;
    }
  | {
      ok: false;
      field: keyof OrderLookupInput;
      message: string;
    };

function getOrderIdFromReference(reference: string) {
  const trimmedReference = reference.trim();

  if (trimmedReference.startsWith("order_")) {
    return trimmedReference;
  }

  try {
    const url = new URL(trimmedReference);
    const pathParts = url.pathname.split("/");
    const orderConfirmationIndex = pathParts.indexOf("order-confirmation");
    const orderId =
      orderConfirmationIndex >= 0 ? pathParts[orderConfirmationIndex + 1] : "";

    return orderId?.startsWith("order_") ? orderId : "";
  } catch {
    return "";
  }
}

export async function verifyOrderLookupAction(
  input: OrderLookupInput,
): Promise<OrderLookupResult> {
  const content = siteContent.trackOrder.form;
  const result = orderLookupSchema.safeParse(input);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path[0] === "email" ? "email" : "orderReference";

    return {
      ok: false,
      field,
      message: issue?.message ?? content.invalidInput,
    };
  }

  const orderId = getOrderIdFromReference(result.data.orderReference);

  if (!orderId) {
    return {
      ok: false,
      field: "orderReference",
      message: content.invalidReference,
    };
  }

  const order = await getOrderById(orderId);
  const expectedEmail = result.data.email.trim().toLowerCase();

  if (!order || order.email.trim().toLowerCase() !== expectedEmail) {
    return {
      ok: false,
      field: "orderReference",
      message: content.notFound,
    };
  }

  await grantOrderAccess(order.id);

  return {
    ok: true,
    orderId: order.id,
  };
}
