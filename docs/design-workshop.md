# Design Workshop

Status: active decision summary
Last reviewed: 2026-05-15

This document is the compact workshop summary. Canonical implementation details now live in focused docs:

- [README](README.md)
- [Architecture](architecture.md)
- [Storefront Experience](storefront-experience.md)
- [Engineering Standards](engineering-standards.md)
- [Implementation Plan](implementation-plan.md)
- [Launch Checklist](launch-checklist.md)
- [Research](fashion-commerce-platform-research.md)

Use this file for future high-level design discussions. When a decision becomes stable, move it into the relevant canonical doc.

## Core Direction

- Build a single-brand fashion commerce storefront.
- Initial catalog: about 20-25 products.
- Product direction: girls fashion, occasion/fancy western wear.
- Price positioning: Rs. 5,000+ products, mid-range premium with luxury/premium lean.
- Target customer assumption: young women / young working women buying premium-looking western occasion/fancy wear.
- Engineering/operator context: one part-time engineer, small non-engineering business team.
- Cost goal: keep recurring operating cost around USD 50/month or lower where practical, excluding payment gateway transaction fees.

## Locked Decisions

- Commerce core: Medusa.
- Storefront: custom Next.js App Router application.
- UI foundation: Tailwind CSS, shadcn CLI-installed local components, `@base-ui/react`.
- Package manager: pnpm.
- Client state: Zustand where global client state is needed.
- Forms: React Hook Form + Zod.
- Payments: Razorpay prepaid for v1; no COD.
- Shipping: simple manual fulfillment/tracking in Medusa Admin for v1; no Shiprocket/Delhivery API integration at launch.
- Email: Resend transactional email, free plan expected to be enough initially.
- Media: Cloudflare R2 plus Next.js image optimization.
- Analytics: Cloudflare Web Analytics for basic v1 visibility.
- Hosting: Vercel Pro for storefront; AWS Lightsail 4 GB in Singapore for production Medusa compute.
- Database/cache: Neon Postgres Singapore and Upstash Redis Singapore pay-as-you-go.
- DNS/security/media: Cloudflare DNS, proxied API/admin records, R2 media, Access for admin, Turnstile for public forms.
- Terraform: broad durable infrastructure under `infra/terraform`; local applies with S3 remote state and native S3 lockfiles.
- Markets: India-only, INR-only, English-only.
- Dark mode: not v1.

## Product UX Summary

- Visual direction: soft feminine premium + boutique editorial.
- Avoid generic AI/LLM design: no gradient blobs, glassy SaaS cards, default shadcn dashboard look, vague luxury filler copy, or decorative complexity.
- Homepage: product-led with premium editorial sections.
- Product pages: strong image gallery, size chart, size/color selection, fit/fabric/care details, related products, mobile sticky add-to-cart.
- Collection pages: curated fashion edit, image-first grid, simple filters, size prioritized.
- Search: fast visual product search, simple for 20-25 product launch.
- Cart: drawer-first plus full cart page.
- Checkout: guest-first sectioned single-page checkout.
- Wishlist/recently viewed/buy now: allowed only if simple.
- Reviews: no fake reviews; real reviews/testimonials later.

## Operational Summary

- Admin: Medusa Admin first.
- Lightweight custom admin views/widgets are allowed later if they solve real operational pain.
- Product entry: manual in Medusa Admin; CSV/script import only if needed.
- Returns/exchanges: final policy unknown; UI copy must stay configurable until business terms are final.
- GST/tax invoice: status unknown; keep receipts/templates compatible with GST details later, but do not build B2B/custom invoicing in v1.
- Tracking: simple track-order page if practical; no account requirement.
- Notifications: automated email only for v1; WhatsApp manual support only.
- Newsletter: simple email capture only; no marketing automation.

## Environment Summary

- Branches:
  - `dev` is used for active development and accepts direct pushes.
  - `dev` runs CI but deploys to QA only by manual workflow dispatch.
  - `dev` merges into `main` through PR for production release.
  - `dev` should be the default GitHub branch.
  - `dev` and `main` must be protected according to their roles.
- Vercel:
  - QA storefront manual deploy from `dev`.
  - Production storefront manual deploy from `main`.
- Medusa:
  - Production Medusa runs on AWS Lightsail Singapore.
  - QA Medusa runs separately first; production Medusa compute remains deferred until QA setup and testing are complete.
  - Production Medusa deploy remains deferred until production compute and full runtime config are approved.
- Data:
  - Production Postgres uses Neon Singapore.
  - QA Postgres uses a Neon branch with separate credentials.
  - Production and QA Redis use separate Upstash Singapore databases.
- QA should stay small, simple, and cost-aware.

## Explicit Not V1

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

## Open Business Items

These are not engineering blockers yet:

- Final logo/assets/colors handoff.
- Final return/exchange policy.
- GST/tax invoice legal requirements.
- Final shipping partner if automation is added later.
- Final brand copy and product content.

## Future Workshop Topics

Use this process for future decisions:

1. Discuss one topic at a time.
2. Prefer low-complexity defaults.
3. Research current vendor/platform facts when costs, APIs, limits, or best practices may have changed.
4. Record the decision in this workshop summary.
5. Move stable implementation details into the appropriate canonical doc.
