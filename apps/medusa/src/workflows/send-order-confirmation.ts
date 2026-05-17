import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

type WorkflowInput = {
  id: string;
};

export const sendOrderConfirmationWorkflow = createWorkflow(
  "send-order-confirmation",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "discount_total",
        "shipping_total",
        "tax_total",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
      ],
      filters: {
        id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    });

    const notifications = transform({ orders }, ({ orders }) => {
      const order = orders[0];
      const ownerEmail = process.env.OWNER_ORDER_EMAIL;
      const baseNotification = {
        channel: "email",
        data: {
          order,
        },
        trigger_type: "order.placed",
        resource_id: order.id,
        resource_type: "order",
      };

      return [
        ...(order.email
          ? [
              {
                ...baseNotification,
                to: order.email,
                template: "order-placed",
                idempotency_key: `order-placed-customer-${order.id}`,
              },
            ]
          : []),
        ...(ownerEmail && !ownerEmail.includes("replace_me")
          ? [
              {
                ...baseNotification,
                to: ownerEmail,
                template: "owner-order-placed",
                idempotency_key: `order-placed-owner-${order.id}`,
              },
            ]
          : []),
      ];
    });

    const notification = sendNotificationsStep(notifications);

    return new WorkflowResponse({
      notification,
    });
  },
);
