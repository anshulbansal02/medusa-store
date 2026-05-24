# Fashion Commerce Storefront

Single-brand premium fashion ecommerce storefront.

## Direction

- Commerce core: Medusa.
- Storefront: Next.js App Router.
- Styling/components: Tailwind CSS, shadcn CLI-installed local components, `@base-ui/react`.
- Payments: Razorpay prepaid.
- Email: Resend.
- Media: Cloudflare R2.
- Analytics: Cloudflare Web Analytics.
- Hosting: Vercel Pro storefront + AWS Lightsail Medusa compute.
- Database/cache: Neon Postgres Singapore + Upstash Redis Singapore.
- Infrastructure: Terraform-managed durable infrastructure with GitHub Actions-managed deploys.

## Current Status

Phase 0 foundation is complete: the repo has a pnpm workspace, a Next.js storefront scaffold, a Medusa backend scaffold, and local Docker services for Postgres/Redis.

The architecture and product decisions have been cleaned into focused docs. The original research note is historical; use the canonical docs below for implementation.

## Local Setup

Use Node 24 and pinned pnpm:

```sh
corepack enable
corepack prepare pnpm@11.1.2 --activate
pnpm install
```

Run local services:

```sh
pnpm services:up
```

Copy app-local env examples before running apps:

```sh
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/medusa/.env.example apps/medusa/.env
```

Start apps:

```sh
pnpm dev:storefront
pnpm dev:medusa
```

Local ports are intentionally fixed and nonstandard:

- Storefront UI: `http://storefront.localhost`
- Medusa API/Admin: `http://localhost:29181`
- Optional Medusa Admin alias: `http://medusa.localhost` via `pnpm medusa:admin:alias`
- Postgres host port: `25433`
- Redis host port: `26380`

The storefront UI runs through portless, which gives a stable named URL while assigning a random internal app port. Local portless runs use plain HTTP. Medusa runs directly on a fixed nonstandard port because it is the API server; use the optional alias only when you want a named browser URL for the Admin UI.

Do not switch local HTTP app development to standard ports like `3000`, `4000`, `8000`, `8080`, or `9000`.

## Docs

- [Agent Guide](AGENTS.md): rules and context for AI-assisted development.
- [Docs Index](docs/README.md): overview of all planning docs.
- [Design Workshop](docs/design-workshop.md): compact active decision summary.
- [Architecture](docs/architecture.md): system, infrastructure, integrations, environments.
- [Storefront Experience](docs/storefront-experience.md): UX, design, pages, SEO, accessibility.
- [Engineering Standards](docs/engineering-standards.md): code organization, tooling, security, performance.
- [Secrets And Config](docs/secrets-and-config.md): environment variables, secret handling, hosted config, rotation.
- [Implementation Plan](docs/implementation-plan.md): MVP scope and build phases.
- [Infrastructure And Terraform Decisions](docs/infra-terraform-decisions.md): accepted infrastructure direction.
- [Infrastructure And Terraform Implementation Plan](docs/infra-terraform-implementation-plan.md): execution order for Terraform, infra, deploy, and launch setup.
- [Launch Checklist](docs/launch-checklist.md): manual launch readiness checks.
- [Cost Model](docs/cost-model.md): cost assumptions and guardrails.
- [References](docs/references.md): official docs and research sources.

## Key Constraints

- Do not invent commerce logic.
- Do not build a custom commerce backend.
- Keep the stack low-complexity and maintainable.
- Keep recurring operating cost around USD 50/month or lower where practical.
- Avoid generic AI/LLM-looking design.
- Use real product photography, brand assets, clear content, strong SEO, and polished mobile UX.

## Next Step

Continue infrastructure setup from [Infrastructure And Terraform Implementation Plan](docs/infra-terraform-implementation-plan.md):

```txt
Preflight and provider audit:
  resource inventory
  provider support checks
  Terraform bootstrap state
```
