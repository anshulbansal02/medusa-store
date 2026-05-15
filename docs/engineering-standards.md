# Engineering Standards

Status: canonical v1 engineering standards
Last reviewed: 2026-05-15

## Principles

- Keep the system simple, modular, and standard.
- Use existing commerce modules; do not invent commerce logic.
- Prefer boring, maintainable code over clever abstractions.
- Keep AI-assisted development constrained by explicit conventions.
- Security, performance, accessibility, and SEO are baseline requirements.

## Repository

Use one repository without heavy monorepo tooling.

```txt
apps/
  storefront/
  medusa/

docs/
  README.md
  design-workshop.md
  architecture.md
  storefront-experience.md
  engineering-standards.md
  implementation-plan.md
  launch-checklist.md
```

Rules:

- Avoid Turborepo/Nx unless clearly needed later.
- Use pnpm.
- Commit lockfile.
- Do not create shared packages prematurely.
- Duplicated config is acceptable if it keeps setup simple.

## Scaffolding

Use official CLIs for framework scaffolding.

Rules:

- Scaffold the storefront with `create-next-app`.
- Scaffold the Medusa backend with `create-medusa-app`.
- Use latest stable tooling at setup time.
- Do not hand-create framework internals that the official CLIs should own.
- Clean up generated starter files after scaffolding.
- Skip Medusa's optional Next.js Starter Storefront because this project uses a custom storefront UI.

## Storefront Structure

```txt
apps/storefront/app/          routes, layouts, metadata
apps/storefront/components/   reusable UI components
apps/storefront/features/     product, collection, cart, checkout, search
apps/storefront/lib/medusa/   Medusa API/data access
apps/storefront/lib/config/   site/nav/policy config
apps/storefront/lib/utils/    small utilities
apps/storefront/styles/       global styles/tokens
```

Rules:

- Keep Medusa access inside `lib/medusa`.
- Keep product/cart/checkout behavior inside feature modules.
- Keep components presentational unless they intentionally own interaction state.
- Keep `"use client"` boundaries small.
- Use server rendering for product/collection data where practical.
- Use typed data contracts at API boundaries.
- Avoid random API calls inside components.

## Preferred Libraries

Use these where they fit:

- TypeScript.
- React 19.
- Next.js latest stable at setup time.
- Tailwind CSS v4 if compatible.
- `@base-ui/react`.
- shadcn-style local components.
- Zod.
- React Hook Form.
- Zustand.
- TanStack Query only where useful.
- date-fns.
- clsx.
- cva.
- tailwind-merge.
- ky where a small HTTP client is useful.

Do not use TanStack Router for the storefront because Next.js App Router is the router.

## State Management

Use Zustand for global client-side state.

Good Zustand use:

- Cart drawer UI state.
- Search overlay state.
- Local wishlist.
- Recently viewed products.
- Small global UI state.

Avoid Zustand for:

- Product/catalog server data.
- Orders as source of truth.
- Payment state as source of truth.
- Medusa commerce state.

Use URL state for filters, sort, and search where appropriate.

Use TanStack Query only where client-side async caching/retry behavior is clearly useful.

## Forms

Use React Hook Form + Zod.

Use for:

- Checkout contact/address.
- Newsletter signup.
- Contact form.
- Track order lookup.
- Webhook payload validation where useful.

Rules:

- Keep schemas close to the feature.
- Share schemas only when it meaningfully reduces duplication.
- Show clear inline errors.
- Preserve entered data.

## Linting And Formatting

Use whatever works best with the current Next.js ecosystem.

Rules:

- Use ESLint for Next.js/React/TypeScript rules where expected.
- Use one formatter only: Prettier or Biome.
- Do not let Biome/Prettier/ESLint fight over formatting.
- Keep scripts simple:
  - `typecheck`
  - `lint`
  - `format` or `format:check`
  - `build`

## TypeScript

- Enable `strict: true`.
- Avoid casual `any`.
- Validate external/API data at boundaries where needed.
- Keep Medusa API helper functions typed.
- Keep types pragmatic; avoid type gymnastics.

## Testing

No written test suite for v1.

Required checks:

- Typecheck.
- Lint/format.
- Production build.
- Manual browser testing.
- Manual mobile/desktop visual review.
- Manual checkout/payment/email smoke testing.

Use Playwright MCP for manual browser verification. Do not add a committed Playwright/Vitest suite unless a specific need appears later.

## Performance

Performance is first-class.

Targets:

- Lighthouse mobile performance target: 85+ where practical.
- Product and collection pages should feel fast.
- Keep JavaScript bundle small.
- Avoid unnecessary client components.
- Avoid heavy animation libraries.
- Avoid unnecessary third-party scripts.
- Optimize images and use stable dimensions.
- Lazy-load below-the-fold images.

Guardrails:

- Use `next/image` or a clear CDN/image-loader strategy.
- Keep `"use client"` boundaries small.
- Review bundle size before launch.
- Do not accept visually polished but slow pages.

## Accessibility

- Use semantic HTML.
- Use Base UI or established primitives for menus, dialogs, cart, search, filters, and overlays.
- Do not invent custom accessibility primitives unless necessary.
- Prefer native semantics before ARIA.
- Ensure keyboard navigation works.
- Keep focus states visible.
- Label forms correctly.
- Check color contrast.

## Security

Security is non-negotiable.

Required:

- No secrets in code.
- No real `.env` files committed.
- `.env.example` documents required variables.
- QA/prod secrets separate.
- `NEXT_PUBLIC_*` only for browser-safe values.
- Razorpay signatures verified server-side.
- Webhooks verified where possible.
- CORS locked to known origins.
- Admin protected with strong credentials.
- No sensitive data in logs.
- Postgres backups enabled.
- Least-privilege R2/S3 tokens.

Preferred:

- Cloudflare Access for admin if simple.
- Cloudflare Turnstile for public forms if needed.

## Backend Customization

Use Medusa core as-is.

Allowed customizations:

- Razorpay payment provider/module.
- Future fulfillment provider/module.
- R2/S3 file provider configuration.
- Email/notification integration.
- Small custom module only if needed, such as newsletter capture.

Rules:

- Do not patch Medusa core.
- Do not duplicate commerce tables outside Medusa.
- Do not build custom cart/order/payment logic.
- Keep integrations isolated and documented.
- Preserve upgrade path.

## Migrations And Seeds

- Use Medusa migration/module conventions.
- Keep custom tables/modules minimal.
- Add seed data for QA/local if needed.
- Keep production data separate from QA/local data.
- Do not manually patch production database as a normal workflow.
- Document one-off operational fixes.

## Local Development

Keep setup simple and agent-friendly.

- pnpm scripts for common tasks.
- Clear README.
- `.env.example` files.
- Obvious app boundaries.
- No hidden setup steps.
- Docker optional only if it simplifies dependencies.
- Docker Compose only if local Postgres/Redis setup becomes annoying.

## Dependency Updates

- Use latest stable versions at setup time.
- Avoid experimental packages unless strongly justified.
- Review release notes before major upgrades.
- Do not auto-upgrade critical commerce dependencies blindly.
- Do not pin forever without maintenance.

## AI-Assisted Development

Create and maintain `AGENTS.md`.

Future agents should follow:

- Project structure.
- Medusa data access rules.
- Storefront UX/design rules.
- Security rules.
- Performance/accessibility/SEO expectations.
- Commands to run.
- Files/areas to avoid editing casually.
