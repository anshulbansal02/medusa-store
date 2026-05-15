# Fashion Commerce Platform Research

Date: 2026-05-15

Status: historical research note. For current implementation decisions, use:

- [Architecture](architecture.md)
- [Storefront Experience](storefront-experience.md)
- [Engineering Standards](engineering-standards.md)
- [Implementation Plan](implementation-plan.md)
- [Launch Checklist](launch-checklist.md)

Some options discussed here, such as COD, S3, Supabase, or shipping automation, were later refined in the canonical docs.

## Context

We are planning a low-cost, low-maintenance web store for a small single-brand fashion business. Current expected scale is modest: roughly 25-100 products and around 100-200 customers initially. The business does not need marketplace, B2B, POS, multiple vendors, or complex custom pricing in the first version.

The main product direction is:

- Use open-source or self-hostable commerce components where practical.
- Do not build commerce logic from scratch.
- Keep the storefront user experience polished and brand-appropriate.
- Keep the shop owner/admin experience simple.
- Allow integrations like Razorpay, email, shipping, analytics, and storage.
- Start simple and expand later without a full rewrite.
- Avoid Shopify as the core platform.

## Recommendation

Use Medusa as the commerce backend/admin and build a custom Next.js storefront.

Recommended v1 stack:

```txt
Storefront: Next.js + React + Tailwind CSS
Commerce backend/admin: Medusa
Database: Postgres
Events/cache: Redis
Payments: Razorpay custom Medusa payment provider + system/COD provider
Email: Resend
Product images/files: S3-compatible storage, preferably Cloudflare R2 or AWS S3
Hosting: Railway for backend/Postgres/Redis initially; Vercel or Railway for storefront
```

This gives us a real commerce engine for catalog, variants, carts, checkout, orders, inventory, payments, promotions, regions, and admin, while leaving the customer-facing storefront fully customizable.

## Why Medusa Fits Best

Medusa is the best default for this scope because it is open-source, Node/TypeScript-friendly, headless, modular, and includes an admin dashboard. Its official Next.js starter is now installed in a monorepo with the backend through `create-medusa-app`, and the storefront is hosted separately from the Medusa application. That gives us a fast starting point without tying the UX to the backend implementation.

Medusa's payment module already models payment collections, authorize/capture/refund flows, webhook handling, and custom third-party payment providers. This matters because Razorpay integration should live as a payment provider, not as ad hoc checkout code scattered through the storefront.

Medusa also includes a system payment provider that behaves like a manual/COD method. For an Indian fashion business, this is useful because COD may be needed even if Razorpay is the primary prepaid payment flow.

The practical advantage: we build on top of commerce primitives instead of inventing cart state, order state, payment state, inventory reservation, refunds, and admin operations ourselves.

## Alternatives Considered

| Option | Fit | Notes |
| --- | --- | --- |
| Medusa | Best fit | Best balance of open source, low business complexity, TypeScript ecosystem, admin, and extensibility. |
| Saleor | Strong but heavier | Excellent GraphQL-first commerce engine with dashboard, apps, webhooks, and strong open-source posture. More platform complexity than needed for v1. |
| Vendure | Strong developer platform | TypeScript/NestJS/GraphQL, very customizable, but more framework-heavy and generally better when the team wants to build deeper commerce plugins. |
| WooCommerce | Operationally mature | Fastest open-source store if WordPress is acceptable, but less aligned with a composable Next.js/headless engineering direction. |
| Supabase custom commerce | Not recommended as commerce core | Good for Postgres, auth, storage, and custom app data, but not a commerce engine. We'd own too much order/payment/cart logic. |
| Shopify | Operationally easiest | Rejected by preference; also less aligned with open-source/self-hosted control. |

## Proposed Architecture

```txt
Customer
  |
  v
Next.js storefront
  - Home
  - Collection pages
  - Product pages
  - Cart
  - Checkout UI
  - Account/order status later
  |
  v
Medusa Store API
  |
  v
Medusa backend + Admin
  - Catalog
  - Variants
  - Inventory
  - Cart/checkout/order flows
  - Promotions
  - Shipping regions/options
  - Payment provider registration
  |
  +--> Postgres
  +--> Redis
  +--> S3/R2 storage
  +--> Razorpay
  +--> Resend
```

Medusa should remain the source of truth for commerce data. The storefront should not directly own product, cart, payment, or order state outside the APIs provided by Medusa.

## MVP Scope

