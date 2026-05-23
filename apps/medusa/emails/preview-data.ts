import type { OrderPlacedEmailData } from "../src/modules/resend-notification/services/order-placed-email";

export const previewOrder = {
  id: "order_preview",
  display_id: 1042,
  email: "customer@example.com",
  currency_code: "inr",
  subtotal: 14_000,
  shipping_total: 149,
  tax_total: 0,
  discount_total: 0,
  total: 14_149,
  items: [
    {
      product_title: "Noor Draped Midi Dress",
      quantity: 1,
      total: 6_800,
    },
    {
      product_title: "Mira Satin Evening Top",
      quantity: 1,
      total: 7_200,
    },
  ],
} satisfies OrderPlacedEmailData;
