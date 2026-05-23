# Delhivery Integration

Status: research and implementation plan only
Last reviewed: 2026-05-23

## Scope

This document records the current Delhivery research, the current project state, and the recommended implementation shape for a future Delhivery integration.

No Delhivery code exists in the repo today. The current store uses Medusa's manual fulfillment provider and flat-rate shipping options. This is still aligned with the original v1 decision to keep fulfillment manual at launch, but it means Delhivery is not implemented yet.

## Current Project Review

Current implementation:

- `apps/medusa/medusa-config.ts` configures payment, notification, and file providers, but no custom fulfillment provider.
- `apps/medusa/src/migration-scripts/initial-data-seed.ts` links the stock location to Medusa's manual fulfillment provider and creates flat-rate `Standard Shipping` and `Express Shipping` options using `provider_id: "manual_manual"`.
- `docs/operations.md` explicitly says to use manual fulfillment for v1 and not add Delhivery API automation at launch.
- The storefront checkout only lets the customer choose existing Medusa shipping options; there are no storefront calls to Delhivery.

Assessment:

- There is no incorrect Delhivery code to fix.
- A complete Delhivery implementation would require new Medusa backend code, not storefront-only work.
- The integration should be treated as a fulfillment automation project after Razorpay and order creation are stable.
- Until implemented, operations should continue to create courier labels/tracking manually and record tracking details in Medusa Admin.

## Official API Facts

Delhivery's Express API is REST-based. Delhivery defines these core terms:

- Waybill: the unique tracking number for each shipment.
- Order ID: the shipment's associated order identifier; it should be unique.
- Token: the authentication value used to access APIs.
- Pickup Location: the warehouse/location where shipments are picked up.
- Test Environment: sandbox environment.
- Production Environment: live setup.

Authentication:

- Delhivery uses a static API token.
- The header format documented in the FAQ is `Authorization: Token XXXXXX`.
- Test and production tokens are separate.
- Delhivery states tokens do not expire, so they must be treated as long-lived secrets.

Important endpoint families:

- Pincode serviceability:
  - Test base from prerequisites: `https://staging-express.delhivery.com/c/api/pin-codes/`
  - Production base from prerequisites: `https://track.delhivery.com/c/api/pin-codes/`
- Package/order creation:
  - Test: `https://staging-express.delhivery.com/api/cmu/create.json`
  - Production: `https://track.delhivery.com/api/cmu/create.json`
- Fetch one waybill:
  - Test: `https://staging-express.delhivery.com/waybill/api/fetch/json/?cl=client_name`
  - Production: `https://track.delhivery.com/waybill/api/fetch/json/?cl=client_name`
- Bulk waybill fetch:
  - Test: `https://staging-express.delhivery.com/waybill/api/bulk/json/?cl=client_name&token=API License key&count=count`
  - Production: `https://track.delhivery.com/waybill/api/bulk/json/?cl=client_name&token=API License key&count=count`
- Tracking:
  - Test: `https://staging-express.delhivery.com/api/v1/packages//?parameter`
  - Production: `https://track.delhivery.com/api/v1/packages//?parameter`
- Pickup request:
  - Test: `https://staging-express.delhivery.com/fm/request/new/`
  - Production: `https://track.delhivery.com/fm/request/new/`
- Warehouse creation:
  - Test: `https://staging-express.delhivery.com/api/backend/clientwarehouse/create/`
  - Production: `https://track.delhivery.com/api/backend/clientwarehouse/create/`

Key shipment creation rules from Delhivery docs:

- `format=json&data=` is mandatory in package/order creation.
- For forward shipments, `payment_mode` is `Pre-paid` or `COD`; this project should only use `Pre-paid`.
- For reverse pickup shipments, `payment_mode` is `Pickup`.
- `pin`, `phone`, and `address` are mandatory in all shipment flows.
- `pickup_location.name` must exactly match the registered warehouse name and is case-sensitive.
- The client identifier in the payload must exactly match the registered Delhivery client name.
- If no waybill is passed for a single-piece shipment, Delhivery can dynamically assign one.
- Multi-piece shipments require explicit waybills for each box.
- Order IDs should be unique, especially when Delhivery dynamically assigns the waybill.
- Delhivery warns against special characters in payload values: `&`, `#`, `%`, `;`, and backslash.
- For shipment value above INR 50,000, an E-waybill is required.
- Seller GST TIN and HSN code are documented as mandatory for order creation.
- Delhivery recommends or requires serviceability checks before order creation; if a destination pincode is not serviceable, creating the order is pointless and can lead to NSZ/non-serviceable handling.

