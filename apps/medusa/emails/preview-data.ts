import type { OrderPlacedEmailData } from "../src/email/templates/order-placed";

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
      thumbnail:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=160&q=80",
      quantity: 1,
      total: 6_800,
    },
    {
      product_title: "Mira Satin Evening Top",
      thumbnail:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=160&q=80",
      quantity: 1,
      total: 7_200,
    },
  ],
} satisfies OrderPlacedEmailData;
