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
  -> Medusa Store API on AWS Lightsail
  -> Medusa backend/admin
  -> Neon Postgres + Upstash Redis

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

AWS Lightsail:
  Production Medusa backend/admin compute
  Single 4 GB instance in Singapore
  Ubuntu 22.04 LTS host OS
  Docker Compose Medusa server and worker containers
  Caddy reverse proxy and HTTPS termination

External managed data services:
  Neon Postgres in Singapore
  Upstash Redis in Singapore, pay-as-you-go initially

Cloudflare:
  Authoritative DNS after cutover from Shopify-managed DNS
  Proxied API/admin records in front of the Lightsail origin
  R2 media storage
  Web Analytics
  Turnstile for public forms
  Access for admin
```

Core backend services run in Singapore for v1:

- Medusa compute: AWS Lightsail Singapore.
- Postgres: Neon AWS Asia Pacific Singapore (`aws-ap-southeast-1`).
- Redis: Upstash Singapore, pay-as-you-go initially.

Do not split Medusa compute, Postgres, and Redis across India and Singapore for v1. Mixed regions would add repeated cross-region calls during cart, checkout, order, admin, and workflow operations. Revisit an all-India backend only if measured production latency requires it or if Neon adds a suitable India region.

Production Medusa compute runs on AWS Lightsail, but durable state must not live on the Lightsail instance. Keep production Postgres, Redis, and media external so the app host can be replaced without moving order, catalog, customer, payment, workflow, or media data.

Use Caddy on the Lightsail instance as the origin reverse proxy and HTTPS manager. Cloudflare DNS/proxy may sit in front, but Cloudflare Tunnel is not the primary public ingress for v1.

Proxy `api.brand.com` and `admin.brand.com` through Cloudflare in production. Keep full end-to-end HTTPS from browser to Cloudflare to Caddy; do not use Flexible SSL.

Launch with Lightsail `80/443` open publicly for simpler DNS/TLS validation. After the Cloudflare-proxied path is stable, restrict origin HTTP/HTTPS access to Cloudflare IP ranges. Keep SSH restricted to the smallest practical trusted source set.

Use Tailscale for routine human SSH and GitHub Actions deploy access to Lightsail. After Tailscale access is tested, close public port `22`; keep Lightsail browser SSH or temporary IP-restricted public SSH as emergency access.

Run Medusa with Docker Compose using one production image and separate `medusa-server` and `medusa-worker` services. Keep deployment mechanics, registry choice, and image tagging as CI/CD decisions.
Production Medusa containers use Docker `restart: unless-stopped`; QA containers do not auto-start by default.
Defer hard Docker memory limits until after QA usage shows real Medusa server/worker memory behavior.

Use GitHub Container Registry for v1 Medusa production images. Keep images private and deploy immutable version tags so rollback does not depend on `latest`.

Production deploys start as controlled Docker Compose updates from GitHub Actions: pull an immutable GHCR image tag, run migrations intentionally, restart services, run a health check, and rollback by redeploying the previous tag. Add `docker-rollout` later for near-zero-downtime `medusa-server` updates after the baseline deploy path is stable. Worker updates can use normal Compose restart semantics.

Production Medusa database migrations require an explicit manual approval gate in the deployment workflow. Use expand-migrate-contract for schema changes and do not combine destructive schema cleanup with the same-minute production app cutover.

Use Terraform, not OpenTofu, for v1 infrastructure as code. Terraform owns durable infrastructure, not application releases. Use Terraform for AWS Lightsail, Cloudflare DNS/R2, Upstash Redis, Vercel project/domain/environment configuration, and Neon resources where provider support is reliable. Use GitHub Actions for image builds, GHCR pushes, deploys, migrations, health checks, and rollback. Do not commit live secret values through Terraform.

Manage the Vercel storefront project and configuration through Terraform where provider support is reliable. Keep Vercel deployments in GitHub Actions. Before managing Vercel secret environment variables in Terraform, confirm the remote state security posture and provider sensitive handling.

Manage Neon through Terraform only after provider review/audit passes. If the Neon provider is not reliable enough, create Neon manually and document/import stable resources later.

Terraform code lives under `infra/terraform` with environment directories and shared modules.

Terraform remote state uses an AWS S3 backend with DynamoDB locking. Use a small bootstrap step/configuration for the state bucket and lock table before regular environment applies.

Terraform uses separate environment directories for `prod` and `qa`, with separate state and shared modules. Do not use Terraform workspaces for v1 environment separation.

Run Terraform `plan` and `apply` locally for v1 while using S3 remote state and DynamoDB locking. GitHub Actions may validate Terraform code later, but must not apply infrastructure until the team intentionally changes that decision.

GitHub repository settings, branch protection, Actions environments, and Actions secrets are configured manually for v1 and documented in checklists. Do not manage GitHub repository settings with Terraform for v1.

Create the S3 state bucket and DynamoDB lock table through a small `infra/terraform/bootstrap` config with local state. Use local state only for this backend bootstrap boundary.

Pin Terraform CLI and provider versions in each root module, commit `.terraform.lock.hcl`, and upgrade providers intentionally in separate changes.

Commit non-secret Terraform tfvars for environment configuration. Never commit secret values in tfvars; provide examples or secure local input paths for secret values.

All Terraform code must pass `terraform fmt` and root modules must pass `terraform validate` before apply. Add repo scripts for these checks during Terraform implementation.

AWS SSM Parameter Store is the central runtime config and secret store for Medusa. GitHub Actions fetches SSM parameters during deploy and writes Medusa runtime env files to Lightsail. Production uses GitHub environment protection/approval. Terraform may manage SSM parameters and Vercel env vars, including secret values, after provider behavior is reviewed. Treat Terraform remote state as a secret-bearing artifact.

Lightsail host bootstrap is a separate committed script/runbook under `infra/`. Terraform creates the VM and network resources; bootstrap installs Docker, Docker Compose plugin, Caddy, deployment directories, permissions, and approved host-level hardening. App deployments remain in GitHub Actions.

The Lightsail host uses Ubuntu 22.04 LTS. Node.js 24 is provided by the Medusa Docker image, not by the host OS.

Configure a 2 GB swap file with low swappiness during Lightsail bootstrap. Treat swap as an emergency cushion only; if it is used regularly, tune containers or scale the instance.

Medusa production Docker builds use an official Node 24 Debian slim base image with multi-stage builds. Do not use Alpine for v1 unless image-size pressure becomes real and native dependency compatibility is verified.

Use Better Stack for uptime checks/alerts and Sentry for storefront and Medusa application error tracking. Manage Better Stack and Sentry resources through Terraform where provider support is stable, with account/API-token bootstrap done manually. Ship Docker/Caddy/app logs to Better Stack via Vector from day one, while keeping local Docker and Caddy logs available on Lightsail as fallback. Do not self-host the observability stack on the production VM for v1.

Add cheap unauthenticated Medusa health endpoints: `/health` for shallow liveness and `/ready` for dependency-aware readiness checks including Postgres/Redis connectivity. Better Stack alerts use email and mobile push for v1. Do not configure Slack or build custom WhatsApp/Telegram/Signal alert bridges for v1.

Do not add a worker heartbeat at launch unless the Medusa worker can emit a real periodic signal. Use worker logs, Sentry backend errors, and Docker restart status initially.

Do not create a public status page for v1; Better Stack is internal monitoring/alerting only.

Enable automatic Lightsail snapshots for the production instance as host recovery convenience. Treat snapshots as separate from data backups; durable data remains in Neon, Upstash, R2, GHCR, Terraform, and bootstrap/deploy automation. Review snapshot storage cost after the first month.

QA/staging Medusa may share the production Lightsail instance, but QA containers stay stopped by default and run only during active test windows. QA must use separate Neon branch/database, separate Redis, separate secrets, and Razorpay test credentials. Move QA to separate compute if it starts affecting production resources or if always-on QA becomes necessary.

QA/staging Redis uses a separate Upstash Redis database in Singapore on pay-as-you-go pricing. QA must never share production Redis.

QA/staging Postgres uses a Neon branch with separate QA/staging credentials. QA must never write to the production Neon branch/database. Document branch reset/refresh rules before launch.

Use Neon Postgres in Singapore for production Medusa. Use pooled application connection strings unless Medusa or Neon guidance requires direct connections for a specific operation. Use Upstash Redis in Singapore for production Redis, starting on pay-as-you-go pricing. Do not provision production database or cache on the Lightsail disk.

Rely on Neon built-in backup/restore/time-travel recovery for v1 and verify restore before launch. Do not add external `pg_dump` backups to R2/S3 unless business risk or recovery requirements change.

Treat Redis as non-source-of-truth infrastructure. Do not add a separate Redis backup/export plan for v1; recover from Medusa/Postgres state if Redis loss disrupts in-flight work.

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

QA should not share production Redis. Do not run QA Redis initially; add it only if QA backend flows require production-like behavior.

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

Terraform manages the R2 bucket and media DNS/custom-domain resources where provider support is reliable. R2 S3 access credentials are created manually in Cloudflare and stored in AWS SSM Parameter Store as `SecureString`.

Do not add separate cross-provider R2 media backups for v1. Keep original product media files organized outside the app and revisit media replication if catalog/media risk grows.

## Payments

Use Razorpay prepaid payments for v1.

Customer-facing methods can include UPI, cards, net banking, and wallets where enabled by Razorpay.

Rules:

- No COD in v1.
- No custom EMI/pay-later UX in v1.
- Create payment sessions through Medusa Store API.
- Create a Razorpay Order from the Medusa payment provider before opening Razorpay Checkout.
- Verify Razorpay signatures server-side through the Medusa backend.
- Bind Checkout success callbacks to the server-created Razorpay order for the active cart.
- Use Medusa's payment webhook route for final payment state:
  `/hooks/payment/razorpay_razorpay`.
- Subscribe Razorpay webhooks to `order.paid`, `payment.captured`, `payment.authorized`, and `payment.failed`.
- Configure automatic capture in the Razorpay Dashboard for QA and production unless the business intentionally changes to manual capture later.
- Never mark orders paid from only a frontend callback.

Razorpay account/dashboard setup remains manual outside Terraform. Store Razorpay app config values and secrets in the approved runtime config stores and keep QA/test separate from production/live.

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
- Keep commerce visibility in Medusa Admin, Razorpay, Resend, Better Stack, Sentry, and logs.

If custom events or lightweight funnel visibility becomes necessary later, evaluate Umami Cloud before heavier product analytics tools.

## Search Infrastructure

Do not provision dedicated search infrastructure in the initial infra build. Keep search implementation modular so Algolia can be added later without scattering provider calls through UI components. Use Postgres/Medusa-native search as the launch fallback until a dedicated provider is intentionally added.

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

Manage production DNS in Cloudflare after a planned cutover from the current Shopify-managed DNS setup. This does not require transferring registrar ownership unless the business intentionally chooses to do that later.

Keep this service-separated domain layout for v1. Do not mount Medusa API or Admin under storefront paths.

Do not mount Medusa Admin/API under storefront paths unless there is a specific future reason.

## Environments

Branches:

- Feature branches are used for development work.
- `dev` deploys to QA.
- `main` is the production release branch.
- Feature branches merge into `dev`.
- `dev` merges into `main` for production release.
- `dev` should be the default GitHub branch.
- `dev` and `main` must be protected; no direct pushes.

QA:

- QA storefront from `dev`.
- QA backend/database from `qa` environment only.
- QA secrets must be separate from production.
- QA must not mutate production orders, live payments, production customers, or inventory.
- QA Medusa may share the production Lightsail instance, but uses separate Neon branch, Upstash Redis, secrets, and Razorpay test credentials.

Production:

- Production storefront from `main`.
- Production Medusa compute on AWS Lightsail 4 GB in Singapore.
- Production Postgres on Neon in Singapore.
- Production Redis on Upstash in Singapore, pay-as-you-go initially.
- Production deploys are manual workflow dispatch for v1.
- Production migrations require explicit approval.
- Razorpay live keys.
- Resend production domain.

## Security

Required:

- HTTPS everywhere.
- Strong Medusa Admin credentials.
- Separate admin accounts; no shared passwords.
- Secrets only in approved runtime/platform secret stores.
- Separate QA/prod secrets.
- CORS restricted to known storefront/admin origins.
- Razorpay signature verification.
- Webhook signature verification where available.
- No secrets, raw payment tokens, or sensitive customer data in logs.
- Neon backup/restore posture verified before launch.
- Least-privilege R2/S3 tokens.
- Conservative Cloudflare WAF/security baseline for proxied API/admin records.

Preferred if simple:

- Additional Cloudflare WAF/rate-limit rules only after they are tested against checkout, webhooks, API, and admin flows.

Required for production admin:

- Cloudflare Access in front of `admin.brand.com`.
- Cloudflare Access email OTP with approved admin email allowlist for v1.
- Medusa Admin authentication remains enabled behind Cloudflare Access.
- Terraform manages the Cloudflare Access app and admin access policies.

Required for public forms:

- Cloudflare Turnstile on contact/newsletter/support forms and future unauthenticated public write actions.
- Server-side Turnstile token verification before accepting submissions.
- Terraform-managed Turnstile widgets where provider support is stable.

Avoid:

- IP allowlists/VPN for v1 unless the business explicitly wants that friction.
- Global Bot Fight Mode or aggressive Cloudflare blocking at launch unless tested against checkout, webhooks, API, and admin flows.

## Cost Guardrails

Expected recurring services:

- Vercel Pro: already acceptable.
- AWS Lightsail 4 GB for production Medusa compute.
- Neon Postgres in Singapore.
- Upstash Redis in Singapore, pay-as-you-go initially.
- Resend Free initially.
- Cloudflare R2: low usage expected.
- Cloudflare Web Analytics: free.

Avoid adding:

- Supabase unless it is explicitly selected as the Postgres provider or a Supabase-specific feature is required.
- Heavy analytics infrastructure.
- Separate CMS.
- Extra queues/databases/search services before real need.