Operational facts:

- A pickup request is needed to tell Delhivery when to collect forward shipments unless the merchant uses a manual or scheduled operational path.
- Pickup requests require pickup time, date, warehouse name, and quantity.
- Delhivery says pickup requests are optional through API because they can also be created from the client panel.
- Reverse pickup shipments are scheduled automatically according to Delhivery's FAQ; separate pickup request API is not required for reverse pickup.
- The Package Slip API is not mandatory. Delhivery says merchants can create their own package slip if Delhivery validates that all required information is present.
- Tracking can be pull-based through the tracking API or push-based by giving Delhivery an endpoint for scan updates.
- Pull tracking is limited to 750 requests per 5 minutes per IP.

## Recommended Medusa Architecture

Delhivery should be implemented as a Medusa fulfillment module provider, not as custom checkout logic.

Recommended backend shape:

- `apps/medusa/src/modules/delhivery-fulfillment`
  - Medusa fulfillment provider service implementing Medusa v2 `IFulfillmentProvider`.
  - Delhivery API client isolated behind a small typed client.
  - Payload mapping utilities for Medusa order/address/items to Delhivery shipment fields.
  - Validation utilities for pincode, phone, address, HSN, GST, weight, dimensions, and configured pickup location.
- Optional Medusa workflows:
  - create Delhivery shipment after fulfillment creation.
  - cancel Delhivery shipment if fulfillment is canceled before pickup.
  - poll tracking for active AWBs.
  - process Delhivery scan push events if push tracking is enabled.
- Optional Admin extension later:
  - show AWB, Delhivery status, label/slip links, pickup request status, and retry/cancel actions.

Recommended `medusa-config.ts` future shape:

- Register the custom provider through `@medusajs/medusa/fulfillment`.
- Keep the provider conditional on complete Delhivery env config.
- Keep the manual provider available during rollout so operations can fall back without blocking orders.

Expected provider id shape:

- If the module identifier is `delhivery` and config id is `delhivery`, Medusa's registered provider id will follow Medusa's provider id format, similar to `fp_delhivery_delhivery`.
- Shipping options should only be switched from `manual_manual` to the Delhivery provider after staging E2E tests pass.

## Required Configuration

Recommended env vars:

- `DELHIVERY_ENABLED`
- `DELHIVERY_ENVIRONMENT`
- `DELHIVERY_API_TOKEN`
- `DELHIVERY_CLIENT_NAME`
- `DELHIVERY_PICKUP_LOCATION_NAME`
- `DELHIVERY_DEFAULT_PACKAGE_TYPE`
- `DELHIVERY_DEFAULT_SHIPPING_MODE`
- `DELHIVERY_SELLER_GST_TIN`
- `DELHIVERY_CLIENT_GST_TIN`
- `DELHIVERY_DEFAULT_HSN_CODE`
- `DELHIVERY_TRACKING_PUSH_SECRET` if scan push webhooks are enabled

Rules:

- Do not expose Delhivery tokens to the storefront.
- Keep test and production tokens separate.
- Keep pickup location names environment-specific and exact-case.
- Do not log API tokens, full customer addresses, raw tracking webhook payloads, or full Delhivery request/response bodies in production logs.
- Store only operationally necessary shipment data in Medusa, such as AWB, provider shipment id/order id, status, label/slip URL if used, and last tracking update.

## Recommended Order Flow

V1.1 conservative flow:

1. Customer places a prepaid order through Medusa/Razorpay.
2. Owner reviews the paid order in Medusa Admin.
3. Owner packs the order and confirms weight/dimensions.
4. Owner creates a fulfillment in Medusa Admin using the Delhivery provider.
5. Delhivery provider validates required fields and serviceability.
6. Delhivery provider creates a forward shipment with `payment_mode: "Pre-paid"`.
7. Delhivery returns or confirms an AWB.
8. Medusa fulfillment stores AWB/tracking details.
9. Owner prints label/package slip.
10. Owner creates pickup request manually in Delhivery One or through the pickup request API.
11. Tracking is updated through polling or scan push.

