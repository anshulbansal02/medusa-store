# Project Docs

This folder contains the canonical planning and implementation context for the fashion commerce storefront.

## Canonical Docs

- [Design Workshop](design-workshop.md): compact active decision summary and future workshop process.
- [Architecture](architecture.md): platform, infrastructure, integrations, environments, security boundaries.
- [Storefront Experience](storefront-experience.md): UX, design direction, page behavior, content standards.
- [Storefront Design Rules](storefront-design-rules.md): distilled visual and UX guardrails from research.
- [Engineering Standards](engineering-standards.md): code organization, tooling, state, forms, security, accessibility, performance.
- [Secrets And Config](secrets-and-config.md): environment variable layout, secret handling, rotation, and hosted config rules.
- [Implementation Plan](implementation-plan.md): MVP boundary, build phases, launch scope.
- [Launch Checklist](launch-checklist.md): manual readiness checks before production launch.
- [Cost Model](cost-model.md): recurring cost assumptions and guardrails.
- [References](references.md): official docs and research sources to verify implementation details.
- [Research](fashion-commerce-platform-research.md): original platform research and source trail.

## How To Use These Docs

- Treat focused docs as canonical for implementation.
- Use `design-workshop.md` for ongoing high-level discussions and new decisions.
- When a decision stabilizes, update the relevant focused doc.
- Keep docs short and current. Avoid reintroducing chronological workshop history into canonical docs.
- If a vendor limit, price, API, or platform capability matters, verify current official docs before changing direction.

## Current Default Stack

```txt
Storefront: Next.js App Router, React, Tailwind CSS, shadcn-style components, Base UI
Commerce: Medusa
Payments: Razorpay prepaid
Email: Resend
Media: Cloudflare R2
Analytics: Cloudflare Web Analytics
Hosting: Vercel Pro + Railway Pro
Database/cache: Railway Postgres + Railway Redis
```
