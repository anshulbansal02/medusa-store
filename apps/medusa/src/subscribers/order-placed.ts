import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation";

type OrderPlacedEventData = {
  id: string;
};

function isConfigured(value?: string) {
  return typeof value === "string" && !value.includes("replace_me");
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderPlacedEventData>) {
  if (
    !isConfigured(process.env.RESEND_API_KEY) ||
    !isConfigured(process.env.RESEND_FROM_EMAIL)
  ) {
    return;
  }

  await sendOrderConfirmationWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