Build v1 around one clean purchase flow:

1. Owner creates product, variants, prices, images, inventory, and shipping settings in Medusa Admin.
2. Customer browses products and collections in the Next.js storefront.
3. Customer selects size/color variants and adds to cart.
4. Customer checks out with shipping details.
5. Customer pays using Razorpay or chooses COD/manual payment if enabled.
6. Medusa creates and tracks the order.
7. Owner manages fulfillment from Medusa Admin.
8. Customer receives transactional emails.

Recommended v1 pages:

- Home
- Shop/all products
- Collection/category page
- Product detail page
- Cart
- Checkout
- Order confirmation
- About
- Contact
- Shipping/returns policy
- Privacy/terms

Avoid in v1:

- Marketplace features
- Multi-warehouse inventory
- Custom CMS
- Loyalty/referral systems
- Complex search infrastructure
- Mobile app
- Heavy personalization
- Custom admin rebuild

## Admin Experience

Use Medusa Admin first. Do not build a custom admin until there is a concrete operational gap.

Admin v1 should support:

- Product creation
- Product images
- Size/color variants
- SKU and inventory entry
- Price entry
- Promotions/discounts
- Order review
- Manual fulfillment status updates
- Refund/cancellation handling where supported by the payment integration

If the owner later needs simpler workflows, we can add small admin extensions or a lightweight operations dashboard on top of Medusa APIs instead of replacing Medusa Admin.

## Payment Strategy

Use Razorpay as the primary Indian payment gateway.

Implementation rule: server-side verification is mandatory. Razorpay's docs require verifying `razorpay_signature` on the server using the original server-created `order_id`, `razorpay_payment_id`, and the secret. We should not mark orders paid based only on a frontend checkout callback.

Recommended Razorpay integration shape:

- Create a custom Medusa payment provider.
- Create Razorpay orders server-side.
- Store Medusa cart/order/payment identifiers in Razorpay notes where useful.
- Verify signature on the backend.
- Confirm payment status through Razorpay APIs and webhooks.
- Handle payment failed, cancelled, refunded, and retry states.
- Keep COD/manual payment available through Medusa's system provider if the business wants COD.

## Email Strategy

Use Resend for transactional email because it is simple, developer-friendly, and has direct Node.js/Next.js/Express-style integration paths.

Initial email events:

- Order confirmation
- Payment success/failure if needed
- Order shipped
- Order cancelled/refunded
- Owner notification for new orders

The key operational requirement is domain verification and deliverability setup before launch.

## Storage Strategy

Use S3-compatible storage for product images and uploaded files.

Good starting options:

- Cloudflare R2: attractive for low egress cost and S3-compatible APIs.
- AWS S3: most standard option, broad tooling, slightly more AWS overhead.
- Supabase S3 Storage: possible, but only worth it if Supabase is already used elsewhere.

Medusa has an S3 file module provider that supports S3-compatible services including Cloudflare R2, so R2 is a reasonable low-cost first choice.

## Hosting Strategy

Start with managed-simple hosting, not raw AWS.

Recommended low-maintenance v1:

```txt
Railway:
  - Medusa backend/admin
  - Postgres
  - Redis

Vercel or Railway:
  - Next.js storefront

Cloudflare:
  - DNS
  - R2 storage
```

Railway is a pragmatic starting point because it can provision Postgres and Redis with little setup, has usage-based pricing, and keeps the backend/database/cache in one project. Railway's database templates are still effectively under our control and require backups/monitoring discipline.

Vercel is the lowest-friction Next.js storefront host. If we want fewer vendors, Railway can also host Next.js. Next.js can self-host on Node.js or Docker, so we should keep the app portable and avoid relying on Vercel-only assumptions.

For a later phase, if cost or control becomes more important than convenience, move backend services to a VPS or AWS ECS/App Runner/RDS/ElastiCache. Do not start there unless we have a clear ops owner.

## Cost Posture

For the expected v1 scale, the main costs are hosting, database/cache, domain, email, storage, payment gateway fees, and optional analytics.

Cost-saving choices:

- Do not use enterprise commerce cloud in v1.
- Use one backend host for Medusa, Postgres, and Redis.
- Use R2 or another S3-compatible storage provider for images.
- Keep search simple with database-backed filters until catalog/search needs grow.
- Avoid custom CMS and custom admin early.
- Use Medusa Admin instead of building owner tools from scratch.