This flow keeps human approval before shipment creation, which is appropriate for a small premium fashion operation where final package dimensions, fragile handling, and inventory checks matter.

Fully automated future flow:

1. Paid order event triggers a workflow.
2. Workflow verifies payment state, address completeness, product HSN/GST data, weight/dimensions, and pincode serviceability.
3. Workflow creates Delhivery shipment.
4. Workflow creates or attaches to pickup request.
5. Workflow stores AWB/tracking/label data.
6. Workflow sends shipment email.

This should wait until the manual fulfillment path is stable.

## Payload Mapping Rules

Medusa to Delhivery mapping should be explicit and tested.

Order identity:

- Use Medusa order id or display id as Delhivery `order`.
- Prefer a deterministic, unique value such as `order_{display_id}` or the Medusa order id.
- Store the returned AWB in fulfillment data.
- Never create multiple Delhivery shipments for the same fulfillment without an idempotency check.

Payment:

- Always send prepaid shipment data for v1.
- Do not send COD fields unless COD is intentionally added later.

Customer/address:

- Use Medusa shipping address as the Delhivery destination.
- Validate pincode length and numeric format.
- Validate phone is present and normalized for India.
- Normalize address lines conservatively; do not silently drop important address data.
- Avoid unsupported special characters before sending to Delhivery.

Items:

- Include product name/title.
- Include SKU/variant SKU when available.
- Include quantity.
- Include declared value from order line totals.
- Include HSN code and GST details once legally confirmed.

Package:

- Require package weight and dimensions before Delhivery shipment creation.
- Defaulting dimensions is risky for billing and serviceability; use defaults only if the business explicitly accepts that operational tradeoff.
- For launch automation, use single-piece shipments only.
- Multi-piece shipment support should be a separate feature because Delhivery requires explicit waybills per box.

## Tracking Strategy

Recommended first version:

- Use pull tracking through a scheduled job for active AWBs.
- Poll only orders that are shipped but not delivered/canceled/returned.
- Stay comfortably below Delhivery's documented 750 requests per 5 minutes per IP.
- Persist the last known Delhivery status and timestamp in fulfillment metadata or a dedicated shipment model.

Recommended future version:

- Add Delhivery scan push endpoint.
- Give Delhivery a server endpoint on the Medusa backend.
- Protect the endpoint with a shared secret in the URL, header, or agreed authentication mechanism.
- Make event processing idempotent by AWB plus scan timestamp/status.
- Treat push events as fulfillment/tracking updates, not as a replacement for Medusa order/payment truth.

## Returns And Reverse Pickup

Returns should not be part of the first Delhivery automation unless the final return/exchange policy is locked.

Future return flow:

- Merchant approves return/exchange in Medusa Admin.
- Workflow creates Delhivery reverse pickup shipment with `payment_mode: "Pickup"`.
- Do not create a separate pickup request for reverse pickup if Delhivery's account behavior matches the documented FAQ.
- Store reverse AWB separately from forward AWB.
- Track reverse shipment independently.
- Only trigger refund/exchange completion after return inspection rules are satisfied.

## Security And Privacy

Required controls:

- Server-only Delhivery API client.
- Secrets only in Medusa environment variables.
- Separate test/prod token and client configuration.
- No Delhivery credentials in `NEXT_PUBLIC_*`.
- Redact token, full address, and phone from logs.
- Log stable correlation ids: Medusa order id, fulfillment id, AWB, and Delhivery request id if available.
- Retry only safe operations. Shipment creation must be idempotent to avoid duplicate AWBs/orders.
- Keep raw Delhivery payloads out of analytics.

## Failure Handling

Expected failures:

- Pincode not serviceable.
- Warehouse/pickup location name mismatch.
- Duplicate Delhivery order id.
- Invalid or consumed waybill.
- Missing GST/HSN/e-waybill data.
- Wallet balance below Delhivery minimum for prepaid account.
- Delhivery API timeout or 5xx.
- Pickup failed or delayed.

Recommended handling:

