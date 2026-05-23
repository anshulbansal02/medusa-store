# Agent Guide

This file gives AI coding agents the project context and rules. Read this before making changes.

## Project

Single-brand premium fashion ecommerce storefront.

Current direction:

- Commerce core: Medusa.
- Storefront: Next.js App Router.
- Styling/components: Tailwind CSS, shadcn CLI-installed local components, `@base-ui/react`.
- Payments: Razorpay prepaid.
- Email: Resend.
- Media: Cloudflare R2.
- Analytics: Cloudflare Web Analytics.
- Hosting: Vercel Pro storefront + AWS Lightsail Medusa compute.
- Database/cache: Neon Postgres Singapore + Upstash Redis Singapore.
- Infrastructure: Terraform-managed durable infra with GitHub Actions-managed deploys.

Canonical docs:

- `docs/README.md`
- `docs/design-workshop.md`
- `docs/architecture.md`
- `docs/storefront-experience.md`
- `docs/engineering-standards.md`
- `docs/secrets-and-config.md`
- `docs/operations.md`
- `docs/implementation-plan.md`
- `docs/infra-terraform-decisions.md`
- `docs/infra-terraform-implementation-plan.md`
- `docs/launch-checklist.md`
- `docs/cost-model.md`
- `docs/references.md`

## Core Rules

- Do not invent commerce logic.
- Do not build a custom commerce backend.
- Medusa is the source of truth for products, carts, checkout, orders, payments, customers, inventory, and promotions.
- Do not patch Medusa core.
- Keep custom integrations isolated as Medusa modules/providers/workflows where possible.
- Keep the setup simple; avoid complex monorepo tooling.

## Setup Rules

- Use Node.js 24 LTS.
- Use Corepack-managed pnpm pinned in root `packageManager`.
- Use pnpm `minimumReleaseAge: 4320` with strict mode.
- Use official CLIs for framework scaffolding.
- Scaffold the storefront with `create-next-app`.
- Scaffold the Medusa backend with `create-medusa-app`.
- Use Biome, `src/`, and `@/*` for the Next.js storefront scaffold.
- Place the generated Medusa backend at `apps/medusa`.
- Do not install Medusa's optional Next.js Starter Storefront.
- Use Docker Compose for local Postgres and Redis only.
- Run Next.js and Medusa directly with pnpm during local development.
- Run local UI apps through portless.
- Use stable portless URL `http://storefront.localhost` for the storefront UI.
- Use plain HTTP and the default `.localhost` TLD for portless commands in this repo.
- Do not hard-code local UI app ports. Portless assigns random internal app ports.
- Run Medusa directly as the API server on fixed nonstandard local port `29181`.
- Optional Medusa Admin alias is `http://medusa.localhost` via `pnpm medusa:admin:alias`; keep storefront API calls pointed at `http://localhost:29181`.
- Use fixed nonstandard local host ports only for Docker services: Postgres `25433`, Redis `26380`.
- Do not use common dev ports such as `3000`, `4000`, `8000`, `8080`, or `9000` for this project.
- Keep app-generated TypeScript configs initially; do not add a root `tsconfig.base.json` until useful.
- Use simple conventional commit messages; no commit tooling yet.
- Use feature branches merged to `dev`, then `dev` merged to `main`.
- Treat `dev` as the default remote branch once the remote exists.
- Protect both `dev` and `main`.

## Storefront Rules

- Keep Medusa API access inside `apps/storefront/lib/medusa`.
- Keep the Medusa data layer server-only; Client Components should receive typed props or call Server Actions, not import Medusa fetch helpers.
- Do not scatter API calls through UI components.
- Use feature folders for product, collection, cart, checkout, and search behavior.
- Keep `"use client"` boundaries small.
- Do not add `"use client"` to pages, layouts, or broad feature shells for one nested interactive control.
- Use `useEffect` only to synchronize with external systems such as timers, focus, browser APIs, scripts, subscriptions, or non-React widgets.
- Do not use `useEffect` for derived render state or click/form logic that belongs in render code or event handlers.
- Avoid route-level `dynamic = "force-dynamic"` unless the route itself truly requires explicit dynamic rendering.
- Use Zustand for global client-only state when needed.
- Do not put product/catalog server data into Zustand unnecessarily.
- Use React Hook Form + Zod for forms.
- For shared UI primitives, install shadcn components with the shadcn CLI first.
- Customize installed shadcn local components through variants, tokens, and Tailwind utilities.
- Do not hand-roll components that shadcn already provides.
- Use `@base-ui/react`, Vaul, or established accessible primitives directly only when shadcn does not provide a suitable component or when building a domain-specific composition.

## Design Rules

The storefront should feel clean premium, soft feminine, boutique editorial, and product-led.

Avoid generic AI/LLM UI:

- No gradient blobs/orbs.
- No glassy SaaS cards.
- No default shadcn dashboard look.
- No cards inside cards.
- No fake luxury filler copy.
- No decorative complexity replacing real product content.

Use real product imagery, brand assets, clear typography, strong hierarchy, useful content, and screenshot review.

## Security Rules

- Follow `docs/secrets-and-config.md`.
- No secrets in code.
- No real `.env` files committed.
- Use `NEXT_PUBLIC_*` only for browser-safe values.
- Verify Razorpay signatures server-side.
- Verify webhooks where available.
- Do not log secrets, raw payment tokens, or sensitive customer data.
- Keep QA/prod secrets separate.

## V1 Scope

Must-have scope is in `docs/implementation-plan.md`.

Do not build in v1:

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

## Quality Expectations

There is no written test suite for v1. Still run/check what is practical:

- Typecheck.
- Lint/format.
- Production build.
- Manual browser verification with Playwright MCP when working on UI.
- Mobile and desktop visual checks.
- Checkout/payment/email smoke tests when relevant.

Do not accept UI that is visually broken, slow, inaccessible, or generic-looking.

## Documentation Rules

- Update canonical docs when a decision changes.
- Use `docs/design-workshop.md` for future high-level discussions.
- Keep docs concise and current.
- If a price, platform limit, API behavior, or vendor feature matters, verify current official docs before changing direction.
