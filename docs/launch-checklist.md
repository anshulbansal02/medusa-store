# Launch Checklist

Status: v1 manual launch checklist
Last reviewed: 2026-05-24

This checklist is intentionally lightweight. There is no written test suite for v1, so manual checks must be disciplined.
Use `docs/razorpay-integration.md` as the source of truth for Razorpay QA and production setup.

## Build And Code

- TypeScript check passes.
- Lint/format check passes.
- Production build passes.
- No obvious console errors on key pages.
- `.env.example` files are current.
- Real secrets are not committed.
- `dev` and `main` branches are protected.
- GitHub repo settings, Actions environments, and Actions secrets are configured manually for v1.
- Direct pushes to `dev` are allowed for active development and run CI.
- QA deploys from `dev` are manual workflow dispatch for v1.
- Production releases merge to `main` through PR, then deploy by manual workflow dispatch for v1.
- GitHub Actions CI runs on `dev` and `main` for lint/typecheck/build checks.
- CI stays lean: no heavy/fancy checks unless they catch a real current risk.
- CI/CD deploy mapping:
  - Storefront QA deploy from `dev` is manual workflow dispatch.
  - Medusa QA deploy from `dev` is manual workflow dispatch.
  - Production deploys from `main` are manual workflow dispatch.
- Confirm the manually dispatched Medusa deploy target shows a successful build step before smoke testing API endpoints.
- Confirm Medusa QA deploy credentials for the shared Lightsail QA setup.
- Confirm Vercel storefront QA deploy is enabled through the GitHub `qa` environment secret `VERCEL_TOKEN`.
- Confirm Vercel storefront QA config has `MEDUSA_BACKEND_URL=https://qa-api.neonfold.com` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` on the QA Vercel project.
- Confirm `qa.neonfold.com` loads after the manual QA storefront deployment.

## Storefront UX

- Home page checked on mobile and desktop.
- Collection page checked on mobile and desktop.
- Product page checked on mobile and desktop.
- Search checked on mobile and desktop.
- Cart drawer checked on mobile and desktop.
- Cart page checked on mobile and desktop.
- Checkout checked on mobile and desktop.
- Empty/loading/error states checked where practical.
- Product image lightbox/zoom works.
- Mobile sticky add-to-cart works.
- Related products render correctly.
- Text does not overflow or overlap.
- Design does not look generic AI/LLM-generated.

## Commerce Flow

- Product catalog loads from Medusa.
- Size/color variants display correctly.
- Unavailable variants are clear.
- Add to cart works.
- Quantity updates/removal work.
- Guest checkout works.
- Razorpay test success works.
- Razorpay failure/retry path is understandable.
- Order confirmation page works.
- Order appears correctly in Medusa Admin.
- No COD option appears in v1.

## Payments

- Razorpay keys are separated for QA/prod.
- Razorpay Dashboard payment capture is set to automatic for QA/prod.
- Razorpay webhooks are configured per environment:
  - URL: `{MEDUSA_BACKEND_URL}/hooks/payment/razorpay_razorpay`.
  - Events: `order.paid`, `payment.captured`, `payment.authorized`, `payment.failed`.
  - Secret matches `RAZORPAY_WEBHOOK_SECRET`.
- Razorpay signature verification is implemented server-side.
- Razorpay callback verification fetches the payment/order from Razorpay before returning success.
- Razorpay webhook signature verification is implemented server-side.
- Payment failure does not create a misleading paid order.
- Payment success maps to correct order state.
- Checkout callback failure still completes the cart through the Razorpay webhook.
- No payment secrets are exposed to the browser.

## Email

- Resend domain is verified before production launch.
- SPF/DKIM/DMARC configured where required.
- Order confirmation email sends.
- Owner new-order notification sends if enabled.
- Shipping/tracking email sends if implemented.
- Emails do not expose internal/debug data.

## Shipping And Fulfillment

- Shipping method/rules are visible in checkout.
- Manual fulfillment/tracking workflow is documented in `docs/operations.md`.
- Store team can create fulfillment from Medusa Admin.
- Store team can add tracking number and tracking URL from Medusa Admin.
- Store team understands when shipment/delivery actions become irreversible.
- Customer shipping/tracking communication works if implemented.
- No Shiprocket/Delhivery API integration is expected in v1.

## Content And Policy

- About page present.
- Contact page present.
- Size guide present.
- Shipping policy present.
- Returns/exchanges policy page present.
- Refund/cancellation policy present.
- Terms and conditions present.
- Privacy policy present.
- Returns/exchanges copy is configurable if final terms are not known.
- GST/tax invoice details are not overbuilt; templates leave room for future GST details.

## SEO And Metadata

- Product metadata exists.
- Collection metadata exists.
- Canonical URLs exist.
- Open Graph metadata exists.
- Product JSON-LD exists.
- Sitemap exists.
- Robots file exists.
- Favicons exist.
- Apple touch icon exists.
- Web manifest exists.
- Theme color is set.

## Performance

- Product images use stable dimensions/aspect ratio.
- Product-card images use 4:5 display ratio.
- Below-the-fold images lazy-load.
- No unnecessary heavy third-party scripts.
- Lighthouse mobile performance target is checked where practical.
- Bundle size is reviewed before launch.

## Accessibility

- Header navigation is keyboard usable.
- Mobile menu is keyboard usable.
- Search overlay is keyboard usable.
- Cart drawer is keyboard usable.
- Filters are keyboard usable.
- Checkout forms have labels.
- Focus states are visible.
- Form errors are clear.
- Color contrast checked.
- Product image alt text is reasonable where practical.

## Security

- HTTPS configured for all public domains.
- Caddy is running on Lightsail and routing API/admin hostnames to Medusa.
- Cloudflare proxies production `api` and `admin` records.
- Cloudflare SSL mode is full end-to-end HTTPS, not Flexible SSL.
- Lightsail `80/443` are open for launch and Cloudflare-only origin restriction is tracked as post-stability hardening.
- Tailscale SSH/deploy access works before public SSH is closed.
- Public Lightsail SSH is closed after Tailscale access is verified, with emergency access documented.
- Docker Compose is running separate Medusa server and worker services.
- Medusa QA/prod Compose files are present under `infra/compose/` and require explicit `MEDUSA_IMAGE` and `MEDUSA_ENV_FILE` values.
- Lightsail bootstrap script/runbook has been run and is committed under `infra/`.
- Lightsail host OS is Ubuntu 22.04 LTS; Node.js runtime is inside the Medusa Docker image.
- Lightsail 2 GB swap file with low swappiness is configured and understood as an emergency cushion.
- Medusa Docker image uses Node 24 Debian slim, not Alpine, unless compatibility is revalidated.
- Production Lightsail automatic snapshots are enabled and understood as host recovery only.
- Medusa production image is stored privately in GHCR.
- Production deploy uses an immutable image tag, not only `latest`.
- Medusa server health check exists before automated production deploys.
- Medusa `/ready` readiness check exists for Postgres/Redis dependency connectivity.
- Production rollback by previous immutable image tag is documented.
- Production Medusa database migrations require explicit approval before running.
- Cloudflare Tunnel is not required for v1 public ingress.
- Vercel, Lightsail/deploy, and any remaining platform deploy secrets are stored only in approved secret stores and injected at runtime.
- AWS SSM Parameter Store paths exist for Medusa QA runtime config/secrets; production paths are created before production deploy.
- Terraform remote state bucket is encrypted, versioned, public-access-blocked, and access-restricted because state may contain secrets.
- Terraform backend bootstrap was created through `infra/terraform/bootstrap`.
- Terraform production/QA applies are run locally with S3 remote state and native S3 lockfiles.
- GitHub Actions fetches SSM parameters and writes Lightsail runtime env files during deploy.
- Generated Lightsail env files have restrictive permissions.
- QA backend domain `qa-api.neonfold.com` is configured and verified. QA admin domain `qa-admin.neonfold.com` is configured, proxied through Cloudflare, and still requires Medusa Admin authentication.
- QA Medusa containers are stopped by default if sharing the production Lightsail instance.
- QA uses separate Neon branch/database, Redis, secrets, and Razorpay test credentials.
- Medusa Admin has strong credentials.
- Cloudflare Access protects production `admin.brand.com` before production launch; QA Access is deferred until the Cloudflare API token has Zero Trust Access write permission.
- Cloudflare Access email OTP allowlist contains only approved admin emails before Access is enabled.
- Cloudflare Access app/policies for admin are Terraform-managed and reviewed before Access is enabled.
- Conservative Cloudflare WAF/security baseline is enabled for proxied API/admin records.
- Bot Fight Mode and aggressive WAF/rate-limit rules are not enabled at launch unless tested against checkout, webhooks, API, and admin flows.
- Cloudflare Turnstile protects public forms and is verified server-side.
- No shared admin passwords.
- CORS restricted to known origins.
- Production secrets are only in approved Vercel and Medusa runtime secret stores.
- QA/prod secrets are separate.
- No secrets in logs.
- R2 tokens are least-privilege.
- R2 bucket/media DNS are Terraform-managed where supported.
- R2 S3 access credentials are created manually and stored in SSM `SecureString`.
- Neon Postgres production project is in the selected Singapore region.
- Neon backup/restore behavior is verified before launch.
- No external `pg_dump` backup is required for v1 unless recovery requirements change.
- Neon pooled and direct connection strings are understood and stored only in approved secret stores.
- QA Neon branch exists with separate credentials and reset/refresh rules.
- Upstash Redis production database is in Singapore.
- Upstash Redis starts on pay-as-you-go and usage monitoring/review is planned.
- QA Upstash Redis is separate from production and also in Singapore.
- Restore process understood at a basic level.

## Analytics And Visibility

- Cloudflare Web Analytics enabled.
- Better Stack uptime checks and alerts configured for storefront and Medusa API.
- Medusa `/health` and `/ready` endpoints exist for liveness and readiness checks.
- Medusa Admin root path is verified on the dedicated admin hostname before unpausing the Better Stack admin monitor.
- Better Stack email/mobile push alerts are tested.
- Better Stack Terraform-managed monitors are reviewed where provider support is used.
- Better Stack error tracking configured for storefront and Medusa backend if included before launch.
- No Google Analytics.
- No Meta/ads pixels.
- No customer/payment/order data sent to analytics.
- Vercel and Medusa runtime logs accessible.
- Caddy and Docker logs accessible on Lightsail.
- Docker/Caddy/app logs ship to Better Stack through Vector.
- Docker local log rotation is configured.
- Razorpay dashboard accessible.
- Resend dashboard accessible.
- Medusa Admin order visibility confirmed.

## Production Cutover

- Domain DNS records configured (can be added later).
- Cloudflare is authoritative DNS before production cutover.
- `www` points to production storefront.
- Apex/root redirects to `www`.
- Admin/API subdomains configured if used.
- Media domain configured if used.
- QA and production URLs are distinct.
- Production smoke test completed after deploy.