- Do not mark fulfillment shipped until Delhivery shipment creation succeeds and AWB is stored.
- On serviceability failure, keep order paid but unfulfilled and surface an operations task.
- On duplicate order id, fetch current shipment/tracking state before retrying creation.
- On network failure during shipment creation, check by order id/AWB before retrying.
- On pickup failure, keep fulfillment status truthful and require manual operations intervention.

## QA Plan

Preconditions:

- Delhivery test account with API token.
- Test client name.
- Test pickup location/warehouse created and exact name confirmed.
- Test pincode pairs for serviceable and non-serviceable destinations.
- Test product data includes weight, dimensions, HSN, GST fields where required.

Required staging tests before production:

- Serviceability success and failure.
- Create prepaid single-piece shipment from a paid Medusa order.
- Confirm AWB is returned and stored.
- Confirm no duplicate shipment is created on retry.
- Confirm invalid/missing pickup location fails clearly.
- Confirm package/order creation fails clearly if required address/phone/pin data is missing.
- Generate or retrieve package slip/label through the chosen path.
- Create pickup request or validate manual pickup flow.
- Pull tracking for the AWB and store status.
- Cancel shipment before pickup if supported and needed.
- Verify no Delhivery token or full PII appears in logs.

Production readiness gates:

- Separate production token and production pickup location configured.
- Manual fallback documented.
- Owner understands when shipment is created and when billing starts.
- Customer support has AWB and tracking URL visibility.
- Refund/return policy is not dependent on incomplete reverse pickup automation.

## Implementation Checklist

Phase 1: prepare data and operations.

- Confirm Delhivery account type, client name, token, pickup location, and shipping modes.
- Confirm GST, HSN, invoice, and e-waybill requirements with the business.
- Add product/package data model decisions for weight/dimensions and HSN.
- Decide whether owner creates pickup requests manually or through API.

Phase 2: build provider.

- Add Delhivery API client.
- Add Medusa fulfillment provider module.
- Implement serviceability check.
- Implement prepaid single-piece shipment creation.
- Store AWB/tracking metadata.
- Implement idempotent retry behavior.
- Keep manual provider available.

Phase 3: tracking.

- Implement pull tracking scheduled job first.
- Add push scan webhook only after Delhivery confirms authentication and payload behavior.
- Add customer shipment notification only after AWB/tracking data is reliable.

Phase 4: returns.

- Wait for final return/exchange policy.
- Implement reverse pickup as a separate workflow.

## Recommendation

Do not add Delhivery automation directly to the storefront.

The right implementation is a Medusa fulfillment provider plus workflows. For this brand and v1 scope, the first automation should be conservative: owner-reviewed fulfillment, serviceability validation, single-piece prepaid shipment creation, AWB storage, label/slip support, and pull tracking. Pickup request automation and reverse pickup should come after the primary forward shipment flow is proven in staging.

## Source References

- Delhivery Express API introduction: https://delhivery-express-api-doc.readme.io/reference/introduction-1
- Delhivery prerequisites: https://delhivery-express-api-doc.readme.io/reference/must-to-have-for-integration
- Delhivery package order creation: https://delhivery-express-api-doc.readme.io/reference/order-creation-api
- Delhivery fetch waybill: https://delhivery-express-api-doc.readme.io/reference/fetch-waybill
- Delhivery bulk waybill: https://delhivery-express-api-doc.readme.io/reference/bulk-waybill
- Delhivery tracking API: https://delhivery-express-api-doc.readme.io/reference/order-tracking-api
- Delhivery pickup request API: https://delhivery-express-api-doc.readme.io/reference/pickup-request-creation-api
- Delhivery warehouse creation API: https://delhivery-express-api-doc.readme.io/reference/clientwarehouse-create-api
- Delhivery API FAQ: https://delhivery-express-api-doc.readme.io/reference/frequently-asked-questions
- Delhivery One forward order operations: https://help.delhivery.com/docs/create-forward-order
- Delhivery One pickup request operations: https://help.delhivery.com/docs/pickup-request
- Medusa fulfillment provider docs: https://docs.medusajs.com/resources/commerce-modules/fulfillment/fulfillment-provider
- Medusa fulfillment concepts: https://docs.medusajs.com/resources/commerce-modules/fulfillment/concepts
- Medusa fulfillment module links: https://docs.medusajs.com/resources/commerce-modules/fulfillment/links-to-other-modules
