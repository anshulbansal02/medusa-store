# Agent Guide

This file gives AI coding agents the project context and rules. Read this before making changes.

## Project

Single-brand premium fashion ecommerce storefront.

Current direction:

- Commerce core: Medusa.
- Storefront: Next.js App Router.
- Styling/components: Tailwind CSS, shadcn-style local components, `@base-ui/react`.
- Payments: Razorpay prepaid.
- Email: Resend.
- Media: Cloudflare R2.
- Analytics: Cloudflare Web Analytics.
- Hosting: Vercel + Railway.

Canonical docs:

- `docs/README.md`
- `docs/design-workshop.md`
- `docs/architecture.md`
- `docs/storefront-experience.md`
- `docs/engineering-standards.md`
- `docs/implementation-plan.md`
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

## Storefront Rules

- Keep Medusa API access inside `apps/storefront/lib/medusa`.
- Do not scatter API calls through UI components.
- Use feature folders for product, collection, cart, checkout, and search behavior.
- Keep `"use client"` boundaries small.
- Use Zustand for global client-only state when needed.
- Do not put product/catalog server data into Zustand unnecessarily.
- Use React Hook Form + Zod for forms.
- Use `@base-ui/react` or established accessible primitives for complex UI.

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
