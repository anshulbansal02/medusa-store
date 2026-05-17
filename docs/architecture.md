# Architecture

Status: canonical v1 architecture
Last reviewed: 2026-05-15

## Goals

- Use existing commerce modules instead of inventing commerce logic.
- Keep the backend standard, modular, and maintainable.
- Keep infrastructure low-complexity and around USD 50/month or lower where practical, excluding payment gateway transaction fees.
- Preserve extension points for Razorpay, shipping automation, custom admin views, and future lightweight AI.

## System Overview

```txt
Customer
  -> Next.js storefront on Vercel
  -> Medusa Store API on Railway
  -> Medusa backend/admin
  -> Railway Postgres + Railway Redis

Integrations:
  Razorpay prepaid payments
  Resend transactional email
  Cloudflare R2 media
  Cloudflare Web Analytics
  Cloudflare DNS/optional admin access
```

## Commerce Core

Medusa is the commerce source of truth.

Medusa owns:

- Products.
- Variants.
- Prices.
- Inventory.
- Carts.
- Checkout.
- Orders.
- Customers.
- Promotions.
- Fulfillment state.
- Payment state.

Rules:

- Do not duplicate commerce tables in the storefront.
- Do not build custom cart/order/payment logic outside Medusa.
- Do not patch Medusa core.
- Use Medusa modules/providers/workflows for extensions.

## Storefront Integration

The storefront talks to Medusa through a small data layer.

```txt
apps/storefront/lib/medusa/
  client.ts
  regions.ts
  categories.ts
  products.ts
  cart.ts
  payments.ts
  orders.ts
  customer.ts
```

Rules:

- No complex backend-for-frontend layer unless a real need appears.
- No random Medusa API calls inside deeply nested UI components.
- Keep shared Store API context, such as default region lookup, in one helper.
- Next.js owns UI, SEO, rendering, and customer interactions.
- Medusa owns commerce state and final payment/order/fulfillment behavior.

## Infrastructure

```txt
Vercel Pro:
  Next.js storefront
  QA storefront from dev branch
  Production storefront from main branch (not deployed in phase 1)

Railway Pro:
  QA Medusa backend/admin
  QA Postgres
  QA Redis
  Production Medusa/Postgres/Redis configured, production deploy disabled in phase 1

Cloudflare:
  DNS after transfer from Shopify-managed domain
  R2 media storage
  Web Analytics
  Optional Turnstile
  Optional Access for admin
```

Use Railway Postgres for Medusa because Medusa runs on Railway. Do not use Supabase only as a remote Postgres database unless a clear Supabase-specific need appears.

## Redis

Production should use Redis.

Redis is used for:

- Event bus.
- Workflow coordination.
- Locks.
- Caching.
- Temporary state.
- Job/event reliability.

Postgres remains the durable data store for products, orders, customers, carts, payments, and inventory.

QA should not share production Redis. Add QA Redis only if QA backend flows require production-like behavior.

## Media

Use Cloudflare R2 for product/media storage.

Rules:

- Use R2 Standard storage for product media.
- Prefer a custom media domain such as `media.brand.com`.
- Use Medusa S3-compatible file provider configuration for R2.
- Configure the Medusa file module only when all R2/S3 environment variables are present; local placeholder environments keep the default local file provider.
- Add the production media hostname to the storefront `NEXT_PUBLIC_IMAGE_HOSTNAMES` allow-list so `next/image` can render Medusa-uploaded product media.
- Use `next/image` with correct remote patterns/loader.
- Add Cloudflare Images only if image transformation or Vercel image costs become a real problem.

## Payments

Use Razorpay prepaid payments for v1.

Customer-facing methods can include UPI, cards, net banking, and wallets where enabled by Razorpay.

Rules:

- No COD in v1.
- No custom EMI/pay-later UX in v1.
- Create payment sessions through Medusa Store API.
- Verify Razorpay signatures server-side through the Medusa backend.
- Use webhooks for final payment state where available.
- Never mark orders paid from only a frontend callback.

