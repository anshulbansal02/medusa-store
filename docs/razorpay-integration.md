# Razorpay Integration

Status: canonical v1 Razorpay setup
Last reviewed: 2026-05-23

## Scope

V1 uses Razorpay Standard Checkout for prepaid India checkout. Medusa remains the source of truth for carts, payment sessions, orders, captures, and refunds.

## Implementation Shape

- Medusa registers a custom payment provider at `apps/medusa/src/modules/razorpay-payment`.
- The storefront creates a Medusa payment collection and Razorpay payment session through `apps/storefront/src/lib/medusa/payments.ts`.
- The payment provider creates a Razorpay Order server-side before Razorpay Checkout opens.
- The storefront passes only the public Razorpay key and server-created Razorpay order ID to Checkout.
- Checkout success callbacks are verified server-side before completing the cart.
- The callback path is bound to the current cart and the expected server-created Razorpay order with a short-lived HttpOnly cookie.
- Razorpay webhooks are handled by Medusa's built-in payment webhook route:
  `/hooks/payment/razorpay_razorpay`.

## Required Environment

Medusa:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Storefront:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Rules:

- QA and production must use separate Razorpay keys and webhook secrets.
- Never expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` to the storefront.
- Keep `NEXT_PUBLIC_RAZORPAY_KEY_ID` browser-safe; it is public by design.

## Razorpay Dashboard Setup

For each environment:

- Enable automatic payment capture in Razorpay Payment Capture settings.
- Add a webhook using the Medusa backend URL:
  `{MEDUSA_BACKEND_URL}/hooks/payment/razorpay_razorpay`
- Configure the webhook secret and store the same value in `RAZORPAY_WEBHOOK_SECRET`.
- Subscribe to:
  - `order.paid`
  - `payment.captured`
  - `payment.authorized`
  - `payment.failed`

## Verification Rules

Checkout callback verification:

- Use the server-created Razorpay order ID, not the returned order ID as the source of trust.
- Generate HMAC SHA-256 over `order_id + "|" + razorpay_payment_id` with `RAZORPAY_KEY_SECRET`.
- Compare signatures using timing-safe equality.
- Fetch the Razorpay payment and order server-side before returning `verified: true`.
- Confirm the payment belongs to the order, amount and currency match, and the payment/order states are acceptable.

Webhook verification:

- Use the raw webhook body, not re-stringified JSON.
- Generate HMAC SHA-256 with `RAZORPAY_WEBHOOK_SECRET`.
- Compare against `x-razorpay-signature` using timing-safe equality.

## QA Smoke Test

Before considering Razorpay ready in QA:

- Confirm Medusa QA has Razorpay test keys and webhook secret.
- Confirm storefront QA has `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Confirm Razorpay test-mode webhook points to the Medusa QA URL.
- Place a test order through storefront QA.
- Confirm the Razorpay payment is captured.
- Confirm the Medusa cart completes into an order.
- Confirm the order payment state is correct in Medusa Admin.
- Confirm the webhook appears in Razorpay Dashboard without delivery failures.
- Test a failed payment attempt and confirm no paid order is created.
- Issue a small refund from the operational path and confirm Medusa and Razorpay remain consistent.

## Source References

- Razorpay Standard Checkout integration: https://razorpay.com/docs/payments/payment-gateway/quick-integration/integration-steps/
- Razorpay webhook validation: https://razorpay.com/docs/webhooks/validate-test/
- Razorpay payment capture settings: https://razorpay.com/docs/payments/payments/capture-settings/
- Medusa payment provider docs: https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider
- Medusa payment webhook events: https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events
