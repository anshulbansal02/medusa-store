import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { getResendConfig } from "../config/env";
import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation";

type OrderPlacedEventData = {
  id: string;
};

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderPlacedEventData>) {
  if (!getResendConfig().isConfigured) {
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