## Shipping

V1 shipping is simple manual fulfillment/tracking in Medusa Admin.

Rules:

- No Shiprocket API integration at launch.
- No Delhivery API integration at launch.
- Keep checkout shipping simple.
- Prefer free shipping on prepaid orders if margins allow; fallback to free-shipping threshold.
- Architect future shipping automation as a Medusa fulfillment provider.
- Keep the operational process in `docs/operations.md`.

Future providers:

- Shiprocket/aggregator if the business needs courier flexibility.
- Delhivery direct if the business gets direct rates/pickup and wants one courier relationship.

## Email

Use Resend for transactional email.

Expected v1 emails:

- Order confirmation.
- Shipping/tracking email.
- Payment/order status only if needed.
- Owner new-order notification.

Resend free plan is expected to be enough for early volume. Keep marketing email separate.

Implementation:

- Register Resend as a Medusa notification provider when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.
- Send order confirmation from an `order.placed` subscriber through a Medusa workflow and `sendNotificationsStep`.
- Send owner new-order notifications from the same workflow when `OWNER_ORDER_EMAIL` is configured.
- Keep email content in the Medusa app because order data and notification delivery are backend concerns.

## Analytics

Use Cloudflare Web Analytics for v1 basic website visibility.

Rules:

- Track basic page/performance/referrer/device visibility.
- Do not use Google Analytics.
- Do not use Meta/ads pixels.
- Do not track customer/payment/order data.
- Keep commerce visibility in Medusa Admin, Razorpay, Resend, and logs.

If open-source analytics becomes a hard requirement later, evaluate GoatCounter before heavier tools.

## Domains

Use subdomains for separate services.

```txt
www.brand.com        storefront
brand.com            redirect to www.brand.com
admin.brand.com      Medusa Admin
api.brand.com        Medusa API
media.brand.com      R2 media
qa.brand.com         QA storefront
qa-api.brand.com     QA API, only if hosted QA backend exists
qa-admin.brand.com   QA Admin, only if hosted QA backend exists
```

Do not mount Medusa Admin/API under storefront paths unless there is a specific future reason.

## Environments

Branches:

- Feature branches are used for development work.
- `dev` deploys to QA.
- `main` deploys to production.
- Feature branches merge into `dev`.
- `dev` merges into `main` for production release.
- `dev` should be the default GitHub branch.
- `dev` and `main` must be protected; no direct pushes.

QA:

- QA storefront from `dev`.
- QA backend/database from `qa` environment only.
- QA secrets must be separate from production.
- QA must not mutate production orders, live payments, production customers, or inventory.
- Phase 1 is QA-only: production deployment is intentionally not enabled.

Production:

- Production storefront from `main`.
- Production Medusa/Postgres/Redis on Railway.
- Razorpay live keys.
- Resend production domain.

## Security

Required:

- HTTPS everywhere.
- Strong Medusa Admin credentials.
- Separate admin accounts; no shared passwords.
- Secrets only in Vercel/Railway secret stores.
- Separate QA/prod secrets.
- CORS restricted to known storefront/admin origins.
- Razorpay signature verification.
- Webhook signature verification where available.
- No secrets, raw payment tokens, or sensitive customer data in logs.
- Postgres backups enabled.
- Least-privilege R2/S3 tokens.

Preferred if simple:

- Cloudflare Access in front of `admin.brand.com`.
- Cloudflare Turnstile on public forms if spam appears or protection is needed.

Avoid:

- IP allowlists/VPN for v1 unless the business explicitly wants that friction.

## Cost Guardrails

Expected recurring services:

- Vercel Pro: already acceptable.
- Railway Pro: already acceptable; keep usage within included credit where practical.
- Resend Free initially.
- Cloudflare R2: low usage expected.
- Cloudflare Web Analytics: free.

Avoid adding:

- Supabase unless Railway is not used for backend/database or a Supabase-specific feature is required.
- Heavy analytics infrastructure.
- Separate CMS.
- Extra queues/databases/search services before real need.