Do not over-optimize to zero-cost hosting if it compromises backups, payment reliability, or owner workflows. For ecommerce, a small predictable monthly infra cost is better than fragile free-tier architecture.

## Key Risks

| Risk | Mitigation |
| --- | --- |
| Razorpay integration is more work than Stripe | Keep it isolated as a Medusa payment provider; implement backend verification and webhooks from day one. |
| Medusa upgrades may require care | Keep customizations small and documented; avoid patching core. |
| Railway databases are convenient but need production discipline | Enable backups, monitor, document restore process. |
| Storefront polish can expand scope | Start from Medusa's Next.js starter, then customize brand/design deliberately. |
| Owner may need workflows Medusa Admin does not expose cleanly | Add small admin extensions only after observing real usage. |
| Search/filtering can become poor if hand-rolled | Use Medusa catalog data first; add Meilisearch/Algolia only when catalog/search needs justify it. |

## Phased Plan

### Phase 0: Decision Prototype

Goal: prove the stack locally.

- Scaffold Medusa monorepo with Next.js starter.
- Add sample fashion products with size/color variants.
- Confirm admin product/order workflow.
- Confirm storefront product/cart/checkout flow.
- Identify Razorpay provider implementation points.

### Phase 1: MVP Store

Goal: launchable single-brand store.

- Customize storefront UI and brand system.
- Configure products, collections, inventory, shipping regions, and basic promotions.
- Implement Razorpay payment provider.
- Enable COD/manual payment if required.
- Configure Resend emails.
- Configure R2/S3 storage.
- Deploy backend, storefront, Postgres, Redis.
- Add backups, environment documentation, and smoke tests.

### Phase 2: Operational Polish

Goal: improve owner and customer experience after real orders.

- Order status emails.
- Better owner notifications.
- Basic analytics.
- Shipping provider integration if order volume justifies it.
- Returns/refund workflow improvements.
- Product import/export if catalog updates become repetitive.

### Phase 3: Scale Only When Needed

Add only if pain appears:

- Dedicated search
- Wishlist
- Customer accounts
- Reviews
- Loyalty/referral
- Advanced analytics
- Custom admin extensions
- More robust infra or cloud migration

## Decisions To Make Next

1. Payment modes: prepaid only, or prepaid + COD?
2. Shipping: flat-rate/manual shipping first, or Shiprocket/other integration from day one?
3. Inventory: exact stock tracking by size/color from day one?
4. Storefront style: minimal clean catalog, or highly editorial fashion brand experience?
5. Hosting preference: Railway-only first, or Vercel storefront + Railway backend?
6. Product content: only Medusa product fields initially, or a CMS later for lookbooks/blogs?

## Suggested Final Direction

Proceed with Medusa + Next.js unless one of these becomes true:

- The team strongly prefers Python/Django/GraphQL over Node/TypeScript, in which case Saleor deserves a deeper spike.
- The owner wants WordPress-style content management more than composable engineering, in which case WooCommerce should be reconsidered.
- The store is so simple that a hosted SaaS becomes acceptable, in which case Shopify would be operationally easier, but that conflicts with the current platform preference.

For the current requirements, Medusa is the most balanced choice: open-source enough, composable enough, small-store friendly enough, and extensible enough for integrations without us owning core commerce logic.

## Sources Checked

- Medusa Next.js starter: https://docs.medusajs.com/resources/nextjs-starter
- Medusa deployments: https://docs.medusajs.com/resources/deployment
- Medusa payment module: https://docs.medusajs.com/resources/commerce-modules/payment
- Medusa payment providers: https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider
- Medusa S3 file provider: https://docs.medusajs.com/resources/infrastructure-modules/file/s3
- Medusa Redis event module: https://docs.medusajs.com/resources/infrastructure-modules/event/redis
- Saleor open source platform: https://saleor.io/open-source
- Vendure docs: https://docs.vendure.io/
- Next.js deployment docs: https://nextjs.org/docs/14/app/building-your-application/deploying
- Railway pricing: https://docs.railway.com/pricing/plans
- Railway Postgres: https://docs.railway.com/databases/postgresql
- Railway Redis: https://docs.railway.com/databases/redis
- Supabase architecture: https://supabase.com/docs/guides/getting-started/architecture
- Razorpay Magic Checkout/payment verification: https://razorpay.com/docs/payments/magic-checkout/web/
- Resend docs: https://resend.com/docs/introduction
- Cloudflare R2 docs: https://developers.cloudflare.com/r2/
