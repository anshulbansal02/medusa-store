# Operations

Status: v1 owner and admin workflow guide
Last reviewed: 2026-05-17

This project uses Medusa Admin for store operations. Do not build custom admin replacements for v1 unless a small view clearly reduces owner friction.

## Daily Order Flow

1. Open Medusa Admin.
2. Go to Orders.
3. Open the newest paid order.
4. Confirm customer email, phone, shipping address, items, size/color variants, totals, and payment state.
5. Pack the order using the order details and item quantities.
6. Create a fulfillment from the Unfulfilled Items section.
7. Add shipment details once the courier label/tracking number exists.
8. Mark the fulfillment as delivered only after delivery is confirmed.

## Fulfillment Rules

- Use the existing manual fulfillment provider for v1.
- Do not add Shiprocket or Delhivery API automation at launch.
- Fulfill all items together unless the business intentionally splits a shipment.
- If an item cannot be packed, do not mark it fulfilled.
- If the shipment has not left, fulfillment can still be canceled and recreated in Medusa Admin.
- After shipment or delivery is marked, treat the action as irreversible from an operations perspective.

## Tracking

When tracking is used:

- Add the courier tracking number in the shipment form.
- Add the tracking URL when the courier provides a stable public tracking link.
- Add the label URL only if the store team needs the label reference later.
- Use the Track Order page for customer self-service by order confirmation link or order ID.

## Payments And Refunds

- V1 is prepaid only through Razorpay.
- Razorpay Dashboard payment capture should remain automatic unless the team intentionally switches to manual capture and updates this runbook.
- Razorpay webhooks should point to the Medusa payment webhook endpoint for the active environment:
  `/hooks/payment/razorpay_razorpay`.
- Capture/refund state must remain consistent between Medusa Admin and Razorpay.
- Do not refund manually from Razorpay without checking the matching Medusa order.
- If payment state is unclear, pause fulfillment until Razorpay and Medusa agree.

## Customer Communication

- Customers receive order confirmation when Resend is configured.
- Owner new-order email is optional through `OWNER_ORDER_EMAIL`.
- Shipment/tracking notification can be sent manually in v1 if automated shipping email is not enabled.
- Keep customer-facing messages short: order number, current status, expected dispatch or tracking link, and support contact.

## Admin Access

- Use separate admin accounts.
- Do not share admin passwords.
- Keep production admin behind Cloudflare Access plus Medusa Admin authentication.
- Remove access immediately when a user no longer needs it.

## References

- Medusa Admin order details: https://docs.medusajs.com/user-guide/orders/manage
- Medusa Admin fulfillments: https://docs.medusajs.com/user-guide/orders/fulfillments
