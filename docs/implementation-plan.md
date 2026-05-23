# Implementation Plan

Status: canonical v1 scope and build order
Last reviewed: 2026-05-15

## MVP Boundary

Use four buckets:

- Must-have: required for launch.
- Nice if simple: include only if clean and low-maintenance.
- Later: planned/possible, but not launch scope.
- Explicitly not v1: do not build unless scope changes.

## Must-Have

- Custom Next.js storefront.
- Medusa backend/admin.
- Product catalog with size/color variants.
- Product images.
- Product detail pages with size chart.
- Product image lightbox/zoom.
- Collection/listing pages.
- Search with a modular provider boundary.
- Bag drawer and bag page.
- Mobile sticky add-to-bag.
- Related products / "you may also like".
- Guest checkout.
- Razorpay prepaid payment.
- Order confirmation.
- Resend transactional email.
- Basic shipping rules.
- Manual fulfillment/tracking in Medusa Admin.
- Medusa Admin operations.
- R2 media storage.
- Core policy/legal pages.
- Contact/WhatsApp support link.
- Cloudflare Web Analytics.
- SEO basics: metadata, sitemap, robots, product structured data.
- Performance/accessibility/security basics.
- QA and production deployment flow.

## Nice If Simple

- Buy Now.
- Local wishlist.
- Recently viewed products.
- Product badges: New, Sale, Low stock, Bestseller if meaningful.
- Simple Track Order page.
- Newsletter email capture.
- Lightweight custom admin widgets/views.
- Cloudflare Turnstile for public forms.
- Cloudflare Access for admin if setup is simple.
- Fit notes/model measurements/product measurements.

## Later

- Shipping provider automation.
- Customer account polish/order history.
- Saved addresses if not native/simple.
- Reviews/testimonials when real.
- CMS.
- Blog/lookbook/content engine.
- EMI/pay-later custom UX.
- Marketing email platform.
- Automated WhatsApp/SMS.
- AI-assisted admin/search/helper features.
- Dedicated search engine such as Algolia, Meilisearch, or Typesense.
- Cloudflare Images.
- GoatCounter/Umami/PostHog only if Cloudflare Web Analytics becomes insufficient.

## Explicitly Not V1

- Shopify as commerce platform.
- Custom commerce backend.
- Full custom admin replacement.
- COD.
- International shipping/currency.
- Dark mode.
- Gift cards.
- True bundles.
- Waitlist/back-in-stock.
- Full offline PWA/service worker.
- Live Instagram feed.
- Fake reviews.
- Heavy AI/LLM features.
- Complex fit quiz.
- Heavy analytics infrastructure.
- Multi-language.
- Loyalty/referral program.

## Build Phases

### Phase 0: Project Foundation

Goal: get the repo and local development shape right.

- Repository structure.
- Node.js 24 LTS recorded in version and engine files.
- Corepack-managed pnpm pinned in root `packageManager`.
- pnpm supply-chain policy with 3-day minimum release age.
- App-generated TypeScript configs; no root `tsconfig.base.json` until it is useful.
- `.editorconfig`.
- Next.js app scaffolded with official `create-next-app` CLI using Biome, `src/`, and `@/*`.
- Medusa app scaffolded with official `create-medusa-app` CLI and placed at `apps/medusa`.
- pnpm scripts.
- Docker Compose for local Postgres/Redis from day one.
- Apps run directly with pnpm on the host in local development.
- `.env.example` files.
- Secrets/config guide linked from docs.
- Basic README.
- Initial docs wired.

Rules:

- Use official framework CLIs for initial scaffolding.
- Do not manually create framework internals.
- Use latest stable tooling at setup time.
- Clean up generated files after scaffolding where they conflict with project decisions.
- Do not install Medusa's optional Next.js Starter Storefront; the customer storefront is custom.
- Use simple conventional commit messages.
- Use feature branches merged to `dev`, then `dev` merged to `main`.
- Keep `dev` as the default branch once the remote exists.

### Phase 1: Design Foundation

Goal: establish the visual system before building many pages.

- Tailwind setup.
- shadcn CLI-installed component structure.
- Base UI primitives.
- Design tokens.
- Typography.
- Layout shell.
- Header.
- Footer.
- Basic responsive rules.

### Phase 2: Commerce Browsing

Goal: let customers browse real catalog data.

- Medusa product connection.
- Home page.
- Collection/listing pages.
- Product detail pages.
- Search with a modular provider boundary; dedicated search infrastructure is deferred.
- Product cards.
- Image handling.
- Related products.
- Image lightbox/zoom.

### Phase 3: Bag And Checkout

Goal: complete the purchase path.

- Bag drawer.
- Bag page.
- Guest checkout.
- Razorpay test integration.
- Order confirmation.
- Payment failure/retry states.
- Mobile sticky add-to-bag.

### Phase 4: Operations

Goal: make the store operable.

- Resend emails.
- R2 media setup.
- Manual shipping/fulfillment workflow.
- Policy/legal pages.
- Contact/WhatsApp support.
- Newsletter capture if simple.
- Medusa Admin setup.

### Phase 5: Polish And Launch

Goal: harden the product before production.

- SEO metadata.
- Sitemap/robots.
- Product JSON-LD.
- Performance pass.
- Accessibility pass.
- Security pass.
- Cloudflare Web Analytics.
- QA/prod deployment.
- Manual launch checklist.

## Scope Control Rules

- If a nice-if-simple feature creates backend complexity, move it later.
- If a feature requires business policy that is unknown, keep copy/config flexible.
- If a feature risks checkout/payment/order correctness, defer it unless essential.
- If a design feature looks generic or decorative, cut it.
- Keep first launch small and polished.
